import type { Product, Category } from "@/types";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { supabaseConfig, SUPABASE_ENABLED } from "@/lib/supabase/config";

// ============================================================
// SUPABASE DATA SOURCE (Phase 2 — repository layer)
// ------------------------------------------------------------
// Public site reads use an isomorphic anon client created from the
// pure config module (no next/headers), so this file stays importable
// from both Server and Client Components. The RLS "public read"
// policies gate what the anon role may see.
//
// Every repository function falls back to the mock data in this file
// when Supabase is not configured or a query fails, so behaviour is
// identical to Phase 1 until the database is populated. Repository
// functions are async because Supabase queries are promise-based.
// ============================================================
let _readClient: SupabaseClient | null = null;

function getReadClient(): SupabaseClient | null {
  if (!SUPABASE_ENABLED || !supabaseConfig) return null;
  if (!_readClient) {
    _readClient = createClient(supabaseConfig.url, supabaseConfig.anonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return _readClient;
}

// ============================================================
// MOCK PRODUCT DATA
// ============================================================
export const MOCK_PRODUCTS: Product[] = [
  {
    id: "1",
    slug: "ca-hai-quy-nemo",
    name: "Cá Hải Quỳ Nemo",
    nameEn: "Clownfish",
    latin: "Amphiprioninae",
    category: "Cá Biển",
    categorySlug: "ca-bien",
    status: "available",
    tags: ["featured", "new"],
    description:
      "Cá hải quỳ Nemo nổi tiếng với màu sắc rực rỡ cam-trắng. Sống cộng sinh với hải quỳ, tạo nên vẻ đẹp sinh động cho hồ rạn san hô.",
    longDescription:
      "Amphiprioninae là một loài cá biển nhiệt đới thuộc họ Pomacentridae. Nổi tiếng thế giới sau bộ phim Finding Nemo, loài cá này được yêu thích bởi màu sắc cam-trắng đặc trưng và hành vi cộng sinh độc đáo với hải quỳ. Cá thích nghi tốt với điều kiện hồ nuôi, dễ chăm sóc và ăn uống không kén chọn.",
    specs: {
      size: "5-8 cm",
      temperature: "24-28°C",
      ph: "8.1-8.4",
      origin: "Thái Bình Dương",
      minTankSize: "100L",
      careLevel: "Dễ chăm sóc",
      diet: "Thức ăn viên, tảo, thức ăn sống",
      compatibility: "Hòa bình với đa số cá biển, cần hải quỳ đối tác",
    },
    createdAt: new Date("2024-01-15"),
    updatedAt: new Date("2024-05-01"),
    viewCount: 1240,
  },
  {
    id: "2",
    slug: "ca-dia-xanh-cobalt",
    name: "Cá Đĩa Xanh Cobalt",
    nameEn: "Cobalt Blue Discus",
    latin: "Symphysodon aequifasciatus",
    category: "Cá Đĩa",
    categorySlug: "ca-dia",
    status: "available",
    tags: ["featured"],
    description:
      "Cá đĩa xanh cobalt với màu sắc tuyệt đẹp và thân hình tròn đặc trưng. Mệnh danh là 'vua' của các loài cá nhiệt đới nước ngọt.",
    longDescription:
      "Symphysodon aequifasciatus — hay còn gọi là Discus — là một trong những loài cá cảnh đắt giá và được săn đón nhiều nhất thế giới. Xuất xứ từ lưu vực sông Amazon, loài cá này đòi hỏi điều kiện nước sạch và ổn định. Màu xanh cobalt rực rỡ là kết quả của kỹ thuật lai tạo tinh tế từ Đức và Đông Nam Á.",
    specs: {
      size: "15-20 cm",
      temperature: "28-32°C",
      ph: "6.0-7.0",
      origin: "Amazon / Lai tạo",
      minTankSize: "200L",
      careLevel: "Trung bình",
      diet: "Thức ăn chuyên dụng cho Discus, trùn đỏ",
      compatibility: "Đàn cùng loài, tránh cá hung hăng",
    },
    createdAt: new Date("2024-02-10"),
    updatedAt: new Date("2024-04-20"),
    viewCount: 890,
  },
  {
    id: "3",
    slug: "ca-buom-hoang-de",
    name: "Cá Bướm Hoàng Đế",
    nameEn: "Emperor Angelfish",
    latin: "Pomacanthus imperator",
    category: "Cá Biển",
    categorySlug: "ca-bien",
    status: "available",
    tags: ["featured"],
    description:
      "Một trong những loài cá biển đẹp nhất với hoa văn kẻ sọc vàng-xanh rực rỡ. Cá trưởng thành có màu sắc khác hoàn toàn với cá con.",
    longDescription:
      "Pomacanthus imperator, hay Cá Thiên Thần Hoàng Đế, là một trong những loài cá biển được ngưỡng mộ nhất thế giới. Đặc điểm nổi bật là màu sắc biến đổi hoàn toàn theo tuổi — cá con có hoa văn xoáy xanh-trắng, trong khi cá trưởng thành có sọc vàng nổi bật trên nền xanh navy. Loài này đòi hỏi hồ lớn và kinh nghiệm nuôi cá biển.",
    specs: {
      size: "30-38 cm",
      temperature: "23-27°C",
      ph: "8.1-8.4",
      origin: "Ấn Độ Dương, Thái Bình Dương",
      minTankSize: "500L",
      careLevel: "Khó",
      diet: "Tảo, bọt biển, thức ăn đông lạnh",
      compatibility: "Bán hung hăng, không nuôi chung cùng loài",
    },
    createdAt: new Date("2024-03-01"),
    updatedAt: new Date("2024-05-10"),
    viewCount: 650,
  },
  {
    id: "4",
    slug: "ca-la-han-campa",
    name: "Cá La Hán Campa",
    nameEn: "Campa Flowerhorn",
    latin: "Cichlasoma sp. hybrid",
    category: "Cá La Hán",
    categorySlug: "ca-la-han",
    status: "available",
    tags: ["new"],
    description:
      "Cá la hán Campa với đầu u nổi bật và hoa văn hoa mai đặc trưng. Biểu tượng của may mắn và thịnh vượng trong văn hóa Á Đông.",
    longDescription:
      "Cá La Hán dòng Campa là kết quả của nhiều thập kỷ lai tạo tại Đông Nam Á. Nổi bật với đầu u (nuchal hump) phát triển to, hoa văn hoa mai sắc nét và màu sắc rực rỡ. Theo phong thủy, cá la hán được coi là mang lại may mắn, sức khỏe và tài lộc cho gia chủ.",
    specs: {
      size: "25-35 cm",
      temperature: "26-30°C",
      ph: "7.0-8.0",
      origin: "Lai tạo (Đông Nam Á)",
      minTankSize: "200L",
      careLevel: "Dễ chăm sóc",
      diet: "Thức ăn viên chuyên dụng La Hán, tôm tươi",
      compatibility: "Nuôi đơn hoặc cặp đôi",
    },
    createdAt: new Date("2024-04-05"),
    updatedAt: new Date("2024-05-15"),
    viewCount: 780,
  },
  {
    id: "5",
    slug: "ca-bay-mau-guppy-duc",
    name: "Cá Bảy Màu Guppy Đức",
    nameEn: "German Guppy",
    latin: "Poecilia reticulata",
    category: "Cá Nhiệt Đới",
    categorySlug: "ca-nhiet-doi",
    status: "available",
    tags: ["new"],
    description:
      "Guppy Đức với đuôi dài rực rỡ, đa màu sắc. Loài cá đẹp và dễ nuôi, lý tưởng cho người mới bắt đầu.",
    specs: {
      size: "3-5 cm",
      temperature: "22-28°C",
      ph: "7.0-8.5",
      origin: "Đức (lai tạo)",
      minTankSize: "40L",
      careLevel: "Rất dễ",
      diet: "Thức ăn viên nhỏ, tảo",
      compatibility: "Hòa bình, đàn nhỏ",
    },
    createdAt: new Date("2024-05-01"),
    updatedAt: new Date("2024-05-20"),
    viewCount: 420,
  },
  {
    id: "6",
    slug: "ca-rong-bach-kim",
    name: "Cá Rồng Châu Á Bạch Kim",
    nameEn: "Platinum Asian Arowana",
    latin: "Scleropages formosus",
    category: "Cá Rồng",
    categorySlug: "ca-rong",
    status: "available",
    tags: ["featured"],
    description:
      "Cá rồng bạch kim — loài cá quý hiếm và giá trị nhất trong thế giới cá cảnh. Mang ý nghĩa phong thủy đặc biệt, thu hút tài lộc.",
    specs: {
      size: "60-90 cm",
      temperature: "25-30°C",
      ph: "6.5-7.5",
      origin: "Malaysia / Indonesia",
      minTankSize: "1000L",
      careLevel: "Khó",
      diet: "Cá sống, tôm, cào cào, thức ăn chuyên dụng",
      compatibility: "Nuôi đơn hoặc đàn cùng kích thước",
    },
    createdAt: new Date("2024-01-20"),
    updatedAt: new Date("2024-05-05"),
    viewCount: 2100,
  },
  {
    id: "7",
    slug: "ca-tang-vang",
    name: "Cá Tang Vàng",
    nameEn: "Yellow Tang",
    latin: "Zebrasoma flavescens",
    category: "Cá Biển",
    categorySlug: "ca-bien",
    status: "out_of_stock",
    tags: [],
    description:
      "Cá tang vàng với màu vàng chanh rực rỡ, nổi bật trong bể rạn san hô. Hoạt động linh hoạt và tính tình hiền lành.",
    specs: {
      size: "15-20 cm",
      temperature: "24-27°C",
      ph: "8.1-8.4",
      origin: "Hawaii",
      minTankSize: "300L",
      careLevel: "Trung bình",
      diet: "Tảo, rau diếp, thức ăn dạng tảo khô",
      compatibility: "Hòa bình, không nuôi 2 cá tang cùng loài",
    },
    createdAt: new Date("2024-02-15"),
    updatedAt: new Date("2024-04-10"),
    viewCount: 560,
  },
  {
    id: "8",
    slug: "ca-ky-cu-ngoc-trai",
    name: "Tôm Ký Cư Ngọc Trai",
    nameEn: "Cleaner Shrimp",
    latin: "Lysmata amboinensis",
    category: "Cá Biển",
    categorySlug: "ca-bien",
    status: "available",
    tags: ["new"],
    description:
      "Tôm ký cư ngọc trai — 'bác sĩ' của hồ rạn san hô, chuyên làm sạch ký sinh trùng trên cá. Màu sắc đỏ-trắng bắt mắt.",
    specs: {
      size: "5-7 cm",
      temperature: "23-28°C",
      ph: "8.1-8.4",
      origin: "Ấn Độ Dương",
      minTankSize: "80L",
      careLevel: "Dễ chăm sóc",
      diet: "Ký sinh trùng, thức ăn thừa, thức ăn đông lạnh",
      compatibility: "Hòa bình, tránh cá ăn tôm",
    },
    createdAt: new Date("2024-05-10"),
    updatedAt: new Date("2024-05-20"),
    viewCount: 310,
  },
];

export const MOCK_CATEGORIES: Category[] = [
  { slug: "ca-bien", name: "Cá Biển", nameEn: "Marine Fish", description: "Cá rạn san hô và các loài cá biển nhiệt đới đẹp nhất", count: 4 },
  { slug: "ca-dia", name: "Cá Đĩa", nameEn: "Discus", description: "Vua của cá nhiệt đới nước ngọt với màu sắc rực rỡ", count: 12 },
  { slug: "ca-la-han", name: "Cá La Hán", nameEn: "Flowerhorn", description: "Biểu tượng may mắn và thịnh vượng trong văn hóa Á Đông", count: 8 },
  { slug: "ca-nhiet-doi", name: "Cá Nhiệt Đới", nameEn: "Tropical Fish", description: "Đa dạng các loài cá nhiệt đới nước ngọt dễ nuôi", count: 25 },
  { slug: "ca-rong", name: "Cá Rồng", nameEn: "Arowana", description: "Loài cá quý hiếm nhất trong thế giới cá cảnh", count: 6 },
  { slug: "phu-kien", name: "Phụ Kiện", nameEn: "Accessories", description: "Thiết bị, thức ăn và phụ kiện hồ cá chuyên nghiệp", count: 30 },
];

// ============================================================
// CATEGORIES — Supabase repository
// Mirrors the `categories` table (0003_tables_core.sql). Falls back
// to MOCK_CATEGORIES when Supabase is unavailable.
// ============================================================
interface CategoryRow {
  slug: string;
  name: string;
  name_en: string;
  emoji: string | null;
  description: string;
  product_count: number;
  image_url: string | null;
}

function mapCategoryRow(row: CategoryRow): Category {
  return {
    slug: row.slug,
    name: row.name,
    nameEn: row.name_en,
    emoji: row.emoji ?? undefined,
    description: row.description,
    count: row.product_count,
    imageUrl: row.image_url ?? undefined,
  };
}

/**
 * All categories, ordered by name. Reads from Supabase when configured,
 * otherwise returns the mock list. Same Category[] shape as MOCK_CATEGORIES.
 */
export async function getCategories(): Promise<Category[]> {
  const supabase = getReadClient();
  if (!supabase) return [...MOCK_CATEGORIES];

  const { data, error } = await supabase
    .from("categories")
    .select("slug, name, name_en, emoji, description, product_count, image_url")
    .order("name", { ascending: true });

  if (error || !data) return [...MOCK_CATEGORIES];
  return (data as CategoryRow[]).map(mapCategoryRow);
}

// ============================================================
// DATA HELPERS
// ============================================================
export function getProductBySlug(slug: string): Product | undefined {
  return MOCK_PRODUCTS.find((p) => p.slug === slug);
}

export function getProductById(id: string): Product | undefined {
  return MOCK_PRODUCTS.find((p) => p.id === id);
}

export function getFeaturedProducts(limit = 4): Product[] {
  return MOCK_PRODUCTS.filter(
    (p) => p.tags.includes("featured") && p.status !== "hidden"
  ).slice(0, limit);
}

export function getNewArrivals(limit = 4): Product[] {
  return MOCK_PRODUCTS.filter(
    (p) => p.tags.includes("new") && p.status !== "hidden"
  ).slice(0, limit);
}

export function getProductsByCategory(categorySlug: string): Product[] {
  return MOCK_PRODUCTS.filter(
    (p) => p.categorySlug === categorySlug && p.status !== "hidden"
  );
}

export function searchProducts(query: string): Product[] {
  const q = query.toLowerCase();
  return MOCK_PRODUCTS.filter(
    (p) =>
      p.status !== "hidden" &&
      (p.name.toLowerCase().includes(q) ||
        p.latin.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q))
  );
}

export function getRelatedProducts(product: Product, limit = 4): Product[] {
  return MOCK_PRODUCTS.filter(
    (p) =>
      p.id !== product.id &&
      p.categorySlug === product.categorySlug &&
      p.status !== "hidden"
  ).slice(0, limit);
}

// ============================================================
// NEWS (MOCK — Phase 1 UI/CMS structure only, no database yet)
// ============================================================
import type { NewsArticle } from "@/types";

export const MOCK_NEWS: NewsArticle[] = [
  {
    id: "n1",
    title: "Cá Koi F1 chất lượng cao vừa nhập về cửa hàng",
    slug: "ca-koi-f1-chat-luong-cao",
    excerpt:
      "Lô cá Koi F1 mới nhất từ trang trại Nhật Bản đã có mặt tại Cá Cảnh Thanh Liêm, với màu sắc rực rỡ và form dáng chuẩn thi đấu.",
    featuredImage: "https://images.unsplash.com/photo-1535591273668-578e31182c4f?w=1200&h=800&fit=crop",
    published: true,
    displayOrder: 1,
    createdAt: new Date("2026-06-18"),
    updatedAt: new Date("2026-06-18"),
    content: [
      { type: "heading", text: "Lô cá Koi F1 đặc biệt" },
      { type: "paragraph", text: "Sau nhiều tháng chờ đợi, lô cá Koi F1 thế hệ mới đã chính thức cập bến cửa hàng Cá Cảnh Thanh Liêm. Đây là dòng cá được lai tạo trực tiếp từ các trại giống uy tín tại Niigata, Nhật Bản, nổi tiếng với chất lượng di truyền ổn định và màu sắc đồng đều." },
      { type: "image", url: "https://images.unsplash.com/photo-1520301255226-bf5f144451c1?w=1200&h=700&fit=crop", caption: "Một góc hồ trưng bày cá Koi mới nhập" },
      { type: "paragraph", text: "Khách hàng có thể trực tiếp đến cửa hàng để chiêm ngưỡng và lựa chọn những cá thể ưng ý nhất. Đội ngũ kỹ thuật của chúng tôi sẵn sàng tư vấn về cách chăm sóc và môi trường nuôi phù hợp." },
      { type: "list", items: ["Kích thước từ 15-25cm", "Đầy đủ giấy chứng nhận nguồn gốc", "Bảo hành sức khỏe 7 ngày", "Hỗ trợ vận chuyển toàn quốc"] },
    ],
  },
  {
    id: "n2",
    title: "Hướng dẫn chăm sóc hồ Koi trong mùa mưa",
    slug: "huong-dan-cham-soc-ho-koi-mua-mua",
    excerpt:
      "Mùa mưa mang đến nhiều thách thức cho người nuôi cá Koi. Cùng tìm hiểu các biện pháp bảo vệ đàn cá hiệu quả nhất.",
    featuredImage: "https://images.unsplash.com/photo-1502786129293-79981df4e689?w=1200&h=800&fit=crop",
    published: true,
    displayOrder: 2,
    createdAt: new Date("2026-06-10"),
    updatedAt: new Date("2026-06-10"),
    content: [
      { type: "heading", text: "Những rủi ro thường gặp" },
      { type: "paragraph", text: "Mưa lớn làm thay đổi đột ngột độ pH và nhiệt độ nước, đồng thời cuốn theo bụi bẩn và vi khuẩn từ môi trường xung quanh vào hồ. Đây là nguyên nhân chính gây stress và bệnh cho cá Koi trong mùa mưa." },
      { type: "list", items: ["Kiểm tra pH nước thường xuyên hơn", "Lắp mái che một phần cho hồ", "Tăng cường sục khí oxy", "Hạn chế cho ăn khi nước đục"] },
      { type: "paragraph", text: "Ngoài ra, việc duy trì hệ thống lọc hoạt động ổn định trong giai đoạn này là vô cùng quan trọng để giảm thiểu tác động của nước mưa lên chất lượng nước trong hồ." },
    ],
  },
  {
    id: "n3",
    title: "Cá La Hán mới: dòng Kamfa đầu gù ấn tượng",
    slug: "ca-la-han-kamfa-dau-gu",
    excerpt:
      "Dòng La Hán Kamfa với phần đầu gù nổi bật và màu sắc châu lấp lánh đang là tâm điểm chú ý tại cửa hàng tuần này.",
    featuredImage: "https://images.unsplash.com/photo-1524704796725-9fc3044a58b2?w=1200&h=800&fit=crop",
    published: true,
    displayOrder: 3,
    createdAt: new Date("2026-06-05"),
    updatedAt: new Date("2026-06-05"),
    content: [
      { type: "paragraph", text: "Cá La Hán Kamfa luôn được giới chơi cá cảnh săn đón nhờ phần đầu gù to và châu (hạt kim tuyến) phủ dày trên thân. Lô cá lần này được tuyển chọn kỹ lưỡng từ các bể giống chất lượng." },
      { type: "image", url: "https://images.unsplash.com/photo-1524704796725-9fc3044a58b2?w=1200&h=700&fit=crop" },
      { type: "paragraph", text: "Mỗi cá thể đều được theo dõi sức khỏe trong thời gian cách ly trước khi đưa ra trưng bày, đảm bảo khách hàng nhận được cá khỏe mạnh nhất." },
    ],
  },
  {
    id: "n4",
    title: "Workshop miễn phí: Kỹ thuật xử lý nước hồ cá tại nhà",
    slug: "workshop-ky-thuat-xu-ly-nuoc-ho-ca",
    excerpt:
      "Cá Cảnh Thanh Liêm tổ chức buổi chia sẻ miễn phí về kỹ thuật xử lý và duy trì chất lượng nước hồ cá dành cho người mới bắt đầu.",
    featuredImage: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=1200&h=800&fit=crop",
    published: true,
    displayOrder: 4,
    createdAt: new Date("2026-05-28"),
    updatedAt: new Date("2026-05-28"),
    content: [
      { type: "heading", text: "Nội dung buổi chia sẻ" },
      { type: "paragraph", text: "Buổi workshop sẽ tập trung vào các kiến thức nền tảng giúp người mới nuôi cá tự tin xử lý các vấn đề về chất lượng nước, từ chu trình nitơ cho đến cách sử dụng các loại vi sinh phù hợp." },
      { type: "list", items: ["Chu trình nitơ trong hồ cá", "Cách đo và điều chỉnh pH/độ cứng", "Lựa chọn hệ thống lọc phù hợp", "Xử lý sự cố nước đục, tảo xanh"] },
    ],
  },
  {
    id: "n5",
    title: "Cá Đĩa màu Cobalt Blue: vẻ đẹp của đại dương trong bể kính",
    slug: "ca-dia-cobalt-blue",
    excerpt:
      "Dòng cá Đĩa Cobalt Blue với sắc xanh ánh kim đặc trưng đang là một trong những lựa chọn được yêu thích nhất hiện nay.",
    featuredImage: "https://images.unsplash.com/photo-1535591273668-578e31182c4f?w=1200&h=800&fit=crop",
    published: true,
    displayOrder: 5,
    createdAt: new Date("2026-05-20"),
    updatedAt: new Date("2026-05-20"),
    content: [
      { type: "paragraph", text: "Cá Đĩa Cobalt Blue được mệnh danh là viên ngọc xanh của thế giới cá cảnh nước ngọt. Với lớp vảy ánh kim đồng đều và dáng bơi uyển chuyển, đây là lựa chọn lý tưởng cho những bể thủy sinh cao cấp." },
      { type: "paragraph", text: "Loài cá này đòi hỏi chất lượng nước ổn định và chế độ dinh dưỡng cân bằng để giữ được màu sắc rực rỡ theo thời gian." },
    ],
  },
  {
    id: "n6",
    title: "Chương trình ưu đãi tháng 6: Giảm 10% phụ kiện hồ cá",
    slug: "uu-dai-thang-6-phu-kien-ho-ca",
    excerpt:
      "Nhân dịp giữa năm, Cá Cảnh Thanh Liêm triển khai chương trình giảm giá 10% cho toàn bộ phụ kiện và thiết bị hồ cá.",
    featuredImage: "https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?w=1200&h=800&fit=crop",
    published: false,
    displayOrder: 6,
    createdAt: new Date("2026-06-19"),
    updatedAt: new Date("2026-06-19"),
    content: [
      { type: "paragraph", text: "Chương trình áp dụng cho toàn bộ máy bơm, máy lọc, đèn hồ và thức ăn cá nhập khẩu trong suốt tháng 6. Đây là cơ hội tốt để nâng cấp hệ thống hồ cá tại nhà với chi phí tiết kiệm hơn." },
    ],
  },
];

export function getNewsBySlug(slug: string): NewsArticle | undefined {
  return MOCK_NEWS.find((n) => n.slug === slug && n.published);
}

export function getPublishedNews(): NewsArticle[] {
  return MOCK_NEWS
    .filter((n) => n.published)
    .sort((a, b) => (b.createdAt as Date).getTime() - (a.createdAt as Date).getTime());
}

export function getRelatedNews(current: NewsArticle, limit = 4): NewsArticle[] {
  return getPublishedNews()
    .filter((n) => n.id !== current.id)
    .slice(0, limit);
}

export function searchNews(query: string): NewsArticle[] {
  const q = query.toLowerCase();
  return getPublishedNews().filter(
    (n) =>
      n.title.toLowerCase().includes(q) ||
      n.excerpt.toLowerCase().includes(q) ||
      n.content.some((b) => "text" in b && b.text.toLowerCase().includes(q))
  );
}

export function isNewsTitleTaken(title: string, excludeId?: string): boolean {
  const norm = title.trim().toLowerCase();
  return MOCK_NEWS.some((n) => n.id !== excludeId && n.title.trim().toLowerCase() === norm);
}
