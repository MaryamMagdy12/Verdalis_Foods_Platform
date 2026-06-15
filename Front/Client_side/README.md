# Prime Fine Foods – Client-side (React)

React SPA with React Router, shared Nav/Footer, and page-specific layouts and styles.

## Pages

- **/** – Home (hero, about, why choose us, best selling, brands, contact)
- **/products** – Fresh Harvest Collection + product grid
- **/brands** – Brands & Partnerships + grid + partnership section
- **/about** – About Us + mission/vision/values
- **/cart** – Your order (cart items, summary, checkout CTA)
- **/checkout** – Order summary + payment method
- **/contact** – Get in touch form, contact cards, FAQ, map placeholder
- **/profile** – Profile card + edit form
- **/order-summary** – Order summary + payment
- **/login** – Login form (same layout as register)
- **/register** – Register form (same layout as login)

## Features

- **Route-based loading**: Full-screen loader (Prime Fine Foods + progress bar) between route changes.
- **Unique CSS per page**: Each page uses its own class prefix (e.g. `home-*`, `products-*`, `brands-*`) to avoid class name clashes.
- **Font Awesome**: Icons used in nav, footer, buttons, and content.
- **Responsive**: Breakpoints and layout adjustments for mobile/tablet/desktop.
- **Animations**: Entrance and scroll-triggered animations (framer-motion); hero sections use subtle looping transitions (scale, y) so they are not static after load.
- **Smooth scroll**: Lenis used for smooth scrolling where supported.

## Assets

To show the hero image and about/brand images on the Home page, copy the image files from `Front/TEST1 - Copy - Copy/src/assets/images/` into `Front/Client_side/src/assets/images/` (e.g. `hero home.png`, `POSTSS NEWW-05.png`, product/brand images). The app runs without them using placeholders/gradients.

## Run

```bash
npm install
npm run dev
```

Build: `npm run build`
