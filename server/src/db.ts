import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import bcrypt from 'bcryptjs';

const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.resolve(__dirname, '../../aura.db');

class ResilientMemoryDb {
  tables: {
    users: Map<string, any>;
    products: Map<string, any>;
    orders: Map<string, any>;
    order_counters: Map<number, any>;
    wardrobe_vault: Map<string, any>;
    waitlist_subscribers: Map<string, any>;
  } = {
    users: new Map(),
    products: new Map(),
    orders: new Map(),
    order_counters: new Map(),
    wardrobe_vault: new Map(),
    waitlist_subscribers: new Map(),
  };

  exec(sql: string) {
    if (sql.includes('DELETE FROM products')) {
      this.tables.products.clear();
    }
  }

  prepare(sql: string) {
    const trimmed = sql.trim();
    return {
      run: (...params: any[]) => {
        try {
          if (/INSERT INTO users/i.test(trimmed)) {
            const [id, name, email, password_hash, phone, role, shipping_address, style_dna, saved_wardrobe_vault] = params;
            this.tables.users.set(id, {
              id,
              name,
              email,
              password_hash,
              phone,
              role,
              shipping_address,
              style_dna,
              saved_wardrobe_vault: saved_wardrobe_vault || '[]',
              created_at: new Date().toISOString(),
            });
          } else if (/INSERT INTO products/i.test(trimmed)) {
            const [
              id,
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
              image_url,
              gallery,
              description,
              fit_specs,
              stock_inventory,
              default_match_score,
            ] = params;
            this.tables.products.set(id, {
              id,
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
              image_url,
              gallery,
              description,
              fit_specs,
              stock_inventory,
              default_match_score,
              created_at: new Date().toISOString(),
            });
          } else if (/INSERT INTO orders/i.test(trimmed)) {
            const [
              id,
              user_id,
              customer_name,
              customer_phone,
              shipping_address,
              items,
              subtotal,
              discount,
              total_amount,
              payment_id,
              payment_method,
              payment_status,
              fulfillment_status,
              awb_tracking_code,
              courier_partner,
              fit_gate_verified,
              custom_tailoring,
              customer_email,
              delivery_charges,
              customer_notes,
              upi_reference,
              payment_screenshot,
            ] = params;
            this.tables.orders.set(id, {
              id,
              user_id,
              customer_name,
              customer_phone,
              shipping_address,
              items,
              subtotal,
              discount,
              total_amount,
              payment_id,
              payment_method,
              payment_status,
              fulfillment_status,
              awb_tracking_code,
              courier_partner,
              fit_gate_verified,
              custom_tailoring,
              customer_email,
              delivery_charges,
              customer_notes,
              upi_reference,
              payment_screenshot,
              created_at: new Date().toISOString(),
            });
          } else if (/INSERT INTO wardrobe_vault/i.test(trimmed)) {
            const [id, user_id, item_name, category, color_name, color_hex, image_url, tags] = params;
            this.tables.wardrobe_vault.set(id, {
              id,
              user_id,
              item_name,
              category,
              color_name,
              color_hex,
              image_url,
              tags,
              created_at: new Date().toISOString(),
            });
          } else if (/INSERT INTO order_counters/i.test(trimmed)) {
            const [year, last_seq] = params;
            this.tables.order_counters.set(year, { year, last_seq });
          } else if (/UPDATE order_counters SET last_seq = \? WHERE year = \?/i.test(trimmed)) {
            const [seq, yr] = params;
            const curr = this.tables.order_counters.get(yr) || { year: yr };
            this.tables.order_counters.set(yr, { ...curr, last_seq: seq });
          } else if (/UPDATE products SET stock_inventory = \? WHERE id = \?/i.test(trimmed)) {
            const [inv, pid] = params;
            const curr = this.tables.products.get(pid);
            if (curr) curr.stock_inventory = inv;
          } else if (/UPDATE users SET/i.test(trimmed)) {
            const id = params[params.length - 1];
            const curr = this.tables.users.get(id);
            if (curr) {
              if (trimmed.includes('style_dna = ?')) curr.style_dna = params[0];
              if (trimmed.includes('shipping_address = ?')) curr.shipping_address = params[0];
              if (trimmed.includes('saved_wardrobe_vault = ?')) curr.saved_wardrobe_vault = params[0];
            }
          } else if (/DELETE FROM wardrobe_vault WHERE id = \?/i.test(trimmed)) {
            this.tables.wardrobe_vault.delete(params[0]);
          }
        } catch (err) {
          console.warn('[ResilientMemoryDb] run notice:', err);
        }
        return { changes: 1 };
      },
      get: (...params: any[]) => {
        try {
          if (/SELECT id FROM users WHERE email = \?/i.test(trimmed)) {
            const row = Array.from(this.tables.users.values()).find((u) => u.email === params[0]);
            return row ? { id: row.id } : undefined;
          }
          if (/SELECT \* FROM users WHERE email = \?/i.test(trimmed)) {
            return Array.from(this.tables.users.values()).find((u) => u.email === params[0]);
          }
          if (/SELECT \* FROM users WHERE id = \?/i.test(trimmed)) {
            return this.tables.users.get(params[0]);
          }
          if (/SELECT \* FROM users WHERE email = 'customer@tarveqatelier.com'/i.test(trimmed)) {
            return Array.from(this.tables.users.values()).find(
              (u) => u.email === 'customer@tarveqatelier.com' || u.email === 'customer@auramodest.com'
            );
          }
          if (/SELECT style_dna FROM users WHERE id = \?/i.test(trimmed)) {
            const u = this.tables.users.get(params[0]);
            return u ? { style_dna: u.style_dna } : undefined;
          }
          if (/SELECT count\(\*\) as count FROM products/i.test(trimmed)) {
            return { count: this.tables.products.size };
          }
          if (/SELECT id, name, category, price, image_url, default_match_score FROM products WHERE id = \?/i.test(trimmed)) {
            return this.tables.products.get(params[0]);
          }
          if (/SELECT \* FROM products WHERE id = \?/i.test(trimmed)) {
            return this.tables.products.get(params[0]);
          }
          if (/SELECT count\(\*\) as count FROM wardrobe_vault/i.test(trimmed)) {
            return { count: this.tables.wardrobe_vault.size };
          }
          if (/SELECT last_seq FROM order_counters WHERE year = \?/i.test(trimmed)) {
            return this.tables.order_counters.get(params[0]);
          }
          if (/SELECT COUNT\(\*\) as cnt FROM orders/i.test(trimmed)) {
            return { cnt: this.tables.orders.size };
          }
          if (/SELECT \* FROM orders WHERE id = \?/i.test(trimmed)) {
            return this.tables.orders.get(params[0]);
          }
          if (/SELECT \* FROM orders WHERE user_id = \? ORDER BY created_at DESC LIMIT 1/i.test(trimmed)) {
            const userOrders = Array.from(this.tables.orders.values()).filter((o) => o.user_id === params[0]);
            return userOrders[userOrders.length - 1];
          }
        } catch (err) {
          console.warn('[ResilientMemoryDb] get notice:', err);
        }
        return undefined;
      },
      all: (...params: any[]) => {
        try {
          if (/FROM products/i.test(trimmed)) {
            return Array.from(this.tables.products.values());
          }
          if (/FROM orders/i.test(trimmed)) {
            if (params.length > 0) {
              return Array.from(this.tables.orders.values()).filter((o) => o.user_id === params[0]).reverse();
            }
            return Array.from(this.tables.orders.values()).reverse();
          }
          if (/FROM wardrobe_vault/i.test(trimmed)) {
            const v = Array.from(this.tables.wardrobe_vault.values()).filter((item) => item.user_id === params[0]).reverse();
            if (trimmed.includes('LIMIT 4')) return v.slice(0, 4);
            return v;
          }
        } catch (err) {
          console.warn('[ResilientMemoryDb] all notice:', err);
        }
        return [];
      },
    };
  }
}

