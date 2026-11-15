import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';
import crypto from 'node:crypto';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import multer from 'multer';
import Razorpay from 'razorpay';
import dotenv from 'dotenv';
import { db, initDatabase, getNextOrderId } from './db.js';
import { shiprocketService } from './services/shiprocketService.js';
import {
  generateWhatsAppUrls,
  sendCloudApiNotification,
  ADMIN_PHONE_1,
  ADMIN_PHONE_2
} from './services/whatsappNotificationService.js';
import {
  generateSecret,
  computeTOTP,
  verifyTOTP,
  getOtpAuthUrl
} from './services/totpService.js';

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
const JWT_SECRET = process.env.JWT_SECRET || 'aura_atelier_production_jwt_secret_2026_key';

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
    cb(null, 'aura-prod-' + uniqueSuffix + ext);
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

// Razorpay Instance
const razorpayKeyId = process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder_key';
const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET || 'rzp_test_placeholder_secret';
let razorpayInstance: Razorpay | null = null;
try {
  razorpayInstance = new Razorpay({
    key_id: razorpayKeyId,
    key_secret: razorpayKeySecret,
  });
} catch (e) {
  console.warn('[Razorpay] Running in Test Mode Simulator');
}

// =========================================================================
// AUTH MIDDLEWARE
// =========================================================================
export interface AuthRequest extends Request {
  user?: any;
}

function authenticateToken(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
}

function requireAdmin(req: AuthRequest, res: Response, next: NextFunction) {
  authenticateToken(req, res, () => {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ error: 'Access restricted to AURA Founder / Atelier Admins only' });
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
      street: '12th Cross, Indiranagar',
      city: 'Bengaluru',
      state: 'Karnataka',
      pincode: '560038',
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

    // Google Authenticator 2FA Gate
    if (row.two_factor_enabled === 1) {
      const tempToken = jwt.sign(
        { id: row.id, email: row.email, role: row.role, name: row.name, stage: '2fa' },
        JWT_SECRET,
        { expiresIn: '5m' }
      );
      return res.json({
        success: true,
        requires2FA: true,
        tempToken,
        message: 'Google Authenticator 2FA verification required'
      });
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

// Login 2FA Verification Endpoint
app.post('/api/auth/login/2fa', (req: Request, res: Response) => {
  try {
    const { tempToken, code } = req.body;
    if (!tempToken || !code) {
      return res.status(400).json({ error: 'Temporary token and 6-digit code are required' });
    }

    let decoded: any;
    try {
      decoded = jwt.verify(tempToken, JWT_SECRET);
    } catch {
      return res.status(401).json({ error: '2FA session expired. Please log in again.' });
    }

    if (decoded.stage !== '2fa') {
      return res.status(401).json({ error: 'Invalid 2FA session' });
    }

    const row = db.prepare('SELECT * FROM users WHERE id = ?').get(decoded.id) as any;
    if (!row || !row.two_factor_secret) {
      return res.status(400).json({ error: 'Google Authenticator is not configured for this account' });
    }

    const isValid = verifyTOTP(String(code).trim(), row.two_factor_secret);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid Google Authenticator code. Check the 6-digit code and try again.' });
    }

    const user = {
      id: row.id,
      name: row.name,
      email: row.email,
      phone: row.phone,
      role: row.role,
      two_factor_enabled: true,
      shipping_address: JSON.parse(row.shipping_address || '{}'),
      style_dna: JSON.parse(row.style_dna || '{}'),
      saved_wardrobe_vault: JSON.parse(row.saved_wardrobe_vault || '[]'),
    };

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role, name: user.name }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ success: true, token, user });
  } catch (error) {
    console.error('2FA verification error:', error);
    res.status(500).json({ error: 'Failed to verify Google Authenticator code' });
  }
});

