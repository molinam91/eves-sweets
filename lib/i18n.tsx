export type Locale = "en" | "es";

type UIStrings = {
  nav_menu: string;
  nav_catering: string;
  nav_contact: string;
  cart_button: string;
  eyebrow: string;
  hero_tagline: string;
  carousel_slides: string[];
  delivery_banner: (date: string) => React.ReactNode;
  menu_title: string;
  menu_subtitle: string;
  catering_title: string;
  catering_subtitle: string;
  footer_tagline: string;
  footer_admin: string;
  quantity: string;
  notes_optional: string;
  notes_placeholder: string;
  event_date: string;
  subtotal: string;
  add_to_cart: string;
  cancel: string;
  bulk_min_note: (min: number, freeQty: number) => string;
  bulk_min_remaining: (remaining: number) => string;
  your_cart: string;
  cart_empty: string;
  remove: string;
  total: string;
  continue_to_order: string;
  keep_browsing: string;
  checkout_title: string;
  checkout_subtitle: string;
  full_name: string;
  full_name_placeholder: string;
  phone: string;
  phone_placeholder: string;
  fulfillment: string;
  delivery_option: string;
  pickup_option: string;
  delivery_address: string;
  address_placeholder: string;
  estimated_date: (date: string) => React.ReactNode;
  catering_note: string;
  payment_method: string;
  pay_zelle: string;
  pay_applepay: string;
  pay_cash: string;
  additional_notes: string;
  additional_notes_placeholder: string;
  promo_code: string;
  promo_code_placeholder: string;
  apply: string;
  promo_applied: (code: string) => string;
  delivery_fee_label: string;
  delivery_fee_waived: string;
  discount_label: string;
  order_total: string;
  wa_order_title: string;
  wa_customer_label: string;
  wa_delivery_label: string;
  wa_pickup_label: string;
  wa_event_label: string;
  wa_payment_note: string;
  wa_promo_label: string;
  wa_notes_label: string;
  wa_total_label: string;
  send_whatsapp: string;
  whatsapp_not_configured: string;
  back_to_cart: string;
  thanks_title: (name: string) => string;
  thanks_body: string;
  estimated_delivery: string;
  keep_exploring: string;
  admin_access: string;
  admin_password_placeholder: string;
  admin_enter: string;
  back_to_store: string;
  admin_wrong_password: string;
  admin_panel_title: string;
  admin_sales_week: string;
  admin_orders_week: string;
  admin_next_delivery: string;
  admin_weekly_summary: string;
  admin_no_sales_yet: string;
  admin_day_labels: string[];
  admin_best_sellers: string;
  admin_qty_sold: string;
  admin_revenue: string;
  admin_menu_catering: string;
  admin_add_item: string;
  admin_edit: string;
  admin_delete: string;
  admin_item: string;
  admin_price: string;
  admin_promo_codes: string;
  admin_add_code: string;
  admin_code: string;
  admin_discount: string;
  admin_status: string;
  admin_active: string;
  admin_inactive: string;
  admin_settings: string;
  admin_reset: string;
  admin_social_contact: string;
  admin_contact_email: string;
  admin_contact_phones: string;
  admin_change_password: string;
  admin_new_password: string;
  admin_new_password_placeholder: string;
  admin_password_saved: string;
  admin_sync_warning: string;
  admin_reset_sales: string;
  admin_resetting_sales: string;
  admin_endpoint_outdated: string;
  language: string;
};

