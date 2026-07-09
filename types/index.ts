// ============================================================
// CORE DOMAIN TYPES
// ============================================================

export type ProductStatus = "available" | "out_of_stock" | "hidden";
export type ProductTag = "featured" | "new";
export type OrderStatus = "pending" | "contacted" | "completed" | "cancelled";
export type CategorySlug =
  | "ca-bien"
  | "ca-dia"
  | "ca-la-han"
  | "ca-nhiet-doi"
  | "ca-rong"
  | "phu-kien";

// ============================================================
// PRODUCT
// ============================================================
export interface ProductSpec {
  size: string;         // e.g. "5-8 cm"
  temperature: string;  // e.g. "24-28°C"
  ph: string;           // e.g. "8.1-8.4"
  origin: string;       // e.g. "Thái Bình Dương"
  minTankSize: string;  // e.g. "100L"
  careLevel: "Rất dễ" | "Dễ chăm sóc" | "Trung bình" | "Khó" | "Rất khó";
  diet?: string;
  compatibility?: string;
}

export interface ProductImage {
  id: string;
  url: string;
  alt: string;
  isPrimary: boolean;
}

export interface Product {
  id: string;
  slug: string;
  name: string;        // Vietnamese name
  nameEn?: string;     // English name
  latin: string;       // Scientific name
  category: string;    // Category display name
  categorySlug: CategorySlug;
  emoji?: string;
  status: ProductStatus;
  tags: ProductTag[];
  description: string;
  longDescription?: string;
  specs: ProductSpec;
  images?: ProductImage[];
  createdAt: Date;
  updatedAt: Date;
  viewCount?: number;
}

// ============================================================
// CATEGORY
// ============================================================
export interface Category {
  slug: string;
  name: string;
  nameEn: string;
  emoji?: string;
  description: string;
  count: number;
  imageUrl?: string;
}

// ============================================================
// CART
// ============================================================
export interface CartItem {
  productId: string;
  product: Product;
  addedAt: Date;
}

export interface Cart {
  items: CartItem[];
  itemCount: number;
}

// ============================================================
// ORDER / REQUEST
// ============================================================
export interface OrderRequest {
  id: string;
  customerName: string;
  phone: string;
  email?: string;
  address?: string;
  note?: string;
  items: Array<{
    productId: string;
    productName: string;
    category: string;
  }>;
  status: OrderStatus;
  createdAt: Date;
  updatedAt: Date;
  adminNote?: string;
}

export interface OrderRequestFormData {
  customerName: string;
  phone: string;
  email?: string;
  address?: string;
  note?: string;
}

// ============================================================
// FORMS
// ============================================================
export interface ContactFormData {
  name: string;
  phone: string;
  subject: string;
  message: string;
}

export interface FormState {
  status: "idle" | "loading" | "success" | "error";
  message?: string;
}

// ============================================================
// API RESPONSES
// ============================================================
export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// ============================================================
// UI
// ============================================================
export interface NavLink {
  href: string;
  label: string;
  isExternal?: boolean;
}

export interface Breadcrumb {
  label: string;
  href?: string;
}

export interface SEOMeta {
  title: string;
  description: string;
  image?: string;
  keywords?: string[];
  noIndex?: boolean;
}

// ============================================================
// NEWS / CMS
// ============================================================
export interface NewsArticle {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  // Rich content stored as a simple block array — enough to express
  // headings, paragraphs, lists, and inline images without pulling in
  // a full rich-text editor for Phase 1 (UI/mock only). This shape is
  // intentionally compatible with a future Supabase JSONB column.
  content: NewsContentBlock[];
  featuredImage: string;
  featuredImagePosX?: number;
  featuredImagePosY?: number;
  featuredImageZoom?: number;
  createdAt: Date;
  updatedAt: Date;
  published: boolean;
  displayOrder?: number;
}

export type NewsContentBlock =
  | { type: "heading"; text: string }
  | { type: "paragraph"; text: string }
  | { type: "list"; items: string[] }
  | { type: "image"; url: string; caption?: string };

// ============================================================
// ADMIN
// ============================================================
export interface AdminStats {
  totalProducts: number;
  availableProducts: number;
  pendingOrders: number;
  totalOrders: number;
  featuredProducts: number;
  newArrivals: number;
}

export interface AdminNavItem {
  key: string;
  label: string;
  icon: string;
  href: string;
}
