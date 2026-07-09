import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { FloatingActions } from "@/components/layout/FloatingActions";

// This layout wraps ONLY the public-facing site routes (grouped under
// the (site) route group). It is intentionally separate from the root
// layout so that /admin/* routes never receive the public Navbar/Footer —
// previously the root layout rendered Navbar/Footer unconditionally
// around {children}, which leaked into every admin route including
// /admin/login because Next.js layout nesting cannot "remove" markup
// from a parent layout, only add to it.
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main id="main-content">{children}</main>
      <Footer />
      <FloatingActions />
    </>
  );
}
