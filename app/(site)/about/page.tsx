import type { Metadata } from "next";
import { Award, Users, Leaf, BookOpen } from "lucide-react";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { SITE_CONFIG } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Về chúng tôi",
  description: `Hơn ${new Date().getFullYear() - SITE_CONFIG.founded} năm kinh nghiệm, Cá Cảnh Thanh Liêm là địa chỉ tin cậy cho người yêu cá cảnh tại TP.HCM.`,
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
    icon: <Leaf size={28} />,
    title: "Bền vững & Trách nhiệm",
    desc: "Chúng tôi chỉ nhập khẩu cá từ các trang trại nuôi dưỡng có đạo đức, không khai thác tự nhiên.",
  },
  {
    icon: <BookOpen size={28} />,
    title: "Chia sẻ kiến thức",
    desc: "Blog, workshop và cộng đồng trực tuyến giúp người chơi cá nâng cao kiến thức và kỹ năng.",
  },
];

const MILESTONES = [
  { year: "2009", title: "Thành lập", desc: "Gian hàng nhỏ đầu tiên tại chợ Thủ Đức, TP.HCM" },
  { year: "2013", title: "Mở rộng", desc: "Khai trương cửa hàng chính thức tại Quận 3" },
  { year: "2017", title: "Nhập khẩu trực tiếp", desc: "Bắt đầu nhập khẩu cá trực tiếp từ Singapore và Nhật Bản" },
  { year: "2020", title: "Online", desc: "Ra mắt kênh mua bán online, phục vụ khách hàng toàn quốc" },
  { year: "2024", title: "Top 3 TP.HCM", desc: "Được cộng đồng bình chọn top 3 cửa hàng cá cảnh uy tín" },
];

const TEAM = [
  { name: "Nguyễn Thanh Liêm", role: "Sáng lập & Giám đốc", emoji: "", exp: "15+ năm kinh nghiệm" },
  { name: "Trần Minh Khoa", role: "Chuyên gia cá biển", emoji: "", exp: "10 năm kinh nghiệm" },
  { name: "Lê Thị Hương", role: "Tư vấn cá nước ngọt", emoji: "", exp: "8 năm kinh nghiệm" },
  { name: "Phạm Quốc Việt", role: "Kỹ thuật viên & Thú y", emoji: "", exp: "12 năm kinh nghiệm" },
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
            Câu chuyện của{" "}
            <em className="text-brand-600 italic">Thanh Liêm</em>
          </h1>
          <p className="text-xl text-surface-500 leading-relaxed font-light max-w-xl mx-auto">
            Hơn {yearsExp} năm gắn bó với thế giới cá cảnh, chúng tôi không chỉ bán cá
            — chúng tôi chia sẻ đam mê và mang vẻ đẹp thiên nhiên vào từng ngôi nhà Việt.
          </p>
        </div>
      </section>

      {/* ---- Story ---- */}
      <section className="section-pad bg-white" aria-labelledby="story-heading">
        <div className="container-site">
          <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
            <div>
              <p className="text-eyebrow mb-4">Lịch sử hình thành</p>
              <h2 id="story-heading" className="font-display text-4xl font-light text-surface-800 mb-6">
                Từ niềm đam mê đến{" "}
                <em className="text-brand-600 italic">thương hiệu uy tín</em>
              </h2>
              <div className="flex flex-col gap-4 text-base text-surface-600 leading-loose font-light">
                <p>
                  Cá Cảnh Thanh Liêm được thành lập năm {SITE_CONFIG.founded} bởi anh Nguyễn Thanh Liêm
                  — một người yêu cá từ thuở nhỏ. Khởi đầu chỉ với một gian hàng nhỏ tại chợ Thủ Đức,
                  sau {yearsExp} năm, chúng tôi đã trở thành một trong những địa chỉ tin cậy nhất tại
                  TP.HCM cho giới chơi cá cảnh.
                </p>
                <p>
                  Chúng tôi tự hào có mạng lưới nhập khẩu trực tiếp từ Singapore, Nhật Bản, Đức và
                  nhiều quốc gia khác, đảm bảo mỗi con cá đến tay khách hàng đều trong tình trạng
                  khỏe mạnh và đẹp nhất.
                </p>
                <p>
                  Triết lý kinh doanh của chúng tôi đơn giản: không chỉ bán cá, mà còn truyền đạt
                  kiến thức, đam mê và trách nhiệm với thiên nhiên đến từng khách hàng.
                </p>
              </div>
            </div>

            {/* Stats card */}
            <div className="bg-brand-50 rounded-3xl border border-brand-100 p-10 flex flex-col items-center text-center gap-8">
              <span className="text-7xl" aria-hidden></span>
              <div>
                <p className="font-display text-2xl text-brand-700 mb-2">
                  Top 3 cửa hàng cá cảnh uy tín tại TP.HCM
                </p>
                <p className="text-sm text-brand-500">
                  Theo đánh giá của cộng đồng người chơi cá cảnh Việt Nam 2024
                </p>
              </div>
              <div className="grid grid-cols-2 gap-6 w-full pt-6 border-t border-brand-200">
                {[
                  { value: `${yearsExp}+`, label: "Năm kinh nghiệm" },
                  { value: "5.000+", label: "Khách hàng tin tưởng" },
                  { value: "200+", label: "Loài cá cảnh" },
                  { value: "4.9/5", label: "Đánh giá trung bình" },
                ].map((s) => (
                  <div key={s.label}>
                    <div className="font-display text-3xl font-light text-brand-700 mb-1">{s.value}</div>
                    <div className="text-xs text-brand-500 font-medium">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
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

      {/* ---- Timeline ---- */}
      <section className="section-pad bg-white" aria-labelledby="timeline-heading">
        <div className="container-narrow">
          <SectionHeader
            eyebrow="Hành trình"
            title={<>Các <em className="text-brand-600">cột mốc</em> quan trọng</>}
            className="mb-14"
          />
          <ol className="relative border-l-2 border-brand-200 flex flex-col gap-0" aria-label="Lịch sử phát triển">
            {MILESTONES.map((m, i) => (
              <li key={m.year} className="relative pl-10 pb-12 last:pb-0">
                {/* Dot */}
                <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-brand-400 border-2 border-white shadow-sm" aria-hidden />
                <span className="text-eyebrow block mb-2">{m.year}</span>
                <h3 className="font-display text-xl font-light text-surface-800 mb-1">{m.title}</h3>
                <p className="text-sm text-surface-500">{m.desc}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ---- Team ---- */}
      <section className="section-pad bg-surface-50" aria-labelledby="team-heading">
        <div className="container-site">
          <SectionHeader
            eyebrow="Đội ngũ"
            title={<>Con người đằng sau <em className="text-brand-600">Thanh Liêm</em></>}
            description="Những chuyên gia đam mê với sứ mệnh mang thế giới cá cảnh đến gần hơn với bạn."
            className="mb-12"
          />
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6" role="list">
            {TEAM.map((member) => (
              <li
                key={member.name}
                className="bg-white rounded-2xl border border-surface-200 p-7 text-center shadow-card hover:shadow-lifted hover:-translate-y-1 transition-all duration-300"
              >
                <div className="w-20 h-20 rounded-full bg-brand-50 border-2 border-brand-100 flex items-center justify-center text-4xl mx-auto mb-5">
                  {member.emoji}
                </div>
                <h3 className="font-semibold text-surface-800 mb-1">{member.name}</h3>
                <p className="text-sm text-brand-600 font-medium mb-2">{member.role}</p>
                <p className="text-xs text-surface-400">{member.exp}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
