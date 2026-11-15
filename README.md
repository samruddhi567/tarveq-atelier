# AURA ATELIER — AI-Powered Fashion Tech Brand & Discovery Platform

> A calm, ultra-aesthetic fashion sanctuary combining YouTube/Instagram-style fabric movement reels, a Pinterest discovery layout, precision photometric AI colorimetry, and an executive model evaluation dashboard.

---

## 🎨 Visual Identity & Brand Aesthetic ("Warm Soft-Luxe")
- **Base Background**: Soft Cream / Ivory (`#FAF8F5`)
- **Accent Tones**: Warm Terracotta (`#D97757`), Soft Blush (`#E8A598`), Tuscan Gold (`#C5A059`), and Olive (`#687358`)
- **Primary Typography**: Deep Espresso (`#2B1E1A`) with *Playfair Display* & *Cormorant Garamond* headers paired with clean *Inter* / *Plus Jakarta Sans* body text
- **Overlays**: Subtle glassmorphism card overlays (`background: rgba(255, 255, 255, 0.45); backdrop-filter: blur(16px);`)

---

## 🏛️ 5 Core Pages & Architecture

### 1. Dynamic Top Navigation & User Header
- **Centered Brand Identity**: Centered `AURA AI ATELIER` luxury logo.
- **Navigation Pills**:
  - `Style DNA Scan` (Page 1)
  - `For You Feed` (Page 2)
  - `Wardrobe Vault` (Page 3)
  - `Capsule Store` (Page 5)
  - `Model Analytics (Admin)` (Page 4)
- **User Actions**: Profile avatar with dynamic "My Color Palette" swatch badge, real-time search bar, and floating shopping bag with active item counter.

---

### 2. Page 1: "Style DNA" Onboarding & Camera Scan Widget
- **Live Camera & Spectrophotometric Engine**:
  - Uses `navigator.mediaDevices.getUserMedia` for real hardware camera feeds with fallback to smart photometric neural simulation.
  - Video overlay includes real-time laser sweep animation, DensePose grid markers, and a center color-sampling reticle.
  - **"Sample Spectrophotometric Swatch"**: Samples live RGB/HSV pixel values, extracts melanin/carotene ratios, and classifies undertones (Warm Golden, Neutral Olive, Cool Rose).
- **Anthropometric Dimension Sliders**: Interactive height (cm / ft'in") and weight (kg / lbs) controls to compute silhouette drape points.
- **Generated Style DNA Passport Card**: 5-swatch calibrated harmonic palette, silhouette classification (Pear, Hourglass, Petite, Tall), and instant 1-click feed personalization.

---

### 3. Page 2: YouTube / Instagram-Style Algorithmic Recommendation Feed ("For You" Page)
- **Multi-Column Masonry Layout**: Pinterest-style staggered columns with high-definition lifestyle imagery and looping fabric-motion video reels.
- **Live AI Match Score**: Computed dynamically based on user Style DNA (e.g., *"98% Match for Warm Olive Undertone & Pear Shape"*).
- **Top-Right Bookmark Pin**: 1-click pin that synchronizes with the Wardrobe Vault and updates the header pin counter.
- **Slide-out "Shop Look"**: Prefills sizes automatically based on active Style DNA (e.g. *S - Petite Inseam*).
- **Filter Pills**: Real-time filtering by undertones, body cuts, and occasions.

---

### 4. Page 3: Smart Wardrobe Vault & Remix Studio
- **Drag-and-Drop Garment Uploader**:
  - Drag and drop or browse photos of garments you already own.
  - Analyzes fabric type, extracts dominant colors, assigns categories, and integrates into your digital closet.
- **"AI Outfit Remix" Studio**:
  - Select any digitized staple to automatically pair it with Aura catalog drops.
  - Visual side-by-side lookbook breakdown with a **99.4% synergy score** and wearable formula.
- **Bookmarked Inspo Board**: Dedicated showcase of all pinned looks with quick-shop access.

---

### 5. Page 4: Real-Time Model Performance & Evaluation Dashboard (Admin Section)
- **Executive Telemetry View**:
  - **Real-Time Metric Cards**: Accuracy (94.8%), Precision (95.2%), Recall (93.6%), and Return Rate Reduction (4.8% vs 38% industry average).
  - **A/B Test Controller Toggle**: Switch between **Model V1** (Heuristic Decision-Tree Rules Engine) and **Model V2** (Deep Learning Pose Estimation & Neural Drape Mesh) to observe metric deltas in real time.
  - **Interactive Confusion Matrix**: 2x2 interactive grid tracking True Positives (7,520), False Positives (380), False Negatives (400), and True Negatives (6,700). Clicking any cell opens a **Telemetry Case Inspection Drawer** showing actual customer anthropometrics and diagnosis.
  - **Dataset Management Panel**: Cohort summary of 142,500 3D body scans (DeepFashion2 + Custom Indian geometry), 80/20 train-test split, undertone and silhouette distribution charts.

---

### 6. Page 5: Product Catalog & Storefront (3 Launch Capsule Items)
1. **The Bias-Cut Mulberry Silk Wrap Dress** ($240):
   - 100% Grade 6A Mulberry Silk from Como, Italy (22 Momme Sandwashed).
   - 45-degree diagonal grain line eliminating pressure points across hips.
   - AI Fit Confidence Score: 99.2% for Pear & Hourglass.
2. **The Relaxed-Fit French Linen Shirt** ($145):
   - 100% Normandy Flax Linen, stonewashed with rain enzymes.
   - Dropped shoulders and architectural curved hem.
   - AI Fit Confidence Score: 98.8%.
3. **The Tailored Elastic-Back Drape Trouser** ($165):
   - 70% Bamboo Viscose + 30% Regenerative Virgin Wool from Biella, Italy.
   - Internal 2.5-inch dynamic elastic channel solving waist-gap for curvy frames.
   - AI Fit Confidence Score: 99.5%.

---

### 7. Footer & Brand Philosophy Modals
- **Anti-Fast-Fashion Manifesto**: Why sizing accuracy is an environmental imperative.
- **Sizing Science & Mesh**: Explanation of 1,400 polygon mesh drape tension modeling.
- **Biometric Privacy Guarantee**: On-device zero-incentive local processing statement.
- **Investor Pitch Deck**: Direct link to the 12-slide presentation (`deck.html`).
- **Atelier Waitlist**: Interactive signup form with instant `AURA15` promo code reward.

---

## 🚀 Running the Platform

The web server is live at:
**[http://localhost:5500](http://localhost:5500)**

To run manually:
```powershell
python -m http.server 5500
```
Open in any modern browser.
