import { HfInference } from '@huggingface/inference';
import { db } from '../db.js';

const hfApiKey = process.env.HUGGINGFACE_API_KEY || '';
const hf = hfApiKey ? new HfInference(hfApiKey) : null;
const GEN_MODEL = 'Qwen/Qwen2.5-7B-Instruct';

// In-memory conversation session history
interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

const sessionStore = new Map<string, ChatMessage[]>();

export interface StylistChatResponse {
  reply_text: string;
  recommended_product_ids?: string[];
}

export async function handleStylistChat(
  sessionId: string,
  userMessage: string,
  userId: string = 'user-customer-demo'
): Promise<StylistChatResponse> {
  // 1. Fetch User Style DNA & Wardrobe Vault from SQLite
  const userRow = db.prepare('SELECT * FROM users WHERE id = ?').get(userId) as any;
  const styleDna = userRow ? JSON.parse(userRow.style_dna || '{}') : {};
  const vaultRows = db.prepare('SELECT * FROM wardrobe_vault WHERE user_id = ? LIMIT 4').all(userId) as any[];

  // 2. Fetch Live Products Catalog
  const products = db.prepare('SELECT id, name, category, price, fabric_spec, undertone_suitability FROM products LIMIT 6').all() as any[];

  // 3. Check for Order Tracking Intent ("where is my order", "order status", "track my order")
  const lowerMsg = userMessage.toLowerCase();
  if (lowerMsg.includes('where is my order') || lowerMsg.includes('order status') || lowerMsg.includes('track order')) {
    const latestOrder = db.prepare('SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC LIMIT 1').get(userId) as any;
    if (latestOrder) {
      return {
        reply_text: `I've checked our atelier records for you! Your latest order **#${latestOrder.id}** (${latestOrder.payment_method}) is currently in **"${latestOrder.fulfillment_status}"** status. Tracking reference: **${latestOrder.awb_tracking_code || 'TRQ-DISPATCH-PENDING'}**. Our Dehradun studio is packing it with bespoke care!`,
      };
    }
  }

  // 4. Session History Buffer
  if (!sessionStore.has(sessionId)) {
    sessionStore.set(sessionId, []);
  }
  const history = sessionStore.get(sessionId)!;
  history.push({ role: 'user', content: userMessage });
  if (history.length > 8) history.splice(0, history.length - 8);

  // 5. System Prompt Context Assembly
  const undertone = styleDna.undertone || 'Warm Golden';
  const build = styleDna.build_proportion || 'Regular Modest';
  const vaultSummary = vaultRows.map((v) => `${v.color_name} ${v.item_name} (${v.category})`).join(', ') || 'No owned items pinned yet';
  const catalogSummary = products.map((p) => `[ID: ${p.id}] ${p.name} (₹${p.price}, ${p.category}, ${p.fabric_spec})`).join('\n');

  // Try Hugging Face model if available
  if (hf) {
    try {
      const prompt = `<|im_start|>system
You are the Head Stylist at TARVEQ ATELIER, a luxury modest fashion house in Dehradun with a Padmora warm soft-luxe aesthetic.
Speak with warmth, respect, and deep knowledge of South Asian skin tones and modest cuts.
Customer Profile:
- Skin Undertone: ${undertone}
- Proportions: ${build}
- Saved Wardrobe: ${vaultSummary}

Live TARVEQ Catalog:
${catalogSummary}

Guidelines:
- Explain WHY fabrics (GSM, zero-sheer), colors (earthy terracottas, sages, lotus creams), and silhouettes flatter them.
- Answer custom length (Petite/Regular/Tall) or wash care questions gently.
- If you recommend products from the catalog, mention their exact IDs in square brackets like [ID: prod-ivory-double-layer-shirt].
- Keep responses concise (3-4 sentences max).<|im_end|>
<|im_start|>user
${userMessage}<|im_end|>
<|im_start|>assistant
`;

      const response = await hf.textGeneration({
        model: GEN_MODEL,
        inputs: prompt,
        parameters: { max_new_tokens: 280, temperature: 0.7 },
      });

      const reply = response.generated_text.trim();
      const cleanReply = reply.split('<|im_start|>assistant').pop()?.replace(/<\|im_end\|>/g, '').trim() || reply;

      // Extract recommended product IDs
      const idMatches = cleanReply.match(/\[ID:\s*([a-zA-Z0-9_-]+)\]/g) || [];
      const recommendedIds = idMatches.map((m) => m.replace(/\[ID:\s*/, '').replace(/\]/, '').trim());

      const finalReply = cleanReply.replace(/\[ID:\s*[a-zA-Z0-9_-]+\]/g, '').trim();

      history.push({ role: 'assistant', content: finalReply });

      return {
        reply_text: finalReply,
        recommended_product_ids: recommendedIds.slice(0, 2),
      };
    } catch (err) {
      console.warn('Hugging Face Stylist Chat notice (using atelier rule engine):', err);
    }
  }

  // Graceful rule-based local atelier persona fallback
  const fallbackResult = generateRuleBasedChatReply(userMessage, undertone, build, vaultRows, products);
  history.push({ role: 'assistant', content: fallbackResult.reply_text });
  return fallbackResult;
}

