"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/Button";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center gradient-hero">
      <div className="container-narrow text-center py-20">
        <p className="text-[80px] leading-none mb-6 select-none" aria-hidden>!</p>
        <p className="text-eyebrow mb-4">Đã xảy ra lỗi</p>
        <h2 className="font-display text-4xl font-light text-surface-800 mb-4">
          Oops! Có gì đó không đúng
        </h2>
        <p className="text-surface-500 max-w-sm mx-auto mb-8 leading-relaxed">
          Đã xảy ra lỗi không mong muốn. Vui lòng thử lại hoặc liên hệ với chúng tôi nếu lỗi vẫn tiếp tục.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Button variant="primary" size="lg" onClick={reset}>
            Thử lại
          </Button>
          <Button variant="secondary" size="lg" onClick={() => (window.location.href = "/")}>
            Về trang chủ
          </Button>
        </div>
      </div>
    </div>
  );
}