let sqliteDbInstance: any = null;
try {
  const { DatabaseSync } = require('node:sqlite');
  if (typeof DatabaseSync === 'function') {
    sqliteDbInstance = new DatabaseSync(dbPath);
    sqliteDbInstance.exec('PRAGMA journal_mode = WAL;');
  }
} catch (err) {
  console.warn('[TARVEQ Database] node:sqlite is not available on this Node runtime. Operating in resilient memory mode.');
}

export const db = sqliteDbInstance || new ResilientMemoryDb();

/**
 * Generates sequential order ID in TAR-YYYY-XXXXX format (e.g. TAR-2026-00001)
 */
export function getNextOrderId(): string {
  const year = new Date().getFullYear();
  try {
    let row = db.prepare('SELECT last_seq FROM order_counters WHERE year = ?').get(year) as any;
    if (!row) {
      db.prepare('INSERT INTO order_counters (year, last_seq) VALUES (?, 0)').run(year);
      row = { last_seq: 0 };
    }
    const nextSeq = row.last_seq + 1;
    db.prepare('UPDATE order_counters SET last_seq = ? WHERE year = ?').run(nextSeq, year);
    const padded = String(nextSeq).padStart(5, '0');
    return `TAR-${year}-${padded}`;
  } catch {
    const count = (db.prepare('SELECT COUNT(*) as cnt FROM orders').get() as any)?.cnt || 0;
    const padded = String(count + 1).padStart(5, '0');
    return `TAR-${year}-${padded}`;
  }
}

