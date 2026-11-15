const { DatabaseSync } = require('node:sqlite');
const path = require('node:path');

const dbPath = path.join(__dirname, '..', 'aura.db');
const db = new DatabaseSync(dbPath);

// Enable WAL mode for better concurrency and performance
db.exec('PRAGMA journal_mode = WAL;');

function initDatabase() {
  // 1. Users Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE,
      name TEXT,
      baseline_measurements TEXT, -- JSON: { height, weight, chest, waist, hip, inseam }
      skin_undertone TEXT,        -- 'warm_honey', 'neutral_olive', 'cool_rose', 'deep_caramel'
      style_dna_calibrated INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // 2. Products Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      category TEXT NOT NULL,     -- 'Palazzo Suits & Kurti Sets', 'Jumpsuits & Playsuits', etc.
      description TEXT,
      original_price INTEGER NOT NULL,  -- e.g. 2999 (in INR ₹)
      discount_price INTEGER NOT NULL,  -- e.g. 1499 (in INR ₹)
      discount_pct INTEGER NOT NULL,    -- e.g. 50 (50% OFF)
      images TEXT NOT NULL,             -- JSON array of 4+ multi-angle URLs
      colors TEXT NOT NULL,             -- JSON array of { name, hex, img }
      sizes TEXT NOT NULL,              -- JSON array of ['S', 'M', 'L', 'XL', 'XXL']
      fabric_details TEXT,
      specs TEXT NOT NULL,              -- JSON object for sizing parameters
      is_trending INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // 3. WardrobeVault Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS wardrobe_vault (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      item_name TEXT NOT NULL,
      category TEXT NOT NULL,
      image_url TEXT NOT NULL,
      dominant_color TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // 4. Capsules Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS capsules (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      occasion TEXT NOT NULL,
      curated_date DATETIME DEFAULT CURRENT_TIMESTAMP,
      product_ids TEXT NOT NULL, -- JSON array of product IDs
      synergy_score REAL NOT NULL
    );
  `);

  seedInitialData();
}

function seedInitialData() {
  // Check if products already exist
  const existingProduct = db.prepare('SELECT count(*) as count FROM products').get();
  if (existingProduct.count > 0) {
    return; // Already seeded
  }

  // Seed Default User (uncalibrated initially to demo the Fit-Gate!)
  const insertUser = db.prepare(`
    INSERT OR REPLACE INTO users (id, email, name, baseline_measurements, skin_undertone, style_dna_calibrated)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  insertUser.run(
    'user-default',
    'ananya.sharma@example.com',
    'Ananya Sharma',
    JSON.stringify({ height: 162, weight: 58, chest: 35, waist: 28, hip: 39, inseam: 29 }),
    'warm_honey',
    0 // initially 0 so user experiences the Style DNA checkout fit-gate!
  );

  // Seed Curated Products across all 5 strict Indian & Western categories
  const products = [
    // -------------------------------------------------------------
    // CATEGORY 1: "Palazzo Suits & Kurti Sets" (Ethnic Wear)
    // -------------------------------------------------------------
    {
      id: "prod-palazzo-01",
      name: "Chanderi Silk Flared Anarkali & Scallop Palazzo Set",
      category: "Palazzo Suits & Kurti Sets",
      description: "Handcrafted Chanderi silk kurti with delicate gold zari booti work, paired with fluid bias-cut palazzos and a lightweight sheer organza dupatta.",
      original_price: 3499,
      discount_price: 1749,
      discount_pct: 50,
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=85",
        "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=85",
        "https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=800&q=85",
        "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=800&q=85"
      ]),
      colors: JSON.stringify([
        { name: "Terracotta Sunset", hex: "#D97757" },
        { name: "Sunlit Ochre", hex: "#C5A059" },
        { name: "Raw Silk Ivory", hex: "#FAF8F5" }
      ]),
      sizes: JSON.stringify(["S", "M", "L", "XL", "XXL"]),
      fabric_details: "Pure Chanderi Silk with 100% Malmal Cotton inner lining. Hand wash separately in cold water with gentle silk detergent.",
      specs: JSON.stringify({
        idealSilhouette: ["Pear", "Hourglass"],
        bestUndertones: ["warm_honey", "deep_caramel"],
        bustRange: "34-44 inches",
        waistTolerance: 3.0,
        hipComfort: "Generous A-line flare",
        advice: "98% Fit Match: The A-line kalis flare over hips, while structured boat-neck flatters shoulder lines."
      }),
      is_trending: 1
    },
    {
      id: "prod-palazzo-02",
      name: "Mulberry Modal Straight Kurti with Flared Sharara",
      category: "Palazzo Suits & Kurti Sets",
      description: "Breathable sandwashed modal kurti featuring floral gota-patti yoke embroidery and tiered tiered sharara palazzos.",
      original_price: 2799,
      discount_price: 1399,
      discount_pct: 50,
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=800&q=85",
        "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=85",
        "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=85",
        "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=85"
      ]),
      colors: JSON.stringify([
        { name: "Dusty Rose Pink", hex: "#E8A598" },
        { name: "Tuscan Sage", hex: "#687358" },
        { name: "Midnight Navy", hex: "#1E293B" }
      ]),
      sizes: JSON.stringify(["S", "M", "L", "XL", "XXL"]),
      fabric_details: "Modal Viscose Silk (210 gsm) with breathable weave. Machine wash gentle cycle.",
      specs: JSON.stringify({
        idealSilhouette: ["Petite Cut", "Athletic Rectangle"],
        bestUndertones: ["neutral_olive", "cool_rose"],
        bustRange: "32-42 inches",
        waistTolerance: 2.0,
        hipComfort: "Fluid Drape",
        advice: "96% Fit Match: Vertical kurti silhouette creates elongating height lines for petite frames."
      }),
      is_trending: 0
    },

    // -------------------------------------------------------------
    // CATEGORY 2: "Jumpsuits & Playsuits" (Western Wear)
    // -------------------------------------------------------------
    {
      id: "prod-jumpsuit-01",
      name: "Sculpted Belted Utility Jumpsuit in Tuscan Olive",
      category: "Jumpsuits & Playsuits",
      description: "Structured premium Tencel-twill jumpsuit featuring notched lapels, front patch pockets, an adjustable cinch-belt, and straight-leg ankle cuts.",
      original_price: 3999,
      discount_price: 1999,
      discount_pct: 50,
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=85",
        "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=800&q=85",
        "https://images.unsplash.com/photo-1485968579580-b6d095142e6e?auto=format&fit=crop&w=800&q=85",
        "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=800&q=85"
      ]),
      colors: JSON.stringify([
        { name: "Tuscan Olive", hex: "#556B2F" },
        { name: "Roasted Espresso", hex: "#2B1E1A" },
        { name: "Warm Khaki", hex: "#D8C4B6" }
      ]),
      sizes: JSON.stringify(["S", "M", "L", "XL", "XXL"]),
      fabric_details: "100% Lenzing Tencel Twill (Eco-certified). Breathable, wrinkle-resistant and silky smooth.",
      specs: JSON.stringify({
        idealSilhouette: ["Hourglass", "Pear", "Athletic Rectangle"],
        bestUndertones: ["warm_honey", "neutral_olive"],
        bustRange: "34-42 inches",
        waistTolerance: 2.5,
        hipComfort: "Relaxed hip with tapered leg",
        advice: "99% Fit Match: The high-waist belt defines your natural waist, while relaxed hips prevent tension pulling."
      }),
      is_trending: 1
    },
    {
      id: "prod-jumpsuit-02",
      name: "Wide-Leg Draped Halter Neck Evening Jumpsuit",
      category: "Jumpsuits & Playsuits",
      description: "Dramatic flowing wide-leg jumpsuit with an asymmetric cowl halter neckline and hidden back zipper closure.",
      original_price: 4499,
      discount_price: 2249,
      discount_pct: 50,
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=800&q=85",
        "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=800&q=85",
        "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=85",
        "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=800&q=85"
      ]),
      colors: JSON.stringify([
        { name: "Terracotta Blush", hex: "#D97757" },
        { name: "Obsidian Black", hex: "#1C1412" },
        { name: "Champagne Cream", hex: "#FAF8F5" }
      ]),
      sizes: JSON.stringify(["S", "M", "L", "XL", "XXL"]),
      fabric_details: "Heavyweight Sandwashed Satin Crepe (280 gsm). Dry clean recommended.",
      specs: JSON.stringify({
        idealSilhouette: ["Hourglass", "Petite Cut"],
        bestUndertones: ["warm_honey", "cool_rose"],
        bustRange: "32-40 inches",
        waistTolerance: 1.5,
        hipComfort: "Full fluid cascade",
        advice: "97% Fit Match: The waterfall halter draws focus upward while floor-grazing hem gives 3+ inches of optical height."
      }),
      is_trending: 0
    },

    // -------------------------------------------------------------
    // CATEGORY 3: "Casual & Formal Shirts" (Western Tops)
    // -------------------------------------------------------------
    {
      id: "prod-shirt-01",
      name: "The Relaxed-Fit French Linen Shirt",
      category: "Casual & Formal Shirts",
      description: "100% Normandy long-staple organic flax linen. Stonewashed with gentle rain enzymes for a velvety hand-feel that softens with every wash.",
      original_price: 2999,
      discount_price: 1499,
      discount_pct: 50,
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1485968579580-b6d095142e6e?auto=format&fit=crop&w=800&q=85",
        "https://images.unsplash.com/photo-1598532163257-ae3c6b2524b6?auto=format&fit=crop&w=800&q=85",
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=85",
        "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=800&q=85"
      ]),
      colors: JSON.stringify([
        { name: "Natural Flax Oat", hex: "#D8C4B6" },
        { name: "Crisp Chalk White", hex: "#FFFFFF" },
        { name: "Dusty Terracotta", hex: "#E8A598" }
      ]),
      sizes: JSON.stringify(["S", "M", "L", "XL", "XXL"]),
      fabric_details: "100% European Certified Pure Flax (165 gsm). Masters of Linen registered quality.",
      specs: JSON.stringify({
        idealSilhouette: ["Pear", "Hourglass", "Athletic Rectangle", "Petite Cut"],
        bestUndertones: ["warm_honey", "neutral_olive", "cool_rose"],
        bustRange: "34-46 inches",
        waistTolerance: 4.0,
        hipComfort: "Curved hemline sits flat over hips",
        advice: "99% Fit Match: Dropped shoulder seams accommodate wider or narrow shoulders with natural drape."
      }),
      is_trending: 1
    },
    {
      id: "prod-shirt-02",
      name: "Sculptural Cotton Poplin Architect Shirt",
      category: "Casual & Formal Shirts",
      description: "Crisp 120-thread-count Egyptian Giza cotton poplin with French seams, concealed mother-of-pearl placket, and exaggerated structural cuffs.",
      original_price: 2599,
      discount_price: 1299,
      discount_pct: 50,
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=85",
        "https://images.unsplash.com/photo-1485968579580-b6d095142e6e?auto=format&fit=crop&w=800&q=85",
        "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=85",
        "https://images.unsplash.com/photo-1598532163257-ae3c6b2524b6?auto=format&fit=crop&w=800&q=85"
      ]),
      colors: JSON.stringify([
        { name: "Chalk White", hex: "#FFFFFF" },
        { name: "Sky Chambray", hex: "#4F709C" },
        { name: "Warm Mocha", hex: "#3D2B1F" }
      ]),
      sizes: JSON.stringify(["S", "M", "L", "XL", "XXL"]),
      fabric_details: "100% Long-Staple Giza Cotton. Machine wash cold, medium iron for razor-sharp finish.",
      specs: JSON.stringify({
        idealSilhouette: ["Hourglass", "Inverted Triangle"],
        bestUndertones: ["neutral_olive", "cool_rose"],
        bustRange: "32-42 inches",
        waistTolerance: 2.0,
        hipComfort: "Clean tuck-in profile",
        advice: "97% Fit Match: Double-darted back contours hollow of lower spine with zero blouse puffiness."
      }),
      is_trending: 0
    },

    // -------------------------------------------------------------
    // CATEGORY 4: "Indo-Western Fusion & Sarees" (Occasion Wear)
    // -------------------------------------------------------------
    {
      id: "prod-fusion-01",
      name: "Pre-Draped Rose Gold Tissue Silk Saree & Corset Blouse",
      category: "Indo-Western Fusion & Sarees",
      description: "One-minute ready-to-wear pre-pleated tissue silk saree in luminous rose-gold metallic luster, paired with an architectural boned organza corset blouse.",
      original_price: 5999,
      discount_price: 2999,
      discount_pct: 50,
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=85",
        "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=85",
        "https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=800&q=85",
        "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=800&q=85"
      ]),
      colors: JSON.stringify([
        { name: "Rose Gold Blush", hex: "#F6D6D6" },
        { name: "Champagne Zari", hex: "#D4AF37" },
        { name: "Spiced Paprika", hex: "#D97757" }
      ]),
      sizes: JSON.stringify(["S", "M", "L", "XL", "XXL"]),
      fabric_details: "Handwoven Metallic Tissue Silk with lightweight Organza corset. Dry clean only.",
      specs: JSON.stringify({
        idealSilhouette: ["Pear", "Hourglass"],
        bestUndertones: ["warm_honey", "deep_caramel"],
        bustRange: "32-44 inches",
        waistTolerance: 2.0,
        hipComfort: "Pre-stitched pleats guarantee zero bulk",
        advice: "100% Fit Match: Pre-stitched inner skirt guarantees sleek waist curvature without traditional underskirt bunching."
      }),
      is_trending: 1
    },
    {
      id: "prod-fusion-02",
      name: "Chanderi Embroidered Cape & Draped Dhoti Co-ord Set",
      category: "Indo-Western Fusion & Sarees",
      description: "Contemporary fusion co-ord set featuring hand-embroidered scallop cape with delicate sitara sequins, paired with tulip draped dhoti pants.",
      original_price: 4999,
      discount_price: 2499,
      discount_pct: 50,
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=85",
        "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=85",
        "https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=800&q=85",
        "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=85"
      ]),
      colors: JSON.stringify([
        { name: "Warm Ochre Zari", hex: "#D4AF37" },
        { name: "Blush Terracotta", hex: "#E8A598" },
        { name: "Ivory Pearl", hex: "#FAF8F5" }
      ]),
      sizes: JSON.stringify(["S", "M", "L", "XL", "XXL"]),
      fabric_details: "Pure Handloom Chanderi with Silk Crepe Draped Dhoti. Dry clean only.",
      specs: JSON.stringify({
        idealSilhouette: ["Petite Cut", "Athletic Rectangle"],
        bestUndertones: ["warm_honey", "neutral_olive"],
        bustRange: "32-42 inches",
        waistTolerance: 2.5,
        hipComfort: "Tulip drape floats without hugging",
        advice: "98% Fit Match: Asymmetric cape adds vertical visual flow, making it flattering for petite frames."
      }),
      is_trending: 0
    },

    // -------------------------------------------------------------
    // CATEGORY 5: "Tailored Trousers & Co-ords" (Bottom Wear)
    // -------------------------------------------------------------
    {
      id: "prod-trouser-01",
      name: "The Tailored Elastic-Back Drape Trouser",
      category: "Tailored Trousers & Co-ords",
      description: "Architectural front pleats with a hidden internal 2.5-inch elastic waistband channel. Completely eliminates waist-gaps for curvy silhouettes.",
      original_price: 3299,
      discount_price: 1649,
      discount_pct: 50,
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=85",
        "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=800&q=85",
        "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=800&q=85",
        "https://images.unsplash.com/photo-1485968579580-b6d095142e6e?auto=format&fit=crop&w=800&q=85"
      ]),
      colors: JSON.stringify([
        { name: "Roasted Espresso", hex: "#2B1E1A" },
        { name: "Tuscan Olive", hex: "#556B2F" },
        { name: "Oatmeal Melange", hex: "#E6D7CD" }
      ]),
      sizes: JSON.stringify(["S", "M", "L", "XL", "XXL"]),
      fabric_details: "70% Forest-FSC Bamboo Viscose + 30% Regenerative Virgin Wool (310 gsm). Machine wash gentle, hang dry.",
      specs: JSON.stringify({
        idealSilhouette: ["Pear", "Hourglass"],
        bestUndertones: ["warm_honey", "neutral_olive", "deep_caramel"],
        bustRange: "N/A",
        waistTolerance: 3.5,
        hipComfort: "Deep front pleats give 4 inches of sitting ease",
        advice: "100% Fit Match: Zero waist-gap guarantee. The dynamic elastic back expands 2.5 inches when sitting."
      }),
      is_trending: 1
    },
    {
      id: "prod-trouser-02",
      name: "Raw Silk Tailored Blazer & Pleated Trouser Co-ord",
      category: "Tailored Trousers & Co-ords",
      description: "Two-piece tailored power co-ord in textured mulberry raw silk. Features structured shoulder pads, horn buttons, and high-rise relaxed slacks.",
      original_price: 5499,
      discount_price: 2749,
      discount_pct: 50,
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1485968579580-b6d095142e6e?auto=format&fit=crop&w=800&q=85",
        "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=85",
        "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=800&q=85",
        "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=800&q=85"
      ]),
      colors: JSON.stringify([
        { name: "Terracotta Sun", hex: "#D97757" },
        { name: "Natural Flax", hex: "#D8C4B6" },
        { name: "Midnight Obsidian", hex: "#1F2421" }
      ]),
      sizes: JSON.stringify(["S", "M", "L", "XL", "XXL"]),
      fabric_details: "100% Pure Mulberry Raw Silk Slub. Dry clean only.",
      specs: JSON.stringify({
        idealSilhouette: ["Hourglass", "Pear", "Athletic Rectangle"],
        bestUndertones: ["warm_honey", "neutral_olive"],
        bustRange: "34-44 inches",
        waistTolerance: 2.5,
        hipComfort: "Fluid drape slacks",
        advice: "98% Fit Match: The unpadded relaxed jacket drapes naturally over bust while slacks lengthen legs."
      }),
      is_trending: 1
    }
  ];

  const insertProduct = db.prepare(`
    INSERT INTO products (
      id, name, category, description, original_price, discount_price, discount_pct,
      images, colors, sizes, fabric_details, specs, is_trending
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const p of products) {
    insertProduct.run(
      p.id, p.name, p.category, p.description, p.original_price, p.discount_price, p.discount_pct,
      p.images, p.colors, p.sizes, p.fabric_details, p.specs, p.is_trending
    );
  }

  // Seed Wardrobe Vault staples
  const insertVault = db.prepare(`
    INSERT INTO wardrobe_vault (id, user_id, item_name, category, image_url, dominant_color)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  insertVault.run('v-1', 'user-default', 'White Oversized Linen Shirt', 'Tops', 'https://images.unsplash.com/photo-1598532163257-ae3c6b2524b6?auto=format&fit=crop&w=400&q=80', '#F7F5F0');
  insertVault.run('v-2', 'user-default', 'Vintage Straight High-Rise Denim', 'Bottoms', 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=400&q=80', '#5B7C99');
  insertVault.run('v-3', 'user-default', 'Black Draped Silk Camisole', 'Tops', 'https://images.unsplash.com/photo-1603400521630-9f2de124b33b?auto=format&fit=crop&w=400&q=80', '#1A1A1A');

  // Seed Capsules
  const insertCapsule = db.prepare(`
    INSERT INTO capsules (id, user_id, occasion, product_ids, synergy_score)
    VALUES (?, ?, ?, ?, ?)
  `);

  insertCapsule.run('cap-1', 'user-default', 'Festive Sangeet & Reception', JSON.stringify(['prod-palazzo-01', 'prod-fusion-01']), 99.4);
  insertCapsule.run('cap-2', 'user-default', 'Boardroom to Gallery Crawl', JSON.stringify(['prod-shirt-01', 'prod-trouser-01']), 98.8);
}

module.exports = {
  db,
  initDatabase
};
