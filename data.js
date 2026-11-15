// Fashion Looks Dataset for AURA ATELIER
const FASHION_DATA = [
  {
    id: "look-01",
    title: "Terracotta Raw Silk Trench & Pleated Wide-Leg",
    category: "Office Capsule Wardrobe",
    vibe: "Quiet Luxury",
    aspectRatio: "3/4",
    undertone: "Warm Undertones",
    bodyShape: "Pear & Hourglass",
    aiMatchScore: 98,
    matchRationale: "Elongates torso, balances hip-to-shoulder ratio with structured lapels, warm terracotta enhances golden undertones.",
    imageUrl: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=85",
    videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-fashion-model-in-a-terracotta-dress-walking-in-slow-motion-41221-large.mp4",
    hasVideo: true,
    colorPalette: ["#E8A598", "#D97757", "#2B1E1A", "#E6D7CD"],
    paletteName: "Spiced Terracotta & Espresso",
    priceTotal: 440,
    items: [
      { id: "item-1a", name: "Raw Mulberry Silk Structured Trench", price: 260, size: "S / M / L", color: "Terracotta Sun" },
      { id: "item-1b", name: "High-Waist Drape Pleated Trousers", price: 130, size: "XS / S / M / L", color: "Oatmeal Melange" },
      { id: "item-1c", name: "Hand-Hammered 18k Vermeil Huggies", price: 50, size: "One Size", color: "Warm Gold" }
    ],
    tags: ["Warm Undertone Picks", "Office Capsule Wardrobe", "Pear & Hourglass"]
  },
  {
    id: "look-02",
    title: "Contemporary Chanderi Draped Cape & Halter Co-ord",
    category: "Festive & Wedding Edit",
    vibe: "Modern Ethnic",
    aspectRatio: "4/5",
    undertone: "Warm Undertones",
    bodyShape: "Petite & Tall Cuts",
    aiMatchScore: 99,
    matchRationale: "Floating asymmetrical drape adds verticality for petite frames; gold zari weave illuminates honey and olive undertones.",
    imageUrl: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=85",
    videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-young-woman-in-an-indian-sari-walking-in-slow-motion-41235-large.mp4",
    hasVideo: true,
    colorPalette: ["#D4AF37", "#C97A63", "#FAF8F5", "#8E4A49"],
    paletteName: "Tuscan Gold & Rose Madder",
    priceTotal: 580,
    items: [
      { id: "item-2a", name: "Handwoven Chanderi Cape with Scallop Zari", price: 310, size: "Custom Made", color: "Warm Ochre" },
      { id: "item-2b", name: "Sculpted Halter Crop & Draped Dhoti Skirt", price: 210, size: "XS / S / M", color: "Champagne Cream" },
      { id: "item-2c", name: "Baroque Pearl Drop Kundan Ear Cuff", price: 60, size: "One Size", color: "Champagne Gold" }
    ],
    tags: ["Festive & Wedding Edit", "Warm Undertone Picks", "Petite & Tall Cuts"]
  },
  {
    id: "look-03",
    title: "Almond Cashmere Ribbed Wrap & Hammered Satin Skirt",
    category: "Office Capsule Wardrobe",
    vibe: "Soft Luxe Minimal",
    aspectRatio: "2/3",
    undertone: "Neutral & Warm",
    bodyShape: "Hourglass & Pear Silhouettes",
    aiMatchScore: 96,
    matchRationale: "V-neckline frames collarbone while diagonal bias-cut satin contours effortlessly without cling.",
    imageUrl: "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=800&q=85",
    videoUrl: "",
    hasVideo: false,
    colorPalette: ["#EAD8C7", "#CBB29C", "#2B1E1A", "#9B7653"],
    paletteName: "Crème Brûlée & Mochaccino",
    priceTotal: 395,
    items: [
      { id: "item-3a", name: "Grade-A Mongolian Cashmere Wrap Cardigan", price: 220, size: "XS to XL", color: "Almond Milk" },
      { id: "item-3b", name: "Heavyweight Silk Satin Bias Midi Skirt", price: 145, size: "XS to L", color: "Warm Bronzed Taupe" },
      { id: "item-3c", name: "Minimalist Italian Nappa Leather Belt", price: 30, size: "S / M / L", color: "Deep Espresso" }
    ],
    tags: ["Office Capsule Wardrobe", "Hourglass & Pear Silhouettes", "Quiet Luxury Neutrals"]
  },
  {
    id: "look-04",
    title: "Sculpted Tailored Trench & Oversized Draped Denim",
    category: "Streetwear Editorial",
    vibe: "High Street Aesthetic",
    aspectRatio: "3/4",
    undertone: "Universal / Cool Autumn",
    bodyShape: "Petite & Tall Cuts",
    aiMatchScore: 94,
    matchRationale: "High-waist wide-leg denim combined with cropped structured jacket creates an effortless 2:1 aesthetic ratio.",
    imageUrl: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=800&q=85",
    videoUrl: "",
    hasVideo: false,
    colorPalette: ["#3A506B", "#E8A598", "#D8C3B0", "#1C2541"],
    paletteName: "Indigo Storm & Terracotta Dust",
    priceTotal: 360,
    items: [
      { id: "item-4a", name: "Boxy Double-Breasted Cropped Utility Jacket", price: 185, size: "S / M / L", color: "Sage Khaki" },
      { id: "item-4b", name: "Organic Japanese Selvedge Puddle Jeans", price: 140, size: "24-34", color: "Faded Vintage Indigo" },
      { id: "item-4c", name: "Slouchy Nappa Mini Baguette Bag", price: 35, size: "One Size", color: "Warm Cognac" }
    ],
    tags: ["Petite & Tall Cuts", "Streetwear Editorial", "Quiet Luxury Neutrals"]
  },
  {
    id: "look-05",
    title: "Pastel Tissue Silk Saree with Organza Corset Blouse",
    category: "Festive & Wedding Edit",
    vibe: "Modern Royalty",
    aspectRatio: "4/5",
    undertone: "Warm Undertones",
    bodyShape: "Hourglass & Pear Silhouettes",
    aiMatchScore: 99,
    matchRationale: "Sheer luminous organza corset provides gentle core definition while liquid metallic tissue silk glides over hips.",
    imageUrl: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=85",
    videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-woman-modeling-a-pink-silk-dress-41223-large.mp4",
    hasVideo: true,
    colorPalette: ["#F6D6D6", "#E8A598", "#D97757", "#FFFBF7"],
    paletteName: "Blush Champagne & Rosé Dust",
    priceTotal: 620,
    items: [
      { id: "item-5a", name: "Handcrafted Rose-Gold Tissue Silk Saree (6m)", price: 380, size: "Standard 6.2m", color: "Blush Champagne" },
      { id: "item-5b", name: "Bespoke Boned Sheer Organza Corset Blouse", price: 180, size: "Custom Measured", color: "Warm Peach" },
      { id: "item-5c", name: "Micro-Seed Pearl Layered Choker", price: 60, size: "Adjustable", color: "Natural Pearl" }
    ],
    tags: ["Festive & Wedding Edit", "Warm Undertone Picks", "Hourglass & Pear Silhouettes"]
  },
  {
    id: "look-06",
    title: "Sandstone Linen Double-Breasted Suit & Shell Cami",
    category: "Office Capsule Wardrobe",
    vibe: "Effortless Tailoring",
    aspectRatio: "2/3",
    undertone: "Warm Undertones",
    bodyShape: "Petite & Tall Cuts",
    aiMatchScore: 97,
    matchRationale: "Natural slub flax linen softens formal lines; custom inseam prevents fabric bunching for petite heights.",
    imageUrl: "https://images.unsplash.com/photo-1485968579580-b6d095142e6e?auto=format&fit=crop&w=800&q=85",
    videoUrl: "",
    hasVideo: false,
    colorPalette: ["#D8C4B6", "#4F709C", "#2B1E1A", "#F7F4EF"],
    paletteName: "Warm Sand & Sea Glass",
    priceTotal: 410,
    items: [
      { id: "item-6a", name: "Relaxed French Linen Blazer", price: 210, size: "XS / S / M / L", color: "Natural Flax" },
      { id: "item-6b", name: "Tailored Linen Pleated Slacks with Waist Extenders", price: 155, size: "Petite & Regular", color: "Natural Flax" },
      { id: "item-6c", name: "Double-Layer Silk Crepe Camisole", price: 45, size: "XS to L", color: "Warm Ivory" }
    ],
    tags: ["Office Capsule Wardrobe", "Petite & Tall Cuts", "Quiet Luxury Neutrals"]
  },
  {
    id: "look-07",
    title: "Burnt Sienna Draped Asymmetric Jersey Midi Gown",
    category: "Evening & Gala",
    vibe: "Sensual Minimalist",
    aspectRatio: "3/4",
    undertone: "Warm Undertones",
    bodyShape: "Hourglass & Pear Silhouettes",
    aiMatchScore: 98,
    matchRationale: "Ruched waistline camouflages midsection, side-slit creates flattering motion, rich terracotta warms olive and deep skin.",
    imageUrl: "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=800&q=85",
    videoUrl: "",
    hasVideo: false,
    colorPalette: ["#C85A32", "#843B20", "#F5EBE0", "#1A1412"],
    paletteName: "Burnt Sienna & Spiced Espresso",
    priceTotal: 340,
    items: [
      { id: "item-7a", name: "Draped Asymmetric Bamboo-Modal Midi Gown", price: 260, size: "XS to XXL", color: "Burnt Sienna" },
      { id: "item-7b", name: "Architectural Sculpted Brass Cuff", price: 45, size: "One Size", color: "Molten Gold" },
      { id: "item-7c", name: "Strappy Minimalist Kitten Heel Sandals", price: 35, size: "36-41", color: "Cocoa Leather" }
    ],
    tags: ["Warm Undertone Picks", "Hourglass & Pear Silhouettes", "Festive & Wedding Edit"]
  },
  {
    id: "look-08",
    title: "Monochrome Olive Knit Maxi & Chunky Shearling Shacket",
    category: "Streetwear Editorial",
    vibe: "Nordic Warmth",
    aspectRatio: "4/5",
    undertone: "Warm Undertones",
    bodyShape: "Petite & Tall Cuts",
    aiMatchScore: 95,
    matchRationale: "Continuous vertical column of olive ribbed knit creates optical length; shearling textures balance proportions.",
    imageUrl: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=800&q=85",
    videoUrl: "",
    hasVideo: false,
    colorPalette: ["#556B2F", "#8F9779", "#FAF8F5", "#2B1E1A"],
    paletteName: "Tuscan Olive & Warm Parchment",
    priceTotal: 490,
    items: [
      { id: "item-8a", name: "Fine Merino Wool Column Knit Maxi Dress", price: 210, size: "XS to L", color: "Deep Olive" },
      { id: "item-8b", name: "Oversized Vegan Suede Shearling Shacket", price: 235, size: "One Size Oversized", color: "Warm Biscuit" },
      { id: "item-8c", name: "Lug-Sole Ankle Boot in Soft Calfskin", price: 45, size: "36-41", color: "Olive Bark" }
    ],
    tags: ["Streetwear Editorial", "Warm Undertone Picks", "Quiet Luxury Neutrals"]
  },
  {
    id: "look-09",
    title: "Ochre Handloom Khadi Anarkali with Mirrorwork Dupatta",
    category: "Festive & Wedding Edit",
    vibe: "Heritage Craft",
    aspectRatio: "2/3",
    undertone: "Warm Undertones",
    bodyShape: "Pear & Hourglass",
    aiMatchScore: 99,
    matchRationale: "Empire cut gently highlights narrowest point below bust while umbrella kalis flow over hips with dramatic poise.",
    imageUrl: "https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=800&q=85",
    videoUrl: "",
    hasVideo: false,
    colorPalette: ["#CC7722", "#E8A598", "#F2E8CF", "#382923"],
    paletteName: "Sunlit Ochre & Antique Cream",
    priceTotal: 520,
    items: [
      { id: "item-9a", name: "Handloom Khadi Silk 24-Kali Flared Anarkali", price: 340, size: "XS to XXL", color: "Sunlit Ochre" },
      { id: "item-9b", name: "Artisanal Hand-Embroidered Sheer Chiffon Dupatta", price: 140, size: "2.5 Meters", color: "Dusty Peach" },
      { id: "item-9c", name: "Filigree Chandbali Earrings in 22k Gold Finish", price: 40, size: "One Size", color: "Antique Gold" }
    ],
    tags: ["Festive & Wedding Edit", "Warm Undertone Picks", "Hourglass & Pear Silhouettes"]
  },
  {
    id: "look-10",
    title: "Crisp Poplin Sculptural Shirt & Chocolate Silk Palazzo",
    category: "Office Capsule Wardrobe",
    vibe: "Architectural Chic",
    aspectRatio: "3/4",
    undertone: "Neutral & Warm",
    bodyShape: "Petite & Tall Cuts",
    aiMatchScore: 97,
    matchRationale: "Structured high collar draws gaze to face; flowing dark chocolate palazzo gives uninterrupted leg length.",
    imageUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=85",
    videoUrl: "",
    hasVideo: false,
    colorPalette: ["#FFFFFF", "#3D2B1F", "#E8A598", "#8B5E3C"],
    paletteName: "Crisp Chalk & Roasted Espresso",
    priceTotal: 380,
    items: [
      { id: "item-10a", name: "Sculptural Draped Poplin Button-Down", price: 175, size: "XS / S / M / L", color: "Chalk White" },
      { id: "item-10b", name: "Pure Silk Charmeuse Fluid Wide Palazzo", price: 165, size: "XS to XL", color: "Bitter Chocolate" },
      { id: "item-10c", name: "Geometric Horn & Gold Statement Pendant", price: 40, size: "24 Inch Chain", color: "Warm Umber" }
    ],
    tags: ["Office Capsule Wardrobe", "Petite & Tall Cuts", "Quiet Luxury Neutrals"]
  },
  {
    id: "look-11",
    title: "Dusk Rose Draped Cowl Neck Halter & Slit Maxi",
    category: "Festive & Wedding Edit",
    vibe: "Cocktail Glamour",
    aspectRatio: "4/5",
    undertone: "Warm Undertones",
    bodyShape: "Hourglass & Pear Silhouettes",
    aiMatchScore: 98,
    matchRationale: "Fluid waterfall cowl creates softening curves; dust rose velvet undertones bring natural flush to wheatish skin tones.",
    imageUrl: "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=800&q=85",
    videoUrl: "",
    hasVideo: false,
    colorPalette: ["#D88A8A", "#FAF8F5", "#B85C5C", "#2B1E1A"],
    paletteName: "Vintage Rose & Pink Pepper",
    priceTotal: 460,
    items: [
      { id: "item-11a", name: "Heavy Sandwashed Silk Cowl Halter Gown", price: 340, size: "XS to L", color: "Dusk Rose" },
      { id: "item-11b", name: "Crystal Pavé Geometric Drop Earrings", price: 70, size: "One Size", color: "Rose Gold" },
      { id: "item-11c", name: "Satin Minaudière Clutch with Tortoiseshell Clasp", price: 50, size: "One Size", color: "Champagne Blush" }
    ],
    tags: ["Festive & Wedding Edit", "Warm Undertone Picks", "Hourglass & Pear Silhouettes"]
  },
  {
    id: "look-12",
    title: "Deconstructed Wool Blazer & Satin Cargo Trouser",
    category: "Streetwear Editorial",
    vibe: "Tech Tailoring",
    aspectRatio: "3/4",
    undertone: "Universal / Cool Autumn",
    bodyShape: "Petite & Tall Cuts",
    aiMatchScore: 96,
    matchRationale: "Contrast between sharp menswear wool and liquid drape satin creates striking texture depth for all heights.",
    imageUrl: "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=800&q=85",
    videoUrl: "",
    hasVideo: false,
    colorPalette: ["#1F2421", "#C7B198", "#E8A598", "#D97757"],
    paletteName: "Midnight Slate & Desert Sand",
    priceTotal: 420,
    items: [
      { id: "item-12a", name: "Asymmetric Fastening Virgin Wool Blazer", price: 230, size: "S / M / L", color: "Charcoal Slate" },
      { id: "item-12b", name: "Hammered Viscose Fluid Cargo Pants", price: 145, size: "XS to XL", color: "Sand Dune" },
      { id: "item-12c", name: "Chunky Curb Chain Choker in Brushed Brass", price: 45, size: "One Size", color: "Antique Gold" }
    ],
    tags: ["Streetwear Editorial", "Petite & Tall Cuts", "Quiet Luxury Neutrals"]
  }
];

