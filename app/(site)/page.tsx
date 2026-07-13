import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ShieldCheck, Truck, MessageCircle } from "lucide-react";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { HeroBannerSlider } from "@/components/sections/HeroBannerSlider";
import type { SlideData } from "@/components/sections/HeroBannerSlider";

// Mock banner slides — realistic Unsplash images to demonstrate the
// banner system before Supabase is connected (Issue #14).
// Landscape + portrait included to exercise the crop engine.
const MOCK_SLIDES: SlideData[] = [
  {
    id: "slide1",
    imageDataUrl: "https://images.unsplash.com/photo-1520301255226-bf5f144451c1?w=1600&h=900&fit=crop",
    objectPositionX: 50, objectPositionY: 40, zoom: 1.1,
  },
  {
    id: "slide2",
    imageDataUrl: "https://images.unsplash.com/photo-1535591273668-578e31182c4f?w=1600&h=900&fit=crop",
    objectPositionX: 50, objectPositionY: 35, zoom: 1.2,
  },
  {
    id: "slide3",
    imageDataUrl: "https://images.unsplash.com/photo-1524704796725-9fc3044a58b2?w=1600&h=900&fit=crop",
    objectPositionX: 50, objectPositionY: 50, zoom: 1,
  },
];
import { VideoShowcase } from "@/components/sections/VideoShowcase";
import { ProductCard } from "@/components/product/ProductCard";
import { CategoryGrid } from "@/components/sections/CategoryGrid";
import { MOCK_CATEGORIES, getFeaturedProducts } from "@/lib/data";
import { SITE_CONFIG } from "@/lib/constants";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Trang chủ",
  description: SITE_CONFIG.description,
};

/* ── Hero ── */
function HeroSection() {
  return (
    <section aria-labelledby="hero-heading">
      <HeroBannerSlider slides={MOCK_SLIDES} />

      {/* Nature intro text — below slider */}
      <div className="py-5 md:py-8 px-4" style={{ background: "linear-gradient(160deg,#f6fbea,#ffffff)" }}>
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-eyebrow mb-3">Thế giới cá cảnh</p>
          <h2 className="font-display font-light text-surface-800 mb-4" style={{ fontSize: "clamp(1.6rem,3.5vw,2.4rem)" }}>
            Vẻ đẹp <em className="italic" style={{ color: "#739620" }}>thiên nhiên</em> trong ngôi nhà bạn
          </h2>
          <p className="text-sm md:text-base text-surface-500 leading-relaxed max-w-xl mx-auto">
            Mỗi con cá cảnh là một tác phẩm nghệ thuật sống — mang màu sắc của đại dương, sự thanh thản của thiên nhiên 
            và vẻ đẹp kỳ diệu của sự sống vào không gian của bạn. Tại Cá Cảnh Thanh Liêm, chúng tôi tuyển chọn kỹ lưỡng 
            từng loài cá để mang đến cho bạn những người bạn đồng hành tuyệt vời nhất.
          </p>
        </div>
      </div>
    </section>
  );
}