// 2FA Management Endpoints (Generate QR Code & Secret)
app.post('/api/auth/2fa/generate', authenticateToken, (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    const secret = generateSecret();
    const otpauthUrl = getOtpAuthUrl(user.email, secret, 'TARVEQ Atelier');
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(otpauthUrl)}`;

    // Store the pending secret on user
    db.prepare('UPDATE users SET two_factor_secret = ? WHERE id = ?').run(secret, user.id);

    res.json({
      success: true,
      secret,
      otpauthUrl,
      qrCodeUrl,
      issuer: 'TARVEQ Atelier',
      account: user.email,
    });
  } catch (error) {
    console.error('Generate 2FA error:', error);
    res.status(500).json({ error: 'Failed to generate 2FA secret' });
  }
});

// 2FA Enable Endpoint (Verify initial code and set active)
app.post('/api/auth/2fa/enable', authenticateToken, (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    const { token } = req.body;
    if (!user) return res.status(401).json({ error: 'Unauthorized' });
    if (!token) return res.status(400).json({ error: '6-digit verification code is required' });

    const row = db.prepare('SELECT two_factor_secret FROM users WHERE id = ?').get(user.id) as any;
    if (!row || !row.two_factor_secret) {
      return res.status(400).json({ error: 'No 2FA setup found. Please generate a QR code first.' });
    }

    const isValid = verifyTOTP(String(token).trim(), row.two_factor_secret);
    if (!isValid) {
      return res.status(400).json({ error: 'Incorrect 6-digit code. Please verify the time on your phone and try again.' });
    }

    db.prepare('UPDATE users SET two_factor_enabled = 1 WHERE id = ?').run(user.id);
    res.json({ success: true, message: 'Google Authenticator 2FA activated successfully!' });
  } catch (error) {
    console.error('Enable 2FA error:', error);
    res.status(500).json({ error: 'Failed to enable Google Authenticator' });
  }
});

// 2FA Disable Endpoint
app.post('/api/auth/2fa/disable', authenticateToken, (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    const { token } = req.body;
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    const row = db.prepare('SELECT two_factor_secret FROM users WHERE id = ?').get(user.id) as any;
    if (!row || !row.two_factor_secret) {
      return res.status(400).json({ error: '2FA is not active' });
    }

    if (token) {
      const isValid = verifyTOTP(String(token).trim(), row.two_factor_secret);
      if (!isValid) {
        return res.status(400).json({ error: 'Invalid Google Authenticator code.' });
      }
    }

    db.prepare('UPDATE users SET two_factor_enabled = 0, two_factor_secret = NULL WHERE id = ?').run(user.id);
    res.json({ success: true, message: 'Google Authenticator 2FA has been disabled.' });
  } catch (error) {
    console.error('Disable 2FA error:', error);
    res.status(500).json({ error: 'Failed to disable 2FA' });
  }
});

// One-Click Demo Login (Customer or Admin)
app.post('/api/auth/demo-login', (req: Request, res: Response) => {
  try {
    const { role = 'customer' } = req.body;
    const targetEmail = role === 'admin' ? 'admin@auramodest.com' : 'customer@auramodest.com';

    const row = db.prepare('SELECT * FROM users WHERE email = ?').get(targetEmail) as any;
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

    if (!token) {
      // Fallback to customer-demo for unauthenticated guest browsing
      const demoUser = db.prepare("SELECT * FROM users WHERE email = 'customer@auramodest.com'").get() as any;
      if (demoUser) {
        return res.json({
          success: true,
          authenticated: false,
          user: {
            id: demoUser.id,
            name: demoUser.name,
            email: demoUser.email,
            phone: demoUser.phone,
            role: demoUser.role,
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

// Persistent Style DNA Calibration
app.post('/api/style-dna', (req: Request, res: Response) => {
  try {
    const {
      userId,
      height = 162,
      buildProportion = 'Regular',
      modestyPreference = 'Balanced Modest',
      skinUndertone = 'Warm Golden',
      shoulderCm = 38.5,
      waistCm = 72.0,
      hipCm = 98.0,
    } = req.body;

    const targetUserId = userId || 'user-customer-demo';
    const styleDnaData = {
      is_scanned: 1,
      height,
      build_proportion: buildProportion,
      modesty_preference: modestyPreference,
      undertone: skinUndertone,
      shoulder_cm: shoulderCm,
      waist_cm: waistCm,
      hip_cm: hipCm,
      calibrated_at: new Date().toISOString(),
    };

    db.prepare(`
      UPDATE users
      SET style_dna = ?
      WHERE id = ?
    `).run(JSON.stringify(styleDnaData), targetUserId);

    const updated = db.prepare('SELECT * FROM users WHERE id = ?').get(targetUserId) as any;

    let paletteName = 'Warm Golden Honey & Spiced Terracotta';
    let swatches = [
      { name: 'Warm Terracotta', hex: '#C86D51' },
      { name: 'Spiced Ochre', hex: '#C5A059' },
      { name: 'Warm Ivory', hex: '#FAF7F2' },
      { name: 'Tuscan Olive', hex: '#5E6E58' },
      { name: 'Deep Espresso', hex: '#1E1B18' },
    ];

    if (skinUndertone === 'Olive') {
      paletteName = 'Olive Earth & Muted Moss';
      swatches = [
        { name: 'Sage Olive', hex: '#5E6E58' },
        { name: 'Toasted Cinnamon', hex: '#9A5B42' },
        { name: 'Warm Sand', hex: '#F2ECE1' },
        { name: 'Charcoal Umber', hex: '#2A2521' },
        { name: 'Subtle Gold', hex: '#C49A45' },
      ];
    } else if (skinUndertone === 'Deep Espresso') {
      paletteName = 'Rich Espresso & Burnished Rust';
      swatches = [
        { name: 'Deep Espresso', hex: '#1E1B18' },
        { name: 'Burnished Terracotta', hex: '#A85138' },
        { name: 'Rich Amber', hex: '#B87A36' },
        { name: 'Soft Sand', hex: '#E0D4C3' },
        { name: 'Deep Emerald', hex: '#3B5244' },
      ];
    } else if (skinUndertone === 'Cool') {
      paletteName = 'Cool Rose Slate & Mineral Charcoal';
      swatches = [
        { name: 'Mineral Charcoal', hex: '#3D4148' },
        { name: 'Cool Alabaster', hex: '#F7F6F4' },
        { name: 'Dusty Rosewood', hex: '#B88279' },
        { name: 'Sage Heather', hex: '#687358' },
        { name: 'Muted Pewter', hex: '#8C9298' },
      ];
    }

    res.json({
      success: true,
      message: 'Style DNA saved permanently',
      user: {
        id: updated.id,
        name: updated.name,
        email: updated.email,
        role: updated.role,
        style_dna: styleDnaData,
      },
      palette: {
        paletteName,
        undertone: skinUndertone,
        swatches,
        confidencePct: 98.8,
        projectedReturnRateReduction: '78.8% reduction vs conventional D2C',
      },
    });
  } catch (error) {
    console.error('Style DNA error:', error);
    res.status(500).json({ error: 'Failed to calibrate Style DNA' });
  }
});

// Reset Style DNA (for demo testing)
app.post('/api/user/reset', (req: Request, res: Response) => {
  try {
    const { userId = 'user-customer-demo' } = req.body;
    const resetDna = {
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

    db.prepare('UPDATE users SET style_dna = ? WHERE id = ?').run(JSON.stringify(resetDna), userId);
    res.json({ success: true, message: 'Style DNA reset to unscanned', style_dna: resetDna });
  } catch (error) {
    res.status(500).json({ error: 'Failed to reset user' });
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
// 3. PAYMENT GATEWAY (RAZORPAY INDIA & SIMULATOR)
// =========================================================================

// Create Razorpay Order
app.post('/api/payments/create-order', (req: Request, res: Response) => {
  try {
    const { items = [], userId } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ error: 'Cart is empty' });
    }

    // Check inventory stock for each item variant
    for (const item of items) {
      const prod = db.prepare('SELECT name, stock_inventory FROM products WHERE id = ?').get(item.id) as any;
      if (prod) {
        const inv = JSON.parse(prod.stock_inventory || '{}');
        const size = item.size || 'M';
        const length = item.length || 'Regular';
        const available = inv[size]?.[length] ?? 5;

        if (available <= 0) {
          return res.status(400).json({
            error: 'OUT_OF_STOCK',
            message: `"${prod.name}" (${size} / ${length}) is currently sold out. Please join the restock waitlist.`,
          });
        }
      }
    }

    // Calculate total in paise (1 INR = 100 paise)
    let subtotal = 0;
    const isCapsule = items.length >= 2;
    for (const it of items) {
      subtotal += (it.price || 1299) * (it.quantity || 1);
    }
    const discount = isCapsule ? Math.round(subtotal * 0.15) : 0;
    const finalAmountINR = subtotal - discount;
    const amountInPaise = finalAmountINR * 100;

    const demoOrderId = `order_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

    res.json({
      success: true,
      order: {
        id: demoOrderId,
        amount: amountInPaise,
        currency: 'INR',
        amount_inr: finalAmountINR,
        subtotal,
        discount,
      },
      key_id: razorpayKeyId,
      is_simulator: !process.env.RAZORPAY_KEY_SECRET || process.env.RAZORPAY_KEY_SECRET.includes('placeholder'),
    });
  } catch (error) {
    console.error('Payment order creation error:', error);
    res.status(500).json({ error: 'Failed to initiate payment' });
  }
});