export const UI_STRINGS: Record<Locale, UIStrings> = {
  en: {
    nav_menu: "Menu",
    nav_catering: "Catering & Events",
    nav_contact: "Contact",
    cart_button: "Cart",
    eyebrow: "Desserts and More",
    hero_tagline:
      "Homemade desserts made with love in Belmont, CA. Order for Friday delivery or pickup, or ask about your event.",
    carousel_slides: ["Made fresh every week", "Friday deliveries", "Orders for events and catering"],
    delivery_banner: (date: string) => (
      <>
        Order before <b className="text-brand-pink-deep">Wednesday 4:00pm</b> and get it{" "}
        <b className="text-brand-pink-deep">{date}</b>. After that, your order ships the
        following Friday.
      </>
    ),
    menu_title: "Our menu",
    menu_subtitle: "Tap a dessert to choose quantity and add-ons.",
    catering_title: "Catering & Events",
    catering_subtitle:
      "Packages for weddings, birthdays, and gatherings. Add your event date when you order.",
    footer_tagline: "Orders via WhatsApp · Friday delivery · Belmont, CA",
    footer_admin: "Admin access",
    quantity: "Quantity",
    notes_optional: "Notes (optional)",
    notes_placeholder: "E.g. no nuts, message on the cake...",
    event_date: "Event date",
    subtotal: "Subtotal",
    add_to_cart: "Add to cart",
    cancel: "Cancel",
    bulk_min_note: (min: number, freeQty: number) =>
      `Mix and match: minimum ${min} combined from these items per order. ${freeQty} combined gets free delivery.`,
    bulk_min_remaining: (remaining: number) =>
      `Add ${remaining} more of these items (mix and match) to reach the order minimum.`,
    your_cart: "Your cart",
    cart_empty: "Your cart is empty. Pick something delicious 🧁",
    remove: "Remove",
    total: "Total",
    continue_to_order: "Continue to checkout",
    keep_browsing: "Keep browsing the menu",
    checkout_title: "Finish your order",
    checkout_subtitle: "We'll take you to WhatsApp with your order ready to send.",
    full_name: "Full name",
    full_name_placeholder: "Your name",
    phone: "Phone",
    phone_placeholder: "(555) 555-5555",
    fulfillment: "Fulfillment",
    delivery_option: "Delivery",
    pickup_option: "Pickup",
    delivery_address: "Delivery address",
    address_placeholder: "Street, city, zip code",
    estimated_date: (date: string) => (
      <>
        Estimated date: <b className="text-foreground">{date}</b> (per the Wednesday 4pm cutoff
        rule).
      </>
    ),
    catering_note: "This order includes catering items; we'll coordinate your event date over WhatsApp.",
    payment_method: "Payment method",
    pay_zelle: "Zelle",
    pay_applepay: "Apple Pay",
    pay_cash: "Cash",
    additional_notes: "Additional notes (optional)",
    additional_notes_placeholder: "Special instructions...",
    promo_code: "Promo code",
    promo_code_placeholder: "Enter code",
    apply: "Apply",
    promo_applied: (code: string) => `Code ${code} applied.`,
    delivery_fee_label: "Delivery fee",
    delivery_fee_waived: "Free delivery",
    discount_label: "Discount",
    order_total: "Order total",
    wa_order_title: "New order — Eve's Sweets",
    wa_customer_label: "Customer",
    wa_delivery_label: "Delivery",
    wa_pickup_label: "Pickup at the store",
    wa_event_label: "Event",
    wa_payment_note: "(we'll message you on WhatsApp to confirm payment)",
    wa_promo_label: "Promo code",
    wa_notes_label: "Notes",
    wa_total_label: "Total",
    send_whatsapp: "Send order via WhatsApp",
    whatsapp_not_configured: "Ordering isn't set up yet — please contact the bakery directly.",
    back_to_cart: "Back to cart",
    thanks_title: (name: string) => `Thanks, ${name}!`,
    thanks_body:
      "We opened WhatsApp with your order ready to send. Once you confirm it, we'll contact you to arrange payment.",
    estimated_delivery: "Estimated delivery:",
    keep_exploring: "Keep exploring the menu",
    admin_access: "Admin access",
    admin_password_placeholder: "Password",
    admin_enter: "Enter",
    back_to_store: "Back to store",
    admin_wrong_password: "Incorrect password.",
    admin_panel_title: "Admin panel",
    admin_sales_week: "Sales this week",
    admin_orders_week: "Orders this week",
    admin_next_delivery: "Next delivery",
    admin_weekly_summary: "Weekly sales summary",
    admin_no_sales_yet: "No sales yet this week.",
    admin_day_labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    admin_best_sellers: "Best sellers",
    admin_qty_sold: "Qty sold",
    admin_revenue: "Revenue",
    admin_menu_catering: "Menu & Catering",
    admin_add_item: "Add item",
    admin_edit: "Edit",
    admin_delete: "Delete",
    admin_item: "Item",
    admin_price: "Price",
    admin_promo_codes: "Promo codes",
    admin_add_code: "Add code",
    admin_code: "Code",
    admin_discount: "Discount",
    admin_status: "Status",
    admin_active: "Active",
    admin_inactive: "Inactive",
    admin_settings: "Checkout settings",
    admin_reset: "Reset sample menu",
    admin_social_contact: "Social links & contact",
    admin_contact_email: "Contact email",
    admin_contact_phones: "Phone numbers (shown to customers)",
    admin_change_password: "Admin password",
    admin_new_password: "New password",
    admin_new_password_placeholder: "Leave blank to keep the current one",
    admin_password_saved: "Password updated.",
    admin_sync_warning:
      "Saved on this device, but it could not be confirmed on the shared Sheet. Make sure the Apps Script is deployed as a new version, then check your connection.",
    admin_reset_sales: "Reset sales",
    admin_resetting_sales: "Resetting...",
    admin_endpoint_outdated:
      "The connected Google Sheet is running an older version of the backend script. Social links, contact info, and the admin password won't save until it's redeployed as a new version.",
    language: "Language",
  },
  es: {
    nav_menu: "Menu",
    nav_catering: "Catering / Eventos",
    nav_contact: "Contacto",
    cart_button: "Carrito",
    eyebrow: "Desserts and More",
    hero_tagline:
      "Postres caseros hechos con amor en Belmont, CA. Pide para entrega el viernes o recoleccion, o cotiza tu evento.",
    carousel_slides: ["Hecho fresco cada semana", "Entregas los viernes", "Pedidos para eventos y catering"],
    delivery_banner: (date: string) => (
      <>
        Pide antes del <b className="text-brand-pink-deep">miercoles 4:00pm</b> y recibe el{" "}
        <b className="text-brand-pink-deep">{date}</b>. Despues de esa hora, tu pedido se entrega
        el viernes siguiente.
      </>
    ),
    menu_title: "Nuestro menu",
    menu_subtitle: "Toca un postre para elegir cantidad y extras.",
    catering_title: "Catering & Eventos",
    catering_subtitle:
      "Paquetes para bodas, cumpleanos y reuniones. Indica la fecha de tu evento al pedir.",
    footer_tagline: "Pedidos por WhatsApp · Entregas los viernes · Belmont, CA",
    footer_admin: "Acceso administrador",
    quantity: "Cantidad",
    notes_optional: "Notas (opcional)",
    notes_placeholder: "Ej. sin nueces, mensaje en el pastel...",
    event_date: "Fecha del evento",
    subtotal: "Subtotal",
    add_to_cart: "Agregar al carrito",
    cancel: "Cancelar",
    bulk_min_note: (min: number, freeQty: number) =>
      `Mezcla y combina: minimo ${min} combinados entre estos articulos por pedido. Con ${freeQty} combinados, envio gratis.`,
    bulk_min_remaining: (remaining: number) =>
      `Agrega ${remaining} mas de estos articulos (mezclando) para llegar al minimo del pedido.`,
    your_cart: "Tu carrito",
    cart_empty: "Tu carrito esta vacio. Elige algo delicioso 🧁",
    remove: "Quitar",
    total: "Total",
    continue_to_order: "Continuar al pedido",
    keep_browsing: "Seguir viendo el menu",
    checkout_title: "Finalizar pedido",
    checkout_subtitle: "Te vamos a redirigir a WhatsApp con tu pedido listo para enviar.",
    full_name: "Nombre completo",
    full_name_placeholder: "Tu nombre",
    phone: "Telefono",
    phone_placeholder: "(555) 555-5555",
    fulfillment: "Entrega",
    delivery_option: "Entrega a domicilio",
    pickup_option: "Recoleccion",
    delivery_address: "Direccion de entrega",
    address_placeholder: "Calle, ciudad, codigo postal",
    estimated_date: (date: string) => (
      <>
        Fecha estimada: <b className="text-foreground">{date}</b> (segun la regla de corte del
        miercoles 4pm).
      </>
    ),
    catering_note:
      "Este pedido incluye articulos de catering; coordinaremos la fecha de tu evento por WhatsApp.",
    payment_method: "Metodo de pago",
    pay_zelle: "Zelle",
    pay_applepay: "Apple Pay",
    pay_cash: "Efectivo",
    additional_notes: "Notas adicionales (opcional)",
    additional_notes_placeholder: "Instrucciones especiales...",
    promo_code: "Codigo promocional",
    promo_code_placeholder: "Ingresa el codigo",
    apply: "Aplicar",
    promo_applied: (code: string) => `Codigo ${code} aplicado.`,
    delivery_fee_label: "Costo de entrega",
    delivery_fee_waived: "Entrega gratis",
    discount_label: "Descuento",
    order_total: "Total del pedido",
    wa_order_title: "Pedido nuevo — Eve's Sweets",
    wa_customer_label: "Cliente",
    wa_delivery_label: "Entrega",
    wa_pickup_label: "Recoleccion en tienda",
    wa_event_label: "Evento",
    wa_payment_note: "(te contactaremos por WhatsApp para confirmar el pago)",
    wa_promo_label: "Codigo promocional",
    wa_notes_label: "Notas",
    wa_total_label: "Total",
    send_whatsapp: "Enviar pedido por WhatsApp",
    whatsapp_not_configured: "Los pedidos no estan configurados todavia — por favor contacta a la panaderia directamente.",
    back_to_cart: "Volver al carrito",
    thanks_title: (name: string) => `Gracias, ${name}!`,
    thanks_body:
      "Abrimos WhatsApp con tu pedido listo para enviar. En cuanto lo confirmes, te contactaremos para coordinar el pago.",
    estimated_delivery: "Entrega estimada:",
    keep_exploring: "Seguir explorando el menu",
    admin_access: "Acceso administrador",
    admin_password_placeholder: "Contrasena",
    admin_enter: "Entrar",
    back_to_store: "Volver a la tienda",
    admin_wrong_password: "Contrasena incorrecta.",
    admin_panel_title: "Panel de administrador",
    admin_sales_week: "Ventas esta semana",
    admin_orders_week: "Pedidos esta semana",
    admin_next_delivery: "Proxima entrega",
    admin_weekly_summary: "Resumen de ventas semanales",
    admin_no_sales_yet: "Todavia no hay ventas esta semana.",
    admin_day_labels: ["Lun", "Mar", "Mie", "Jue", "Vie", "Sab", "Dom"],
    admin_best_sellers: "Mas vendido",
    admin_qty_sold: "Cantidad vendida",
    admin_revenue: "Ingresos",
    admin_menu_catering: "Menu & Catering",
    admin_add_item: "Agregar articulo",
    admin_edit: "Editar",
    admin_delete: "Eliminar",
    admin_item: "Articulo",
    admin_price: "Precio",
    admin_promo_codes: "Codigos promocionales",
    admin_add_code: "Agregar codigo",
    admin_code: "Codigo",
    admin_discount: "Descuento",
    admin_status: "Estado",
    admin_active: "Activo",
    admin_inactive: "Inactivo",
    admin_settings: "Configuracion de pedidos",
    admin_reset: "Restaurar menu de ejemplo",
    admin_social_contact: "Redes sociales y contacto",
    admin_contact_email: "Correo de contacto",
    admin_contact_phones: "Numeros de telefono (visibles para clientes)",
    admin_change_password: "Contrasena de administrador",
    admin_new_password: "Nueva contrasena",
    admin_new_password_placeholder: "Dejar en blanco para no cambiarla",
    admin_password_saved: "Contrasena actualizada.",
    admin_sync_warning:
      "Se guardo en este dispositivo, pero no se pudo confirmar en la hoja compartida. Verifica que el Apps Script este desplegado como version nueva, y tu conexion.",
    admin_reset_sales: "Reiniciar ventas",
    admin_resetting_sales: "Reiniciando...",
    admin_endpoint_outdated:
      "La hoja de Google conectada esta usando una version anterior del script. Las redes sociales, el contacto y la contrasena de administrador no se guardaran hasta que se despliegue como version nueva.",
    language: "Idioma",
  },
};

