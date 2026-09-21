import type { MockOrder, Product, SalesDay } from "./types";

export const WHATSAPP_NUMBER = "15555555555"; // placeholder -- Jayro to provide the real business number

// Seed data for the menu/catering store (see context/MenuContext.tsx). Real
// items from Jayro's flyers (2026-09-21); prices are NOT on the flyers -- the
// numbers below are placeholders. Jayro manages the live catalog from
// /admin, which persists on top of this seed.
export const DEFAULT_MENU: Product[] = [
  {
    id: "chocoflan",
    name: "Chocoflan",
    description: "La perfecta combinacion de pastel de chocolate y flan. Rinde para 8 a 10 personas.",
    price: 35,
    gradient: ["#B23764", "#E8B84B"],
    photo: "/menu/chocoflan.jpg",
    isCatering: false,
    addons: [],
  },
  {
    id: "fresaflan",
    name: "Fresaflan",
    description: "Flan casero cubierto con fresas frescas.",
    price: 28,
    gradient: ["#F06292", "#D84F7D"],
    isCatering: false,
    addons: [],
  },
  {
    id: "arroz-con-leche",
    name: "Arroz con Leche",
    description:
      "Suave, cremoso y lleno de sabor casero: arroz de grano suave, leche cremosa, canela y pasas. Vaso de 12 oz.",
    price: 7,
    gradient: ["#E8B84B", "#F06292"],
    photo: "/menu/arroz-con-leche.jpg",
    isCatering: false,
    addons: [],
  },
  {
    id: "gelatina-vainilla",
    name: "Gelatina de Vainilla",
    description: "Suave, cremosa y con un delicioso sabor a vainilla. Vaso de 12 oz.",
    price: 6,
    gradient: ["#F06292", "#E8B84B"],
    photo: "/menu/gelatina-vainilla.jpg",
    isCatering: false,
    addons: [],
  },
  {
    id: "gelatina-mosaico",
    name: "Gelatina Mosaico",
    description: "Deliciosa gelatina con trozos de colores en una base cremosa y refrescante. Vaso de 12 oz.",
    price: 7,
    gradient: ["#D84F7D", "#F06292"],
    photo: "/menu/gelatina-mosaico.jpg",
    isCatering: false,
    addons: [],
  },
  {
    id: "pan-de-banana",
    name: "Pan de Banana",
    description: "Pan casero de platano.",
    price: 12,
    gradient: ["#E8B84B", "#B23764"],
    isCatering: false,
    addons: [],
  },
];

export const DEFAULT_CATERING: Product[] = [
  {
    id: "mesa-postres",
    name: "Mesa de Postres (20 personas)",
    description: "Surtido de mini postres para tu evento.",
    price: 180,
    gradient: ["#F06292", "#E8B84B"],
    isCatering: true,
    addons: [
      { id: "letrero", name: "Letreros con nombre", price: 10 },
      { id: "montaje", name: "Montaje en el lugar", price: 25 },
    ],
  },
  {
    id: "pastel-boda",
    name: "Pastel de Boda (3 pisos)",
    description: "Diseno personalizado, sabor a eleccion.",
    price: 420,
    gradient: ["#D84F7D", "#E8B84B"],
    isCatering: true,
    addons: [{ id: "flores", name: "Flores comestibles", price: 20 }],
  },
  {
    id: "paquete-cumple",
    name: "Paquete de Cumpleanos",
    description: "Pastel + 2 docenas de cupcakes a juego.",
    price: 95,
    gradient: ["#E8B84B", "#F06292"],
    isCatering: true,
    addons: [{ id: "topper", name: "Topper personalizado", price: 8 }],
  },
];

export const CAROUSEL_SLIDES: { caption: string; gradient: [string, string] }[] = [
  { caption: "Hecho fresco cada semana", gradient: ["#F06292", "#E8B84B"] },
  { caption: "Entregas los viernes", gradient: ["#E8B84B", "#D84F7D"] },
  { caption: "Pedidos para eventos y catering", gradient: ["#D84F7D", "#F06292"] },
];

export const MOCK_ORDERS: MockOrder[] = [
  { id: "0007", cliente: "Marisol Vega", detalle: "1x Chocoflan, 2x Gelatina de Vainilla", entrega: "941 Hill St, Belmont, CA", total: 47, estado: "nuevo" },
  { id: "0006", cliente: "Jonathan Reyes", detalle: "2x Arroz con Leche", entrega: "Recoleccion en tienda", total: 14, estado: "confirmado" },
  { id: "0005", cliente: "Priya Shah", detalle: "1x Mesa de Postres (20p)", entrega: "Evento - 2026-10-03", total: 205, estado: "confirmado" },
  { id: "0004", cliente: "Diego Ramirez", detalle: "1x Fresaflan, 1x Pan de Banana", entrega: "218 Ralston Ave, San Mateo, CA", total: 40, estado: "entregado" },
  { id: "0003", cliente: "Amanda Cole", detalle: "3x Gelatina Mosaico", entrega: "Recoleccion en tienda", total: 21, estado: "entregado" },
];

export const SALES_WEEK: SalesDay[] = [
  { day: "Lun", value: 120 },
  { day: "Mar", value: 180 },
  { day: "Mie", value: 340 },
  { day: "Jue", value: 90 },
  { day: "Vie", value: 610 },
  { day: "Sab", value: 75 },
  { day: "Dom", value: 40 },
];

// Brand-color options for items added from /admin without a photo yet.
export const GRADIENT_PRESETS: [string, string][] = [
  ["#F06292", "#E8B84B"],
  ["#E8B84B", "#F06292"],
  ["#D84F7D", "#F06292"],
  ["#F06292", "#D84F7D"],
  ["#B23764", "#E8B84B"],
  ["#E8B84B", "#B23764"],
];
