# Supabase Migration Guide
## Cá Cảnh Thanh Liêm — Phase 2: Connect Real Database

---

## Phase 1 Status (Completed)

Auth infrastructure is fully scaffolded. The app currently runs on:
- **Custom JWT auth** (`lib/auth/session.ts`) as primary layer
- **Mock data** (`lib/data.ts`) for all content
- **Supabase modules** installed and ready (`lib/supabase/`) — activated automatically when credentials are set

---

## Step 1 — Create Supabase Project

1. Go to https://supabase.com and sign in
2. Click **New project**
3. Choose your organisation, set a strong database password
4. Select region closest to Vietnam (e.g. Southeast Asia - Singapore)
5. Wait for project to provision (~2 minutes)

---

## Step 2 — Get Credentials

From **Project Settings → API**:

| Variable | Where to find |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Project API Keys → anon / public |
| `SUPABASE_SERVICE_ROLE_KEY` | Project API Keys → service_role (keep secret!) |

Copy `.env.example` to `.env.local` and fill in these three values.

---

## Step 3 — Run SQL Migration

Open **SQL Editor** in the Supabase Dashboard and paste the full schema
from `AUDIT_REPORT.md` (Section H — SQL Migration).

This creates all 9 tables:
- `categories`, `products`, `product_media`
- `banners`, `videos`, `inquiries`
- `site_settings`, `admin_users`

---

## Step 4 — Create Admin User in Supabase Auth

```sql
-- Run in Supabase SQL Editor
-- Replace with real email and password
SELECT supabase_admin.create_user(
  email    := 'admin@cacanhthanhliem.com',
  password := 'TL@Admin2025',
  user_metadata := '{
    "display_name": "Nguyễn Thanh Liêm",
    "role": "superadmin"
  }'::jsonb
);
```

Or via Supabase Dashboard → Authentication → Users → Add User.

---

## Step 5 — Create Storage Buckets

Go to **Storage → New bucket** and create:

| Bucket name | Public | Allowed MIME types |
|---|---|---|
| `product-images` | Có | image/jpeg, image/png, image/webp |
| `product-videos` | Có | video/mp4, video/quicktime |
| `banners` | Có | image/jpeg, image/png, image/webp |
| `site-videos` | Có | video/mp4, video/quicktime |
| `news-images` | Có | image/jpeg, image/png, image/webp |

---

## Step 6 — Seed Initial Data

```sql
-- Categories are already seeded by the migration.
-- Add your first product:
INSERT INTO public.products (category_id, slug, name, status, is_featured)
VALUES (
  (SELECT id FROM public.categories WHERE slug = 'ca-koi'),
  'ca-koi-kohaku-f1',
  'Cá Koi Kohaku F1 Nhật',
  'available',
  true
);
```

---

## Step 7 — Migrate Each Admin Module (Phase 2 CRUD)

After credentials are set and the schema is applied, migrate each module:

### Order of migration (recommended):

1. **Site Settings** — replace `lib/constants.ts` hardcoded values
2. **Categories** — replace `MOCK_CATEGORIES` in `lib/data.ts`
3. **Products** — replace `MOCK_PRODUCTS` + `AdminProductsClient`
4. **Banners** — replace `DEFAULTS` in `AdminBannersClient`
5. **Videos** — replace `INITIAL` in `AdminVideosClient`
6. **News** — replace `MOCK_NEWS` in `lib/data.ts`
7. **Inquiries** — connect contact form to `inquiries` table
8. **Admin Users** — replace `lib/auth/accounts.ts` in-memory store

### Pattern for each module:

```typescript
// lib/data.ts — before (mock)
export async function getProducts() {
  return MOCK_PRODUCTS;
}

// lib/data.ts — after (Supabase)
export async function getProducts() {
  const supabase = await getSupabaseServerClient();
  if (!supabase) return MOCK_PRODUCTS; // graceful fallback

  const { data, error } = await supabase
    .from("products")
    .select("*, categories(name, slug)")
    .neq("status", "hidden")
    .order("display_order");

  if (error || !data) return MOCK_PRODUCTS;
  return data;
}
```

---

## Step 8 — Verify Deployment

```bash
# Validate environment
node -e "console.log(process.env.NEXT_PUBLIC_SUPABASE_URL)"

# TypeScript check
npx tsc --noEmit

# Build
npm run build

# Start production server
npm start
```

---

## Checklist Before Going Live

- [ ] All 9 database tables created
- [ ] Storage buckets created with correct MIME restrictions
- [ ] Admin user created in Supabase Auth
- [ ] `SESSION_SECRET` set to a strong 48+ char random string
- [ ] `RESEND_API_KEY` configured for email notifications
- [ ] All mock data migrated to real database
- [ ] RLS policies verified (run `SUPABASE_AUDIT.sql`)
- [ ] Media uploads tested end-to-end
- [ ] Contact form tested → entry appears in `inquiries` table
- [ ] Login with Supabase Auth credentials tested
- [ ] Logout clears both JWT cookie and Supabase session

---

## Auth Flow After Full Migration

```
User submits login form
  ↓
POST /api/admin/login
  ↓
[SUPABASE_ENABLED=true]
  supabase.auth.signInWithPassword()
  ↓ success
  Creates custom JWT cookie (for AdminShell/middleware)
  Supabase session cookie set automatically by @supabase/ssr
  ↓
Middleware runs on every /admin/* request
  1. Verifies custom JWT → extracts role + displayName
  2. refreshSupabaseSession() → refreshes Supabase token silently
  ↓
Admin UI renders normally

Logout
  POST /api/admin/logout
    supabase.auth.signOut()     ← invalidates Supabase session
    Clears custom JWT cookie    ← invalidates middleware gate
  ↓
Redirect → /admin/login
```

---

## Environment Variables Reference

| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Phase 2 | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Phase 2 | Public anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Phase 2 | Service role key (server-only) |
| `SESSION_SECRET` | **Now** | JWT signing secret (32+ chars) |
| `RESEND_API_KEY` | Phase 2 | Email notifications |
| `ADMIN_EMAIL` | Phase 2 | Recipient for contact form emails |
| `NEXT_PUBLIC_SITE_URL` | Production | Used in metadata |
