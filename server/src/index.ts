import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';
import crypto from 'node:crypto';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import multer from 'multer';
import dotenv from 'dotenv';
import { db, initDatabase, getNextOrderId } from './db.js';
import {
  generateWhatsAppUrls,
  sendCloudApiNotification,
  ADMIN_PHONE_1,
  ADMIN_PHONE_2
} from './services/whatsappNotificationService.js';
import { computeWardrobeMatches } from './services/visualEmbeddingService.js';
import { generateEditorialCopy, explainStylistFit } from './services/langchainStylistService.js';
import { handleStylistChat } from './services/stylistChatService.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distPath = path.resolve(__dirname, '../../dist');
const uploadsDir = path.resolve(__dirname, '../../public/uploads/products');
const paymentsUploadsDir = path.resolve(__dirname, '../../public/uploads/payments');

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
if (!fs.existsSync(paymentsUploadsDir)) {
  fs.mkdirSync(paymentsUploadsDir, { recursive: true });
}

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'tarveq_atelier_jwt_secret_2026_key';

app.use(cors());
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// Serve static uploads
app.use('/uploads/products', express.static(uploadsDir));
app.use('/public/uploads/products', express.static(uploadsDir));
app.use('/uploads/payments', express.static(paymentsUploadsDir));
app.use('/public/uploads/payments', express.static(paymentsUploadsDir));

// Serve built frontend if available
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
}

// Health check endpoint (required by Railway)
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'TARVEQ ATELIER', timestamp: new Date().toISOString() });
});

// Initialize SQLite tables & seeds
initDatabase();

// Configure Multer for product image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname) || '.jpg';
    cb(null, 'tarveq-prod-' + uniqueSuffix + ext);
  },
});
const upload = multer({ storage });

// Configure Multer for manual UPI payment proof screenshots
const paymentProofStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, paymentsUploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname) || '.jpg';
    cb(null, 'tarveq-pay-' + uniqueSuffix + ext);
  },
});
const uploadPaymentProof = multer({ storage: paymentProofStorage });

// =========================================================================
// AUTH MIDDLEWARE
// =========================================================================
export interface AuthRequest extends Request {
  user?: any;
}

function authenticateToken(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token || token === 'null' || token === 'undefined') {
    const demoUser = db.prepare("SELECT * FROM users WHERE email = 'customer@tarveqatelier.com' OR email = 'customer@auramodest.com' LIMIT 1").get() as any;
    if (demoUser) {
      req.user = { id: demoUser.id, email: demoUser.email, role: demoUser.role, name: demoUser.name };
      return next();
    }
    return res.status(401).json({ error: 'Authentication required' });
  }

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) {
      const demoUser = db.prepare("SELECT * FROM users WHERE email = 'customer@tarveqatelier.com' OR email = 'customer@auramodest.com' LIMIT 1").get() as any;
      if (demoUser) {
        req.user = { id: demoUser.id, email: demoUser.email, role: demoUser.role, name: demoUser.name };
        return next();
      }
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
}

function requireAdmin(req: AuthRequest, res: Response, next: NextFunction) {
  authenticateToken(req, res, () => {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ error: 'Access restricted to TARVEQ Founder / Atelier Admins only' });
    }
    next();
  });
}

// Helper: Match scoring logic
function computeMatchBreakdown(product: any, styleDna: any) {
  if (!styleDna || styleDna.is_scanned !== 1) {
    return {
      aiMatchScore: product.default_match_score || 88.5,
      shoulderAlignment: 91.2,
      opaqueFabricRating: 98.5,
      undertoneHarmony: 89.0,
      fitVerdict: 'Standard Proportions (Uncalibrated Baseline)',
      isCalibrated: false,
    };
  }

  let undertoneBonus = 0;
  let undertoneTags: string[] = [];
  try {
    undertoneTags = typeof product.undertone_tags === 'string' ? JSON.parse(product.undertone_tags) : product.undertone_tags;
  } catch {
    undertoneTags = [];
  }

  if (undertoneTags.includes(styleDna.undertone) || undertoneTags.includes('All Undertones')) {
    undertoneBonus = 4.2;
  } else {
    undertoneBonus = 1.0;
  }

  let modestyBonus = 0;
  if (styleDna.modesty_preference === 'Full Coverage' && product.coverage_type === 'Full Coverage') {
    modestyBonus = 3.8;
  } else if (styleDna.modesty_preference === 'Balanced Modest') {
    modestyBonus = 3.2;
  } else {
    modestyBonus = 2.5;
  }

  let proportionBonus = 2.5;
  if (styleDna.build_proportion === 'Petite' && product.category?.includes('Co-ord')) {
    proportionBonus = 3.1;
  }

  const rawScore = 89.0 + undertoneBonus + modestyBonus + proportionBonus;
  const aiMatchScore = Math.min(99.4, Math.max(91.0, parseFloat(rawScore.toFixed(1))));

  const shoulderAlignment = Math.min(99.8, parseFloat((94.5 + ((styleDna.shoulder_cm || 38) % 3) + 1.2).toFixed(1)));
  const opaqueFabricRating = parseFloat((product.modesty_rating * 10).toFixed(1));
  const undertoneHarmony = Math.min(99.6, parseFloat((92.0 + undertoneBonus * 1.6).toFixed(1)));

  let fitVerdict = 'Calibrated Zero-Gap Fit';
  if (aiMatchScore >= 97) {
    fitVerdict = 'Exceptional Silhouette & Color Harmony (Zero-Return Certified)';
  } else if (aiMatchScore >= 94) {
    fitVerdict = 'High Precision Drape (True-to-Posture Match)';
  }

  return {
    aiMatchScore,
    shoulderAlignment,
    opaqueFabricRating,
    undertoneHarmony,
    fitVerdict,
    isCalibrated: true,
  };
}

