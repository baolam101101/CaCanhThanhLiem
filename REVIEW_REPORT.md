# Production Engineering Review — Cá Cảnh Thanh Liêm

**Reviewer:** Senior engineering review (pre-production)
**Last updated:** 2026-07-13
**Stack:** Next.js 16.2.6 (App Router, React 19.2), TypeScript 5 (strict), Tailwind CSS 4, Supabase (SSR), custom JWT auth (jose)
**Verification:** `next build` PASS · `tsc --noEmit` PASS · runtime login/auth/routing smoke test PASS · footer render verified via screenshot

> No content in this report uses emoji characters. Per your request the entire codebase (source and docs) has been purged of emoji glyphs — see §12.

---

## 1. Executive Summary

The codebase is in good shape for a Phase-1/Phase-2 hybrid: a polished public site running on mock data, a full admin CRUD UI (still on in-memory state), and a well-designed Supabase migration/RLS layer wired but not yet the source of truth. Architecture is clean, TypeScript is strict and sound, and the build/typecheck pass.

This review was delivered in two rounds:

**Round 1 — Review + safe fixes**
- **Vietnamese text** — the largest category. Several admin screens, the login flow, and the public banner slider shipped un-accented placeholder text visible to users. 33 strings corrected (§8).
- **One user-visible bug:** login button rendered `"Đăng đăng nhập..."` (duplicated word). Fixed.
- **Security:** replaced a homemade 32-bit hash with `bcryptjs` (already a declared-but-unused dependency) (§5).
- **Framework deprecation:** migrated `middleware.ts` -> `proxy.ts` (Next.js 16) (§2).
- Safe lint/correctness fixes (conditional `useId`, `prefer-const`, unescaped JSX quotes).

**Round 2 — Cleanup you requested**
- Removed cart dead-code and the unused Orders admin module (§10).
- Removed the `/cart` redirect page.
- Removed the unused `framer-motion` dependency.
- Redesigned the footer mini-logo (§7).
- Purged all emoji glyphs from the entire codebase (§12).

**Verdict:** Safe to deploy the public marketing site. The admin panel + auth still need the Phase-2 Supabase wiring completed before it is a real production back office (§5, §11).

---

## 2. Architecture Review

Clean App Router structure with correct route-group separation: chrome-free root layout, `(site)` layout for the public site, `admin` layout for the shell, and `(admin-auth)` group so the login page escapes the shell. The `lib/` layering is sound — `lib/supabase/config.ts` is a pure guard importable from both server and client; `lib/data.ts` builds an isomorphic anon read-client on top and falls back to mock data on any failure. Types are centralized in `types/index.ts`.

**Findings:**

| # | Severity | Finding |
|---|----------|---------|
| A1 | Medium | **Divergent category datasets.** `types#CategorySlug` and `MOCK_CATEGORIES` use `ca-bien`; `PRODUCT_CATEGORIES` and the admin categories seed use `ca-koi`. `AdminProductsClient` falls back to `"ca-koi" as CategorySlug` — a slug not in the union, masked by a cast. Not a runtime bug on mock data; consolidate to the DB `categories` table in Phase 2. Left unchanged. |
| A2 | Low | Barrel files (`components/*/index.ts`) are inconsistent — harmless since imports are direct. |
| A3 | Low | `Product.specs` is fully modelled/populated but never rendered on the product detail page. Surface it or treat as intentional. No change. |

---

## 3. Code Quality Review

- **Readability:** high; consistent naming, purposeful comments.
- **Duplication:** minimal. `computeCroppedImageStyle` is correctly shared between the admin crop tool and the live slider/news render.
- **TypeScript:** `strict` on; `tsc --noEmit` clean. A few deliberate casts (`(product as { images?: string[] })`) contradict the real `Product.images: ProductImage[]` shape — a latent bug once real images arrive (C3 in §11). No stray `any`.
- **Correctness lint fixes applied** (§9): conditional `React.useId()` in `Input`/`Textarea`, `prefer-const`, unescaped `"` in JSX.

