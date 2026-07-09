import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { ArrowLeft, Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center gradient-hero">
      <div className="container-narrow text-center py-20">
        <p className="text-[100px] leading-none mb-8 select-none" aria-hidden></p>
        <p className="text-eyebrow mb-4">Lỗi 404</p>
        <h1 className="font-display text-5xl font-light text-surface-800 mb-4">
          Trang không tìm thấy
        </h1>
        <p className="text-lg text-surface-500 max-w-md mx-auto mb-10 leading-relaxed">
          Có vẻ như trang bạn tìm kiếm đã bơi đi mất. Hãy thử quay lại trang chủ hoặc xem sản phẩm của chúng tôi.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Button variant="primary" size="lg" asChild>
            <Link href="/">
              <Home size={16} aria-hidden />
              Về trang chủ
            </Link>
          </Button>
          <Button variant="secondary" size="lg" asChild>
            <Link href="/products">
              <ArrowLeft size={16} aria-hidden />
              Xem sản phẩm
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