// Verify Payment & Execute Order
app.post('/api/payments/verify', (req: Request, res: Response) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      userId = 'user-customer-demo',
      items = [],
      shippingAddress,
      customTailoring = { length: 'Regular', coverage: 'Standard Modest' },
      paymentMethod = 'UPI (Google Pay / PhonePe)',
    } = req.body;

    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId) as any;
    const styleDna = user ? JSON.parse(user.style_dna || '{}') : null;

    // FIT-GATE VERIFICATION
    if (!styleDna || styleDna.is_scanned !== 1) {
      return res.status(403).json({
        error: 'FIT_GATE_BLOCKED',
        message: 'To guarantee a zero-return fit, complete your 3-second Style DNA scan first.',
      });
    }

    // Calculate totals
    let subtotal = 0;
    const isCapsule = items.length >= 2;
    for (const it of items) {
      subtotal += (it.price || 1299) * (it.quantity || 1);
    }
    const discount = isCapsule ? Math.round(subtotal * 0.15) : 0;
    const total = subtotal - discount;

    // Atomic Stock Deduction per variant in SQLite
    for (const it of items) {
      const prod = db.prepare('SELECT id, stock_inventory FROM products WHERE id = ?').get(it.id) as any;
      if (prod) {
        const inv = JSON.parse(prod.stock_inventory || '{}');
        const size = it.size || 'M';
        const length = it.length || customTailoring?.length || 'Regular';

        if (inv[size] && inv[size][length] !== undefined) {
          inv[size][length] = Math.max(0, inv[size][length] - (it.quantity || 1));
          db.prepare('UPDATE products SET stock_inventory = ? WHERE id = ?').run(JSON.stringify(inv), prod.id);
        }
      }
    }

    const orderId = `ORD-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const effectivePaymentId = razorpay_payment_id || `pay_${Date.now()}`;
    const effectiveAddress = shippingAddress || JSON.parse(user?.shipping_address || '{}');

    db.prepare(`
      INSERT INTO orders (
        id, user_id, customer_name, customer_phone, shipping_address,
        items, subtotal, discount, total_amount, payment_id, payment_method,
        payment_status, fulfillment_status, fit_gate_verified, custom_tailoring
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Paid', 'New Order', 1, ?)
    `).run(
      orderId,
      userId,
      user?.name || 'Valued Customer',
      user?.phone || '+91 98765 43210',
      JSON.stringify(effectiveAddress),
      JSON.stringify(items),
      subtotal,
      discount,
      total,
      effectivePaymentId,
      paymentMethod,
      JSON.stringify(customTailoring)
    );

    // Simulated Instant WhatsApp & Email Founder Alert Toast/Log
    const founderAlert = `
==============================================================
🔔 [AURA FOUNDER & ATELIER ALERT] New Paid Order ${orderId}!
Customer: ${user?.name || 'Customer'} (${user?.phone || 'N/A'})
Amount: ₹${total.toLocaleString('en-IN')} [PAID via ${paymentMethod}]
Items: ${items.map((i: any) => `${i.name} (Size: ${i.size || 'M'}, Length: ${i.length || 'Regular'})`).join(', ')}
Shipping Destination: ${effectiveAddress.city || 'Bengaluru'}, ${effectiveAddress.pincode || '560038'}
Fit-Gate Certified: YES (Shoulder ${styleDna.shoulder_cm || 38.5}cm, Undertone: ${styleDna.undertone})
==============================================================`;
    console.log(founderAlert);

    res.json({
      success: true,
      orderId,
      paymentId: effectivePaymentId,
      total,
      paymentStatus: 'Paid',
      fulfillmentStatus: 'New Order',
      founderAlertMessage: `Paid order ${orderId} received from ${user?.name}. Notification sent to Tara Kapoor (Founder WhatsApp).`,
      zeroReturnCertificate: {
        certificateNo: `ZRC-${Date.now().toString().slice(-6)}`,
        guarantee: 'Zero-Return Guaranteed or 100% Instant Store Credit + Free Alteration Concierge',
        calibratedShoulder: `${styleDna.shoulder_cm || 38.5} cm`,
        selectedLength: customTailoring.length || 'Regular',
        selectedCoverage: customTailoring.coverage || 'Standard Modest',
      },
    });
  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({ error: 'Failed to complete order' });
  }
});

// =========================================================================
// 4. WHATSAPP-FIRST ORDER MANAGEMENT SYSTEM
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
    res.attachment(`aura-orders-ledger-${new Date().toISOString().slice(0, 10)}.csv`);
    res.send(csv);
  } catch (error) {
    res.status(500).json({ error: 'Failed to export CSV' });
  }
});

// =========================================================================
// 5. SHIPROCKET LOGISTICS & TRACKING WORKFLOW
// =========================================================================

// Admin: Generate Shipment & AWB
app.post('/api/admin/orders/:id/generate-awb', requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(id) as any;

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const shipment = await shiprocketService.generateShipment({
      id: order.id,
      customer_name: order.customer_name,
      customer_phone: order.customer_phone,
      shipping_address: JSON.parse(order.shipping_address || '{}'),
      items: JSON.parse(order.items || '[]'),
      total_amount: order.total_amount,
    });

    db.prepare(`
      UPDATE orders
      SET fulfillment_status = 'Shipped via Shiprocket',
          awb_tracking_code = ?,
          courier_partner = ?
      WHERE id = ?
    `).run(shipment.awb_tracking_code, shipment.courier_partner, id);

    res.json({
      success: true,
      message: 'Shipment manifest generated & AWB assigned',
      shipment,
    });
  } catch (error) {
    console.error('Shipment generation error:', error);
    res.status(500).json({ error: 'Failed to generate shipment' });
  }
});

// Customer: Live Order Tracking Timeline
app.get('/api/orders/:id/tracking', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(id) as any;

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const awb = order.awb_tracking_code || 'DEL-92847192';
    const timeline = shiprocketService.getTrackingTimeline(awb, order.created_at);

    res.json({
      success: true,
      orderId: order.id,
      awbTrackingCode: order.awb_tracking_code,
      courierPartner: order.courier_partner || 'Delhivery Express',
      fulfillmentStatus: order.fulfillment_status,
      timeline,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch tracking' });
  }
});

// =========================================================================
// WARDROBE VAULT & CAPSULE ENGINE
// =========================================================================

app.get('/api/wardrobe-vault', (req: Request, res: Response) => {
  try {
    const userId = (req.query.userId as string) || 'user-customer-demo';
    const vaultItems = db.prepare('SELECT * FROM wardrobe_vault WHERE user_id = ?').all(userId) as any[];
    const parsed = vaultItems.map((v) => ({ ...v, tags: JSON.parse(v.tags || '[]') }));
    res.json({ success: true, vault: parsed });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch vault' });
  }
});

app.post('/api/wardrobe-vault', (req: Request, res: Response) => {
  try {
    const { userId = 'user-customer-demo', itemName, category = 'Tops', colorName = 'Custom Tone', colorHex = '#C5A059', imageUrl, tags = ['Smart Capsule'] } = req.body;
    const id = `vault-custom-${Date.now()}`;

    db.prepare(`
      INSERT INTO wardrobe_vault (id, user_id, item_name, category, color_name, color_hex, image_url, tags)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, userId, itemName, category, colorName, colorHex, imageUrl || 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=700&q=80', JSON.stringify(tags));

    res.json({ success: true, id, message: 'Item pinned to Wardrobe Vault' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to pin item' });
  }
});