**Remaining lint (8 errors) — intentionally not fixed.** These come from the new React-Compiler-aligned rules in `eslint-config-next@16` and flag working, conventional patterns; refactoring them is riskier than the warning:
- `Calling setState synchronously within an effect` — `useMediaQuery`, `useScrolled`, `AdminShell`, `ImageCropTool` (init-on-mount pattern).
- `Cannot create components during render` — `AdminSidebar` defines `DesktopSidebar`/`MobileNav` nested (should be hoisted).
- `Cannot access refs during render` / `Cannot call impure function during render` — `ImageCropTool`, `AdminBannersClient` (`Date.now()` in a `useState` initializer).

None are regressions; all predate this review. See §11 for the recommended follow-up.

---

## 4. Performance Review

- Pages are Server Components; interactivity is in leaf `"use client"` components. `generateStaticParams` is used for product/news detail (SSG). `next.config.ts` enables `optimizePackageImports` (lucide-react + Radix), AVIF/WebP, and long-cache headers for `/images/*`.
- **`framer-motion` removed** (Round 2) — it was declared and referenced in `optimizePackageImports` but imported nowhere; removing it trims the dependency graph.
- **`<img>` vs `next/image`:** most remaining `<img>` usages are justified (base64 `dataUrl` from `FileReader`, or `object-position`/`transform` crops that `next/image` does not handle cleanly). Acceptable.
- `removeConsole` in production keeps `error`/`warn`. Good.

---

## 5. Security Review

| # | Severity | Finding | Action |
|---|----------|---------|--------|
| S1 | High | **Weak password hashing.** `lib/auth/accounts.ts` used a custom 32-bit hash while `bcryptjs` was installed but unused. | **Fixed** — switched to `bcrypt.hashSync/compareSync` (cost 10). Verified live (correct login -> 200 + cookie; wrong -> 401). |
| S2 | High | **In-memory admin account store.** `global.__tlAccounts` is process-memory only — accounts vanish on restart and do not exist across serverless instances. This is the active auth because Supabase env vars are still placeholders. | **Not changed** (Phase-2 scope). Complete the Supabase Auth path before go-live. |
| S3 | Medium | **Session secret has a hardcoded fallback** in `lib/auth/session.ts`. | Recommend failing fast in production if `SESSION_SECRET` is missing. Left unchanged; ensure the env var is set in deploy. |
| S4 | Low | **Default credentials printed on the login screen** and in `.env.example`/seed. | Remove/rotate before production. |
| S5 | OK | **RLS is well-designed** (`0009_rls.sql`): RLS on every table, `security definer is_admin()`, anon read-only on public content, public insert-only on orders, admin-only writes. Storage policies are public-read/admin-write and reconcile the `videos -> site-videos` rename. | No change. |
| S6 | OK | Security headers set (`X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy`); session cookie `httpOnly`/`sameSite=lax`/`secure` in prod; admin routes `noindex`. | Good. |
| S7 | OK | No secrets committed; `.gitignore` covers `.env*`; service-role key is server-only. | Good. |

No `dangerouslySetInnerHTML` anywhere; news content is a typed block array rendered as React nodes (safe). CSRF surface is limited (`sameSite=lax`, same-origin fetch).

---

## 6. Supabase Review

- Config guard (`SUPABASE_ENABLED`) cleanly detects placeholders and degrades to mock/JWT mode. Good client separation (browser/server/admin/middleware).
- Repository layer (`lib/data.ts`) maps snake_case rows to camelCase types and falls back to mock on error; column selection matches `0003_tables_core.sql`.
- Login route layers Supabase Auth + custom JWT so middleware keeps working during transition.
- Migrations are ordered and idempotent where needed; seed matches `lib/auth/accounts.ts`; storage buckets mirror client-side size caps.
- **Gap (expected):** products/news/banners/videos/orders/accounts admin CRUD still operate on component-local state. This is Phase-2 work, not a defect.

---

## 7. UI / UX Review

