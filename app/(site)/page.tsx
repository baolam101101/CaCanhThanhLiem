import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ShieldCheck, Truck, MessageCircle } from "lucide-react";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { HeroBannerSlider } from "@/components/sections/HeroBannerSlider";
import type { SlideData } from "@/components/sections/HeroBannerSlider";
import { VideoShowcase } from "@/components/sections/VideoShowcase";
import { ProductCard } from "@/components/product/ProductCard";
import { CategoryGrid } from "@/components/sections/CategoryGrid";
import { getBanners, getCategories, getFeaturedProducts, getSiteVideos } from "@/lib/data";
import type { Category, Product, SiteVideo } from "@/types";
import { SITE_CONFIG } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Trang chủ",
  description: SITE_CONFIG.description,
};

/* ── Hero ── */
function HeroSection({ slides }: { slides: SlideData[] }) {
  return (
    <section aria-labelledby="hero-heading">
      <HeroBannerSlider slides={slides} />

      {/* Nature intro text — below slider */}
      <div className="py-5 md:py-8 px-4" style={{ background: "linear-gradient(160deg,#f6fbea,#ffffff)" }}>
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-eyebrow mb-3">Trang Trại</p>
          <h2 className="font-display font-light text-surface-800 mb-4" style={{ fontSize: "clamp(1.6rem,3.5vw,2.4rem)" }}>
            <em className="italic" style={{ color: "#739620" }}>CÁ CẢNH THANH LIÊM</em>
          </h2>
          <p className="text-sm md:text-base text-surface-500 leading-relaxed max-w-xl mx-auto">
            Trang trại nuôi dưỡng & tuyển chọn kỹ lưỡng những “tác phẩm nghệ thuật sống” chất lượng, 
            khỏe mạnh để mang đến cho Quý Khách những người bạn đồng hành tuyệt vời.
          </p>
        </div>
      </div>
    </section>
  );
}

/* ── Trust strip ── */
function TrustStrip() {
  const items = [
    { icon: <ShieldCheck size={17} />, text: "Cá Cảnh khỏe mạnh" },
    { icon: <Truck size={17} />,        text: "Giao hàng toàn quốc" },
    { icon: <MessageCircle size={17} />,text: "Tư vấn tận tình" },
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
function VideoSection({ videos }: { videos: SiteVideo[] }) {
  if (videos.length === 0) return null;
  return (
    <section className="section-pad bg-surface-50">
      <div className="container-site">
        <SectionHeader
          eyebrow="Cá cảnh của chúng tôi"
          title={<>Video <em className="italic" style={{ color: "#8fb82a" }}>thực tế</em> tại cửa hàng</>}
          description="Cá Cảnh thuần dưỡng kỹ càng - cập nhật thường xuyên từ Trang Trại."
          className="mb-8 md:mb-10"
        />
        <VideoShowcase videos={videos} />
      </div>
    </section>
  );
}

/* ── Categories ── */
function CategoriesSection({ categories }: { categories: Category[] }) {
  if (categories.length === 0) return null;
  return (
    <section className="section-pad bg-white">
      <div className="container-site">
        <SectionHeader
          eyebrow="Danh mục"
          title={<><em className="italic" style={{ color: "#8fb82a" }}>Khám phá bộ sưu tập Cá Cảnh trực tiếp tại Trang Trại Cá Cảnh Thanh Liêm</em></>}
          className="mb-8 md:mb-10"
        />
        <CategoryGrid categories={categories} />
      </div>
    </section>
  );
}

/* ── Featured ── */
function FeaturedSection({ featured }: { featured: Product[] }) {
  if (featured.length === 0) return null;
  return (
    <section className="section-pad bg-surface-50">
      <div className="container-site">
        <SectionHeader
          eyebrow="Nổi bật"
          title={<>Cá cảnh <em className="italic" style={{ color: "#8fb82a" }}>đặc sắc</em></>}
          description="Những loài cá được yêu thích nhất tại cửa hàng chúng tôi."
          className="mb-8 md:mb-10"
        />
        <ul className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5" role="list">
          {featured.map((product) => (
            <li key={product.id}>
              <ProductCard product={product} />
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
    { title: "Kiểm dịch nghiêm ngặt",  desc: "Mọi cá thể đều qua kiểm tra sức khỏe kỹ lưỡng & cách ly trước khi bán ra." },
    { title: "Nguồn tận Trại",       desc: "Cá giống bố mẹ tuyển chọn gen tốt nổi trội để lai tạo bản sao F1 nâng cấp đẹp từ trong trứng & thuần dưỡng nước máy thủy cục" },
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
          Liên hệ trực tiếp - chúng tôi hỗ trợ tư vấn theo yêu cầu của bạn.
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

export default async function HomePage() {
  const [slides, videos, categories, featured] = await Promise.all([
    getBanners(),
    getSiteVideos(),
    getCategories(),
    getFeaturedProducts(4),
  ]);

  return (
    <>
      <HeroSection slides={slides} />
      <TrustStrip />
      <VideoSection videos={videos} />
      <CategoriesSection categories={categories} />
      <FeaturedSection featured={featured} />
      <WhyUsSection />
      <CTABanner />
    </>
  );
}
