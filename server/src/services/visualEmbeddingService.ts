import { HfInference } from '@huggingface/inference';

const hfApiKey = process.env.HUGGINGFACE_API_KEY || '';
const hf = hfApiKey ? new HfInference(hfApiKey) : null;

// Primary Vision-Language Model for multimodal clothing embedding
const EMBEDDING_MODEL = 'google/siglip-base-patch16-224';

export interface WardrobeMatchResult {
  productId: string;
  name: string;
  category: string;
  price: number;
  imageUrl: string;
  synergyScore: number; // e.g. 96.8%
  pairingReason: string;
}

// Cosine similarity between two feature vectors
function cosineSimilarity(vecA: number[], vecB: number[]): number {
  if (vecA.length !== vecB.length || vecA.length === 0) return 0.5;
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  if (normA === 0 || normB === 0) return 0.5;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

// Compute Visual/Semantic Matches for Wardrobe Vault Item
export async function computeWardrobeMatches(
  vaultItem: { itemName: string; category: string; colorName: string; colorHex?: string },
  catalogProducts: any[]
): Promise<WardrobeMatchResult[]> {
  const { itemName, category, colorName } = vaultItem;

  // Try Hugging Face feature extraction if API key available
  if (hf) {
    try {
      const vaultPrompt = `A ${colorName} modest luxury ${category} clothing item: ${itemName}`;
      const vaultEmbedding: any = await hf.featureExtraction({
        model: EMBEDDING_MODEL,
        inputs: vaultPrompt,
      });

      const results: WardrobeMatchResult[] = [];

      for (const prod of catalogProducts) {
        const prodPrompt = `A ${prod.undertone_suitability} luxury ${prod.category}: ${prod.name}. ${prod.description}`;
        const prodEmbedding: any = await hf.featureExtraction({
          model: EMBEDDING_MODEL,
          inputs: prodPrompt,
        });

        const rawSim = cosineSimilarity(vaultEmbedding as number[], prodEmbedding as number[]);
        // Normalize cosine score to [88.0, 99.4] luxury presentation scale
        const normalizedScore = Math.min(99.4, Math.max(88.0, Math.round((0.85 + rawSim * 0.14) * 1000) / 10));

        results.push({
          productId: prod.id,
          name: prod.name,
          category: prod.category,
          price: prod.price,
          imageUrl: prod.image_url,
          synergyScore: normalizedScore,
          pairingReason: generatePairingReason(category, prod.category, colorName, prod.name),
        });
      }

      return results.sort((a, b) => b.synergyScore - a.synergyScore).slice(0, 3);
    } catch (err) {
      console.warn('Hugging Face SigLIP inference notice (falling back to rule-based synergy):', err);
    }
  }

  // Graceful rule-based local fallback (Zero external dependency)
  return computeRuleBasedMatches(vaultItem, catalogProducts);
}

function computeRuleBasedMatches(
  vaultItem: { itemName: string; category: string; colorName: string },
  catalogProducts: any[]
): WardrobeMatchResult[] {
  const { category, colorName } = vaultItem;

  return catalogProducts
    .map((prod) => {
      let score = 91.5;

      // Category complement synergy: Tops pair with Bottoms/Co-ords; Outerwear pairs with Sets
      if (
        (category.toLowerCase().includes('top') && (prod.category.includes('Trouser') || prod.category.includes('Skirt'))) ||
        (category.toLowerCase().includes('trouser') && (prod.category.includes('Shirt') || prod.category.includes('Tunic') || prod.category.includes('Tee')))
      ) {
        score += 5.2;
      } else if (category.toLowerCase().includes('co-ord') || prod.category.includes('Co-ord')) {
        score += 4.5;
      }

      // Harmonious earth-tone color balancing
      const warmTones = ['terracotta', 'gold', 'mustard', 'cinnamon', 'ivory', 'sand'];
      const neutralTones = ['olive', 'sage', 'espresso', 'charcoal', 'black'];

      const isVaultWarm = warmTones.some((t) => colorName.toLowerCase().includes(t));
      const isProdWarm = warmTones.some((t) => prod.name.toLowerCase().includes(t));

      if (isVaultWarm !== isProdWarm) {
        // High-contrast balance (e.g. Ivory Top + Espresso Bottom)
        score += 2.1;
      } else {
        // Monochrome / tonal harmony (e.g. Terracotta + Cinnamon)
        score += 1.8;
      }

      score = Math.min(99.2, Math.round(score * 10) / 10);

      return {
        productId: prod.id,
        name: prod.name,
        category: prod.category,
        price: prod.price,
        imageUrl: prod.image_url,
        synergyScore: score,
        pairingReason: generatePairingReason(category, prod.category, colorName, prod.name),
      };
    })
    .sort((a, b) => b.synergyScore - a.synergyScore)
    .slice(0, 3);
}

function generatePairingReason(
  vaultCat: string,
  prodCat: string,
  vaultColor: string,
  prodName: string
): string {
  return `The subtle drape of your ${vaultColor} ${vaultCat} creates an elegant tonal contrast with the structured silhouette of the ${prodName}, maintaining a balanced modest proportion without excess volume.`;
}
