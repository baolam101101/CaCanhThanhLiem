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
              <div className="relative w-14 h-14 shrink-0 rounded-full bg-white p-1 shadow-md ring-1 ring-black/10">
                <Image
                  src="/images/logo.jpg"
                  alt="Logo Cá Cảnh Thanh Liêm"
                  width={56}
                  height={56}
                  className="w-full h-full object-cover rounded-full"
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
                <svg viewBox="0 0 24 24" width="20" height="20" fill="white" aria-hidden>
                  <path d="M12.49 10.2722v-.4496h1.3467v6.3218h-.7704a.576.576 0 01-.5763-.5729l-.0006.0005a3.273 3.273 0 01-1.9372.6321c-1.8138 0-3.2844-1.4697-3.2844-3.2823 0-1.8125 1.4706-3.2822 3.2844-3.2822a3.273 3.273 0 011.9372.6321l.0006.0005zM6.9188 7.7896v.205c0 .3823-.051.6944-.2995 1.0605l-.03.0343c-.0542.0615-.1815.206-.2421.2843L2.024 14.8h4.8948v.7682a.5764.5764 0 01-.5767.5761H0v-.3622c0-.4436.1102-.6414.2495-.8476L4.8582 9.23H.1922V7.7896h6.7266zm8.5513 8.3548a.4805.4805 0 01-.4803-.4798v-7.875h1.4416v8.3548H15.47zM20.6934 9.6C22.52 9.6 24 11.0807 24 12.9044c0 1.8252-1.4801 3.306-3.3066 3.306-1.8264 0-3.3066-1.4808-3.3066-3.306 0-1.8237 1.4802-3.3044 3.3066-3.3044zm-10.1412 5.253c1.0675 0 1.9324-.8645 1.9324-1.9312 0-1.065-.865-1.9295-1.9324-1.9295s-1.9324.8644-1.9324 1.9295c0 1.0667.865 1.9312 1.9324 1.9312zm10.1412-.0033c1.0737 0 1.945-.8707 1.945-1.9453 0-1.073-.8713-1.9436-1.945-1.9436-1.0753 0-1.945.8706-1.945 1.9436 0 1.0746.8697 1.9453 1.945 1.9453z"/>
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
