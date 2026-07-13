import type { Metadata, Viewport } from "next";
import "./globals.css";
import { SITE_CONFIG } from "@/lib/constants";

// Root layout — applies to EVERY route in the app, including /admin/*.
// It must stay free of any UI (no Navbar, no Footer, no site chrome)
// so that admin routes and the public site can each define their own
// presentation independently:
//   - app/(site)/layout.tsx  → Navbar + Footer + FloatingActions
//   - app/admin/layout.tsx   → AdminShell (sidebar)
//   - app/admin/login/layout.tsx → bare passthrough (login screen only)
export const metadata: Metadata = {
  metadataBase: new URL(SITE_CONFIG.url),
  title: { template: `%s | ${SITE_CONFIG.name}`, default: SITE_CONFIG.name },
  description: SITE_CONFIG.description,
  keywords: ["ca Koi", "ca canh", "Koi Nhat", "Ca Canh Thanh Liem", "Binh Chanh"],
  appleWebApp: { capable: true, statusBarStyle: "default", title: SITE_CONFIG.name },
};

export const viewport: Viewport = {
  themeColor: "#A8CF36",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Playfair+Display:wght@600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <a href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:rounded-lg focus:font-medium focus:text-sm"
          style={{ backgroundColor: "#A8CF36", color: "#1e1e1b" }}>
          Bỏ qua điều hướng
        </a>
        {children}
      </body>
    </html>
  );
}
