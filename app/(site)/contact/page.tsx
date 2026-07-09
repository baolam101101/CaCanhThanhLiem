import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/PageHeader";
import { ContactClient } from "@/components/sections/ContactClient";
import { SITE_CONFIG } from "@/lib/constants";
import { MapPin, Phone, Mail, Clock } from "lucide-react";

export const metadata: Metadata = {
  title: "Liên hệ",
  description: `Liên hệ với Cá Cảnh Thanh Liêm. Hotline: ${SITE_CONFIG.phone}. Địa chỉ: ${SITE_CONFIG.address}.`,
};

const CONTACT_METHODS = [
  {
    icon: <MapPin size={20} />,
    title: "Địa chỉ cửa hàng",
    value: SITE_CONFIG.address,
    href: `https://maps.google.com/?q=${encodeURIComponent(SITE_CONFIG.address)}`,
    note: "Mở cửa 7:00 - 20:00, tất cả các ngày",
    external: true,
  },
  {
    icon: <Phone size={20} />,
    title: "Điện thoại / Zalo",
    value: SITE_CONFIG.phone,
    href: SITE_CONFIG.phoneHref,
    note: "Hỗ trợ 7:00 - 20:00 hàng ngày",
    external: false,
  },
  {
    icon: <Mail size={20} />,
    title: "Email",
    value: SITE_CONFIG.email,
    href: `mailto:${SITE_CONFIG.email}`,
    note: "Phản hồi trong vòng 2 giờ",
    external: false,
  },
  {
    icon: <span className="text-base font-bold" aria-hidden>f</span>,
    title: "Facebook",
    value: "Cá Cảnh Thanh Liêm",
    href: SITE_CONFIG.facebook,
    note: "Theo dõi để cập nhật hàng mới nhất",
    external: true,
  },
  {
    icon: <Clock size={20} />,
    title: "Giờ mở cửa",
    value: SITE_CONFIG.hours,
    href: null,
    note: "Kể cả ngày lễ và cuối tuần",
    external: false,
  },
];

export default function ContactPage() {
  return (
    <>
      <PageHeader
        breadcrumbs={[
          { label: "Trang chủ", href: "/" },
          { label: "Liên hệ" },
        ]}
        title={
          <>
            Liên hệ với{" "}
            <em className="text-brand-600 italic">chúng tôi</em>
          </>
        }
        subtitle="Chúng tôi luôn sẵn sàng tư vấn và hỗ trợ bạn"
      />

      <section className="section-pad bg-white">
        <div className="container-site">
          <div className="grid lg:grid-cols-[1fr_480px] gap-12 lg:gap-16 items-start">

            {/* ---- Left: Contact info ---- */}
            <div>
              <h2 className="font-display text-3xl font-light text-surface-800 mb-8">
                Thông tin liên hệ
              </h2>

              <ul className="flex flex-col divide-y divide-surface-100" role="list">
                {CONTACT_METHODS.map((method) => (
                  <li key={method.title} className="py-6 first:pt-0 last:pb-0">
                    <div className="flex gap-5 items-start">
                      <div className="w-11 h-11 rounded-xl bg-brand-50 border border-brand-100 flex items-center justify-center text-brand-600 shrink-0 mt-0.5">
                        {method.icon}
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-surface-400 uppercase tracking-wider mb-1">
                          {method.title}
                        </p>
                        {method.href ? (
                          <a
                            href={method.href}
                            target={method.external ? "_blank" : undefined}
                            rel={method.external ? "noopener noreferrer" : undefined}
                            className="text-brand-600 font-semibold hover:text-brand-700 transition-colors text-base"
                          >
                            {method.value}
                          </a>
                        ) : (
                          <p className="text-surface-800 font-semibold text-base">{method.value}</p>
                        )}
                        {method.note && (
                          <p className="text-sm text-surface-400 mt-0.5">{method.note}</p>
                        )}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>

              {/* Map placeholder */}
              <div className="mt-8 rounded-2xl overflow-hidden border border-surface-200 aspect-[16/9] bg-gradient-to-br from-brand-50 to-surface-100 flex items-center justify-center">
                <div className="text-center">
                  <span className="text-5xl block mb-3" aria-hidden></span>
                  <p className="text-sm text-surface-500 font-medium">Bản đồ Google Maps</p>
                  <a
                    href={`https://maps.google.com/?q=${encodeURIComponent(SITE_CONFIG.address)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-brand-600 hover:underline mt-1 block"
                  >
                    Mở trong Google Maps →
                  </a>
                </div>
              </div>
            </div>

            {/* ---- Right: Message form ---- */}
            <div className="lg:sticky lg:top-24">
              <ContactClient />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