// ==========================================================================
// Launch Capsule Items (Page 5: Product Catalog & Storefront)
// ==========================================================================
const CAPSULE_PRODUCTS = [
  {
    id: "capsule-01",
    name: "The Bias-Cut Mulberry Silk Wrap Dress",
    tagline: "Signature Fluid Drape with Zero Pressure-Points",
    price: 240,
    colors: [
      { name: "Spiced Terracotta", hex: "#D97757", img: "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=800&q=85" },
      { name: "Almond Cream", hex: "#FAF8F5", img: "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=800&q=85" },
      { name: "Roasted Espresso", hex: "#2B1E1A", img: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=85" }
    ],
    sizes: ["XS (Bust 32-34)", "S (Bust 34-36)", "M (Bust 36-38)", "L (Bust 38-41)", "XL (Bust 41-44)"],
    recommendedFor: "Pear & Hourglass Silhouettes • Warm Autumn Undertones",
    fitConfidenceScore: 99.2,
    fabricSource: {
      origin: "Como, Northern Italy (Heritage Mill)",
      material: "100% Grade 6A Mulberry Silk (22 Momme Sandwashed)",
      dyeMethod: "Zero-Runoff Mineral Dyeing with Azo-Free pigments",
      certification: "OEKO-TEX Standard 100 Class I Certified"
    },
    fitArchitecture: "Engineered on a 45-degree diagonal grain line. Naturally glides across the hips without pulling, while adjustable inner wrap ties allow micro-adjustment as your body fluctuates during the day.",
    reviewsCount: 142,
    rating: 4.96
  },
  {
    id: "capsule-02",
    name: "The Relaxed-Fit French Linen Shirt",
    tagline: "Architectural Dropped-Shoulder with Stonewashed Rain Enzymes",
    price: 145,
    colors: [
      { name: "Natural Oat Flax", hex: "#D8C4B6", img: "https://images.unsplash.com/photo-1485968579580-b6d095142e6e?auto=format&fit=crop&w=800&q=85" },
      { name: "Dusty Blossom", hex: "#E8A598", img: "https://images.unsplash.com/photo-1598532163257-ae3c6b2524b6?auto=format&fit=crop&w=800&q=85" },
      { name: "Crisp Chalk White", hex: "#FFFFFF", img: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=85" }
    ],
    sizes: ["XS - Petite", "S - Standard", "M - Standard", "L - Tall Cut", "XL - Tall Cut"],
    recommendedFor: "All Silhouettes • Petite & Tall Inseams",
    fitConfidenceScore: 98.8,
    fabricSource: {
      origin: "Normandy, France (Long-staple flax)",
      material: "100% European Certified Pure Organic Flax (165gsm)",
      dyeMethod: "Enzyme washed with recycled rain water; no toxic softeners",
      certification: "Masters of Linen® Registered Quality Guarantee"
    },
    fitArchitecture: "Sculpted with a gentle back pleat and curved hemline designed to remain perfectly tucked into high-rise trousers, or flow elegantly untucked over slip skirts.",
    reviewsCount: 98,
    rating: 4.92
  },
  {
    id: "capsule-03",
    name: "The Tailored Elastic-Back Drape Trouser",
    tagline: "Savile Row Front Pleat with Hidden 2.5-Inch Dynamic Comfort Band",
    price: 165,
    colors: [
      { name: "Roasted Espresso", hex: "#2B1E1A", img: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=85" },
      { name: "Tuscan Olive", hex: "#556B2F", img: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=800&q=85" },
      { name: "Spiced Paprika", hex: "#D97757", img: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=800&q=85" }
    ],
    sizes: ["24-26 Petite (28\" Inseam)", "27-29 Regular (31\" Inseam)", "30-32 Regular (31\" Inseam)", "33-35 Tall (34\" Inseam)"],
    recommendedFor: "Pear, Hourglass & Petite Shapes (Solves Waist-Gap)",
    fitConfidenceScore: 99.5,
    fabricSource: {
      origin: "Biella, Piedmont, Italy",
      material: "70% Forest-FSC Bamboo Viscose + 30% Regenerative Virgin Wool (310gsm)",
      dyeMethod: "Closed-loop yarn dying; 94% water recycled in spinning",
      certification: "GOTS Organic & Responsible Wool Standard (RWS)"
    },
    fitArchitecture: "Eliminates the dreaded 'waist gap' for curvy silhouettes. Features crisp double front pleats with a discreet, internal elasticized back channel that moves 2.5 inches with you whether seated at your desk or walking.",
    reviewsCount: 215,
    rating: 4.98
  }
];

// ==========================================================================
// Real-Time Model Performance & Evaluation Dashboard Data (Page 4: Admin Section)
// ==========================================================================
const MODEL_EVALUATION_DATA = {
  v1: {
    modelName: "Model V1: Heuristic Decision-Tree & Static Anthropometry",
    architecture: "Rule-based decision tree with standard ISO 8559-1 sizing lookup tables",
    accuracy: 78.6,
    precision: 74.2,
    recall: 71.8,
    f1Score: 73.0,
    returnRate: 18.4,
    latencyMs: 120,
    inferenceEngine: "CPU-based tabular classifier",
    confusionMatrix: {
      tp: 6240, // True Positive: recommended fit, kept & loved
      fp: 1420, // False Positive: recommended, but returned due to fit gap
      fn: 1680, // False Negative: marked poor fit, but user could have worn
      tn: 5660  // True Negative: correctly warned user of mismatch
    },
    sampleTestCases: [
      {
        id: "CASE-9102",
        type: "FP",
        userMetrics: "Height 5'3\" • Weight 138 lbs • Bust 35 • Waist 27 • Hip 40 (Pear)",
        garment: "Rigid High-Rise Selvedge Denim (Size 28)",
        verdict: "False Positive: Model predicted standard size 28 fit based on hip circumference. Customer returned due to 2.5-inch waist gap and pulling across outer thighs.",
        improvementNote: "Heuristics ignored torso-to-femur angle and drape elasticity."
      },
      {
        id: "CASE-9103",
        type: "FN",
        userMetrics: "Height 5'7\" • Weight 145 lbs • Broad Shoulders • Waist 28 (Inverted Triangle)",
        garment: "Relaxed French Linen Shirt (Size S)",
        verdict: "False Negative: Rule engine flagged 'Shoulder width too narrow'. In reality, dropped shoulder seam easily accommodated the frame.",
        improvementNote: "Rule engine failed to account for non-rigid fabric drop physics."
      }
    ]
  },
  v2: {
    modelName: "Model V2: Photometric Neural Drape & Pose-Estimation Network",
    architecture: "Dense Pose ResNet-50 + HSV Skin Tone Spectrophotometer + Finite Element Drape Mesh",
    accuracy: 94.8,
    precision: 95.2,
    recall: 93.6,
    f1Score: 94.4,
    returnRate: 4.8,
    latencyMs: 38,
    inferenceEngine: "ONNX Web Runtime / GPU WebGL Accelerated",
    confusionMatrix: {
      tp: 7520, // True Positive
      fp: 380,  // False Positive (vastly reduced!)
      fn: 400,  // False Negative
      tn: 6700  // True Negative
    },
    sampleTestCases: [
      {
        id: "CASE-9844",
        type: "TP",
        userMetrics: "Height 5'3\" • Weight 136 lbs • Pear Silhouette • Warm Autumn Skin",
        garment: "The Tailored Elastic-Back Trouser (Size 27-29 Petite)",
        verdict: "True Positive: Model recommended Petite 28\" inseam with contour waist band. Customer kept item, rated 5/5 stars with verified selfie review.",
        improvementNote: "Elastic-back channel accommodated 13-inch hip-to-waist differential flawlessly."
      },
      {
        id: "CASE-9845",
        type: "TN",
        userMetrics: "Height 5'1\" • Cool Rose Skin Undertone",
        garment: "Unstructured Floor-Length Trench in Spiced Ochre",
        verdict: "True Negative: Model accurately warned customer that 52-inch trench length would drag without 4-inch heels, and suggested Dusk Rose Cowl Midi instead.",
        improvementNote: "Prevented an immediate $260 return before garment was cut."
      }
    ]
  },
  datasetManagement: {
    datasetName: "DeepFashion2 + AURA Global & Indian Anthropometric Cohort v4",
    totalSamples: 142500,
    trainTestSplit: "80% Training (114,000) / 20% Evaluation (28,500)",
    validationMethod: "5-Fold Stratified Cross-Validation on Morphological Clusters",
    undertoneDistribution: [
      { label: "Warm Golden / Honey", pct: 42, hex: "#D97757" },
      { label: "Neutral Olive / Caramel", pct: 34, hex: "#C5A059" },
      { label: "Cool Rose / Alabaster", pct: 24, hex: "#DEB3AD" }
    ],
    silhouetteDistribution: [
      { label: "Pear / Curvier Hips (A-Line)", pct: 36 },
      { label: "Classic Hourglass (Defined Waist)", pct: 28 },
      { label: "Athletic Rectangle / Column", pct: 22 },
      { label: "Inverted Triangle (Broader Shoulders)", pct: 9 },
      { label: "Apple / Round (Midsection Focus)", pct: 5 }
    ]
  }
};

// ==========================================================================
// Community Reviews dataset ("Real Women, Real Fit")
// ==========================================================================
const COMMUNITY_REVIEWS = [
  {
    id: "rev-1",
    author: "Tara Sen",
    location: "Mumbai & London",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
    verifiedStats: {
      height: "5'3\" (Petite)",
      bodyShape: "Pear Silhouette",
      skinTone: "Warm Honey (Autumn)"
    },
    rating: 5,
    outfitBought: "Terracotta Raw Silk Trench & Drape Trousers",
    reviewText: "I usually dread buying trousers because standard hems drag on 5'3\" frames. The AI Fit scan advised the petite inseam cut with high-rise drape — it fits like bespoke Savile Row tailoring. The terracotta color literally made my skin glow on Zoom!",
    matchScore: 99,
    fitAccuracy: "100% True to Body Scan",
    likes: 342,
    date: "2 days ago"
  },
  {
    id: "rev-2",
    author: "Elena Rostova",
    location: "Milan",
    avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80",
    verifiedStats: {
      height: "5'9\" (Tall)",
      bodyShape: "Athletic Rectangle",
      skinTone: "Golden Olive"
    },
    rating: 5,
    outfitBought: "Almond Cashmere Wrap & Hammered Satin Skirt",
    reviewText: "The diagonal drape of this skirt creates curves I never knew I had! The soft almond tone softens my angular shoulders. I uploaded my favorite leather jacket into the Wardrobe Vault and the AI generated 4 seamless work-to-dinner formulas.",
    matchScore: 98,
    fitAccuracy: "Flawless Drape & Sizing",
    likes: 289,
    date: "5 days ago"
  },
  {
    id: "rev-3",
    author: "Meera Kapoor",
    location: "New Delhi",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80",
    verifiedStats: {
      height: "5'5\"",
      bodyShape: "Full Hourglass",
      skinTone: "Deep Warm Caramel"
    },
    rating: 5,
    outfitBought: "Pastel Tissue Silk Saree & Organza Corset",
    reviewText: "Draping can often add bulk around the waist, but this corset blouse provides structural support while keeping the tissue silk feather-light. Received endless compliments at my sister's Sangeet. Truly tech meets high couture.",
    matchScore: 100,
    fitAccuracy: "Zero Tailor Alterations Needed",
    likes: 512,
    date: "1 week ago"
  },
  {
    id: "rev-4",
    author: "Chloe Vance",
    location: "New York",
    avatar: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=200&q=80",
    verifiedStats: {
      height: "5'7\"",
      bodyShape: "Inverted Triangle",
      skinTone: "Warm Peach Undertone"
    },
    rating: 5,
    outfitBought: "Sandstone Linen Double-Breasted Suit",
    reviewText: "The unpadded shoulders with relaxed waist drop balance my wider shoulders effortlessly. The fabric breathability is sublime. Can't wait for the upcoming drops suggested in my AI DNA Vault!",
    matchScore: 97,
    fitAccuracy: "Ideal Shoulder & Chest Ratio",
    likes: 198,
    date: "1 week ago"
  }
];

// AI Color Palette System
const COLOR_PROFILES = {
  "warm-autumn": {
    name: "Warm Autumn Glow",
    tagline: "Golden, Earthy & Deeply Luminous",
    description: "Your complexion radiates when paired with rich spiced spices, terracotta, sun-drenched amber, and creamy toasted neutrals.",
    colors: [
      { name: "Terracotta Blush", hex: "#E8A598", note: "Primary Signature" },
      { name: "Spiced Paprika", hex: "#D97757", note: "Statement Accent" },
      { name: "Tuscan Olive", hex: "#556B2F", note: "Luxe Neutral" },
      { name: "Toasted Oat Cream", hex: "#FAF8F5", note: "Base Glow" },
      { name: "Roasted Espresso", hex: "#2B1E1A", note: "Structure & Line" }
    ],
    recommendedCuts: ["Bias-cut silks", "High-waist wide trousers", "Architectural lapels", "Asymmetric drapes"],
    avoidTones: ["Harsh icy neon blues", "Pure stark white", "Cool lavender grey"]
  },
  "soft-summer": {
    name: "Soft Rose Quartz & Sage",
    tagline: "Muted, Gentle & Whispering Luxury",
    description: "Your undertones thrive with desaturated, powdery hues like dusty rose, heather sage, soft French blue, and pearl cream.",
    colors: [
      { name: "Dusty Blossom", hex: "#DEB3AD", note: "Soft Romance" },
      { name: "Heather Sage", hex: "#9EAA96", note: "Muted Earth" },
      { name: "Powder Smoke", hex: "#C5C6C7", note: "Gentle Accent" },
      { name: "Ivory Silk", hex: "#FDFBF7", note: "Refined Base" },
      { name: "Deep Heather Slate", hex: "#3B424B", note: "Soft Contrast" }
    ],
    recommendedCuts: ["Waterfall necklines", "A-line skirts", "Soft unstructured coats", "Fluid modal knits"],
    avoidTones: ["Harsh orange", "Acid greens", "Brash yellows"]
  },
  "deep-winter": {
    name: "Midnight Obsidian & Ruby",
    tagline: "High Contrast, Regal & Striking",
    description: "Bold saturation and crisp contrast awaken your natural clarity: midnight indigo, deep emerald, carmine red, and stark ivory.",
    colors: [
      { name: "Rich Crimson", hex: "#991B1B", note: "Bold Pop" },
      { name: "Midnight Navy", hex: "#1E293B", note: "Sartorial Power" },
      { name: "Deep Emerald", hex: "#064E3B", note: "Jewel Glow" },
      { name: "Pristine Snow", hex: "#FFFFFF", note: "High Contrast" },
      { name: "Deep Espresso", hex: "#1C1412", note: "Sharp Line" }
    ],
    recommendedCuts: ["Sharp tailored blazers", "Geometric necklines", "Column maxi dresses", "Clean monochrome sets"],
    avoidTones: ["Muted murky beiges", "Faded salmon", "Mustard browns"]
  }
};

// Wardrobe Remix Closet demo items
const CLOSET_ITEMS = [
  {
    id: "closet-1",
    name: "White Oversized Linen Shirt",
    category: "Tops",
    color: "#F7F5F0",
    image: "https://images.unsplash.com/photo-1598532163257-ae3c6b2524b6?auto=format&fit=crop&w=400&q=80",
    pairsWith: ["capsule-03", "look-01", "look-06"],
    suggestionText: "Tuck partially into The Tailored Elastic-Back Trouser in Roasted Espresso and layer with 18k hammered vermeil jewelry for instant quiet-luxury boardroom impact."
  },
  {
    id: "closet-2",
    name: "Vintage Straight High-Rise Denim",
    category: "Bottoms",
    color: "#5B7C99",
    image: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=400&q=80",
    pairsWith: ["capsule-02", "look-03", "look-12"],
    suggestionText: "Pair with The Relaxed French Linen Shirt in Dusty Blossom and minimal kitten heels for an elevated weekend gallery crawl."
  },
  {
    id: "closet-3",
    name: "Black Draped Silk Camisole",
    category: "Tops",
    color: "#1A1A1A",
    image: "https://images.unsplash.com/photo-1603400521630-9f2de124b33b?auto=format&fit=crop&w=400&q=80",
    pairsWith: ["capsule-01", "look-02", "look-07"],
    suggestionText: "Layer under The Bias-Cut Mulberry Silk Wrap Dress worn open as an evening duster coat with Baroque Pearl Drop Kundan earrings."
  }
];
