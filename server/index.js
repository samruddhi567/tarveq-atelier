const express = require('express');
const cors = require('cors');
const path = require('node:path');
const { db, initDatabase } = require('./db');

const app = express();
const PORT = process.env.PORT || 5500;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Initialize SQLite database
initDatabase();

// ==========================================================================
// 1. Style DNA Calibration Engine
// ==========================================================================
app.post('/api/style-dna/calibrate', (req, res) => {
  try {
    const { userId = 'user-default', height = 162, weight = 58, bust = 35, waist = 28, hip = 39, inseam = 29, r = 217, g = 119, b = 87 } = req.body;

    // Sizing inference: Calculate silhouette from waist-to-hip & shoulder ratio
    let silhouette = 'Hourglass';
    const hipToWaistRatio = hip / waist;
    if (hipToWaistRatio >= 1.35) {
      silhouette = 'Pear';
    } else if (height < 160) {
      silhouette = 'Petite Cut';
    } else if (Math.abs(hip - bust) < 2 && hipToWaistRatio < 1.25) {
      silhouette = 'Athletic Rectangle';
    }

    // Photometric Spectrophotometer: Classify Indian complexion undertone from RGB
    let undertone = 'warm_honey';
    let undertoneLabel = 'Warm Golden Honey (Warm Autumn)';
    let paletteName = 'Warm Terracotta & Spiced Amber';
    let swatches = [
      { name: 'Spiced Terracotta', hex: '#D97757' },
      { name: 'Sunlit Ochre', hex: '#C5A059' },
      { name: 'Warm Cream', hex: '#FAF8F5' },
      { name: 'Tuscan Olive', hex: '#556B2F' },
      { name: 'Espresso', hex: '#2B1E1A' }
    ];

    // If red and green are fairly balanced or lower saturation
    if (r > 200 && g > 170 && b > 165) {
      undertone = 'cool_rose';
      undertoneLabel = 'Cool Rose Alabaster (Soft Summer)';
      paletteName = 'Dusty Blossom & Heather Sage';
      swatches = [
        { name: 'Dusty Rose', hex: '#E8A598' },
        { name: 'Heather Sage', hex: '#687358' },
        { name: 'Powder Silver', hex: '#CBD5E1' },
        { name: 'Chalk White', hex: '#FFFFFF' },
        { name: 'Slate Espresso', hex: '#332926' }
      ];
    } else if (r > 150 && g > 130 && b < 100) {
      undertone = 'neutral_olive';
      undertoneLabel = 'Neutral Golden Olive';
      paletteName = 'Warm Sand & Sea Glass';
      swatches = [
        { name: 'Warm Sand', hex: '#D8C4B6' },
        { name: 'Sea Glass', hex: '#4F709C' },
        { name: 'Toasted Caramel', hex: '#8B5E3C' },
        { name: 'Ivory', hex: '#FAF8F5' },
        { name: 'Deep Umber', hex: '#2B1E1A' }
      ];
    }

    const measurements = { height, weight, bust, waist, hip, inseam, silhouette };

    // Update user in SQLite
    const updateUser = db.prepare(`
      UPDATE users 
      SET baseline_measurements = ?, skin_undertone = ?, style_dna_calibrated = 1
      WHERE id = ?
    `);
    updateUser.run(JSON.stringify(measurements), undertone, userId);

    res.json({
      success: true,
      user_id: userId,
      silhouette,
      undertone,
      undertoneLabel,
      paletteName,
      swatches,
      measurements,
      recommendedSize: waist <= 28 ? 'M' : waist <= 32 ? 'L' : 'XL',
      fitConfidence: 98.4
    });
  } catch (err) {
    console.error('Calibration error:', err);
    res.status(500).json({ error: 'Failed to calibrate Style DNA' });
  }
});