/* ── Trust strip ── */
function TrustStrip() {
  const items = [
    { icon: <ShieldCheck size={17} />, text: "Cá Koi khỏe mạnh" },
    { icon: <Truck size={17} />,        text: "Giao hàng toàn quốc" },
    { icon: <MessageCircle size={17} />,text: "Tư vấn 24/7" },
  ];
  return (
    <div style={{ backgroundColor: "#A8CF36" }} className="py-3.5 md:py-4">
      <div className="container-site">
        <ul className="flex flex-wrap justify-center gap-3 md:gap-0 md:justify-between">
          {items.map((item) => (
            <li key={item.text} className="flex items-center gap-1.5 text-surface-900">
              <span className="shrink-0 text-surface-800" aria-hidden>{item.icon}</span>
              <span className="text-xs sm:text-sm font-semibold whitespace-nowrap">{item.text}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/* ── Video ── */
function VideoSection() {
  return (
    <section className="section-pad bg-surface-50">
      <div className="container-site">
        <SectionHeader
          eyebrow="Cá cảnh của chúng tôi"
          title={<>Video <em className="italic" style={{ color: "#8fb82a" }}>thực tế</em> tại cửa hàng</>}
          description="Cá tươi sống, khỏe mạnh — cập nhật thường xuyên từ cửa hàng Thanh Liêm."
          className="mb-8 md:mb-10"
        />
        <VideoShowcase />
      </div>
    </section>
  );
}

/* ── Categories ── */
function CategoriesSection() {
  return (
    <section className="section-pad bg-white">
      <div className="container-site">
        <SectionHeader
          eyebrow="Danh mục"
          title={<>Khám phá <em className="italic" style={{ color: "#8fb82a" }}>bộ sưu tập</em></>}
          description="Cá Koi Nhật, cá nhiệt đới, cá la hán và nhiều loài quý hiếm khác."
          className="mb-8 md:mb-10"
        />
        <CategoryGrid categories={[...MOCK_CATEGORIES]} />
      </div>
    </section>
  );
}

/* ── Featured ── */
function FeaturedSection() {
  const featured = getFeaturedProducts(4);
  return (
    <section className="section-pad bg-surface-50">
      <div className="container-site">
        <SectionHeader
          eyebrow="Nổi bật"
          title={<>Cá cảnh <em className="italic" style={{ color: "#8fb82a" }}>đặc sắc</em></>}
          description="Những loài cá được yêu thích nhất tại cửa hàng chúng tôi."
          className="mb-8 md:mb-10"
        />
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5" role="list">
          {featured.map((product) => (
            <li key={product.id}>
              <Link href={`/products/${product.slug}`}
                className={cn(
                  "group block bg-white rounded-2xl border border-surface-200 overflow-hidden shadow-card",
                  "transition-all duration-300 hover:-translate-y-1.5 hover:shadow-float hover:border-brand-300",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400"
                )}>
                <div className="relative aspect-[4/3] flex items-center justify-center overflow-hidden"
                  style={{ background: "linear-gradient(135deg,#f6fbea,#ebf5d0)" }}>
                  <span className="text-[64px] md:text-[72px] group-hover:scale-110 transition-transform duration-400 select-none" aria-hidden>
                    {product.emoji}
                  </span>
                  <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                    {product.tags.includes("new")      && <span className="px-2.5 py-1 rounded-full text-[11px] font-bold text-white" style={{ backgroundColor: "#739620" }}>Mới về</span>}
                    {product.tags.includes("featured") && <span className="px-2.5 py-1 rounded-full text-[11px] font-bold text-white bg-orange-500">Nổi bật</span>}
                  </div>
                </div>
                <div className="p-4">
                  <p className="text-[10px] font-bold tracking-widest uppercase mb-1.5" style={{ color: "#8fb82a" }}>{product.category}</p>
                  <h3 className="font-display text-lg md:text-xl font-light text-surface-800 mb-3 leading-snug group-hover:text-brand-700 transition-colors line-clamp-2">{product.name}</h3>
                  <div className="flex items-center justify-between pt-3 border-t border-surface-100">
                    <span className="text-xs text-surface-400">Liên hệ để biết giá</span>
                    <span className="text-xs font-semibold flex items-center gap-1" style={{ color: "#739620" }}>
                      Chi tiết <ArrowRight size={11} aria-hidden />
                    </span>
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
        <div className="text-center mt-8">
          <Link href="/products"
            className="inline-flex items-center gap-2 px-7 py-3 rounded-xl text-sm font-semibold text-surface-900 shadow-sm hover:opacity-90 transition-opacity"
            style={{ backgroundColor: "#A8CF36" }}>
            Xem tất cả sản phẩm <ArrowRight size={15} aria-hidden />
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ── Why Us ── */
function WhyUsSection() {
  const items = [
    { title: "Kiểm dịch nghiêm ngặt",  desc: "Mọi cá đều qua kiểm tra sức khỏe và cách ly trước khi bán ra." },
    { title: "Nguồn gốc rõ ràng",       desc: "Nhập khẩu trực tiếp từ trang trại Koi uy tín Nhật Bản và Việt Nam." },
    { title: "Chuyên gia tư vấn",     desc: "Đội ngũ nhiều năm kinh nghiệm hỗ trợ chọn cá và chăm sóc." },
    { title: "Đóng gói chuyên nghiệp",  desc: "Hệ thống đóng gói đặc biệt đảm bảo cá an toàn khi giao hàng." },
  ];
  return (
    <section className="section-pad bg-white">
      <div className="container-site">
        <SectionHeader
          eyebrow="Tại sao chọn chúng tôi"
          title={<>Cam kết từ <em className="italic" style={{ color: "#8fb82a" }}>Thanh Liêm</em></>}
          className="mb-10"
        />
        <ul className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6" role="list">
          {items.map((r) => (
            <li key={r.title} className="flex flex-col items-start text-left p-5 rounded-2xl bg-surface-50 border border-surface-100">
              <div className="w-8 h-1 rounded-full mb-4" style={{ backgroundColor: "#A8CF36" }} />
              <h3 className="font-semibold text-sm md:text-base text-surface-800 mb-2">{r.title}</h3>
              <p className="text-xs md:text-sm text-surface-500 leading-relaxed">{r.desc}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ── CTA ── */
function CTABanner() {
  return (
    <section style={{ backgroundColor: "#A8CF36" }} className="section-pad-sm">
      <div className="container-site text-center px-4">
        <h2 className="font-display font-light text-surface-900 mb-3" style={{ fontSize: "clamp(1.5rem,4vw,2.5rem)" }}>
          Không tìm thấy cá bạn muốn?
        </h2>
        <p className="text-surface-800 text-sm md:text-base mb-6 max-w-md mx-auto">
          Liên hệ trực tiếp — chúng tôi có thể nhập theo yêu cầu đặc biệt.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-3">
          <Link href="/contact" className="px-6 py-3 rounded-xl text-sm font-semibold bg-white text-surface-900 hover:bg-surface-50 transition-colors shadow-sm">
            Liên hệ tư vấn
          </Link>
          <a href={SITE_CONFIG.phoneHref} className="px-6 py-3 rounded-xl text-sm font-semibold bg-surface-900 text-white hover:bg-surface-800 transition-colors">
             {SITE_CONFIG.phone}
          </a>
        </div>
      </div>
    </section>
  );
}

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <TrustStrip />
      <VideoSection />
      <CategoriesSection />
      <FeaturedSection />
      <WhyUsSection />
      <CTABanner />
    </>
  );
}
