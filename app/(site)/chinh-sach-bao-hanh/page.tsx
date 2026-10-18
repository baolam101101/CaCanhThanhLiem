import type { Metadata } from "next";
import Image from "next/image";
import { Video, ShieldCheck, XCircle, Heart } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import policyImage from "@/public/images/chinh-sach-bao-hanh-van-chuyen.webp";

export const metadata: Metadata = {
  title: "Chính sách bảo hành vận chuyển",
  description:
    "Chính sách bảo hành vận chuyển cá cảnh của Cá Cảnh Thanh Liêm: quy định quay video khi nhận hàng, trách nhiệm của shop và các trường hợp không được bảo hành.",
  openGraph: { images: [policyImage.src] },
};

const NOT_COVERED = [
  {
    text: "Khách nhận cá trễ quá 90 phút so với thời gian xe/máy bay đến.",
    note: "Trường hợp xe/sân bay chưa liên hệ, Khách phải báo ngay cho Trại để cùng xử lý & rà soát lại thông tin.",
  },
  { text: "Không có video mở thùng (Mục số 1) ngay tại thời điểm nhận." },
  { text: "Cá chết/bệnh phát sinh sau 24h kể từ khi nhận." },
  {
    text: "Do lỗi trong quá trình thả hồ của khách. Không phải do Trại đóng gói hay do vận chuyển.",
    note: "Bắt cá sai cách, cá nhảy, sát khuẩn quá lâu, sốc nước - sốc nhiệt - sốc pH, hồ chưa xử lý, thả chung cá dữ, hệ thống lọc & oxi,…",
  },
];

function Section({ n, icon, title, tone, children }: {
  n: number; icon: React.ReactNode; title: string; tone: "blue" | "green" | "red"; children: React.ReactNode;
}) {
  const tones = {
    blue:  "border-sky-200 bg-sky-50/50 [--accent:#0369a1]",
    green: "border-brand-200 bg-brand-50/50 [--accent:#4d7c0f]",
    red:   "border-red-200 bg-red-50/50 [--accent:#b91c1c]",
  };
  return (
    <section className={`rounded-2xl border p-5 md:p-6 ${tones[tone]}`} aria-labelledby={`policy-${n}`}>
      <h2 id={`policy-${n}`} className="flex items-center gap-3 font-semibold text-lg md:text-xl mb-4" style={{ color: "var(--accent)" }}>
        <span className="shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-white text-base" style={{ backgroundColor: "var(--accent)" }}>{n}</span>
        <span className="flex items-center gap-2">{icon}{title}</span>
      </h2>
      <div className="text-surface-700 leading-relaxed">{children}</div>
    </section>
  );
}

export default function WarrantyPolicyPage() {
  return (
    <>
      <PageHeader
        breadcrumbs={[
          { label: "Trang chủ", href: "/" },
          { label: "Chính sách bảo hành" },
        ]}
        title={<>Chính sách <em className="text-brand-600 italic">bảo hành vận chuyển</em></>}
        subtitle="Áp dụng cho cá cảnh gửi xe / máy bay đến khách hàng"
      />

      <div className="container-site section-pad grid gap-10 lg:grid-cols-[1fr_420px] lg:items-start">
        <div className="flex flex-col gap-5">
          <Section n={1} tone="blue" icon={<Video size={20} aria-hidden />} title="Quy định quay video khi nhận hàng">
            <p className="mb-3">
              Vui lòng quay video toàn bộ quá trình mở thùng ngay khi nhận cá để làm bằng chứng đối chiếu.
            </p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Video phải quay đủ <strong>6 mặt của thùng</strong> cho thấy vẫn còn băng keo niêm phong, không có dấu hiệu can thiệp.</li>
              <li>Phải quay hết toàn quá trình rạch thùng mở nắp cho đến khi nhìn thấy cá trong thùng hoặc xách cả bao cá lên.</li>
            </ul>
          </Section>

          <Section n={2} tone="green" icon={<ShieldCheck size={20} aria-hidden />} title="Trách nhiệm của shop">
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Shop cam kết cá khỏe mạnh khi xuất khỏi trại.</li>
              <li>
                Trong quá trình vận chuyển nếu cá chết, shop sẽ chịu trách nhiệm đổi mới/ hoàn tiền cá{" "}
                <strong className="text-red-700">(BẢO HÀNH VẬN CHUYỂN)</strong>.
              </li>
            </ul>
          </Section>

          <Section n={3} tone="red" icon={<XCircle size={20} aria-hidden />} title="Các trường hợp không được bảo hành">
            <ul className="list-disc pl-5 space-y-2.5">
              {NOT_COVERED.map((c) => (
                <li key={c.text}>
                  {c.text}
                  {c.note && <span className="block text-sm italic text-surface-500 mt-0.5">({c.note})</span>}
                </li>
              ))}
            </ul>
            <p className="mt-4 font-semibold text-red-700">=&gt; Không bảo hành các trường hợp phát sinh sau khi cá vào hồ.</p>
          </Section>

          <p className="flex items-center gap-2 text-surface-700 font-medium">
            <Heart size={18} className="text-red-500 shrink-0" aria-hidden />
            Cảm ơn Anh/Chị đã hợp tác để đảm bảo quyền lợi 2 bên.
          </p>
        </div>

        <a href={policyImage.src} target="_blank" rel="noopener" title="Bấm để xem ảnh lớn"
          className="block rounded-2xl overflow-hidden border border-surface-200 shadow-card lg:sticky lg:top-24">
          <Image
            src={policyImage}
            alt="Chính sách bảo hành vận chuyển cá cảnh: quy định quay video khi nhận hàng, trách nhiệm của shop, các trường hợp không được bảo hành"
            sizes="(max-width: 1024px) 100vw, 420px"
            className="w-full h-auto"
          />
        </a>
      </div>
    </>
  );
}
