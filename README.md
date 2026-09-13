# NEXUS — Level Up Your Setup

A bespoke premium gaming marketplace built with React, TypeScript, Vite, Tailwind Preflight, Framer Motion, Three.js, Vercel functions, and Supabase.

## Features

- Brief WebGL loot-chest entrance: curved flight, metallic surfaces, physical lid hinge, light spill, particles, a shadow, and scroll/touch/keyboard control. Scrolling upward reverses the opening. Overscrolling upward at the top of the homepage reconnects the experience. Skip, replay, reduced-motion, WebGL fallback, and a performance timeout are included.
- Three selectable homepage collections; original cinematic controller artwork and optimized WebP product imagery.
- Database-driven catalog, eight categories, featured products and discounts; search, category, brand, price, availability, and sale filters; price and newest sorting; shareable query-string states.
- Product detail pages with gallery zoom, specifications, seller, condition, stock, and delivery information.
- Database-persisted anonymous cart and wishlist. Session access is based on an unguessable browser-held UUID; this is not an authenticated customer account.
- Animated, focus-trapped shopping overlays with background isolation; quantity controls, removal, and demo checkout.
- Orders validated and repriced server-side; successful test orders are persisted with reference IDs.
- Newsletter-interest capture, help center, gear guide, delivery, returns, privacy, and demo-policy pages.

## Database schema

- `nexus_categories`: id, name, slug, image, position.
- `nexus_products`: id, slug, name, brand, category, price, original_price, image, gallery JSON, tagline, description, specs JSON, condition, stock, featured, badge, seller.
- `nexus_carts`: browser-held UUID id, items JSON, saved_items JSON, updated_at.
- `nexus_orders`: UUID id, cart_id, item snapshots JSON, total, email, full_name, address, status, created_at.
- `nexus_subscribers`: email primary key, id, created_at.

RLS denies direct anonymous table access. All reads and writes go through resource-specific serverless routes using the preconfigured server-side Supabase client. The cart API validates IDs, actions, quantity limits, and stock; all mutations refresh API data.

## Run and verify

- `npm run build` performs TypeScript checking and a production build.
- `node scripts/test-storefront.mjs` runs a bounded local production-build harness with the actual serverless handlers and Supabase. It checks catalog rendering, search, gallery/specs, filtering/sorting, persistent cart and wishlist, demo checkout, newsletter capture, responsive navigation, hero controls, reversible chest interaction, and reduced motion. It removes its own test records and shuts down its browser/server afterward.

## Demo and launch boundaries

This is a working shopping demonstration, not a live retailer. Brand products have sample prices and inventory. All product visuals are illustrative generated studio renders, not official manufacturer photography. NEXUS-branded accessories and the Eclipse game are fictional demonstration products. No reviews, countdowns, live-stock claims, or real fulfillment promises are fabricated.

No payment processor, tax/shipping calculator, carrier, transactional email service, or live social profile is connected. Checkout requires no card data and creates no real purchase or shipment. Use test contact details. Newsletter submission stores interest only and sends no emails.

Before live commerce, integrate verified supplier inventory and licensed imagery, exact product specifications, authenticated customer and seller roles, a transactional/idempotent inventory-and-order workflow, payment-provider webhooks, shipping/tax services, region-specific policies, rate limiting/bot protection, and operational support. Demo checkout does not reserve/decrement stock or create a financial obligation.
