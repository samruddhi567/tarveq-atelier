export interface ShippingAddress {
  street: string;
  city: string;
  state: string;
  pincode: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'customer' | 'admin';
  two_factor_enabled?: boolean;
  shipping_address?: ShippingAddress;
  style_dna?: {
    is_scanned: number;
    height: number;
    build_proportion: 'Petite' | 'Regular' | 'Tall';
    modesty_preference: 'Full Coverage' | 'Balanced Modest' | 'Relaxed';
    undertone: 'Warm Golden' | 'Olive' | 'Deep Espresso' | 'Cool';
    shoulder_cm?: number;
    bust_cm?: number;
    waist_cm?: number;
    hip_cm?: number;
    calibrated_at?: string | null;
  };
  saved_wardrobe_vault?: any[];
}

export type InventoryMatrix = Record<string, Record<string, number>>;

export interface Product {
  id: string;
  name: string;
  tagline: string;
  category: string;
  price: number;
  original_price: number;
  undertone_suitability: string;
  undertone_tags: string[];
  fabric_spec: string;
  fabric_opacity: string;
  modesty_rating: number;
  coverage_type: string;
  image_url: string;
  gallery: string[];
  description: string;
  fit_specs: {
    shoulderSlope?: string;
    chestTolerance?: string;
    waistband?: string;
  };
  stock_inventory?: InventoryMatrix;
  total_stock?: number;
  is_sold_out?: boolean;
  default_match_score: number;
  aiMatchScore: number;
  shoulderAlignment: number;
  opaqueFabricRating: number;
  undertoneHarmony: number;
  fitVerdict: string;
  isCalibrated: boolean;
}

export interface WardrobeVaultItem {
  id: string;
  user_id: string;
  item_name: string;
  category: string;
  color_name: string;
  color_hex: string;
  image_url: string;
  tags: string[];
}

export interface OrderItem {
  id: string;
  name: string;
  price: number;
  image_url: string;
  quantity?: number;
  size?: string;
  length?: string;
  selectedLength?: string;
  selectedCoverage?: string;
}

export interface Order {
  id: string;
  user_id: string;
  customer_name: string;
  customer_phone?: string;
  customer_email?: string;
  shipping_address: ShippingAddress & { houseNo?: string; landmark?: string };
  items: OrderItem[];
  subtotal: number;
  discount: number;
  delivery_charges?: number;
  total_amount: number;
  payment_id?: string;
  payment_method?: string;
  payment_status: 'Paid' | 'Pending' | 'Pending Verification' | 'Failed';
  fulfillment_status: 'New Order' | 'Pending Confirmation' | 'Confirmed' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  awb_tracking_code?: string;
  courier_partner?: string;
  fit_gate_verified?: number;
  customer_notes?: string;
  upi_reference?: string;
  payment_screenshot?: string;
  admin_notes?: string;
  custom_tailoring?: {
    length?: string;
    coverage?: string;
  };
  created_at: string;
}

export interface StyleDnaPayload {
  userId?: string;
  height: number;
  buildProportion: 'Petite' | 'Regular' | 'Tall';
  modestyPreference: 'Full Coverage' | 'Balanced Modest' | 'Relaxed';
  skinUndertone: 'Warm Golden' | 'Olive' | 'Deep Espresso' | 'Cool';
  shoulderCm?: number;
  waistCm?: number;
  hipCm?: number;
}
