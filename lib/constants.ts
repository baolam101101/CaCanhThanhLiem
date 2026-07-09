export const SITE_CONFIG = {
  name: "Cá Cảnh Thanh Liêm",
  nameEn: "Ca Canh Thanh Liem",
  tagline: "Chuyên Cung Cấp Cá Chép Koi Việt - Nhập",
  description:
    "Chuyên cung cấp các dòng cá chép Koi Việt - Nhập khẩu chất lượng cao tại Bình Chánh, TP.HCM.",
  url: "https://cacanhthanhliem.com",
  phone: "0909 633 203",
  phone2: "0931 44 42 40",
  phoneHref: "tel:+84909633203",
  email: "info@cacanhthanhliem.com",
  address: "223A2 Nguyễn Văn Linh - Tổ 9 - Ấp 1 - Xã An Phú Tây - Huyện Bình Chánh",
  addressShort: "223A2 Nguyễn Văn Linh, Bình Chánh, TP.HCM",
  googleMapsUrl: "https://maps.google.com",
  hours: "7:00 - 20:00 (Tất cả các ngày trong tuần)",
  facebook: "https://facebook.com/CaCanhThanhLiem",
  zalo: "https://zalo.me/0909633203",
  website: "www.cacanhthanhliem.com",
  founded: 2009,
} as const;

export const NAV_LINKS = [
  { href: "/",        label: "Trang chủ" },
  { href: "/products",label: "Sản phẩm" },
  { href: "/about",   label: "Về chúng tôi" },
  { href: "/news",    label: "Tin tức" },
  { href: "/contact", label: "Liên hệ" },
] as const;

export const PRODUCT_CATEGORIES = [
  { slug: "ca-koi",      name: "Cá Koi",        nameEn: "Koi Fish", description: "Cá chép Koi Việt & Nhật nhập khẩu chính hãng", count: 0 },
  { slug: "ca-dia",      name: "Cá Đĩa",        nameEn: "Discus", description: "Vua của cá nhiệt đới nước ngọt", count: 0 },
  { slug: "ca-la-han",   name: "Cá La Hán",     nameEn: "Flowerhorn", description: "Biểu tượng may mắn và thịnh vượng", count: 0 },
  { slug: "ca-nhiet-doi",name: "Cá Nhiệt Đới",  nameEn: "Tropical Fish", description: "Đa dạng các loài cá nhiệt đới", count: 0 },
  { slug: "ca-rong",     name: "Cá Rồng",       nameEn: "Arowana", description: "Loài cá quý hiếm nhất trong thế giới cá cảnh", count: 0 },
  { slug: "phu-kien",    name: "Phụ Kiện",      nameEn: "Accessories", description: "Thiết bị, thức ăn và phụ kiện hồ cá", count: 0 },
] as const;

export const PRODUCT_STATUSES = {
  available:    { label: "Còn hàng",  color: "text-brand-700 bg-brand-50 border-brand-200" },
  out_of_stock: { label: "Hết hàng",  color: "text-surface-600 bg-surface-100 border-surface-200" },
  hidden:       { label: "Ẩn",        color: "text-surface-500 bg-surface-50 border-surface-200" },
} as const;

export const PRODUCT_TAGS = {
  featured: { label: "Nổi bật", color: "bg-accent-warm text-white" },
  new:      { label: "Mới về",  color: "bg-brand-500 text-white" },
} as const;

export const ORDER_STATUSES = {
  pending:   { label: "Chờ xử lý",  color: "text-amber-700 bg-amber-50" },
  contacted: { label: "Đã liên hệ", color: "text-brand-700 bg-brand-50" },
  completed: { label: "Hoàn thành", color: "text-surface-600 bg-surface-100" },
  cancelled: { label: "Đã hủy",     color: "text-red-700 bg-red-50" },
} as const;

export const TRUST_ITEMS = [
  { icon: "", text: "Cá Koi chất lượng cao" },
  { icon: "", text: "Nguồn gốc rõ ràng" },
  { icon: "", text: "Giao hàng toàn quốc" },
  { icon: "", text: "Tư vấn chuyên nghiệp" },
] as const;