/** English translations for the seed catalog (Spanish is the source of truth in mockData.ts). */
export const PRODUCT_TRANSLATIONS: Record<string, { name: string; description: string }> = {
  chocoflan: {
    name: "Chocoflan",
    description: "The perfect combination of chocolate cake and flan. Serves 8 to 10.",
  },
  fresaflan: {
    name: "Strawberry Flan",
    description: "Homemade flan topped with fresh strawberries.",
  },
  "arroz-con-leche": {
    name: "Rice Pudding",
    description:
      "Soft, creamy, and full of homemade flavor: tender rice, creamy milk, cinnamon, and raisins. 12 oz cup.",
  },
  "gelatina-vainilla": {
    name: "Vanilla Gelatin",
    description: "Soft, creamy, with a delicious vanilla flavor. 12 oz cup.",
  },
  "gelatina-mosaico": {
    name: "Mosaic Gelatin",
    description: "Delicious gelatin with colorful pieces in a creamy, refreshing base. 12 oz cup.",
  },
  "pan-de-banana": {
    name: "Banana Bread",
    description: "Homemade banana bread.",
  },
  "mesa-postres": {
    name: "Dessert Table (20 people)",
    description: "An assortment of mini desserts for your event.",
  },
  "pastel-boda": {
    name: "Wedding Cake (3 tiers)",
    description: "Custom design, choice of flavor.",
  },
  "paquete-cumple": {
    name: "Birthday Package",
    description: "Cake + 2 dozen matching cupcakes.",
  },
};
