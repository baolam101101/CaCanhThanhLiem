"use client";

import React, { useState, useRef } from "react";
import { Plus, Trash2, Eye, EyeOff, X, ArrowUp, ArrowDown, Edit2, Upload } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { MediaPreviewModal } from "@/components/admin/MediaPreviewModal";
import { ImageCropTool, computeCroppedImageStyle } from "@/components/admin/ImageCropTool";
import type { SlideData } from "@/components/sections/HeroBannerSlider";

interface BannerItem extends SlideData {
  visible: boolean;
  order: number;
  imageName?: string;
}

const DEFAULTS: BannerItem[] = [
  {
    id: "b_seed_landscape",
    imageDataUrl: "https://images.unsplash.com/photo-1520301255226-bf5f144451c1?w=1600&h=900&fit=crop",
    imageName: "koi-pond-landscape.jpg",
    objectPositionX: 50, objectPositionY: 50, zoom: 1,
    visible: true, order: 1,
  },
  {
    id: "b_seed_portrait",
    imageDataUrl: "https://images.unsplash.com/photo-1535591273668-578e31182c4f?w=1080&h=1920&fit=crop",
    imageName: "koi-fish-portrait.jpg",
    objectPositionX: 50, objectPositionY: 50, zoom: 1,
    visible: true, order: 2,
  },
];

