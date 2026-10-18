"use client";

import React, { useState, useRef } from "react";
import { Plus, Trash2, Eye, EyeOff, X, ArrowUp, ArrowDown, Edit2, Upload, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { MediaPreviewModal } from "@/components/admin/MediaPreviewModal";
import { ImageCropTool, computeCroppedImageStyle } from "@/components/admin/ImageCropTool";
import { NotConfiguredNotice } from "@/components/admin/NotConfiguredNotice";
import { adminApi, shrinkImage, uploadMedia } from "@/lib/admin/client";
import { useBusy } from "@/lib/hooks/use-busy";
import { checkFileForBucket } from "@/lib/admin/media";
import type { AdminBanner } from "@/lib/admin/repo";

// Brand green, also the background of the shop signboard artwork.
const DEFAULT_BACKGROUND = "#A8CF36";

interface BannerForm extends Omit<AdminBanner, "id" | "order"> {
  id?: string;
  file?: File; // new image, uploaded on save
}

function BannerPreview({ b }: { b: Pick<AdminBanner, "imageUrl" | "objectPositionX" | "objectPositionY" | "zoom" | "fit" | "background"> }) {
  return (
    <div className="absolute inset-0" style={{ backgroundColor: b.fit === "contain" ? b.background || DEFAULT_BACKGROUND : undefined }}>
      {b.imageUrl && (
        <img src={b.imageUrl} alt="" style={computeCroppedImageStyle(b.objectPositionX, b.objectPositionY, b.zoom, b.fit)} />
      )}
    </div>
  );
}

function BannerModal({ banner, onSave, onClose }: {
  banner: AdminBanner | null;
  onSave: (b: BannerForm) => Promise<void>;
  onClose: () => void;
}) {
  const isNew = !banner;
  const fileRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState<BannerForm>(banner ?? {
    imageUrl: "", imageName: "", visible: true,
    objectPositionX: 50, objectPositionY: 50, zoom: 1,
    fit: "cover", background: DEFAULT_BACKGROUND,
  });
  const { run, isBusy } = useBusy();
  const saving = isBusy("save");
  const [error, setError] = useState("");
  const upd = (p: Partial<BannerForm>) => setForm((f) => ({ ...f, ...p }));

  // Banners are shown full width, so they keep more pixels than photos.
  const handleFile = async (original: File) => {
    const file = await shrinkImage(original, 2400);
    const problem = checkFileForBucket("banners", file);
    if (problem) { setError(problem); return; }
    setError("");
    if (form.file) URL.revokeObjectURL(form.imageUrl);
    upd({ file, imageUrl: URL.createObjectURL(file), imageName: original.name, objectPositionX: 50, objectPositionY: 50, zoom: 1 });
  };

  const save = async () => {
    if (!form.imageUrl) { setError("Vui lòng chọn ảnh banner"); return; }
    setError("");
    const done = await run("save", async () => {
      try {
        await onSave(form);
        return true;
      } catch (e) {
        setError((e as Error).message);
        return false;
      }
    });
    if (done) onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/55 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={(e) => e.target === e.currentTarget && !saving && onClose()}>
      <div className="bg-white w-full sm:max-w-2xl rounded-t-2xl sm:rounded-2xl shadow-modal max-h-[96vh] overflow-y-auto animate-slide-up sm:animate-fade-in">
        <div className="sticky top-0 bg-white border-b border-surface-100 flex items-center justify-between px-6 py-4 z-10">
          <h2 className="font-display font-semibold text-lg text-surface-800">{isNew ? "Thêm banner mới" : "Chỉnh sửa banner"}</h2>
          <button onClick={onClose} disabled={saving} className="p-2 rounded-xl hover:bg-surface-100 transition-colors"><X size={18} aria-hidden /></button>
        </div>
        <div className="p-5 flex flex-col gap-5">
          {error && <div role="alert" className="p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">{error}</div>}
          <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ""; }} />

          {form.imageUrl ? (
            <>
              {form.fit === "cover" ? (
                <ImageCropTool src={form.imageUrl} aspectRatio="16/5"
                  posX={form.objectPositionX} posY={form.objectPositionY} zoom={form.zoom}
                  onPosX={(v) => upd({ objectPositionX: v })} onPosY={(v) => upd({ objectPositionY: v })} onZoom={(v) => upd({ zoom: v })} />
              ) : (
                <div className="relative w-full rounded-xl overflow-hidden border border-surface-200" style={{ aspectRatio: "16/5" }}>
                  <BannerPreview b={form} />
                </div>
              )}
              <button type="button" onClick={() => fileRef.current?.click()} className="text-sm text-brand-600 hover:underline self-start">Đổi ảnh khác</button>
            </>
          ) : (
            <button type="button" onClick={() => fileRef.current?.click()}
              className="flex flex-col items-center justify-center gap-3 py-10 rounded-xl border-2 border-dashed border-surface-200 hover:border-brand-400 hover:bg-brand-50 transition-all">
              <Upload size={24} className="text-surface-400" aria-hidden />
              <div className="text-center">
                <p className="text-sm font-medium text-surface-700">Nhấn để chọn ảnh banner</p>
                <p className="text-xs text-surface-400 mt-0.5">JPG, PNG, WebP — Tối đa 8 MB</p>
              </div>
            </button>
          )}

          {/* Whole-image mode, for artwork that must not be cropped (e.g. the shop signboard). */}
          <div className="p-3 rounded-xl border border-surface-100 flex flex-col gap-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <div className="relative">
                <input type="checkbox" className="sr-only" checked={form.fit === "contain"}
                  onChange={(e) => upd({ fit: e.target.checked ? "contain" : "cover" })} />
                <div className={cn("w-10 h-5 rounded-full transition-colors", form.fit === "contain" ? "bg-brand-500" : "bg-surface-300")} />
                <div className={cn("absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform", form.fit === "contain" ? "translate-x-5" : "translate-x-0.5")} />
              </div>
              <span>
                <span className="block text-sm font-medium text-surface-700">Hiển thị trọn ảnh (không cắt)</span>
                <span className="block text-xs text-surface-400">Dùng cho ảnh có chữ như biển hiệu; phần trống hai bên được tô màu nền.</span>
              </span>
            </label>
            {form.fit === "contain" && (
              <label className="flex items-center gap-3 pl-13 text-sm text-surface-700">
                <input type="color" value={form.background || DEFAULT_BACKGROUND}
                  onChange={(e) => upd({ background: e.target.value })}
                  className="w-10 h-8 rounded border border-surface-200 cursor-pointer" />
                Màu nền
              </label>
            )}
          </div>

          <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl border border-surface-100 hover:bg-surface-50 transition-colors">
            <div className="relative">
              <input type="checkbox" className="sr-only" checked={form.visible} onChange={(e) => upd({ visible: e.target.checked })} />
              <div className={cn("w-10 h-5 rounded-full transition-colors", form.visible ? "bg-brand-500" : "bg-surface-300")} />
              <div className={cn("absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform", form.visible ? "translate-x-5" : "translate-x-0.5")} />
            </div>
            <span className="text-sm font-medium text-surface-700">Hiển thị banner này</span>
          </label>
          {/* Kept in view on phones: these forms are longer than the screen. */}
          <div className="sticky bottom-0 z-10 -mx-5 px-5 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] bg-white border-t border-surface-100 sm:static sm:mx-0 sm:px-0 sm:pb-0 sm:pt-1 sm:border-0 flex gap-3">
            <Button variant="primary" className="flex-1" onClick={save} loading={saving}>{isNew ? "Thêm banner" : "Lưu thay đổi"}</Button>
            <Button variant="outline" onClick={onClose} disabled={saving}>Hủy</Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function AdminBannersClient({ initialBanners, configured }: { initialBanners: AdminBanner[]; configured: boolean }) {
  const [banners,    setBanners]    = useState<AdminBanner[]>(initialBanners);
  const [editTarget, setEditTarget] = useState<AdminBanner | null | "new">(null);
  const [previewing, setPreviewing] = useState<AdminBanner | null>(null);
  const [toast,      setToast]      = useState<string | null>(null);
  const { run, isBusy } = useBusy();
  const reordering = isBusy("reorder");

  const msg = (t: string) => { setToast(t); setTimeout(() => setToast(null), 3000); };
  const sorted = [...banners].sort((a, b) => a.order - b.order);

  const reload = async () => {
    const { banners: fresh } = await adminApi<{ banners: AdminBanner[] }>("/api/admin/banners");
    setBanners(fresh);
  };

  const move = (id: string, dir: "up" | "down") => run("reorder", async () => {
    const arr = [...sorted];
    const i = arr.findIndex((b) => b.id === id), j = dir === "up" ? i - 1 : i + 1;
    if (j < 0 || j >= arr.length) return;
    [arr[i], arr[j]] = [arr[j], arr[i]];
    const previous = banners;
    setBanners(arr.map((b, k) => ({ ...b, order: k + 1 })));
    try {
      await adminApi("/api/admin/reorder", { method: "POST", body: { table: "banners", ids: arr.map((b) => b.id) } });
    } catch (e) { setBanners(previous); msg((e as Error).message); }
  });

  const toggleVisible = (b: AdminBanner) => run(`row:${b.id}`, async () => {
    const visible = !b.visible;
    setBanners((p) => p.map((x) => (x.id === b.id ? { ...x, visible } : x)));
    try {
      await adminApi(`/api/admin/banners/${b.id}`, { method: "PATCH", body: { visible } });
      msg(visible ? "Đã hiện banner" : "Đã ẩn banner");
    } catch (e) {
      setBanners((p) => p.map((x) => (x.id === b.id ? { ...x, visible: b.visible } : x)));
      msg((e as Error).message);
    }
  });

  const deleteBanner = (id: string) => {
    if (!confirm("Xoá banner này?")) return;
    return run(`row:${id}`, async () => {
      try {
        await adminApi(`/api/admin/banners/${id}`, { method: "DELETE" });
        setBanners((p) => p.filter((b) => b.id !== id));
        msg("Đã xoá banner");
      } catch (e) { msg((e as Error).message); }
    });
  };

  const handleSave = async (form: BannerForm) => {
    let image: { imageUrl: string; storagePath?: string } = { imageUrl: form.imageUrl };
    if (form.file) {
      const up = await uploadMedia("banners", form.file, { shrunk: true });
      URL.revokeObjectURL(form.imageUrl);
      image = { imageUrl: up.url, storagePath: up.path };
    }
    const body = {
      ...image,
      imageName: form.imageName,
      objectPositionX: form.objectPositionX, objectPositionY: form.objectPositionY, zoom: form.zoom,
      fit: form.fit, background: form.background, visible: form.visible,
    };
    if (form.id) await adminApi(`/api/admin/banners/${form.id}`, { method: "PATCH", body });
    else await adminApi("/api/admin/banners", { method: "POST", body });
    await reload();
    msg("Đã lưu banner");
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6 md:mb-8 gap-3 flex-wrap">
        <div>
          <h1 className="font-display font-semibold text-2xl md:text-3xl text-surface-800">Quản lý Banner</h1>
          <p className="text-sm text-surface-500 mt-1">{sorted.filter((b) => b.visible).length}/{banners.length} đang hiển thị</p>
        </div>
        <Button variant="primary" disabled={!configured} onClick={() => setEditTarget("new")}><Plus size={15} /> Thêm banner</Button>
      </div>

      {!configured && <NotConfiguredNotice />}

      {sorted.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed border-surface-200 rounded-2xl">
          <p className="text-sm text-surface-400 mb-1">Chưa có banner nào</p>
          <p className="text-xs text-surface-400 mb-4">Khi chưa có banner, trang chủ hiển thị ảnh biển hiệu mặc định.</p>
          {configured && <Button variant="primary" onClick={() => setEditTarget("new")}><Plus size={15} /> Thêm banner đầu tiên</Button>}
        </div>
      ) : (
        <div className="flex flex-col gap-2.5">
          {sorted.map((b, i) => {
            const rowBusy = isBusy(`row:${b.id}`);
            return (
            <div key={b.id} className={cn("bg-white rounded-xl border shadow-card flex items-center gap-3 px-4 py-3 transition-opacity", !b.visible && "opacity-55")}>
              <button onClick={() => setPreviewing(b)} className="shrink-0 rounded-lg overflow-hidden hover:ring-2 hover:ring-brand-300 transition-all" aria-label="Xem lớn">
                <div className="relative overflow-hidden rounded-lg bg-surface-100" style={{ width: 80, height: 28 }}>
                  <BannerPreview b={b} />
                </div>
              </button>
              <div className="flex-1 min-w-0">
                <div className="flex gap-1 mb-0.5">
                  {!b.visible && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-surface-100 text-surface-500">Ẩn</span>}
                  {b.fit === "contain" && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-brand-50 text-brand-700">Trọn ảnh</span>}
                </div>
                <p className="text-sm font-medium text-surface-800 truncate">{b.imageName || "Ảnh banner"}</p>
              </div>
              <div className="flex flex-col gap-0.5 shrink-0">
                <button onClick={() => move(b.id, "up")} disabled={i === 0 || reordering} aria-label="Lên trên" className="w-9 h-9 md:w-7 md:h-7 inline-flex items-center justify-center rounded-lg text-surface-400 hover:text-brand-600 hover:bg-brand-50 disabled:opacity-25 transition-all"><ArrowUp size={13} /></button>
                <button onClick={() => move(b.id, "down")} disabled={i === sorted.length - 1 || reordering} aria-label="Xuống dưới" className="w-9 h-9 md:w-7 md:h-7 inline-flex items-center justify-center rounded-lg text-surface-400 hover:text-brand-600 hover:bg-brand-50 disabled:opacity-25 transition-all"><ArrowDown size={13} /></button>
              </div>
              <div className="flex items-center gap-1 border-l border-surface-100 pl-2 shrink-0">
                <button onClick={() => setEditTarget(b)} aria-label="Sửa" className="w-10 h-10 md:w-8 md:h-8 inline-flex items-center justify-center rounded-lg text-surface-400 hover:text-brand-600 hover:bg-brand-50 transition-all"><Edit2 size={14} /></button>
                <button onClick={() => toggleVisible(b)} disabled={rowBusy} aria-label={b.visible ? "Ẩn" : "Hiện"} className="w-10 h-10 md:w-8 md:h-8 inline-flex items-center justify-center rounded-lg text-surface-400 hover:text-amber-600 hover:bg-amber-50 disabled:pointer-events-none transition-all">
                  {rowBusy ? <Loader2 size={14} className="animate-spin" /> : b.visible ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
                <button onClick={() => deleteBanner(b.id)} disabled={rowBusy} aria-label="Xóa" className="w-10 h-10 md:w-8 md:h-8 inline-flex items-center justify-center rounded-lg text-surface-400 hover:text-red-600 hover:bg-red-50 disabled:opacity-30 disabled:pointer-events-none transition-all"><Trash2 size={14} /></button>
              </div>
            </div>
            );
          })}
        </div>
      )}

      {editTarget !== null && <BannerModal banner={editTarget === "new" ? null : editTarget} onSave={handleSave} onClose={() => setEditTarget(null)} />}
      {previewing && previewing.imageUrl && (
        <MediaPreviewModal media={{ type: "image", src: previewing.imageUrl, name: previewing.imageName }}
          onClose={() => setPreviewing(null)}
          onReplace={() => { setEditTarget(previewing); setPreviewing(null); }}
          onDelete={() => { deleteBanner(previewing.id); setPreviewing(null); }} />
      )}
      {toast && <div role="status" aria-live="polite" className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-surface-800 text-white text-sm font-medium px-5 py-3 rounded-xl shadow-float animate-fade-up whitespace-nowrap">{toast}</div>}
    </div>
  );
}