function generateRuleBasedChatReply(
  msg: string,
  undertone: string,
  build: string,
  vaultRows: any[],
  products: any[]
): StylistChatResponse {
  const lower = msg.toLowerCase();

  if (lower.includes('color') || lower.includes('skin') || lower.includes('tone') || lower.includes('glow')) {
    const recommended = products.find((p) => p.id.includes('terracotta') || p.id.includes('ivory')) || products[0];
    return {
      reply_text: `With your **${undertone}** undertone, earthy tones like Spiced Terracotta, Warm Lotus Cream, and Banarasi Olive will naturally illuminate your complexion without washing you out. Avoid harsh cool blues—warm mineral pigments create a rich, radiant harmony!`,
      recommended_product_ids: recommended ? [recommended.id] : [],
    };
  }

  if (lower.includes('vault') || lower.includes('pair') || lower.includes('match') || lower.includes('already own')) {
    const recommended = products.find((p) => p.id.includes('trousers') || p.id.includes('coord')) || products[1];
    return {
      reply_text: `Looking at your Wardrobe Vault, our structured bottom-wear and zero-sheer shirts are engineered to pair seamlessly with your everyday staples. A tonal contrast between a lighter top and rich espresso trousers creates an effortless, elongated modest drape!`,
      recommended_product_ids: recommended ? [recommended.id] : [],
    };
  }

  if (lower.includes('weather') || lower.includes('summer') || lower.includes('hot') || lower.includes('campus')) {
    const recommended = products.find((p) => p.id.includes('cambric') || p.id.includes('linen') || p.id.includes('shirt')) || products[0];
    return {
      reply_text: `For warm or humid climates, our 210–240 GSM Pure Cambric Cotton and lightweight linen blends are unmatched. They are double-layer lab tested to remain 100% zero-sheer while allowing complete air circulation with a relaxed, modest cut.`,
      recommended_product_ids: recommended ? [recommended.id] : [],
    };
  }

  if (lower.includes('length') || lower.includes('custom') || lower.includes('return') || lower.includes('size')) {
    return {
      reply_text: `Every TARVEQ piece is tailored to order! You can select between **Petite (-5cm)**, **Regular**, and **Tall (+7cm)** lengths so hems fall at the exact modest drop you desire. We also guarantee doorstep exchanges within 7 days if you'd like a size adjustment.`,
    };
  }

  const defaultProd = products[0];
  return {
    reply_text: `Namaste! As your atelier stylist, I recommend silhouettes crafted with gentle drape and zero cling for your **${build}** frame. Would you like a personal styling recommendation, undertone palette check, or pairing with pieces you already own?`,
    recommended_product_ids: defaultProd ? [defaultProd.id] : [],
  };
}
