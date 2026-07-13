# Cá Cảnh Thanh Liêm — Premium Ornamental Fish Website

A modern, premium Next.js 15 website for a Vietnamese ornamental fish store.

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4 (CSS-first config)
- **UI Primitives**: Custom components built with Radix UI + CVA
- **Database**: Supabase (ready to connect)
- **Deployment**: Vercel

## Project Structure

```
├── app/
│   ├── layout.tsx          # Root layout (fonts, nav, footer)
│   ├── page.tsx            # Homepage
│   ├── not-found.tsx       # 404 page
│   ├── loading.tsx         # Global loading state
│   ├── error.tsx           # Global error boundary
│   ├── products/
│   │   ├── page.tsx        # Product listing + filters
│   │   └── [slug]/page.tsx # Product detail
│   ├── cart/page.tsx       # Cart + order request form
│   ├── about/page.tsx      # About us page
│   ├── contact/page.tsx    # Contact page
│   └── admin/
│       ├── layout.tsx      # Admin layout with sidebar
│       ├── page.tsx        # Dashboard overview
│       ├── products/       # Product management
│       └── orders/         # Order management
├── components/
│   ├── ui/                 # Button, Badge, Input, Textarea, Card
│   ├── layout/             # Navbar, Footer, FloatingActions
│   ├── product/            # ProductCard, ProductsClient, ProductDetailClient
│   ├── cart/               # CartClient
│   ├── sections/           # ContactClient
│   ├── shared/             # SectionHeader, PageHeader, EmptyState
│   └── admin/              # AdminSidebar, Dashboard, Products, Orders
├── hooks/
│   ├── useCart.ts          # Cart state with localStorage
│   ├── useScrolled.ts      # Navbar scroll detection
│   └── useMediaQuery.ts    # Responsive breakpoints
├── lib/
│   ├── utils.ts            # cn(), slugify(), formatDate()...
│   ├── constants.ts        # Site config, nav links, categories
│   └── data.ts             # Mock data + query helpers
└── types/index.ts          # All TypeScript interfaces
```

## Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## Environment Variables

Copy `.env.local` and fill in your Supabase credentials:

```bash
cp .env.local .env.local
```

## Key Business Logic

- **No public prices** — customers send inquiries, shop contacts manually
- **Cart** stores fish selections only (no price/quantity)
- **Order flow**: Browse → Add to cart → Submit form → Admin notified → Staff calls customer
- **Product statuses**: available, out_of_stock, hidden, featured, new_arrival

## Design System

Colors defined in `app/globals.css` via `@theme`:
- `--color-brand-*`: Natural green (#2d7a2d base)
- `--color-surface-*`: Warm neutrals
- `--font-display`: Cormorant Garamond (elegant serif)
- `--font-body`: DM Sans (clean sans-serif)

## Deployment (Vercel)

```bash
vercel deploy
```
Set environment variables in Vercel Dashboard → Settings → Environment Variables.