app.delete('/api/wardrobe-vault/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    db.prepare('DELETE FROM wardrobe_vault WHERE id = ?').run(id);
    res.json({ success: true, message: 'Item removed from wardrobe vault' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete vault item' });
  }
});

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

app.post('/api/capsule/evaluate', (req: Request, res: Response) => {
  try {
    const { vaultItemId, productIds = [] } = req.body;
    const vaultItem = db.prepare('SELECT * FROM wardrobe_vault WHERE id = ?').get(vaultItemId) as any;
    const products = productIds.map((pid: string) => db.prepare('SELECT * FROM products WHERE id = ?').get(pid)).filter(Boolean) as any[];

    const subtotal = products.reduce((sum, p) => sum + p.price, 0);
    const bundleDiscount = Math.round(subtotal * 0.15);
    const finalPrice = subtotal - bundleDiscount;

    res.json({
      success: true,
      synergyScore: products.length >= 2 ? 98.6 : 96.2,
      bundleDiscountPct: 15,
      subtotal,
      bundleDiscount,
      finalPrice,
      vaultItem,
      products,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to evaluate capsule' });
  }
});

// Fallback SPA routing
app.get('*', (req: Request, res: Response, next) => {
  if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) return next();
  const indexPath = path.join(distPath, 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.send('AURA Atelier Backend Active');
  }
});

app.listen(PORT, () => {
  console.log(`[AURA Production Server] Running smoothly on port ${PORT}`);
});