// ==========================================================================
// 2. Products Catalog & Sizing Specs
// ==========================================================================
app.get('/api/products', (req, res) => {
  try {
    const { category, search } = req.query;
    let query = 'SELECT * FROM products';
    const params = [];

    if (category && category !== 'All') {
      query += ' WHERE category = ?';
      params.push(category);
    }

    if (search) {
      query += (params.length ? ' AND' : ' WHERE') + ' (name LIKE ? OR description LIKE ? OR category LIKE ?)';
      const s = `%${search}%`;
      params.push(s, s, s);
    }

    query += ' ORDER BY is_trending DESC, original_price DESC';

    const rows = db.prepare(query).all(...params);
    const parsed = rows.map(r => ({
      ...r,
      images: JSON.parse(r.images),
      colors: JSON.parse(r.colors),
      sizes: JSON.parse(r.sizes),
      specs: JSON.parse(r.specs)
    }));

    res.json(parsed);
  } catch (err) {
    console.error('Products fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

app.get('/api/products/:id', (req, res) => {
  try {
    const row = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
    if (!row) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json({
      ...row,
      images: JSON.parse(row.images),
      colors: JSON.parse(row.colors),
      sizes: JSON.parse(row.sizes),
      specs: JSON.parse(row.specs)
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch product details' });
  }
});

// ==========================================================================
// 3. AI Match Score Engine
// ==========================================================================
app.get('/api/products/match-score', (req, res) => {
  try {
    const { productId, userId = 'user-default' } = req.query;
    const product = db.prepare('SELECT * FROM products WHERE id = ?').get(productId);
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const specs = JSON.parse(product.specs);
    const measurements = user && user.baseline_measurements ? JSON.parse(user.baseline_measurements) : null;
    const isCalibrated = user ? user.style_dna_calibrated : 0;

    let score = 94;
    let advice = specs.advice || "Relaxed fit on shoulders and waist.";

    if (isCalibrated && measurements) {
      if (specs.idealSilhouette && specs.idealSilhouette.includes(measurements.silhouette)) {
        score += 4;
      }
      if (specs.bestUndertones && specs.bestUndertones.includes(user.skin_undertone)) {
        score += 2;
      }
      score = Math.min(score, 100);
    }

    res.json({
      productId,
      aiMatchScore: score,
      isCalibrated: Boolean(isCalibrated),
      advice
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to calculate match score' });
  }
});

// ==========================================================================
// 4. Dynamic Capsules Generator
// ==========================================================================
app.get('/api/capsules/generate', (req, res) => {
  try {
    const { userId = 'user-default' } = req.query;
    const rows = db.prepare('SELECT * FROM capsules WHERE user_id = ?').all(userId);

    const capsulesWithProducts = rows.map(cap => {
      const pIds = JSON.parse(cap.product_ids);
      const matchedProducts = pIds.map(id => {
        const p = db.prepare('SELECT * FROM products WHERE id = ?').get(id);
        return p ? {
          ...p,
          images: JSON.parse(p.images),
          colors: JSON.parse(p.colors),
          sizes: JSON.parse(p.sizes),
          specs: JSON.parse(p.specs)
        } : null;
      }).filter(Boolean);

      return {
        ...cap,
        products: matchedProducts
      };
    });

    res.json(capsulesWithProducts);
  } catch (err) {
    res.status(500).json({ error: 'Failed to generate capsules' });
  }
});

// ==========================================================================
// 5. Wardrobe Vault Upload & Digitizer
// ==========================================================================
app.get('/api/vault', (req, res) => {
  try {
    const { userId = 'user-default' } = req.query;
    const items = db.prepare('SELECT * FROM wardrobe_vault WHERE user_id = ? ORDER BY created_at DESC').all(userId);
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch vault items' });
  }
});

app.post('/api/vault/upload', (req, res) => {
  try {
    const { userId = 'user-default', itemName, category, imageUrl, dominantColor = '#D97757' } = req.body;
    const id = `vault-${Date.now()}`;

    const insert = db.prepare(`
      INSERT INTO wardrobe_vault (id, user_id, item_name, category, image_url, dominant_color)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    insert.run(id, userId, itemName || 'Custom Wardrobe Staple', category || 'Tops', imageUrl, dominantColor);

    res.json({
      success: true,
      id,
      item: { id, userId, itemName, category, imageUrl, dominantColor }
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to upload wardrobe item' });
  }
});

// ==========================================================================
// 6. Indian Pin-code Delivery Checker
// ==========================================================================
const INDIAN_PINCODES = {
  '248001': { city: 'Dehradun', state: 'Uttarakhand', days: 2, cod: true },
  '110001': { city: 'New Delhi', state: 'Delhi NCR', days: 1, cod: true },
  '560001': { city: 'Bengaluru', state: 'Karnataka', days: 2, cod: true },
  '400001': { city: 'Mumbai', state: 'Maharashtra', days: 2, cod: true },
  '700001': { city: 'Kolkata', state: 'West Bengal', days: 3, cod: true },
  '500001': { city: 'Hyderabad', state: 'Telangana', days: 2, cod: true },
  '600001': { city: 'Chennai', state: 'Tamil Nadu', days: 2, cod: true },
  '302001': { city: 'Jaipur', state: 'Rajasthan', days: 2, cod: true },
  '226001': { city: 'Lucknow', state: 'Uttar Pradesh', days: 2, cod: true },
  '380001': { city: 'Ahmedabad', state: 'Gujarat', days: 2, cod: true }
};

app.get('/api/pincode/check', (req, res) => {
  const pin = String(req.query.code || '').trim();
  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  if (pin.length !== 6 || !/^\d+$/.test(pin)) {
    return res.status(400).json({ valid: false, message: 'Please enter a valid 6-digit Indian PIN code.' });
  }

  const found = INDIAN_PINCODES[pin];
  const deliveryDays = found ? found.days : 4;
  const targetDate = new Date();
  targetDate.setDate(targetDate.getDate() + deliveryDays);
  const dayName = daysOfWeek[targetDate.getDay()];
  const city = found ? `${found.city}, ${found.state}` : 'your location';

  res.json({
    valid: true,
    pincode: pin,
    city,
    deliveryDate: `${dayName}, ${targetDate.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}`,
    codAvailable: true,
    expressAvailable: true,
    message: `Delivers by ${dayName} to ${city} • Cash on Delivery available`
  });
});

// ==========================================================================
// 7. Checkout & Fit-Gate Verification
// ==========================================================================
app.post('/api/checkout', (req, res) => {
  try {
    const { userId = 'user-default', items, paymentMethod, shippingAddress, bypassFitGate } = req.body;
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);

    // Strict Fit-Gate Check: If user is not calibrated and did not bypass explicitly
    if (!bypassFitGate && user && user.style_dna_calibrated === 0) {
      return res.status(412).json({
        fitGateBlocked: true,
        message: 'Style DNA Calibration Required to lock in zero-return fit precision.'
      });
    }

    const orderId = `AURA-ORD-${Date.now().toString().slice(-6)}`;
    res.json({
      success: true,
      orderId,
      status: 'Order Placed Successfully',
      paymentMethod,
      estimatedDelivery: '2-3 Business Days via BlueDart Express'
    });
  } catch (err) {
    res.status(500).json({ error: 'Checkout processing failed' });
  }
});

// Serve frontend static assets
app.use(express.static(path.join(__dirname, '..', 'public')));

// Catch-all route to serve the SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`\n======================================================`);
  console.log(`✨ AURA Fashion E-Commerce Storefront is Live!`);
  console.log(`🌐 Server URL: http://localhost:${PORT}`);
  console.log(`📦 Database: SQLite (Node.js 24 Native Engine)`);
  console.log(`======================================================\n`);
});
