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
};

export type PaymentMethod = "zelle" | "applepay" | "cash";

export type MockOrder = {
  id: string;
  cliente: string;
  detalle: string;
  entrega: string;
  total: number;
  estado: "nuevo" | "confirmado" | "entregado";
};

export type SalesDay = {
  day: string;
  value: number;
};