function BannerModal({ banner, onSave, onClose }: { banner: BannerItem | null; onSave: (b: BannerItem) => void; onClose: () => void }) {
  const isNew = !banner;
  const fileRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState<BannerItem>(banner ?? {
    id: `b_${Date.now()}`, visible: true, order: 99,
    objectPositionX: 50, objectPositionY: 50, zoom: 1,
  });
  const upd = (p: Partial<BannerItem>) => setForm((f) => ({ ...f, ...p }));

  const handleFile = async (file: File) => {
    if (!file.type.startsWith("image/")) { alert("Vui lòng chọn file ảnh"); return; }
    if (file.size > 15 * 1024 * 1024) { alert("Ảnh tối đa 15MB"); return; }
    const r = new FileReader();
    r.onload = () => upd({ imageDataUrl: r.result as string, imageName: file.name, objectPositionX: 50, objectPositionY: 50, zoom: 1 });
    r.readAsDataURL(file);
  };

  const save = () => {
    if (!form.imageDataUrl) { alert("Vui lòng chọn ảnh banner"); return; }
    onSave(form);
  };

  return (
    <div className="fixed inset-0 bg-black/55 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bg-white w-full sm:max-w-2xl rounded-t-2xl sm:rounded-2xl shadow-modal max-h-[96vh] overflow-y-auto animate-slide-up sm:animate-fade-in">
        <div className="sticky top-0 bg-white border-b border-surface-100 flex items-center justify-between px-6 py-4 z-10">
          <h2 className="font-display font-semibold text-lg text-surface-800">{isNew ? "Thêm banner mới" : "Chỉnh sửa banner"}</h2>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-surface-100 transition-colors"><X size={18} aria-hidden /></button>
        </div>
        <div className="p-5 flex flex-col gap-5">
          <input ref={fileRef} type="file" accept="image/*" className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ""; }} />
          {form.imageDataUrl ? (
            <>
              <ImageCropTool src={form.imageDataUrl} aspectRatio="16/5"
                posX={form.objectPositionX ?? 50} posY={form.objectPositionY ?? 50} zoom={form.zoom ?? 1}
                onPosX={(v) => upd({ objectPositionX: v })} onPosY={(v) => upd({ objectPositionY: v })} onZoom={(v) => upd({ zoom: v })} />
              <button type="button" onClick={() => fileRef.current?.click()} className="text-sm text-brand-600 hover:underline self-start">Đổi ảnh khác</button>
            </>
          ) : (
            <button type="button" onClick={() => fileRef.current?.click()}
              className="flex flex-col items-center justify-center gap-3 py-10 rounded-xl border-2 border-dashed border-surface-200 hover:border-brand-400 hover:bg-brand-50 transition-all">
              <Upload size={24} className="text-surface-400" aria-hidden />
              <div className="text-center">
                <p className="text-sm font-medium text-surface-700">Nhấn để chọn ảnh banner</p>
                <p className="text-xs text-surface-400 mt-0.5">JPG, PNG, WebP - Tối đa 15MB</p>
              </div>
            </button>
          )}
          <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl border border-surface-100 hover:bg-surface-50 transition-colors">
            <div className="relative">
              <input type="checkbox" className="sr-only" checked={form.visible} onChange={(e) => upd({ visible: e.target.checked })} />
              <div className={cn("w-10 h-5 rounded-full transition-colors", form.visible ? "bg-brand-500" : "bg-surface-300")} />
              <div className={cn("absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform", form.visible ? "translate-x-5" : "translate-x-0.5")} />
            </div>
            <span className="text-sm font-medium text-surface-700">Hiển thị banner này</span>
          </label>
          <div className="flex gap-3">
            <Button variant="primary" className="flex-1" onClick={save}>{isNew ? "Thêm banner" : "Lưu thay đổi"}</Button>
            <Button variant="outline" onClick={onClose}>Hủy</Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function AdminBannersClient() {
  const [banners,    setBanners]    = useState<BannerItem[]>(DEFAULTS);
  const [editTarget, setEditTarget] = useState<BannerItem | null | "new">(null);
  const [previewing, setPreviewing] = useState<BannerItem | null>(null);
  const [toast,      setToast]      = useState<string | null>(null);

  const msg = (t: string) => { setToast(t); setTimeout(() => setToast(null), 3000); };
  const sorted = [...banners].sort((a, b) => a.order - b.order);

  const move = (id: string, dir: "up" | "down") => {
    setBanners((prev) => {
      const arr = [...prev].sort((a, b) => a.order - b.order);
      const i = arr.findIndex((b) => b.id === id), j = dir === "up" ? i - 1 : i + 1;
      if (j < 0 || j >= arr.length) return prev;
      [arr[i].order, arr[j].order] = [arr[j].order, arr[i].order];
      return arr;
    });
  };

  const toggleVisible = (id: string) => { setBanners((p) => p.map((b) => b.id === id ? { ...b, visible: !b.visible } : b)); msg("Đã cập nhật trạng thái"); };
  const deleteBanner  = (id: string) => { if (!confirm("Xoá banner này?")) return; setBanners((p) => p.filter((b) => b.id !== id)); msg("Đã xoá banner"); };

  const handleSave = (saved: BannerItem) => {
    setBanners((prev) => {
      const ex = prev.find((b) => b.id === saved.id);
      if (ex) return prev.map((b) => b.id === saved.id ? saved : b);
      return [...prev, { ...saved, order: prev.length + 1 }];
    });
    setEditTarget(null); msg("Đã lưu banner");
  };

  const Thumb = ({ b }: { b: BannerItem }) => (
    <div className="relative overflow-hidden rounded-lg shrink-0 bg-surface-100" style={{ width: 80, height: 28 }}>
      {b.imageDataUrl && <img src={b.imageDataUrl} alt="" style={computeCroppedImageStyle(b.objectPositionX ?? 50, b.objectPositionY ?? 50, b.zoom ?? 1)} />}
    </div>
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6 md:mb-8 gap-3 flex-wrap">
        <div>
          <h1 className="font-display font-semibold text-2xl md:text-3xl text-surface-800">Quản lý Banner</h1>
          <p className="text-sm text-surface-500 mt-1">{sorted.filter((b) => b.visible).length}/{banners.length} đang hiển thị</p>
        </div>
        <Button variant="primary" onClick={() => setEditTarget("new")}><Plus size={15} /> Thêm banner</Button>
      </div>

      {sorted.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed border-surface-200 rounded-2xl">
          <p className="text-sm text-surface-400 mb-3">Chưa có banner nào</p>
          <Button variant="primary" onClick={() => setEditTarget("new")}><Plus size={15} /> Thêm banner đầu tiên</Button>
        </div>
      ) : (
        <div className="flex flex-col gap-2.5">
          {sorted.map((b, i) => (
            <div key={b.id} className={cn("bg-white rounded-xl border shadow-card flex items-center gap-3 px-4 py-3 transition-opacity", !b.visible && "opacity-55")}>
              <button onClick={() => setPreviewing(b)} className="shrink-0 rounded-lg overflow-hidden hover:ring-2 hover:ring-brand-300 transition-all" aria-label="Xem lon">
                <Thumb b={b} />
              </button>
              <div className="flex-1 min-w-0">
                {!b.visible && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-surface-100 text-surface-500 mb-0.5 inline-block">Ẩn</span>}
                <p className="text-sm font-medium text-surface-800 truncate">{b.imageName ?? "Anh banner"}</p>
              </div>
              <div className="flex flex-col gap-0.5 shrink-0">
                <button onClick={() => move(b.id, "up")} disabled={i === 0} className="p-1 rounded text-surface-400 hover:text-brand-600 hover:bg-brand-50 disabled:opacity-25 transition-all"><ArrowUp size={13} /></button>
                <button onClick={() => move(b.id, "down")} disabled={i === sorted.length - 1} className="p-1 rounded text-surface-400 hover:text-brand-600 hover:bg-brand-50 disabled:opacity-25 transition-all"><ArrowDown size={13} /></button>
              </div>
              <div className="flex items-center gap-1 border-l border-surface-100 pl-2 shrink-0">
                <button onClick={() => setEditTarget(b)} className="p-2 rounded-lg text-surface-400 hover:text-brand-600 hover:bg-brand-50 transition-all"><Edit2 size={14} /></button>
                <button onClick={() => toggleVisible(b.id)} className="p-2 rounded-lg text-surface-400 hover:text-amber-600 hover:bg-amber-50 transition-all">{b.visible ? <EyeOff size={14} /> : <Eye size={14} />}</button>
                <button onClick={() => deleteBanner(b.id)} className="p-2 rounded-lg text-surface-400 hover:text-red-600 hover:bg-red-50 transition-all"><Trash2 size={14} /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {editTarget !== null && <BannerModal banner={editTarget === "new" ? null : editTarget} onSave={handleSave} onClose={() => setEditTarget(null)} />}
      {previewing && previewing.imageDataUrl && (
        <MediaPreviewModal media={{ type: "image", src: previewing.imageDataUrl, name: previewing.imageName }}
          onClose={() => setPreviewing(null)}
          onReplace={() => { setEditTarget(previewing); setPreviewing(null); }}
          onDelete={() => { deleteBanner(previewing.id); setPreviewing(null); }} />
      )}
      {toast && <div role="status" aria-live="polite" className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-surface-800 text-white text-sm font-medium px-5 py-3 rounded-xl shadow-float animate-fade-up whitespace-nowrap">{toast}</div>}
    </div>
  );
}