// =========================================================================
// 1. AUTHENTICATION & USER PROFILE ENDPOINTS
// =========================================================================

// Register
app.post('/api/auth/register', (req: Request, res: Response) => {
  try {
    const { name, email, password, phone, shippingAddress } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (existing) {
      return res.status(400).json({ error: 'An account with this email already exists' });
    }

    const id = `user-${Date.now()}`;
    const passwordHash = bcrypt.hashSync(password, 10);
    const defaultAddress = shippingAddress || {
      street: 'Rajpur Road, Clock Tower',
      city: 'Dehradun',
      state: 'Uttarakhand',
      pincode: '248001',
    };
    const defaultStyleDna = {
      is_scanned: 0,
      height: 162,
      build_proportion: 'Regular',
      modesty_preference: 'Balanced Modest',
      undertone: 'Warm Golden',
      shoulder_cm: 38.5,
      bust_cm: 90.0,
      waist_cm: 72.0,
      hip_cm: 98.0,
      calibrated_at: null,
    };

    db.prepare(`
      INSERT INTO users (id, name, email, password_hash, phone, role, shipping_address, style_dna, saved_wardrobe_vault)
      VALUES (?, ?, ?, ?, ?, 'customer', ?, ?, '[]')
    `).run(
      id,
      name,
      email,
      passwordHash,
      phone || '+91 98000 00000',
      JSON.stringify(defaultAddress),
      JSON.stringify(defaultStyleDna)
    );

    const user = { id, name, email, phone, role: 'customer', shipping_address: defaultAddress, style_dna: defaultStyleDna };
    const token = jwt.sign({ id, email, role: 'customer', name }, JWT_SECRET, { expiresIn: '7d' });

    res.json({ success: true, token, user });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Failed to create account' });
  }
});

// Login (Email / Password)
app.post('/api/auth/login', (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    const row = db.prepare('SELECT * FROM users WHERE email = ?').get(email) as any;
    if (!row) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const isValid = bcrypt.compareSync(password, row.password_hash);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const user = {
      id: row.id,
      name: row.name,
      email: row.email,
      phone: row.phone,
      role: row.role,
      two_factor_enabled: Boolean(row.two_factor_enabled),
      shipping_address: JSON.parse(row.shipping_address || '{}'),
      style_dna: JSON.parse(row.style_dna || '{}'),
      saved_wardrobe_vault: JSON.parse(row.saved_wardrobe_vault || '[]'),
    };

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role, name: user.name }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ success: true, token, user });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
});

// One-Click Demo Login (Customer or Admin)
app.post('/api/auth/demo-login', (req: Request, res: Response) => {
  try {
    const { role = 'customer' } = req.body;
    const targetEmail = role === 'admin' ? 'admin@tarveqatelier.com' : 'customer@tarveqatelier.com';
    let row = db.prepare('SELECT * FROM users WHERE email = ?').get(targetEmail) as any;
    if (!row) {
      const fallbackEmail = role === 'admin' ? 'admin@auramodest.com' : 'customer@auramodest.com';
      row = db.prepare('SELECT * FROM users WHERE email = ?').get(fallbackEmail) as any;
    }
    if (!row) {
      return res.status(404).json({ error: 'Demo account not found' });
    }

    const user = {
      id: row.id,
      name: row.name,
      email: row.email,
      phone: row.phone,
      role: row.role,
      shipping_address: JSON.parse(row.shipping_address || '{}'),
      style_dna: JSON.parse(row.style_dna || '{}'),
      saved_wardrobe_vault: JSON.parse(row.saved_wardrobe_vault || '[]'),
    };

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role, name: user.name }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ success: true, token, user });
  } catch (error) {
    console.error('Demo login error:', error);
    res.status(500).json({ error: 'Failed demo login' });
  }
});

