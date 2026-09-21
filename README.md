# Eve's Sweets — Portal de Pedidos

Ordering portal for Eve's Sweets — Desserts and More, a home bakery in Belmont, CA.
Next.js (App Router) + Tailwind CSS, built mobile-first for both customers and the owner.

## What's here

- **Storefront** (`/`): branding, photo carousel, live delivery-date banner, menu and
  catering/eventos grids, an item modal (qty + add-ons + live subtotal), a cart, and a
  checkout flow that builds a formatted WhatsApp message and opens `wa.me` with it.
- **Delivery-date rule** (`lib/delivery.ts`): orders before Wednesday 4:00pm Pacific ship
  that Friday; after cutoff, the following Friday. Computed live from the system clock.
- **Admin panel** (`/admin`): a password-gated (demo only) dashboard mockup — weekly sales
  chart, orders table, menu/catering table.

The real logo (`public/logo.png`, also used for the favicon and app icons) and the real
menu names/descriptions (from Jayro's flyers) are in. Orders, catering packages, and the
admin password are still mock/placeholder — see `lib/mockData.ts`. Nothing is wired to a
real backend yet.

## Still placeholder / not yet connected

- `lib/mockData.ts` — `WHATSAPP_NUMBER` is a fake number. Menu item **prices** are
  placeholders (not on the flyers) pending Jayro's real numbers. Catering packages and
  the sample orders/sales numbers are still invented for demonstration.
- `/admin` accepts any password — real auth arrives once there's a backend.
- No Google Sheets integration yet (planned: `Orders`, `Order_Items`, `Menu_Items`,
  `Addons`, `Catering_Packages`, `Config` tabs) and no Netlify deploy configured.
- Product photos are still placeholders (gradient tiles + emoji) pending the real photos.

## Development

```bash
npm install
npm run dev
```
