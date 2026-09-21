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

## Backend

Menu items, promo codes, store rules (delivery fee, bulk rule, WhatsApp numbers), and
orders are stored in a Google Sheet through a Google Apps Script Web App
(`lib/backend.ts`, script source at
`/mnt/project-files/eves-sweets-sheets-backend/Code.gs`). Every browser fetches this
shared snapshot on load and pushes changes back to it, so admin edits and customer
orders reach everyone instead of staying per-device. Orders are polled every 20s so a
new order placed on one device shows up in admin on another without a refresh.
localStorage is still used as an offline/first-paint cache, so the site keeps working if
the backend is briefly unreachable.

The Web App URL is deployed with "Anyone" access, which is required for a static site to
call it from the browser -- that also means the URL (visible in the page's JS bundle) can
be called by anyone, not just this site. There's no login on the endpoint itself; the
mitigation today is that the script only accepts a fixed set of actions and this is a
low-stakes small-business ordering form. Revisit if abuse ever becomes a concern.

## Still placeholder / not yet connected

- Menu item **prices** are placeholders (not on the flyers) pending Jayro's real numbers.
  Catering packages are still invented for demonstration.
- `/admin` accepts any password — real auth would need its own backend work.
- Product photos added from `/admin` are device-local only (stored as a data URL in
  localStorage, never sent to the Sheet -- a spreadsheet cell can't hold an image). A
  photo added on one device is not yet visible to customers on another; needs real file
  storage (e.g. Google Drive or Netlify) to fix properly.

## Development

```bash
npm install
npm run dev
```
