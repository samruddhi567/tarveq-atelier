import { HfInference } from '@huggingface/inference';

const hfApiKey = process.env.HUGGINGFACE_API_KEY || '';
const hf = hfApiKey ? new HfInference(hfApiKey) : null;

// Open-source generative models
const GEN_MODEL = 'Qwen/Qwen2.5-7B-Instruct';

export interface EditorialCopyRequest {
  name?: string;
  category?: string;
  fabricSpec?: string;
  fabricOpacity?: string;
}

export interface EditorialCopyResponse {
  tagline: string;
  description: string;
  modestyRating: number;
  undertoneTags: string[];
}

// 1. Admin Editorial Copy & Modesty Tag Generator
export async function generateEditorialCopy(specs: EditorialCopyRequest): Promise<EditorialCopyResponse> {
  const {
    name = 'Editorial Apparel',
    category = 'Co-ord Set',
    fabricSpec = '100% Breathable Cambric Cotton (210 GSM)',
    fabricOpacity = '100% Zero-Sheer Lab Tested',
  } = specs;

  if (hf) {
    try {
      const prompt = `You are a luxury modest fashion atelier copywriter for TARVEQ ATELIER (inspired by Padmora warm soft-luxe aesthetic).
Write editorial product copy for:
Product Name: ${name}
Category: ${category}
Fabric: ${fabricSpec}
Opacity: ${fabricOpacity}

Return ONLY valid JSON with keys:
"tagline": A poetic 3 to 6 word tagline.
"description": A 2-sentence poetic description emphasizing modest ease, drape, and breathable luxury.
"modestyRating": A number from 9.5 to 10.0.
"undertoneTags": An array of 2 to 3 skin undertone recommendations chosen from ["Warm Golden", "Olive Neutral", "Deep Espresso", "Cool Rosy"].
JSON:`;

      const response = await hf.textGeneration({
        model: GEN_MODEL,
        inputs: prompt,
        parameters: { max_new_tokens: 250, temperature: 0.7 },
      });

      const text = response.generated_text;
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          tagline: parsed.tagline || 'Editorial Atelier Cut',
          description: parsed.description || 'Engineered with bespoke modest drape and zero cling.',
          modestyRating: Number(parsed.modestyRating) || 9.8,
          undertoneTags: Array.isArray(parsed.undertoneTags) ? parsed.undertoneTags : ['Warm Golden', 'Olive Neutral'],
        };
      }
    } catch (err) {
      console.warn('LangChain/HF generation notice (using Padmora rules):', err);
    }
  }

  // Graceful rule-based atelier fallback
  return generateRuleBasedCopy(category, fabricSpec);
}

function generateRuleBasedCopy(category: string, fabricSpec: string): EditorialCopyResponse {
  if (category.toLowerCase().includes('trouser')) {
    return {
      tagline: 'Sculpted Fluidity & Modest Ease',
      description: `Woven from ${fabricSpec}, designed with an architectural silhouette that provides tailored coverage without clinging, ideal for warm Indian climates.`,
      modestyRating: 9.7,
      undertoneTags: ['Warm Golden', 'Olive Neutral'],
    };
  } else if (category.toLowerCase().includes('tunic') || category.toLowerCase().includes('shirt')) {
    return {
      tagline: 'Zero-Sheer Breathable Elegance',
      description: `Crafted in ${fabricSpec} with a fluid drop-shoulder drape, engineered to ensure graceful coverage with an effortless contemporary presence.`,
      modestyRating: 9.9,
      undertoneTags: ['Warm Golden', 'Deep Espresso'],
    };
  }

  return {
    tagline: 'Monochrome Grace & Architectural Drape',
    description: `Tailored with ${fabricSpec} for supreme breathability. Features clean minimalist lines and a modest structured silhouette suitable for all occasions.`,
    modestyRating: 9.8,
    undertoneTags: ['Warm Golden', 'Olive Neutral', 'Deep Espresso'],
  };
}

// 2. Product Detail Page: "Ask TARVEQ Stylist" Dynamic Fit Explanation
export async function explainStylistFit(
  product: { name: string; category: string; undertone_suitability?: string; fabric_spec?: string },
  userStyleDna: any
): Promise<string> {
  const undertone = userStyleDna?.undertone || 'Warm Golden';
  const build = userStyleDna?.build_proportion || 'Regular Modest';

  if (hf) {
    try {
      const prompt = `As the head stylist at TARVEQ ATELIER, write a warm, respectful 2-sentence explanation to a customer with ${undertone} undertone and ${build} proportion on why the "${product.name}" (${product.category}, ${product.fabric_spec || 'Modest weave'}) is universally flattering on them.
Stylist Advice:`;

      const response = await hf.textGeneration({
        model: GEN_MODEL,
        inputs: prompt,
        parameters: { max_new_tokens: 120, temperature: 0.6 },
      });

      const reply = response.generated_text.trim();
      if (reply && reply.length > 20) {
        return reply.replace(/^Stylist Advice:\s*/i, '');
      }
    } catch (err) {
      console.warn('Stylist fit explanation notice (using rule engine):', err);
    }
  }

  return `The tailored lines and generous drape of this ${product.category} naturally flatter your ${build} silhouette. Its rich earthy tone brings out the natural glow of your ${undertone} complexion without overwhelming your frame.`;
}