- **Consistency:** strong. Shared UI primitives, consistent brand color, consistent toast/modal patterns.
- **States:** loading, empty, and error states all present and localized.
- **Accessibility:** skip-link, aria-labels on icon buttons, `aria-current`, `aria-modal` dialogs, focus rings. (Fixed several un-accented aria-labels — §8.)
- **Footer mini-logo redesign (Round 2):** the logo previously used a translucent `border-white/60` on the bright green background and read as washed-out. It now sits on a solid white padded coin (`bg-white p-1 rounded-full`) with a soft shadow and a subtle `ring-1 ring-black/10`, so the monogram reads crisply against the green. Verified via screenshot.
- **Minor (not changed):** the home hero references `product.emoji` (now always empty); About/Team/Contact use empty-string image placeholders by design.

---

## 8. Vietnamese Text Review

33 strings corrected (missing accents/diacritics + one duplicated word). Full Old/New/Reason log:

### Login flow

`app/api/admin/login/route.ts`
```
Old: "Vui long nhap du thong tin"                 New: "Vui lòng nhập đủ thông tin"
Old: "Ten dang nhap hoac mat khau khong dung"     New: "Tên đăng nhập hoặc mật khẩu không đúng"
Reason: Missing diacritics on user-facing errors (401 verified live).
```

`components/admin/AdminLoginClient.tsx`
```
Old: "Vui long dien day du thong tin"             New: "Vui lòng điền đầy đủ thông tin"
Old: "Dang nhap that bai"                         New: "Đăng nhập thất bại"
Old: "Khong the ket noi. Vui long thu lai."       New: "Không thể kết nối. Vui lòng thử lại."
Old: aria "An mat khau"/"Hien mat khau"           New: "Ẩn mật khẩu"/"Hiện mật khẩu"
Old: "Đăng đăng nhập..."  (button loading)        New: "Đang đăng nhập..."
Reason: Missing diacritics; the button text was a duplicated-word BUG ("Đăng" -> "Đang").
```

### Root layout

`app/layout.tsx`
```
Old: "Bo qua dieu huong"   New: "Bỏ qua điều hướng"
Reason: Missing diacritics on the a11y skip link.
```

### Public banner slider

`components/sections/HeroBannerSlider.tsx`
```
Old: "Ca Canh Thanh Liem"                 New: "Cá Cảnh Thanh Liêm"
Old: aria "Slide truoc"/"Slide tiep theo" New: "Slide trước"/"Slide tiếp theo"
Reason: Brand name + carousel controls needed diacritics.
```

### Admin — Categories (`components/admin/AdminCategoriesClient.tsx`)
```
Seed names/descriptions (un-accented -> accented):
  "Ca Koi"/"Ca chep Koi Viet & Nhat nhap khau chinh hang" -> "Cá Koi"/"Cá chép Koi Việt & Nhật nhập khẩu chính hãng"
  "Ca Dia"/"Vua cua ca nhiet doi nuoc ngot"               -> "Cá Đĩa"/"Vua của cá nhiệt đới nước ngọt"
  "Ca La Han"/"Bieu tuong may man va thinh vuong"         -> "Cá La Hán"/"Biểu tượng may mắn và thịnh vượng"
  "Ca Nhiet Doi"/"Da dang cac loai ca nhiet doi"          -> "Cá Nhiệt Đới"/"Đa dạng các loài cá nhiệt đới"
  "Ca Rong"/"Loai ca quy hiem nhat trong the gioi ca canh"-> "Cá Rồng"/"Loài cá quý hiếm nhất trong thế giới cá cảnh"
  "Phu Kien"/"Thiet bi, thuc an va phu kien ho ca"        -> "Phụ Kiện"/"Thiết bị, thức ăn và phụ kiện hồ cá"
Messages/labels:
  "Vui long nhap ten danh muc"   -> "Vui lòng nhập tên danh mục"
  "Danh muc nay da ton tai"      -> "Danh mục này đã tồn tại"
  "Da them danh muc ..."         -> "Đã thêm danh mục ..."
  "Da cap nhat ..."              -> "Đã cập nhật ..."
  "Khong the xoa — co N san pham"-> "Không thể xóa — còn N sản phẩm"
  "Xoa danh muc ...?"            -> "Xóa danh mục ...?"
  "Da xoa ..."                   -> "Đã xóa ..."
  badge/toggle "An"/"Hien"       -> "Ẩn"/"Hiện"
  title "Sua"/"Xoa"              -> "Sửa"/"Xóa"
  placeholder "VD: Ca Koi Nhat Ban" -> "VD: Cá Koi Nhật Bản"
Reason: Category names, toasts, validation, badges, action titles and placeholder were un-accented.
```

