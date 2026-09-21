import type { MockOrder, Product, SalesDay } from "./types";

export const WHATSAPP_NUMBER = "15555555555"; // placeholder -- Jayro to provide the real business number

export const MENU: Product[] = [
  {
    id: "tres-leches",
    name: "Pastel Tres Leches",
    description: "Bizcocho esponjoso banado en tres leches y canela.",
    price: 32,
    gradient: ["#F06292", "#E8B84B"],
    isCatering: false,
    addons: [
      { id: "velas", name: "Set de velas", price: 3 },
      { id: "tarjeta", name: "Tarjeta personalizada", price: 2 },
    ],
  },
  {
    id: "flan",
    name: "Flan Napolitano",
    description: "Cremoso, con caramelo casero hecho a fuego lento.",
    price: 18,
    gradient: ["#E8B84B", "#F06292"],
    isCatering: false,
    addons: [{ id: "individual", name: "Porciones individuales", price: 4 }],
  },
  {
    id: "cupcakes",
    name: "Cupcakes Surtidos (caja de 6)",
    description: "Sabores de temporada, decoracion a mano.",
    price: 22,
    gradient: ["#D84F7D", "#F06292"],
    isCatering: false,
    addons: [
      { id: "chispas", name: "Chispas extra", price: 1 },
      { id: "caja-regalo", name: "Caja de regalo", price: 3 },
    ],
  },
  {
    id: "cheesecake",
    name: "Cheesecake de Fresa",
    description: "Base de galleta, cubierto con salsa de fresa natural.",
    price: 28,
    gradient: ["#F06292", "#D84F7D"],
    isCatering: false,
    addons: [{ id: "topping-extra", name: "Topping de fresa extra", price: 3 }],
  },
  {
    id: "brownies",
    name: "Brownies de Chocolate (12 pz)",
    description: "Chocolate belga, centro fundente.",
    price: 20,
    gradient: ["#B23764", "#E8B84B"],
    isCatering: false,
    addons: [{ id: "nuez", name: "Con nuez", price: 2 }],
  },
  {
    id: "alfajores",
    name: "Alfajores de Dulce de Leche",
    description: "Docena, banados en coco rallado.",
    price: 16,
    gradient: ["#E8B84B", "#B23764"],
    isCatering: false,
    addons: [],
  },
];

export const CATERING: Product[] = [
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

export const ALL_PRODUCTS: Product[] = [...MENU, ...CATERING];

export function findProduct(id: string): Product | undefined {
  return ALL_PRODUCTS.find((p) => p.id === id);
}

export const CAROUSEL_SLIDES: { caption: string; gradient: [string, string] }[] = [
  { caption: "Hecho fresco cada semana", gradient: ["#F06292", "#E8B84B"] },
  { caption: "Entregas los viernes", gradient: ["#E8B84B", "#D84F7D"] },
  { caption: "Pedidos para eventos y catering", gradient: ["#D84F7D", "#F06292"] },
];

export const MOCK_ORDERS: MockOrder[] = [
  { id: "0007", cliente: "Marisol Vega", detalle: "1x Pastel Tres Leches, 1x Cupcakes Surtidos", entrega: "941 Hill St, Belmont, CA", total: 54, estado: "nuevo" },
  { id: "0006", cliente: "Jonathan Reyes", detalle: "2x Flan Napolitano", entrega: "Recoleccion en tienda", total: 36, estado: "confirmado" },
  { id: "0005", cliente: "Priya Shah", detalle: "1x Mesa de Postres (20p)", entrega: "Evento - 2026-10-03", total: 205, estado: "confirmado" },
  { id: "0004", cliente: "Diego Ramirez", detalle: "1x Cheesecake de Fresa, 1x Alfajores", entrega: "218 Ralston Ave, San Mateo, CA", total: 44, estado: "entregado" },
  { id: "0003", cliente: "Amanda Cole", detalle: "3x Brownies de Chocolate", entrega: "Recoleccion en tienda", total: 60, estado: "entregado" },
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
