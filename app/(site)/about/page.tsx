import type { Metadata } from "next";
import { Award, Users, Leaf, BookOpen } from "lucide-react";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { SITE_CONFIG } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Về chúng tôi",
  description: `Chuyên sản xuất, nhân giống, lai tạo và nuôi trồng các dòng Cá Koi & Koi Đuôi Dài chất lượng tại Thành phố Hồ Chí Minh. 
  Trang Trại luôn thực hiện quy trình nuôi dưỡng tốt, thuần dưỡng kỹ các cá thể dưới nguồn nước máy sạch. 
  Cùng với tâm huyết & kinh nghiệm của người làm nghề, Cá Cảnh Thanh Liêm mang đến những cá thể tuyển chọn & khỏe mạnh 
  đồng hành cùng thủy cảnh và không gian sống của bạn.`,
};

const VALUES = [
  {
    icon: <Award size={28} />,
    title: "Chất lượng trên hết",
    desc: "Mỗi con cá đều qua kiểm tra sức khỏe nghiêm ngặt và cách ly ít nhất 2 tuần trước khi bán ra.",
  },
  {
    icon: <Users size={28} />,
    title: "Tư vấn tận tâm",
    desc: "Đội ngũ chuyên gia sẵn sàng hỗ trợ từ việc chọn cá đến chăm sóc và xử lý bệnh.",
  },
  {
    icon: <BookOpen size={28} />,
    title: "Chia sẻ kiến thức",
    desc: "Tư vấn chọn cá, hướng dẫn cách chăm, giải đáp thắc mắc & chia sẻ kinh nghiệm.",
  },
  {
    icon: <Leaf size={28} />,
    title: "Bền vững & Trách nhiệm",
    desc: "",
  },
];

export default function AboutPage() {
  const yearsExp = new Date().getFullYear() - SITE_CONFIG.founded;

  return (
    <>
      {/* ---- Hero ---- */}
      <section className="gradient-hero py-20 md:py-28 text-center" aria-labelledby="about-hero-heading">
        <div className="container-narrow">
          <p className="text-eyebrow mb-5">Về chúng tôi</p>
          <h1
            id="about-hero-heading"
            className="font-display font-light text-surface-800 mb-6"
          >
            TRANG TRẠI CÁ CẢNH{" "}
            <em className="text-brand-600 italic">THANH LIÊM</em>
          </h1>
          <p className="text-xl text-surface-500 leading-relaxed font-light max-w-xl mx-auto">
            Chuyên sản xuất, nhân giống, lai tạo và nuôi trồng các dòng Cá Koi & Koi Đuôi Dài chất lượng tại Thành phố Hồ Chí Minh. 
            Trang Trại luôn thực hiện quy trình nuôi dưỡng tốt, thuần dưỡng kỹ các cá thể dưới nguồn nước máy sạch. 
            Cùng với tâm huyết & kinh nghiệm của người làm nghề, Cá Cảnh Thanh Liêm mang đến những cá thể tuyển chọn & khỏe mạnh 
            đồng hành cùng thủy cảnh và không gian sống của bạn.
          </p>
        </div>
      </section>

      {/* ---- Values ---- */}
      <section className="section-pad bg-surface-50" aria-labelledby="values-heading">
        <div className="container-site">
          <SectionHeader
            eyebrow="Giá trị cốt lõi"
            title={<>Những điều chúng tôi <em className="text-brand-600">tin tưởng</em></>}
            className="mb-12"
          />
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6" role="list">
            {VALUES.map((v) => (
              <li
                key={v.title}
                className="bg-brand-50 border border-brand-100 rounded-2xl p-7 hover:shadow-md transition-shadow"
              >
                <div className="w-12 h-12 rounded-xl bg-brand-100 flex items-center justify-center text-brand-600 mb-5">
                  {v.icon}
                </div>
                <h3 className="font-semibold text-brand-700 mb-3">{v.title}</h3>
                <p className="text-sm text-surface-600 leading-relaxed">{v.desc}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
