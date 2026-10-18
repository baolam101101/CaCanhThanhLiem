import type { Metadata } from "next";
import Image from "next/image";
import { Phone } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { SITE_CONFIG } from "@/lib/constants";
import guideImage from "@/public/images/huong-dan-tha-ca-moi.webp";

export const metadata: Metadata = {
  title: "Hướng dẫn chăm sóc cá Koi",
  description:
    "Hướng dẫn thả cá Koi mới vào hồ: cân bằng nhiệt độ, tắm thuốc tím, thay nước và cho thuốc Tetra trong 3 - 4 ngày đầu.",
  openGraph: { images: [guideImage.src] },
};

// The steps from the customer's guide image, as text: search engines and
// small screens can read it without zooming into the picture.
const STEPS = [
  {
    title: "Bước 1: Cân bằng nhiệt độ",
    body: "Cho bao cá vào hồ để cân bằng nhiệt độ khoảng 15 - 30 phút (tuỳ sự chênh lệch nhiệt độ bên trong và bên ngoài bao cá).",
  },
  {
    title: "Bước 2: Tắm thuốc tím",
    body: "Tắm thuốc tím cho cá mới về (nhằm giúp loại bỏ những vi khuẩn).",
  },
  {
    title: "Bước 3: Thay nước",
    body: "Hôm sau, thay 30% - 50% nước và cho thêm thuốc Tetra Nhật vào. Thay như Bước 3 liên tục 3 - 4 ngày (giúp cá nhập bầy và thích nghi nguồn nước tốt hơn).",
  },
];

const SUPPORT_PHONES = ["0909 633 203", SITE_CONFIG.phone];

export default function CareGuidePage() {
  return (
    <>
      <PageHeader
        breadcrumbs={[
          { label: "Trang chủ", href: "/" },
          { label: "Hướng dẫn chăm sóc cá Koi" },
        ]}
        title={<>Hướng dẫn <em className="text-brand-600 italic">chăm sóc cá Koi</em></>}
        subtitle="Thả cá mới vào hồ đúng cách giúp cá khỏe, nhanh thích nghi"
      />

      <section className="section-pad">
        <div className="container-narrow flex flex-col gap-10">
          <a href={guideImage.src} target="_blank" rel="noopener" className="block rounded-2xl overflow-hidden border border-surface-200 shadow-card" title="Bấm để xem ảnh lớn">
            <Image
              src={guideImage}
              alt="Hướng dẫn thả cá mới vào hồ: cân bằng nhiệt độ, tắm thuốc tím, thay nước và cho thuốc Tetra"
              sizes="(max-width: 768px) 100vw, 768px"
              className="w-full h-auto"
              priority
            />
          </a>

          <div>
            <h2 className="font-display text-2xl md:text-3xl font-light text-surface-800 mb-6">Hướng dẫn thả cá mới vào hồ</h2>
            <ol className="flex flex-col gap-4">
              {STEPS.map((s, i) => (
                <li key={s.title} className="flex gap-4 p-5 rounded-2xl bg-white border border-surface-200">
                  <span className="shrink-0 w-9 h-9 rounded-full flex items-center justify-center font-bold text-surface-900" style={{ backgroundColor: "#A8CF36" }}>
                    {i + 1}
                  </span>
                  <div>
                    <h3 className="font-semibold text-surface-800 mb-1">{s.title}</h3>
                    <p className="text-surface-600 leading-relaxed">{s.body}</p>
                  </div>
                </li>
              ))}
            </ol>
            <p className="mt-5 p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 font-medium">
              * Không cho cá ăn trong 3 - 4 ngày đầu.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-3 p-5 rounded-2xl bg-brand-50 border border-brand-100">
            <p className="font-semibold text-surface-800">Số điện thoại hỗ trợ:</p>
            <div className="flex flex-wrap gap-2">
              {SUPPORT_PHONES.map((p) => (
                <a key={p} href={`tel:+84${p.replace(/\D/g, "").slice(1)}`}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full font-bold text-surface-900 hover:brightness-95 transition"
                  style={{ backgroundColor: "#A8CF36" }}>
                  <Phone size={15} aria-hidden /> {p}
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
