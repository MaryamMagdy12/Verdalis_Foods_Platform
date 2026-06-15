# Verdalis Foods — Shipper App

Mobile-first React delivery interface for wholesale food distribution drivers.

## Run locally

```bash
cd Front/Shippers_side
npm install
npm run dev
```

Open http://localhost:5175

## Demo login

Use any phone/email and password, or OTP mode with any 4+ digit code.

## Flow

Login → Today's Orders (Home) → Scan / Pickup → Route → Delivery Confirmation → History & Profile

## Structure

- `src/pages/*` — One component per screen
- `src/assets/css/*` — Dedicated stylesheet per page (no shared page styles)
- `src/components/layout` — App shell, bottom nav, toasts only
- `src/context` — Auth, orders, notifications (demo data)