### Admin — Videos (`components/admin/AdminVideosClient.tsx`)
```
  "Ca Koi Nhat moi ve thang 5"     -> "Cá Koi Nhật mới về tháng 5"
  "Ca Rong Bach Kim tai cua hang"  -> "Cá Rồng Bạch Kim tại cửa hàng"
  "Ca Dia Cobalt xanh"             -> "Cá Đĩa Cobalt xanh"
  "Quan ly Video"                  -> "Quản lý Video"
  "N dang hien thi"                -> "N đang hiển thị"
  "Bam de doi video khac"          -> "Bấm để đổi video khác"
  title "An"/"Hien" / "Xoa"        -> "Ẩn"/"Hiện" / "Xóa"
Reason: Seed titles, heading, status line and action labels were un-accented.
```

### Admin — Banners (`components/admin/AdminBannersClient.tsx`)
```
Old: aria "Xem lon"   New: "Xem lớn"
Old: "Anh banner"     New: "Ảnh banner"
Reason: Missing diacritics on a11y label and image-name fallback.
```

**Total: 33 distinct strings across 8 files.** Wording/terminology elsewhere was already natural and consistent — no rewrites needed.

---

## 9. Files Modified / Added / Removed

Working tree state after both rounds.

**Modified (content):**
| File | Change |
|------|--------|
| `app/api/admin/login/route.ts` | Vietnamese diacritics on 2 errors |
| `app/layout.tsx` | Diacritics on skip link |
| `app/(site)/page.tsx` | Diacritics; removed `biểu tượng sao` from featured badge |
| `components/admin/AdminLoginClient.tsx` | 5 message/aria fixes + duplicated-word bug fix |
| `components/admin/AdminCategoriesClient.tsx` | Seed data + all toasts/labels/placeholder accented |
| `components/admin/AdminVideosClient.tsx` | Seed titles + heading/status/labels accented; JSX quote escape |
| `components/admin/AdminBannersClient.tsx` | 2 aria/label diacritic fixes |
| `components/admin/AdminProductsClient.tsx` | Unescaped JSX `"` -> string expression |
| `components/admin/AdminAccountsClient.tsx` | Removed leading `biểu tượng info` emoji from info box |
| `components/product/ProductsClient.tsx` | Removed `biểu tượng sao` from "Nổi bật" filter label |
| `components/sections/HeroBannerSlider.tsx` | Brand fallback + 2 carousel aria labels accented |
| `components/layout/Footer.tsx` | Mini-logo redesigned (white coin + shadow + ring) |
| `components/ui/Input.tsx` | Fix conditional `React.useId()` |
| `components/ui/Textarea.tsx` | Fix conditional `React.useId()` |
| `lib/auth/accounts.ts` | Security: replace 32-bit hash with `bcryptjs` |
| `lib/supabase/middleware.ts` | `let -> const` |
| `next.config.ts` | Removed `framer-motion` from `optimizePackageImports` |
| `package.json` / `package-lock.json` | Removed `framer-motion` dependency |
| `README.md` | Removed `biểu tượng cá` emoji from title |
| `AUDIT_REPORT.md` | Replaced `dấu x` markers with `-` |
| `SUPABASE_MIGRATION.md` | Replaced `dấu tích` markers with `Có` |

**Renamed:** `middleware.ts` -> `proxy.ts` (Next.js 16 migration; `middleware()` -> `proxy()`).

**Added:** `REVIEW_REPORT.md` (this file).