export function initDatabase() {
  // 1. Users Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      phone TEXT,
      role TEXT CHECK(role IN ('customer', 'admin')) DEFAULT 'customer',
      shipping_address TEXT,
      style_dna TEXT,
      saved_wardrobe_vault TEXT DEFAULT '[]',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // 2. Products Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      tagline TEXT NOT NULL,
      category TEXT NOT NULL,
      price INTEGER NOT NULL,
      original_price INTEGER NOT NULL,
      undertone_suitability TEXT NOT NULL,
      undertone_tags TEXT NOT NULL,
      fabric_spec TEXT NOT NULL,
      fabric_opacity TEXT NOT NULL,
      modesty_rating REAL NOT NULL,
      coverage_type TEXT NOT NULL,
      image_url TEXT NOT NULL,
      gallery TEXT NOT NULL,
      description TEXT NOT NULL,
      fit_specs TEXT NOT NULL,
      stock_inventory TEXT NOT NULL,
      default_match_score REAL NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // 3. Wardrobe Vault Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS wardrobe_vault (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      item_name TEXT NOT NULL,
      category TEXT NOT NULL,
      color_name TEXT NOT NULL,
      color_hex TEXT NOT NULL,
      image_url TEXT NOT NULL,
      tags TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // 4. Orders Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      customer_name TEXT NOT NULL,
      customer_phone TEXT,
      shipping_address TEXT NOT NULL,
      items TEXT NOT NULL,
      subtotal INTEGER NOT NULL,
      discount INTEGER NOT NULL,
      total_amount INTEGER NOT NULL,
      payment_id TEXT,
      payment_method TEXT DEFAULT 'Manual UPI',
      payment_status TEXT NOT NULL DEFAULT 'Pending',
      fulfillment_status TEXT NOT NULL DEFAULT 'New Order',
      awb_tracking_code TEXT,
      courier_partner TEXT,
      fit_gate_verified INTEGER NOT NULL DEFAULT 1,
      custom_tailoring TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // 5. Waitlist Subscribers Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS waitlist_subscribers (
      id TEXT PRIMARY KEY,
      contact TEXT NOT NULL,
      type TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // 6. Order Sequential Counter Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS order_counters (
      year INTEGER PRIMARY KEY,
      last_seq INTEGER NOT NULL DEFAULT 0
    );
  `);

  // Safe schema migrations for existing orders table
  const orderColumnsToAdd = [
    'customer_email TEXT',
    'delivery_charges INTEGER DEFAULT 0',
    'customer_notes TEXT',
    'upi_reference TEXT',
    'payment_screenshot TEXT',
    'admin_notes TEXT'
  ];

  for (const col of orderColumnsToAdd) {
    try {
      db.exec(`ALTER TABLE orders ADD COLUMN ${col};`);
    } catch {
      // Column already exists, ignore
    }
  }

  // Safe schema migrations for users (Google Authenticator 2FA)
  const userColumnsToAdd = [
    'two_factor_secret TEXT',
    'two_factor_enabled INTEGER DEFAULT 0'
  ];

  for (const col of userColumnsToAdd) {
    try {
      db.exec(`ALTER TABLE users ADD COLUMN ${col};`);
    } catch {
      // Column already exists, ignore
    }
  }

  seedData();
}

function getDefaultInventory() {
  return JSON.stringify({
    XS: { Petite: 4, Regular: 6, Tall: 3 },
    S: { Petite: 8, Regular: 12, Tall: 6 },
    M: { Petite: 12, Regular: 18, Tall: 8 },
    L: { Petite: 8, Regular: 12, Tall: 5 },
    XL: { Petite: 4, Regular: 6, Tall: 3 },
  });
}

function seedData() {
  // Pre-seed Admin Account
  const adminExists = db.prepare('SELECT id FROM users WHERE email = ?').get('admin@auramodest.com');
  if (!adminExists) {
    const adminHash = bcrypt.hashSync('admin123', 10);
    db.prepare(`
      INSERT INTO users (id, name, email, password_hash, phone, role, shipping_address, style_dna)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      'user-admin-01',
      'Samruddhi & Vikash (Co-Founders)',
      'admin@auramodest.com',
      adminHash,
      '+91 98200 12345',
      'admin',
      JSON.stringify({
        street: 'TARVEQ Atelier Studio, Rajpur Road',
        city: 'Dehradun',
        state: 'Uttarakhand',
        pincode: '248001'
      }),
      JSON.stringify({
        is_scanned: 1,
        height: 165,
        build_proportion: 'Regular',
        modesty_preference: 'Balanced Modest',
        undertone: 'Olive',
        shoulder_cm: 38.5,
        bust_cm: 88.0,
        waist_cm: 70.0,
        hip_cm: 96.0,
        calibrated_at: new Date().toISOString()
      })
    );
  }

  // Pre-seed Demo Customer Account
  const customerExists = db.prepare('SELECT id FROM users WHERE email = ?').get('customer@auramodest.com');
  if (!customerExists) {
    const custHash = bcrypt.hashSync('customer123', 10);
    db.prepare(`
      INSERT INTO users (id, name, email, password_hash, phone, role, shipping_address, style_dna)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      'user-customer-demo',
      'Ananya Sharma',
      'customer@auramodest.com',
      custHash,
      '+91 98765 43210',
      'customer',
      JSON.stringify({
        street: 'Flat 402, Rajpur Road Colony',
        city: 'Dehradun',
        state: 'Uttarakhand',
        pincode: '248001'
      }),
      JSON.stringify({
        is_scanned: 1,
        height: 162,
        build_proportion: 'Regular',
        modesty_preference: 'Full Coverage',
        undertone: 'Warm Golden',
        shoulder_cm: 38.5,
        bust_cm: 90.0,
        waist_cm: 72.0,
        hip_cm: 98.0,
        calibrated_at: new Date().toISOString()
      })
    );
  }

  // Seed Products with Stock Inventory
  const productCount = (db.prepare('SELECT count(*) as count FROM products').get() as any).count;
  if (productCount < 6) {
    db.exec('DELETE FROM products;');

    const insertProd = db.prepare(`
      INSERT INTO products (
        id, name, tagline, category, price, original_price,
        undertone_suitability, undertone_tags, fabric_spec, fabric_opacity,
        modesty_rating, coverage_type, image_url, gallery, description,
        fit_specs, stock_inventory, default_match_score
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const products = [
      {
        id: 'prod-terracotta-cambric',
        name: 'Terracotta Breathable Cambric Co-ord Set',
        tagline: 'Dual-tone earth weave with ergonomic ease pleats',
        category: 'Co-ord Set',
        price: 1399,
        original_price: 2499,
        undertone_suitability: 'Warm / Olive',
        undertone_tags: JSON.stringify(['Warm Golden', 'Olive']),
        fabric_spec: 'Pure Breathable Cambric Cotton (210 GSM)',
        fabric_opacity: '100% Zero-Sheer Guaranteed (Lab Verified)',
        modesty_rating: 9.8,
        coverage_type: 'Full Coverage',
        image_url: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&q=80',
        gallery: JSON.stringify([
          'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&q=80',
          'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=900&q=80'
        ]),
        description: 'Engineered for tropical Indian climates with non-transparent high-count cambric weave. Features relaxed high side-slits, extended cuff wrists, and anti-crease drape suited for warm to olive undertones.',
        fit_specs: JSON.stringify({
          shoulderSlope: 'Anatomical 14° drop',
          chestTolerance: '+4.5cm modest ease',
          waistband: 'Contoured flat front + elasticated back'
        }),
        stock_inventory: getDefaultInventory(),
        default_match_score: 96.8
      },
      {
        id: 'prod-sage-olive-linen',
        name: 'Sage Olive Modest Linen-Blend Tunic & Trousers',
        tagline: 'High-neck structured tunic with fluid straight-leg cut',
        category: 'Tunic Set',
        price: 1599,
        original_price: 2899,
        undertone_suitability: 'Olive / Deep',
        undertone_tags: JSON.stringify(['Olive', 'Deep Espresso']),
        fabric_spec: 'Pre-Washed Flax Linen-Viscose Blend (220 GSM)',
        fabric_opacity: 'Opaque Double-Twist Weave',
        modesty_rating: 9.9,
        coverage_type: 'Full Coverage',
        image_url: 'https://images.unsplash.com/photo-1551803091-e20673f15770?auto=format&fit=crop&w=900&q=80',
        gallery: JSON.stringify([
          'https://images.unsplash.com/photo-1551803091-e20673f15770?auto=format&fit=crop&w=900&q=80',
          'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=900&q=80'
        ]),
        description: 'Tailored for deep and olive skin undertones. The natural earthy sage shade balances yellow and neutral skin hues. Designed with zero-cling linen that stays upright through 12-hour workdays.',
        fit_specs: JSON.stringify({
          shoulderSlope: 'Standard 12°',
          chestTolerance: '+5.0cm modesty allowance',
          waistband: 'Full soft-glide inner drawstring'
        }),
        stock_inventory: getDefaultInventory(),
        default_match_score: 95.2
      },
      {
        id: 'prod-deep-espresso-tee',
        name: 'Deep Espresso 240 GSM Heavyweight Oversized Tee',
        tagline: 'Architectural dropped shoulder with reinforced anti-stretch rib',
        category: 'Heavyweight Tee',
        price: 899,
        original_price: 1499,
        undertone_suitability: 'Warm / Deep',
        undertone_tags: JSON.stringify(['Warm Golden', 'Deep Espresso']),
        fabric_spec: 'Combed Heavyweight Organic Cotton (240 GSM)',
        fabric_opacity: 'Dense Structured Knit (Zero Cling)',
        modesty_rating: 9.6,
        coverage_type: 'Balanced Modest',
        image_url: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=900&q=80',
        gallery: JSON.stringify([
          'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=900&q=80'
        ]),
        description: 'A luxurious 240 GSM boxy cut that eliminates outline cling completely. The deep espresso pigment is formulated with warm undertone micro-pigments to enhance melanin-rich skin radiance.',
        fit_specs: JSON.stringify({
          shoulderSlope: 'Relaxed 18° drop-shoulder',
          chestTolerance: '+8.0cm oversized drape',
          waistband: 'Straight silhouette hem'
        }),
        stock_inventory: getDefaultInventory(),
        default_match_score: 97.4
      },
      {
        id: 'prod-ivory-double-layer-shirt',
        name: 'Ivory Double-Layered Zero-Transparency Shirt',
        tagline: 'Dual-ply poplin front with modest high-stance mandarin collar',
        category: 'Modest Shirt',
        price: 1199,
        original_price: 2199,
        undertone_suitability: 'All Undertones',
        undertone_tags: JSON.stringify(['Warm Golden', 'Olive', 'Deep Espresso', 'Cool']),
        fabric_spec: 'Double-Ply Long Staple Cotton Poplin (195 GSM)',
        fabric_opacity: 'Patent-Pending 100% Zero-Sheer Lamination',
        modesty_rating: 10.0,
        coverage_type: 'Modest High Collar',
        image_url: 'https://images.unsplash.com/photo-1598554747436-c9293d6a588f?auto=format&fit=crop&w=900&q=80',
        gallery: JSON.stringify([
          'https://images.unsplash.com/photo-1598554747436-c9293d6a588f?auto=format&fit=crop&w=900&q=80'
        ]),
        description: 'Finally solves the #1 reason women return white shirts: transparency. Dual-layered front chest shields inner camisoles while breathable side venting prevents overheating.',
        fit_specs: JSON.stringify({
          shoulderSlope: 'Crisp tailored 11° shoulder',
          chestTolerance: '+3.8cm modest button placket',
          waistband: 'Sculpted hem for tucking or untucked elegance'
        }),
        stock_inventory: getDefaultInventory(),
        default_match_score: 98.9
      },
      {
        id: 'prod-cinnamon-relaxed-trousers',
        name: 'Cinnamon Relaxed-Fit Elastic-Back Trousers',
        tagline: 'High-rise pleated silhouette calibrated to Indian hip-waist curves',
        category: 'Trousers',
        price: 1099,
        original_price: 1999,
        undertone_suitability: 'Warm / Olive',
        undertone_tags: JSON.stringify(['Warm Golden', 'Olive']),
        fabric_spec: 'Matte Twill Lyocell Blend with 4-Way Micro-Stretch',
        fabric_opacity: 'Opaque Heavy Twill (230 GSM)',
        modesty_rating: 9.7,
        coverage_type: 'Full Coverage',
        image_url: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=900&q=80',
        gallery: JSON.stringify([
          'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=900&q=80'
        ]),
        description: 'Engineered with a custom 0.72 waist-to-hip ratio prevalent in South Asian demographics. Eliminates waistband gaping at the back while offering graceful wide-leg modesty.',
        fit_specs: JSON.stringify({
          shoulderSlope: 'N/A',
          chestTolerance: 'N/A',
          waistband: 'Tailored front waistband + hidden flexi-elastic back'
        }),
        stock_inventory: getDefaultInventory(),
        default_match_score: 94.6
      },
      {
        id: 'prod-charcoal-structured-coord',
        name: 'Charcoal Structured Campus Co-ord',
        tagline: 'Minimalist boxy overshirt with straight modest joggers',
        category: 'Co-ord Set',
        price: 1499,
        original_price: 2599,
        undertone_suitability: 'Cool / Neutral',
        undertone_tags: JSON.stringify(['Cool', 'Warm Golden']),
        fabric_spec: 'Subtle Mineral-Wash French Terry (240 GSM)',
        fabric_opacity: 'Full Heavyknit Opacity',
        modesty_rating: 9.8,
        coverage_type: 'Full Coverage',
        image_url: 'https://images.unsplash.com/photo-1584273143981-41c073dfe8f8?auto=format&fit=crop&w=900&q=80',
        gallery: JSON.stringify([
          'https://images.unsplash.com/photo-1584273143981-41c073dfe8f8?auto=format&fit=crop&w=900&q=80'
        ]),
        description: 'An understated charcoal set created for cool to neutral undertones. Features seamless dropped armholes for zero pull during prayer or travel movements.',
        fit_specs: JSON.stringify({
          shoulderSlope: '15° relaxed drop',
          chestTolerance: '+6.2cm comfort ease',
          waistband: 'Dual cinch encased drawstring'
        }),
        stock_inventory: getDefaultInventory(),
        default_match_score: 93.7
      }
    ];

    for (const p of products) {
      insertProd.run(
        p.id, p.name, p.tagline, p.category, p.price, p.original_price,
        p.undertone_suitability, p.undertone_tags, p.fabric_spec, p.fabric_opacity,
        p.modesty_rating, p.coverage_type, p.image_url, p.gallery, p.description,
        p.fit_specs, p.stock_inventory, p.default_match_score
      );
    }
  }

  // Pre-seed default Wardrobe Vault items
  const vaultCount = (db.prepare('SELECT count(*) as count FROM wardrobe_vault').get() as any).count;
  if (vaultCount < 3) {
    const insertVault = db.prepare(`
      INSERT INTO wardrobe_vault (id, user_id, item_name, category, color_name, color_hex, image_url, tags)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const vaultItems = [
      {
        id: 'vault-item-1',
        user_id: 'user-customer-demo',
        item_name: 'Existing Black Wide-Leg Pants',
        category: 'Bottoms',
        color_name: 'Jet Black',
        color_hex: '#1A1A1A',
        image_url: 'https://images.unsplash.com/photo-1509551388413-e18d0ac5d495?auto=format&fit=crop&w=700&q=80',
        tags: JSON.stringify(['High Waist', 'Pleated', 'Formal Modest'])
      },
      {
        id: 'vault-item-2',
        user_id: 'user-customer-demo',
        item_name: 'Existing Beige Linen Blazer',
        category: 'Outerwear',
        color_name: 'Oatmeal Beige',
        color_hex: '#D7C7B3',
        image_url: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=700&q=80',
        tags: JSON.stringify(['Breathable', 'Layering', 'Neutral Tone'])
      },
      {
        id: 'vault-item-3',
        user_id: 'user-customer-demo',
        item_name: 'Existing White Sneakers',
        category: 'Footwear',
        color_name: 'Chalk White',
        color_hex: '#F4F4F4',
        image_url: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=700&q=80',
        tags: JSON.stringify(['Minimalist', 'Everyday Comfort', 'Casual'])
      }
    ];

    for (const v of vaultItems) {
      insertVault.run(v.id, v.user_id, v.item_name, v.category, v.color_name, v.color_hex, v.image_url, v.tags);
    }
  }
}
