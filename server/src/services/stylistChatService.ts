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
  userId: string = 'user-customer-demo',
  userUndertoneParam?: string
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

  // 5. Detect Undertone from message content, parameter, or database
  let detectedUndertone = userUndertoneParam || styleDna.undertone;
  if (lowerMsg.includes('cool') || lowerMsg.includes('rosy') || lowerMsg.includes('pink') || lowerMsg.includes('fair') || lowerMsg.includes('pale')) {
    detectedUndertone = 'Cool Rosy';
  } else if (lowerMsg.includes('olive') || lowerMsg.includes('green') || lowerMsg.includes('neutral')) {
    detectedUndertone = 'Olive Neutral';
  } else if (lowerMsg.includes('deep') || lowerMsg.includes('espresso') || lowerMsg.includes('dusky') || lowerMsg.includes('dark') || lowerMsg.includes('melanin')) {
    detectedUndertone = 'Deep Espresso';
  } else if (lowerMsg.includes('warm') || lowerMsg.includes('golden') || lowerMsg.includes('wheatish')) {
    detectedUndertone = 'Warm Golden';
  }

  const undertone = detectedUndertone || 'Olive Neutral';
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

  // 1. Skin undertone & Color recommendations (Specific to skin type)
  if (
    lower.includes('color') ||
    lower.includes('skin') ||
    lower.includes('tone') ||
    lower.includes('glow') ||
    lower.includes('outfit') ||
    lower.includes('recommend') ||
    lower.includes('wear') ||
    lower.includes('suit')
  ) {
    if (undertone === 'Cool Rosy' || lower.includes('cool') || lower.includes('fair') || lower.includes('rosy') || lower.includes('pink')) {
      const coord = products.find((p) => p.id === 'prod-charcoal-structured-coord') || products[0];
      const shirt = products.find((p) => p.id === 'prod-ivory-double-layer-shirt') || products[1];
      return {
        reply_text: `For **Cool Rosy & Fair** skin tones, crisp high-contrast tones and cool mineral hues bring out your radiant glow! We recommend our **Charcoal Structured Campus Co-ord** and **Ivory Double-Layered Poplin Shirt**. Avoid mustard yellows or warm ochre, as they tend to clash with cool undertones!`,
        recommended_product_ids: [coord.id, shirt.id],
      };
    }

    if (undertone === 'Olive Neutral' || lower.includes('olive') || lower.includes('neutral')) {
      const tunic = products.find((p) => p.id === 'prod-sage-olive-linen') || products[0];
      const trousers = products.find((p) => p.id === 'prod-cinnamon-relaxed-trousers') || products[1];
      return {
        reply_text: `For **Olive Neutral** skin tones, botanical greens, Tuscan sage, and muted warm spices naturally complement the subtle greenish-golden balance of your skin. Our **Sage Olive Modest Linen Tunic & Trousers** and **Cinnamon Relaxed-Fit Trousers** will make you look effortlessly poised!`,
        recommended_product_ids: [tunic.id, trousers.id],
      };
    }

    if (undertone === 'Deep Espresso' || lower.includes('deep') || lower.includes('dusky') || lower.includes('dark')) {
      const tee = products.find((p) => p.id === 'prod-deep-espresso-tee') || products[0];
      const shirt = products.find((p) => p.id === 'prod-ivory-double-layer-shirt') || products[1];
      return {
        reply_text: `For **Deep Espresso & Dusky** complexions, rich velvety chocolates, burnished earth tones, and high-contrast ivory make your melanin depth pop with royalty! We recommend our **Deep Espresso 240 GSM Heavyweight Tee** and **Ivory Double-Layered Shirt**. Avoid muddy pastel beiges!`,
        recommended_product_ids: [tee.id, shirt.id],
      };
    }

    // Warm Golden / Wheatish
    const trousers = products.find((p) => p.id === 'prod-cinnamon-relaxed-trousers') || products[0];
    const cambric = products.find((p) => p.id === 'prod-terracotta-cambric') || products[1];
    return {
      reply_text: `For **Warm Golden & Wheatish** complexions, sun-drenched rusts, terracotta, and warm cinnamon balance your golden pigmentation with sunlit radiance. We recommend our **Cinnamon Relaxed-Fit Trousers** and **Terracotta Breathable Cambric Co-ord Set**!`,
      recommended_product_ids: [trousers.id, cambric.id],
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