**Removed (Round 2 cleanup):**
| File | Reason |
|------|--------|
| `components/cart/CartClient.tsx` | Cart feature removed; unused `return null` stub |
| `components/cart/index.ts` | Re-exported the removed CartClient |
| `hooks/useCart.ts` | Backward-compat stub for removed cart; no importers |
| `app/(site)/cart/page.tsx` | `/cart` redirect; no internal links point to it |
| `components/admin/AdminOrdersClient.tsx` | No `/admin/orders` route; imported nowhere |

---

## 10. Dead Code — status

All Round-2 removals above were verified unreferenced by grep before deletion, and `next build` + `tsc` pass afterward.

**Still present (documented, not removed):**
| Item | Note |
|------|------|
| `lib/utils.ts` -> `debounce`, `isEmpty`, `staggerDelay` | Exported functions with zero importers. Not whole files, so removal is a line edit; left in place. |
| `components/ui/Card.tsx` (+ `index.ts` re-exports) | Unused, but a reasonable reusable primitive. Recommend keeping. |
| `emoji` fields/props (`Product.emoji`, `Category.emoji`, etc.) | These hold empty strings — they contain no emoji glyphs, so the "no emoji" requirement is satisfied. Removing the fields themselves is a cross-cutting refactor (types + data + components) and was intentionally not done. |

---

## 11. Remaining Recommendations

1. **Complete the Supabase Phase-2 wiring** before treating the admin as production (S2) — the highest-value remaining work.
2. **Fail fast on missing `SESSION_SECRET`** in production and remove the hardcoded fallback + on-screen default credentials (S3, S4).
3. **Unify the category taxonomy** (A1) and drop the `"ca-koi" as CategorySlug` cast once real data lands.
4. **Align the image casts** in `ProductCard`/`ProductDetailClient` with `Product.images: ProductImage[]` before wiring real images (C3).
5. **Address the 8 React-Compiler lint errors** in a dedicated pass (hoist `AdminSidebar` nested components; adjust init-on-mount effects).
6. **Consider `next/image`** for public product/news placeholders once Supabase Storage URLs replace base64 previews.
7. Optionally prune the three unused `lib/utils.ts` functions (§10).

---

## 12. Emoji Purge (Round 2)

At your request, every emoji glyph was removed from the codebase (source and docs). Detection scanned `.ts/.tsx/.js/.mjs/.jsx/.css/.json/.md/.sql` for pictographic/symbol emoji ranges (deliberately excluding legitimate typography such as arrows, bullets, and the middot).

| File | Was | Now |
|------|-----|-----|
| `app/(site)/page.tsx` | `biểu tượng sao Nổi bật` | `Nổi bật` |
| `components/product/ProductsClient.tsx` | `biểu tượng sao Nổi bật` | `Nổi bật` |
| `components/admin/AdminAccountsClient.tsx` | `biểu tượng info Tài khoản mới ...` | `Tài khoản mới ...` |
| `README.md` | `# biểu tượng cá Cá Cảnh ...` | `# Cá Cảnh ...` |
| `AUDIT_REPORT.md` | `dấu x ...` (5x) | `- ...` |
| `SUPABASE_MIGRATION.md` | `dấu tích` (5x) | `Có` |
| `REVIEW_REPORT.md` | (regenerated) | emoji-free |

A re-scan confirms zero emoji glyphs remain in the repository. Note: `emoji` variable/property names are identifiers (not emoji characters) and remain; they hold empty strings.

---

### Verification log

```
tsc --noEmit ............................. PASS
next build ............................... PASS (0 deprecation warnings; no /cart route; framer-motion gone)
runtime: POST /api/admin/login (correct) .. 200 + httpOnly session cookie, role=superadmin
runtime: POST /api/admin/login (wrong) .... 401 "Tên đăng nhập hoặc mật khẩu không đúng"
runtime: GET /admin (no cookie) ........... 307 -> /admin/login (proxy guard OK)
runtime: GET / ............................ 200
footer mini-logo ......................... rendered + visually verified via screenshot
emoji re-scan ............................ 0 glyphs across source + docs
```