// Current Authenticated User & /api/user alias
app.get('/api/user', (req: Request, res: Response) => {
  try {
    const userId = (req.query.userId as string) || 'user-customer-demo';
    const row = db.prepare('SELECT * FROM users WHERE id = ?').get(userId) as any;
    if (!row) return res.status(404).json({ error: 'User not found' });
    res.json({
      success: true,
      user: {
        id: row.id,
        name: row.name,
        email: row.email,
        phone: row.phone,
        role: row.role,
        two_factor_enabled: Boolean(row.two_factor_enabled),
        shipping_address: JSON.parse(row.shipping_address || '{}'),
        style_dna: JSON.parse(row.style_dna || '{}'),
        saved_wardrobe_vault: JSON.parse(row.saved_wardrobe_vault || '[]'),
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

app.get('/api/auth/me', (req: Request, res: Response) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token || token === 'null' || token === 'undefined') {
      // Fallback to customer-demo for unauthenticated guest browsing
      const demoUser = db.prepare("SELECT * FROM users WHERE email = 'customer@tarveqatelier.com' OR email = 'customer@auramodest.com' LIMIT 1").get() as any;
      if (demoUser) {
        const demoToken = jwt.sign(
          { id: demoUser.id, email: demoUser.email, role: demoUser.role, name: demoUser.name },
          JWT_SECRET,
          { expiresIn: '7d' }
        );
        return res.json({
          success: true,
          authenticated: true,
          token: demoToken,
          user: {
            id: demoUser.id,
            name: demoUser.name,
            email: demoUser.email,
            phone: demoUser.phone,
            role: demoUser.role,
            two_factor_enabled: Boolean(demoUser.two_factor_enabled),
            shipping_address: JSON.parse(demoUser.shipping_address || '{}'),
            style_dna: JSON.parse(demoUser.style_dna || '{}'),
            saved_wardrobe_vault: JSON.parse(demoUser.saved_wardrobe_vault || '[]'),
          },
        });
      }
      return res.status(401).json({ error: 'Not authenticated' });
    }

    jwt.verify(token, JWT_SECRET, (err: any, decoded: any) => {
      if (err) return res.status(403).json({ error: 'Invalid token' });
      const row = db.prepare('SELECT * FROM users WHERE id = ?').get(decoded.id) as any;
      if (!row) return res.status(404).json({ error: 'User not found' });

      res.json({
        success: true,
        authenticated: true,
        user: {
          id: row.id,
          name: row.name,
          email: row.email,
          phone: row.phone,
          role: row.role,
          two_factor_enabled: Boolean(row.two_factor_enabled),
          shipping_address: JSON.parse(row.shipping_address || '{}'),
          style_dna: JSON.parse(row.style_dna || '{}'),
          saved_wardrobe_vault: JSON.parse(row.saved_wardrobe_vault || '[]'),
        },
      });
    });
  } catch (error) {
    res.status(500).json({ error: 'Error fetching profile' });
  }
});

// Update Profile & Shipping Address
app.post('/api/auth/update-profile', authenticateToken, (req: AuthRequest, res: Response) => {
  try {
    const { name, phone, shipping_address } = req.body;
    const userId = req.user.id;

    db.prepare(`
      UPDATE users
      SET name = COALESCE(?, name),
          phone = COALESCE(?, phone),
          shipping_address = COALESCE(?, shipping_address)
      WHERE id = ?
    `).run(name, phone, shipping_address ? JSON.stringify(shipping_address) : null, userId);

    const updated = db.prepare('SELECT * FROM users WHERE id = ?').get(userId) as any;
    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: updated.id,
        name: updated.name,
        email: updated.email,
        phone: updated.phone,
        role: updated.role,
        shipping_address: JSON.parse(updated.shipping_address || '{}'),
        style_dna: JSON.parse(updated.style_dna || '{}'),
      },
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Edge Style DNA Calibration (Saves numerical ratios & CIELAB undertones)
app.post('/api/style-dna', (req: Request, res: Response) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    let targetUserId = req.body.userId || 'user-customer-demo';

    if (token) {
      try {
        const decoded = jwt.verify(token, JWT_SECRET) as any;
        if (decoded && decoded.id) targetUserId = decoded.id;
      } catch {}
    }

    const {
      height = 164,
      buildProportion = 'Regular Modest',
      modestyPreference = 'Balanced Modest',
      skinUndertone = 'Warm Golden',
      shoulderCm = 39.0,
      waistCm = 72.5,
      hipCm = 98.0,
      lab = { L: 62.5, a: 14.8, b: 22.4 },
    } = req.body;

    const styleDnaData = {
      is_scanned: 1,
      height,
      build_proportion: buildProportion,
      modesty_preference: modestyPreference,
      undertone: skinUndertone,
      shoulder_cm: shoulderCm,
      waist_cm: waistCm,
      hip_cm: hipCm,
      lab,
      calibrated_at: new Date().toISOString(),
    };

    db.prepare(`
      UPDATE users
      SET style_dna = ?
      WHERE id = ?
    `).run(JSON.stringify(styleDnaData), targetUserId);

    const updated = db.prepare('SELECT * FROM users WHERE id = ?').get(targetUserId) as any;

    res.json({
      success: true,
      message: 'Style DNA calibrated permanently via Edge Vision',
      user: {
        id: updated?.id || targetUserId,
        name: updated?.name || 'Client',
        email: updated?.email || 'customer@tarveqatelier.com',
        role: updated?.role || 'customer',
        style_dna: styleDnaData,
      },
    });
  } catch (error) {
    console.error('Style DNA error:', error);
    res.status(500).json({ error: 'Failed to save Style DNA' });
  }
});

// =========================================================================
// 2. PRODUCT CATALOG & INVENTORY MANAGEMENT
// =========================================================================

app.get('/api/products', (req: Request, res: Response) => {
  try {
    const userId = (req.query.userId as string) || 'user-customer-demo';
    const userRow = db.prepare('SELECT style_dna FROM users WHERE id = ?').get(userId) as any;
    const styleDna = userRow ? JSON.parse(userRow.style_dna || '{}') : null;

    const products = db.prepare('SELECT * FROM products ORDER BY default_match_score DESC').all() as any[];

    const enriched = products.map((prod) => {
      const breakdown = computeMatchBreakdown(prod, styleDna);
      const inventory = JSON.parse(prod.stock_inventory || '{}');

      // Calculate total stock across variants
      let totalStock = 0;
      Object.keys(inventory).forEach((size) => {
        Object.keys(inventory[size] || {}).forEach((len) => {
          totalStock += Number(inventory[size][len]) || 0;
        });
      });

      return {
        ...prod,
        gallery: JSON.parse(prod.gallery || '[]'),
        undertone_tags: JSON.parse(prod.undertone_tags || '[]'),
        fit_specs: JSON.parse(prod.fit_specs || '{}'),
        stock_inventory: inventory,
        total_stock: totalStock,
        is_sold_out: totalStock <= 0,
        ...breakdown,
      };
    });

    res.json({
      success: true,
      user_is_scanned: styleDna?.is_scanned === 1,
      user_undertone: styleDna?.undertone || 'Uncalibrated',
      products: enriched,
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Failed to fetch catalog' });
  }
});

// Admin: Add New Apparel with Multer Multi-Photo Upload
app.post('/api/admin/products', requireAdmin, upload.array('photos', 5), (req: AuthRequest, res: Response) => {
  try {
    const {
      name,
      tagline,
      category,
      price,
      original_price,
      undertone_suitability,
      undertone_tags,
      fabric_spec,
      fabric_opacity,
      modesty_rating,
      coverage_type,
      description,
      stock_inventory,
    } = req.body;

    const files = (req.files as Express.Multer.File[]) || [];
    let imageUrls: string[] = [];

    if (files.length > 0) {
      imageUrls = files.map((f) => `/uploads/products/${f.filename}`);
    } else {
      imageUrls = ['https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&q=80'];
    }

    const id = `prod-custom-${Date.now()}`;
    const mainImageUrl = imageUrls[0];
    const tagsArray = typeof undertone_tags === 'string' ? JSON.parse(undertone_tags) : undertone_tags || ['Warm Golden'];
    const inventoryData = typeof stock_inventory === 'string' ? stock_inventory : JSON.stringify(stock_inventory || getDefaultInventory());

    db.prepare(`
      INSERT INTO products (
        id, name, tagline, category, price, original_price,
        undertone_suitability, undertone_tags, fabric_spec, fabric_opacity,
        modesty_rating, coverage_type, image_url, gallery, description,
        fit_specs, stock_inventory, default_match_score
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      name,
      tagline || 'Editorial Atelier Cut',
      category || 'Co-ord Set',
      Number(price) || 1499,
      Number(original_price) || 2499,
      undertone_suitability || 'Warm / Olive',
      JSON.stringify(tagsArray),
      fabric_spec || '100% Breathable Cambric Cotton (210 GSM)',
      fabric_opacity || '100% Zero-Sheer Lab Tested',
      Number(modesty_rating) || 9.8,
      coverage_type || 'Full Coverage',
      mainImageUrl,
      JSON.stringify(imageUrls),
      description || 'Engineered with bespoke modest drape and zero cling.',
      JSON.stringify({ shoulderSlope: '12° drop', chestTolerance: '+4.5cm ease' }),
      inventoryData,
      96.5
    );

    res.json({
      success: true,
      message: 'Apparel created and added to live catalog',
      productId: id,
    });
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ error: 'Failed to create product' });
  }
});

// Admin: AI Auto-Generate Editorial Copy & Modesty Tags (LangChain / Qwen / Llama)
app.post('/api/admin/generate-copy', requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { name, category, fabric_spec, fabric_opacity } = req.body;
    const copy = await generateEditorialCopy({
      name,
      category,
      fabricSpec: fabric_spec,
      fabricOpacity: fabric_opacity,
    });
    res.json({ success: true, copy });
  } catch (error: any) {
    console.error('Error generating copy:', error);
    res.status(500).json({ error: 'Failed to generate editorial copy' });
  }
});

// Product Page: "Ask TARVEQ Stylist" Dynamic Fit Explanation
app.post('/api/stylist/explain-fit', async (req: Request, res: Response) => {
  try {
    const { product, userStyleDna } = req.body;
    if (!product) return res.status(400).json({ error: 'Product required' });
    const explanation = await explainStylistFit(product, userStyleDna);
    res.json({ success: true, explanation });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to get stylist explanation' });
  }
});

// Context-Aware Personal Stylist AI Chatbot (LangChain / Qwen / Llama)
app.post('/api/stylist-chat', async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    let userId = req.body.userId || 'user-customer-demo';

    if (token) {
      try {
        const decoded = jwt.verify(token, JWT_SECRET) as any;
        if (decoded?.id) userId = decoded.id;
      } catch {}
    }

    const { message, sessionId = `session-${userId}` } = req.body;
    if (!message || message.trim().length === 0) {
      return res.status(400).json({ error: 'Message cannot be empty' });
    }

    const chatResponse = await handleStylistChat(sessionId, message.trim(), userId);

    // If recommended product IDs were returned, enrich with product details from SQLite
    let recommendedProducts: any[] = [];
    if (chatResponse.recommended_product_ids && chatResponse.recommended_product_ids.length > 0) {
      for (const pid of chatResponse.recommended_product_ids) {
        const p = db.prepare('SELECT id, name, category, price, image_url, default_match_score FROM products WHERE id = ?').get(pid) as any;
        if (p) recommendedProducts.push(p);
      }
    }

    res.json({
      success: true,
      reply: chatResponse.reply_text,
      recommendedProducts,
    });
  } catch (error: any) {
    console.error('Stylist chat error:', error);
    res.status(500).json({ error: 'Atelier stylist service unavailable' });
  }
});

// Admin: Update Stock Inventory Matrix
app.put('/api/admin/products/:id/stock', requireAdmin, (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { stock_inventory } = req.body;

    const inventoryStr = typeof stock_inventory === 'string' ? stock_inventory : JSON.stringify(stock_inventory);
    db.prepare('UPDATE products SET stock_inventory = ? WHERE id = ?').run(inventoryStr, id);

    res.json({ success: true, message: 'Inventory updated successfully' });
  } catch (error) {
    console.error('Error updating stock:', error);
    res.status(500).json({ error: 'Failed to update stock' });
  }
});

// =========================================================================
// 3. WHATSAPP-FIRST ORDER MANAGEMENT SYSTEM
// =========================================================================

// Create new customer order & generate prefilled WhatsApp click-to-chat links
app.post('/api/orders/create', async (req: Request, res: Response) => {
  try {
    const {
      userId = 'user-customer-demo',
      customerName,
      customerPhone,
      customerEmail = '',
      shippingAddress,
      items = [],
      paymentMethod = 'COD', // 'COD' | 'Manual UPI' | 'Pay Later'
      upiReference = '',
      paymentScreenshot = '',
      customerNotes = '',
      customTailoring = {},
    } = req.body;

    // 1. Validation
    if (!customerName || customerName.trim().length < 2) {
      return res.status(400).json({ error: 'Please enter a valid customer full name.' });
    }
    const cleanPhone = (customerPhone || '').replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      return res.status(400).json({ error: 'Please enter a valid 10-digit mobile number.' });
    }
    if (!shippingAddress || !shippingAddress.street || !shippingAddress.city || !shippingAddress.pincode) {
      return res.status(400).json({ error: 'Please enter your complete delivery address including street, city, and PIN code.' });
    }
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Your shopping cart is empty.' });
    }

    // 2. Server-side Price & Stock Verification (Security: Do not trust frontend totals)
    let subtotal = 0;
    const verifiedItems: any[] = [];

    for (const it of items) {
      const prodId = it.id || it.product_id;
      const prod = db.prepare('SELECT * FROM products WHERE id = ?').get(prodId) as any;
      if (!prod) {
        return res.status(400).json({ error: `Product not found: ${it.name}` });
      }
      const qty = Math.max(1, it.quantity || 1);
      const unitPrice = prod.price;
      subtotal += unitPrice * qty;

      // Deduct size-wise inventory safely
      const size = it.size || 'M';
      const length = it.length || 'Regular';
      const inv = JSON.parse(prod.stock_inventory || '{}');
      if (inv[size] && inv[size][length] !== undefined) {
        inv[size][length] = Math.max(0, inv[size][length] - qty);
        db.prepare('UPDATE products SET stock_inventory = ? WHERE id = ?').run(JSON.stringify(inv), prod.id);
      }

      verifiedItems.push({
        id: prod.id,
        name: prod.name,
        price: unitPrice,
        size,
        length,
        colour: it.colour || it.undertone || prod.undertone_suitability,
        quantity: qty,
        image_url: prod.image_url,
      });
    }

    // 3. Discount & Delivery Calculation
    const discount = 0;
    const deliveryCharge = subtotal >= 999 ? 0 : 99;
    const totalAmount = subtotal - discount + deliveryCharge;

    // 4. Sequential Unique Order ID (e.g. TAR-2026-00001) generated on server
    const orderId = getNextOrderId();
    const createdAt = new Date().toISOString();

    const paymentStatus = paymentMethod === 'Manual UPI' && upiReference ? 'Pending Verification' : 'Pending';
    const fulfillmentStatus = 'Pending Confirmation';

    // 5. Save in SQLite Orders Table BEFORE opening WhatsApp
    db.prepare(`
      INSERT INTO orders (
        id, user_id, customer_name, customer_phone, customer_email,
        shipping_address, items, subtotal, discount, delivery_charges,
        total_amount, payment_id, payment_method, payment_status,
        fulfillment_status, customer_notes, upi_reference,
        payment_screenshot, custom_tailoring, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      orderId,
      userId,
      customerName.trim(),
      customerPhone.trim(),
      customerEmail.trim(),
      JSON.stringify(shippingAddress),
      JSON.stringify(verifiedItems),
      subtotal,
      discount,
      deliveryCharge,
      totalAmount,
      `wa_${Date.now()}`,
      paymentMethod,
      paymentStatus,
      fulfillmentStatus,
      customerNotes.trim(),
      upiReference.trim(),
      paymentScreenshot.trim(),
      JSON.stringify(customTailoring),
      createdAt
    );

    // 6. Generate Official Click-to-Chat WhatsApp URLs for Admin 1 & Admin 2
    const orderNotificationPayload = {
      orderId,
      createdAt,
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      customerEmail: customerEmail.trim(),
      shippingAddress,
      items: verifiedItems,
      subtotal,
      discount,
      deliveryCharge,
      totalAmount,
      paymentMethod,
      paymentStatus,
      customerNotes: customerNotes.trim(),
    };

    const whatsAppUrls = generateWhatsAppUrls(orderNotificationPayload);

    // Trigger future-ready Cloud API hook (no-op if not configured)
    sendCloudApiNotification(orderNotificationPayload).catch((e) => console.warn(e));

    res.json({
      success: true,
      orderId,
      order: {
        id: orderId,
        customer_name: customerName,
        customer_phone: customerPhone,
        customer_email: customerEmail,
        shipping_address: shippingAddress,
        items: verifiedItems,
        subtotal,
        discount,
        delivery_charges: deliveryCharge,
        total_amount: totalAmount,
        payment_method: paymentMethod,
        payment_status: paymentStatus,
        fulfillment_status: fulfillmentStatus,
        customer_notes: customerNotes,
        created_at: createdAt,
      },
      whatsAppUrls,
    });
  } catch (error: any) {
    console.error('Order creation error:', error);
    res.status(500).json({ error: error.message || 'Failed to place order' });
  }
});

// Upload Payment Proof Screenshot (for Manual UPI)
app.post('/api/orders/upload-proof', uploadPaymentProof.single('proof'), (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No proof file uploaded' });
    }
    const fileUrl = `/uploads/payments/${req.file.filename}`;
    res.json({ success: true, fileUrl });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to upload payment proof' });
  }
});

// Admin: Update Order Fulfillment & Payment Status
app.put('/api/admin/orders/:id/status', requireAdmin, (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { fulfillment_status, payment_status, admin_notes } = req.body;

    const updates: string[] = [];
    const params: any[] = [];

    if (fulfillment_status) {
      updates.push('fulfillment_status = ?');
      params.push(fulfillment_status);
    }
    if (payment_status) {
      updates.push('payment_status = ?');
      params.push(payment_status);
    }
    if (admin_notes !== undefined) {
      updates.push('admin_notes = ?');
      params.push(admin_notes);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No status fields provided' });
    }

    params.push(id);
    db.prepare(`UPDATE orders SET ${updates.join(', ')} WHERE id = ?`).run(...params);

    const updated = db.prepare('SELECT * FROM orders WHERE id = ?').get(id) as any;
    res.json({ success: true, order: updated });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to update order' });
  }
});

// Customer: My Orders
app.get('/api/orders', (req: Request, res: Response) => {
  try {
    const userId = (req.query.userId as string) || 'user-customer-demo';
    const orders = db.prepare('SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC').all(userId) as any[];

    const parsed = orders.map((o) => ({
      ...o,
      shipping_address: JSON.parse(o.shipping_address || '{}'),
      items: JSON.parse(o.items || '[]'),
      custom_tailoring: JSON.parse(o.custom_tailoring || '{}'),
    }));

    res.json({ success: true, orders: parsed });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch customer orders' });
  }
});

// Admin: Orders & Revenue Ledger
app.get('/api/admin/orders', requireAdmin, (req: AuthRequest, res: Response) => {
  try {
    const orders = db.prepare('SELECT * FROM orders ORDER BY created_at DESC').all() as any[];

    const parsed = orders.map((o) => ({
      ...o,
      shipping_address: JSON.parse(o.shipping_address || '{}'),
      items: JSON.parse(o.items || '[]'),
      custom_tailoring: JSON.parse(o.custom_tailoring || '{}'),
    }));

    // Calculate gross financials
    const totalGrossRevenue = parsed.reduce((sum, o) => sum + (o.payment_status === 'Paid' ? o.total_amount : 0), 0);
    const paidCount = parsed.filter((o) => o.payment_status === 'Paid').length;
    const netProfitEst = Math.round(totalGrossRevenue * 0.62); // 62% modest gross margin

    res.json({
      success: true,
      orders: parsed,
      ledger: {
        totalGrossRevenue,
        paidOrdersCount: paidCount,
        netProfitEstimate: netProfitEst,
        averageOrderValue: paidCount > 0 ? Math.round(totalGrossRevenue / paidCount) : 0,
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch orders ledger' });
  }
});

// Admin: 1-Click CSV Export for Accounting
app.get('/api/admin/orders/export-csv', requireAdmin, (req: AuthRequest, res: Response) => {
  try {
    const orders = db.prepare('SELECT * FROM orders ORDER BY created_at DESC').all() as any[];

    let csv = 'Order ID,Customer Name,Phone,Total Amount (INR),Payment ID,Payment Status,Fulfillment Status,AWB Code,Courier,Date\n';
    orders.forEach((o) => {
      csv += `"${o.id}","${o.customer_name}","${o.customer_phone || ''}",${o.total_amount},"${o.payment_id}","${o.payment_status}","${o.fulfillment_status}","${o.awb_tracking_code || ''}","${o.courier_partner || ''}","${o.created_at}"\n`;
    });

    res.header('Content-Type', 'text/csv');
    res.attachment(`tarveq-orders-ledger-${new Date().toISOString().slice(0, 10)}.csv`);
    res.send(csv);
  } catch (error) {
    res.status(500).json({ error: 'Failed to export CSV' });
  }
});

// =========================================================================
// 5. ATELIER LOGISTICS & DISPATCH WORKFLOW
// =========================================================================

// Admin: Update Shipment & Tracking Code
app.post('/api/admin/orders/:id/generate-awb', requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(id) as any;

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const awbCode = `TRQ-${Math.floor(10000000 + Math.random() * 90000000)}`;
    const courierPartner = 'Standard Courier Dispatch';

    db.prepare(`
      UPDATE orders
      SET fulfillment_status = 'Shipped',
          awb_tracking_code = ?,
          courier_partner = ?
      WHERE id = ?
    `).run(awbCode, courierPartner, id);

    res.json({
      success: true,
      message: 'Order status marked as Shipped',
      shipment: { awb_tracking_code: awbCode, courier_partner: courierPartner },
    });
  } catch (error) {
    console.error('Shipment update error:', error);
    res.status(500).json({ error: 'Failed to update shipment' });
  }
});

// Customer: Order Tracking Timeline
app.get('/api/orders/:id/tracking', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(id) as any;

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json({
      success: true,
      orderId: order.id,
      awbTrackingCode: order.awb_tracking_code || 'Pending Dispatch',
      courierPartner: order.courier_partner || 'TARVEQ Logistics',
      fulfillmentStatus: order.fulfillment_status,
      timeline: [
        { status: 'Order Placed', timestamp: order.created_at, completed: true },
        { status: 'Order Confirmed', timestamp: order.created_at, completed: ['Confirmed', 'Processing', 'Shipped', 'Delivered'].includes(order.fulfillment_status) },
        { status: 'Shipped', timestamp: '', completed: ['Shipped', 'Delivered'].includes(order.fulfillment_status) },
        { status: 'Delivered', timestamp: '', completed: order.fulfillment_status === 'Delivered' },
      ],
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch tracking' });
  }
});

// Waitlist & Early Access Subscription
app.post('/api/waitlist/subscribe', (req: Request, res: Response) => {
  try {
    const { contact, type = 'email' } = req.body;
    if (!contact || contact.trim().length < 3) {
      return res.status(400).json({ error: 'Please provide a valid email or phone number' });
    }
    const id = `sub-${Date.now()}-${Math.round(Math.random() * 1000)}`;
    db.prepare('INSERT INTO waitlist_subscribers (id, contact, type) VALUES (?, ?, ?)').run(id, contact.trim(), type);
    res.json({ success: true, message: 'You have been registered for early access to Drop 02!' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to register subscription' });
  }
});

// =========================================================================
// 6. WARDROBE VAULT & SIGLIP VISUAL EMBEDDINGS
// =========================================================================

// Get user's saved wardrobe vault items
app.get('/api/wardrobe-vault', (req: Request, res: Response) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    let userId = (req.query.userId as string) || 'user-customer-demo';

    if (token) {
      try {
        const decoded = jwt.verify(token, JWT_SECRET) as any;
        if (decoded?.id) userId = decoded.id;
      } catch {}
    }

    const items = db.prepare('SELECT * FROM wardrobe_vault WHERE user_id = ? ORDER BY created_at DESC').all(userId) as any[];
    const parsed = items.map((it) => ({
      ...it,
      tags: JSON.parse(it.tags || '[]'),
    }));

    res.json({ success: true, vault: parsed });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch wardrobe vault' });
  }
});

// Pin item with transparent cutout to Wardrobe Vault
app.post('/api/wardrobe-vault', (req: Request, res: Response) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    let userId = req.body.userId || 'user-customer-demo';

    if (token) {
      try {
        const decoded = jwt.verify(token, JWT_SECRET) as any;
        if (decoded?.id) userId = decoded.id;
      } catch {}
    }

    const {
      itemName = 'Owned Apparel Item',
      category = 'Tops',
      colorName = 'Warm Beige',
      colorHex = '#C5A059',
      imageUrl = 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=700&q=80',
      tags = ['Capsule Essential'],
    } = req.body;

    const id = `vault-${Date.now()}`;
    db.prepare(`
      INSERT INTO wardrobe_vault (id, user_id, item_name, category, color_name, color_hex, image_url, tags)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, userId, itemName, category, colorName, colorHex, imageUrl, JSON.stringify(tags));

    res.json({ success: true, id, message: 'Item saved to Wardrobe Vault' });
  } catch (error) {
    console.error('Error pinning to vault:', error);
    res.status(500).json({ error: 'Failed to save to wardrobe vault' });
  }
});

// Delete item from Wardrobe Vault
app.delete('/api/wardrobe-vault/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    db.prepare('DELETE FROM wardrobe_vault WHERE id = ?').run(id);
    res.json({ success: true, message: 'Item deleted from vault' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete vault item' });
  }
});

// Compute SigLIP/CLIP Visual Embedding matches against live catalog
app.post('/api/wardrobe-vault/match', async (req: Request, res: Response) => {
  try {
    const { vaultItem } = req.body;
    if (!vaultItem) {
      return res.status(400).json({ error: 'Vault item details required' });
    }

    const catalogProducts = db.prepare('SELECT * FROM products').all() as any[];
    const matches = await computeWardrobeMatches(vaultItem, catalogProducts);

    res.json({
      success: true,
      matches,
      modelUsed: process.env.HUGGINGFACE_API_KEY ? 'google/siglip-base-patch16-224 (Hugging Face)' : 'Local Harmonic Pairing Rule Engine',
    });
  } catch (error: any) {
    console.error('Visual matching error:', error);
    res.status(500).json({ error: error.message || 'Failed to match wardrobe item' });
  }
});

// Fallback SPA routing
app.get('*', (req: Request, res: Response, next) => {
  if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) return next();
  const indexPath = path.join(distPath, 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.send('TARVEQ Atelier Backend Active');
  }
});

app.listen(PORT, () => {
  console.log(`[TARVEQ Production Server] Running smoothly on port ${PORT}`);
});
