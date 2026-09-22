export type Addon = {
  id: string;
  name: string;
  price: number;
};

export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  gradient: [string, string];
  /** Real product photo path (public/). Falls back to the gradient tile when absent. */
  photo?: string;
  addons: Addon[];
  isCatering: boolean;
};

export type CartLine = {
  cartId: string;
  productId: string;
  name: string;
  unitPrice: number;
  qty: number;
  addons: Addon[];
  notes: string;
  isCatering: boolean;
  eventDate: string;
  gradient: [string, string];
  photo?: string;
};

export type PaymentMethod = "zelle" | "applepay" | "cash";

export type OrderStatus = "new" | "completed";

export type OrderLineSnapshot = {
  name: string;
  qty: number;
  unitPrice: number;
  addons: Addon[];
  isCatering: boolean;
  eventDate: string;
  lineTotal: number;
};

export type Order = {
  id: string;
  createdAt: string;
  customerName: string;
  customerPhone: string;
  fulfillment: FulfillmentMethod;
  hasCatering: boolean;
  address: string;
  deliveryLabel: string;
  paymentMethod: PaymentMethod;
  notes: string;
  promoCode: string | null;
  items: OrderLineSnapshot[];
  subtotal: number;
  discount: number;
  deliveryFee: number;
  total: number;
  status: OrderStatus;
};

export type PromoCode = {
  code: string;
  type: "percent" | "fixed";
  value: number;
  active: boolean;
};

export type FulfillmentMethod = "delivery" | "pickup";

export type StoreRules = {
  /** Flat fee added at checkout for delivery orders (waived for pickup). */
  deliveryFee: number;
  /** Items priced under this amount require a minimum quantity per order. */
  bulkMaxPrice: number;
  bulkMinQty: number;
  /** Ordering this many units of a bulk-priced item waives the delivery fee. */
  bulkFreeDeliveryQty: number;
  /** WhatsApp numbers orders can go to. Index 0 is the primary number used at checkout; the rest are extras. */
  whatsappNumbers: string[];
  /** Social/contact links shown in the footer. Empty string/array means "not set, hide it". */
  socialTiktok: string;
  socialInstagram: string;
  socialFacebook: string;
  contactEmail: string;
  contactPhones: string[];
  /** SHA-256 hex of the admin panel password. Checked client-side (no server), but no longer accepts anything. */
  adminPasswordHash: string;
};
