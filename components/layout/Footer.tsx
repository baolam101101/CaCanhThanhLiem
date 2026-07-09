import React from "react";
import Link from "next/link";
import Image from "next/image";
import { MapPin, Phone, Mail, Clock, Play } from "lucide-react";
import { SITE_CONFIG, NAV_LINKS } from "@/lib/constants";

const YOUTUBE_VIDEO_ID = "HYFmNmV5yIo";
const YOUTUBE_WATCH_URL = `https://www.youtube.com/watch?v=${YOUTUBE_VIDEO_ID}`;
const YOUTUBE_THUMBNAIL = `https://img.youtube.com/vi/${YOUTUBE_VIDEO_ID}/hqdefault.jpg`;

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer style={{ backgroundColor: "#A8CF36" }} className="text-surface-900">
      {/* Main grid */}
      <div className="container-site py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">

          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3 mb-5">
              <div className="relative w-14 h-14 shrink-0">
                <Image
                  src="/images/logo.jpg"
                  alt="Logo Cá Cảnh Thanh Liêm"
                  fill
                  className="object-cover rounded-full border-2 border-white/60 shadow"
                  sizes="56px"
                />
              </div>
              <div>
                <p className="font-display text-xl font-semibold text-surface-900 leading-tight">
                  Cá Cảnh Thanh Liêm
                </p>
                <p className="text-xs font-semibold tracking-wider uppercase text-surface-700 mt-0.5">
                  Koi Việt · Nhập Khẩu
                </p>
              </div>
            </div>
            <p className="text-sm leading-relaxed text-surface-800 max-w-[260px]">
              {SITE_CONFIG.tagline}. Chất lượng tốt nhất, giá hợp lý nhất tại TP.HCM.
            </p>
            {/* Social — using each platform's official brand color */}
            <div className="flex items-center gap-3 mt-5">
              {/* Facebook — official blue #1877F2 */}
              <a
                href={SITE_CONFIG.facebook}
                target="_blank" rel="noopener noreferrer"
                className="flex items-center justify-center w-9 h-9 rounded-lg transition-opacity hover:opacity-80"
                style={{ backgroundColor: "#1877F2" }}
                aria-label="Facebook"
              >
                <svg viewBox="0 0 24 24" width="18" height="18" fill="white" aria-hidden>
                  <path d="M24 12.073C24 5.404 18.627 0 12 0S0 5.404 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.533-4.697 1.313 0 2.686.236 2.686.236v2.97h-1.514c-1.491 0-1.956.93-1.956 1.886v2.267h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z"/>
                </svg>
              </a>

              {/* Zalo — official blue #0068FF */}
              <a
                href={SITE_CONFIG.zalo}
                target="_blank" rel="noopener noreferrer"
                className="flex items-center justify-center w-9 h-9 rounded-lg transition-opacity hover:opacity-80"
                style={{ backgroundColor: "#0068FF" }}
                aria-label="Zalo"
              >
                <svg viewBox="0 0 48 48" width="22" height="22" fill="white" aria-hidden>
                  <path d="M24 4C12.95 4 4 12.95 4 24s8.95 20 20 20 20-8.95 20-20S35.05 4 24 4zm-2.5 28.5h-3v-14h3v14zm8.5 0l-6-8v8h-3v-14h3l6 8v-8h3v14h-3z"/>
                </svg>
              </a>

              {/* YouTube — official red #FF0000 */}
              <a
                href="https://www.youtube.com/@CaCanhThanhLiem_BanCaKoiGiaSi/featured"
                target="_blank" rel="noopener noreferrer"
                className="flex items-center justify-center w-9 h-9 rounded-lg transition-opacity hover:opacity-80"
                style={{ backgroundColor: "#FF0000" }}
                aria-label="YouTube"
              >
                <svg viewBox="0 0 24 24" width="18" height="18" fill="white" aria-hidden>
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Youtube */}
          <div>
            <h3 className="text-xs font-bold tracking-[0.15em] uppercase text-surface-700 mb-5">
              Youtube
            </h3>
            <a
              href={YOUTUBE_WATCH_URL}
              target="_blank" rel="noopener noreferrer"
              className="group block rounded-xl overflow-hidden bg-black/10 hover:bg-black/15 transition-colors"
            >
              <div className="relative aspect-video">
                <Image
                  src={YOUTUBE_THUMBNAIL}
                  alt="Video Cá Cảnh Thanh Liêm trên Youtube"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 280px"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/25 group-hover:bg-black/35 transition-colors">
                  <div className="w-11 h-11 rounded-full bg-red-600 flex items-center justify-center shadow-lifted group-hover:scale-110 transition-transform">
                    <Play size={18} className="text-white ml-0.5" fill="currentColor" aria-hidden />
                  </div>
                </div>
              </div>
              <p className="text-sm font-medium text-surface-900 px-3 py-2.5 leading-snug">
                Xem video giới thiệu cửa hàng
              </p>
            </a>
          </div>

          {/* Info */}
          <div>
            <h3 className="text-xs font-bold tracking-[0.15em] uppercase text-surface-700 mb-5">
              Thông tin
            </h3>
            <ul className="space-y-2.5">
              {[
                { label: "Về chúng tôi", href: "/about" },
                { label: "Sản phẩm", href: "/products" },
                { label: "Liên hệ", href: "/contact" },
                { label: "Chính sách bảo hành", href: "/contact" },
                { label: "Hướng dẫn chăm sóc Koi", href: "/about" },
              ].map((l) => (
                <li key={l.href + l.label}>
                  <Link href={l.href} className="text-sm text-surface-800 hover:text-surface-900 font-medium transition-colors hover:translate-x-0.5 inline-block">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-xs font-bold tracking-[0.15em] uppercase text-surface-700 mb-5">
              Liên hệ
            </h3>
            <ul className="space-y-3">
              <li>
                <a href={`https://maps.google.com/?q=${encodeURIComponent(SITE_CONFIG.address)}`}
                  target="_blank" rel="noopener noreferrer"
                  className="flex gap-3 group"
                >
                  <MapPin size={15} className="text-surface-700 mt-0.5 shrink-0" aria-hidden />
                  <span className="text-sm text-surface-800 group-hover:text-surface-900 transition-colors leading-relaxed">
                    {SITE_CONFIG.address}
                  </span>
                </a>
              </li>
              <li>
                <a href={SITE_CONFIG.phoneHref} className="flex items-center gap-3 group">
                  <Phone size={15} className="text-surface-700 shrink-0" aria-hidden />
                  <span className="text-sm text-surface-800 group-hover:text-surface-900 transition-colors font-medium">
                    {SITE_CONFIG.phone} · {SITE_CONFIG.phone2}
                  </span>
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Clock size={15} className="text-surface-700 shrink-0" aria-hidden />
                <span className="text-sm text-surface-800">{SITE_CONFIG.hours}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-black/10">
        <div className="container-site py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-surface-700">
            © {year} {SITE_CONFIG.name}. Tất cả quyền được bảo lưu.
          </p>
          <p className="text-xs text-surface-700">
            {SITE_CONFIG.website}
          </p>
        </div>
      </div>
    </footer>
  );
}
