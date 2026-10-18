"use client";

import React, { useState, useMemo, useRef } from "react";
import { Plus, Search, Edit2, Eye, EyeOff, Trash2, X, Upload, Video, ImageIcon, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { cn, getPrimaryImageUrl } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
import { MediaPreviewModal } from "@/components/admin/MediaPreviewModal";
import { NotConfiguredNotice } from "@/components/admin/NotConfiguredNotice";
import { adminApi, shrinkImage, uploadMedia } from "@/lib/admin/client";
import { checkFileForBucket, MEDIA_BUCKETS, mb } from "@/lib/admin/media";
import { useBusy } from "@/lib/hooks/use-busy";
import type { Category, Product, ProductStatus } from "@/types";

// A photo/video in the form. New files stay local (blob: preview) until
// the product is saved, so cancelling the form leaves nothing in Storage.
interface MediaItem {
  key: string;          // local React key
  id?: string;          // product_media row id, once saved
  type: "image" | "video";
  url: string;          // public URL, or a blob: preview before upload
  name: string;
  file?: File;          // present until uploaded
}

interface ProductFormData {
  name: string;
  categorySlug: string;
  description: string;
  status: ProductStatus;
  isFeatured: boolean;
  isNew: boolean;
  media: MediaItem[];
}

type ModalMode = "add" | "edit" | null;

const bucketFor = (type: "image" | "video") => (type === "image" ? "product-images" : "product-videos");
const newKey = () => "m_" + Date.now() + "_" + Math.random().toString(36).slice(2, 8);

// ── Placeholder thumbnail for products with no image ──
function ProductThumbnail({ imageUrl, name }: { imageUrl?: string; name: string }) {
  if (imageUrl) {
    return (
      <img
        src={imageUrl}
        alt={name}
        className="w-full h-full object-cover"
      />
    );
  }
  return (
    <div
      className="w-full h-full flex items-center justify-center"
      style={{ background: "linear-gradient(135deg,#f4f9e8,#deeeb8)" }}
    >
      <ImageIcon size={16} className="text-brand-300" aria-hidden />
    </div>
  );
}

// ── Media uploader ──
function MediaUploader({ media, onChange }: { media: MediaItem[]; onChange: (m: MediaItem[]) => void }) {
  const imgRef  = useRef<HTMLInputElement>(null);
  const vidRef  = useRef<HTMLInputElement>(null);
  const replaceRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [overIdx, setOverIdx] = useState<number | null>(null);
  const [previewIdx, setPreviewIdx] = useState<number | null>(null);
  const [replaceTargetId, setReplaceTargetId] = useState<string | null>(null);

  const [preparing, setPreparing] = useState(false);

  // Shrink photos, validate against the Storage limits, preview via blob: URL.
  const toItem = async (original: File): Promise<MediaItem | null> => {
    const type: "image" | "video" = original.type.startsWith("video/") ? "video" : "image";
    const file = type === "image" ? await shrinkImage(original) : original;
    const problem = checkFileForBucket(bucketFor(type), file);
    if (problem) { alert(problem); return null; }
    return { key: newKey(), type, url: URL.createObjectURL(file), name: original.name, file };
  };

  const addFiles = async (files: FileList | null) => {
    if (!files || files.length === 0 || preparing) return;
    const list = Array.from(files);
    setPreparing(true);
    try {
      const items = (await Promise.all(list.map(toItem))).filter((m): m is MediaItem => m !== null);
      onChange([...media, ...items]);
    } finally {
      setPreparing(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setDragOver(false);
    addFiles(e.dataTransfer.files);
  };

  const remove = (key: string) => onChange(media.filter((m) => m.key !== key));

  const replaceMedia = async (file: File) => {
    if (!replaceTargetId) return;
    const target = replaceTargetId;
    setReplaceTargetId(null);
    setPreparing(true);
    try {
      const item = await toItem(file);
      if (item) onChange(media.map((m) => (m.key === target ? item : m)));
    } finally {
      setPreparing(false);
    }
  };

  // The thumbnail is the first image (videos are never thumbnails).
  const coverIdx = media.findIndex((m) => m.type === "image");

  // Touch screens have no HTML drag-and-drop, so tiles also get arrows.
  const shift = (i: number, by: -1 | 1) => {
    const j = i + by;
    if (j < 0 || j >= media.length) return;
    const arr = [...media];
    [arr[i], arr[j]] = [arr[j], arr[i]];
    onChange(arr);
  };

  const onDrop = (targetIdx: number) => {
    if (dragIdx === null || dragIdx === targetIdx) { setDragIdx(null); setOverIdx(null); return; }
    const arr = [...media];
    const [item] = arr.splice(dragIdx, 1);
    arr.splice(targetIdx, 0, item);
    onChange(arr);
    setDragIdx(null); setOverIdx(null);
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Header row */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <p className="text-sm font-medium text-surface-700">Hình ảnh & Video</p>
          <p className="text-xs text-surface-400 mt-0.5">Ảnh đầu tiên là ảnh bìa · Kéo thả hoặc bấm mũi tên để sắp xếp</p>
        </div>
        <div className="flex gap-2">
          <input ref={imgRef} type="file" accept="image/*" multiple className="hidden"
            onChange={(e) => { addFiles(e.target.files); e.target.value = ""; }} />
          <input ref={vidRef} type="file" accept="video/*" multiple className="hidden"
            onChange={(e) => { addFiles(e.target.files); e.target.value = ""; }} />
          <input ref={replaceRef} type="file" accept="image/*,video/*" className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) replaceMedia(f); e.target.value = ""; }} />
          <button type="button" onClick={() => imgRef.current?.click()} disabled={preparing}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-surface-200 text-xs font-medium text-surface-600 hover:border-brand-400 hover:text-brand-600 disabled:opacity-50 transition-all">
            <ImageIcon size={14} aria-hidden /> Thêm ảnh
          </button>
          <button type="button" onClick={() => vidRef.current?.click()} disabled={preparing}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-surface-200 text-xs font-medium text-surface-600 hover:border-brand-400 hover:text-brand-600 disabled:opacity-50 transition-all">
            <Video size={14} aria-hidden /> Thêm video
          </button>
        </div>
      </div>

      {media.length === 0 ? (
        /* Drop zone */
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => imgRef.current?.click()}
          className={cn(
            "border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all",
            dragOver ? "border-brand-400 bg-brand-50" : "border-surface-200 hover:border-brand-400 hover:bg-surface-50"
          )}>
          <Upload size={24} className="mx-auto mb-2 text-surface-300" aria-hidden />
          <p className="text-sm font-medium text-surface-600">Kéo thả hoặc nhấn để thêm ảnh / video</p>
          <p className="text-xs text-surface-400 mt-1">Ảnh JPG, PNG, WebP (tự động nén) · Video MP4, MOV tối đa {mb(MEDIA_BUCKETS["product-videos"].maxBytes)} MB</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {media.map((item, i) => (
            <div
              key={item.key}
              draggable
              onDragStart={() => setDragIdx(i)}
              onDragOver={(e) => { e.preventDefault(); setOverIdx(i); }}
              onDrop={() => onDrop(i)}
              onDragEnd={() => { setDragIdx(null); setOverIdx(null); }}
              onClick={() => setPreviewIdx(i)}
              className={cn(
                "relative rounded-xl overflow-hidden border-2 group cursor-pointer transition-all",
                overIdx === i ? "border-brand-400 scale-[1.02]" : "border-surface-200",
                dragIdx === i && "opacity-40",
                i === coverIdx && "ring-2 ring-brand-300 ring-offset-1"
              )}>
              <div className="aspect-square">
                {item.type === "image"
                  ? <img src={item.url} alt={item.name} className="w-full h-full object-cover" />
                  : <video src={item.url} className="w-full h-full object-cover" muted playsInline preload="metadata" />
                }
              </div>
              {/* Tap opens the preview; delete and reorder are always visible
                  (a hover-only button is invisible yet tappable on a phone). */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); remove(item.key); }}
                className="absolute top-1 right-1 w-8 h-8 rounded-full bg-red-600/90 text-white flex items-center justify-center shadow hover:bg-red-700"
                aria-label={`Xóa ${item.name}`}>
                <Trash2 size={14} aria-hidden />
              </button>
              <div className="absolute bottom-1 inset-x-1 flex justify-between">
                <button type="button" disabled={i === 0}
                  onClick={(e) => { e.stopPropagation(); shift(i, -1); }}
                  className="w-8 h-8 rounded-full bg-white/90 text-surface-700 flex items-center justify-center shadow disabled:invisible"
                  aria-label="Đưa lên trước">
                  <ChevronLeft size={16} aria-hidden />
                </button>
                <button type="button" disabled={i === media.length - 1}
                  onClick={(e) => { e.stopPropagation(); shift(i, 1); }}
                  className="w-8 h-8 rounded-full bg-white/90 text-surface-700 flex items-center justify-center shadow disabled:invisible"
                  aria-label="Đưa ra sau">
                  <ChevronRight size={16} aria-hidden />
                </button>
              </div>
              {/* Badge */}
              <div className="absolute top-1 left-1 flex gap-1">
                {i === coverIdx && (
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-brand-500 text-white">Bìa</span>
                )}
                {item.type === "video" && (
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-black/60 text-white">VID</span>
                )}
              </div>
            </div>
          ))}
          {/* Add more */}
          <button type="button" onClick={() => imgRef.current?.click()} disabled={preparing}
            className="aspect-square rounded-xl border-2 border-dashed border-surface-200 hover:border-brand-400 hover:bg-brand-50 transition-all flex flex-col items-center justify-center gap-1 text-surface-400 hover:text-brand-600">
            {preparing ? <Loader2 size={18} className="animate-spin" aria-hidden /> : <Plus size={18} aria-hidden />}
            <span className="text-[10px] font-medium">{preparing ? "Đang nén ảnh…" : "Thêm"}</span>
          </button>
        </div>
      )}

      {previewIdx !== null && media[previewIdx] && (
        <MediaPreviewModal
          media={{ type: media[previewIdx].type, src: media[previewIdx].url, name: media[previewIdx].name }}
          onClose={() => setPreviewIdx(null)}
          onReplace={() => {
            setReplaceTargetId(media[previewIdx].key);
            setPreviewIdx(null);
            replaceRef.current?.click();
          }}
          onDelete={() => {
            remove(media[previewIdx].key);
            setPreviewIdx(null);
          }}
        />
      )}
    </div>
  );
}

// ── Product Modal ──
function ProductModal({ mode, product, categories, onSave, onClose }: {
  mode: "add" | "edit";
  product: Product | null;
  categories: Category[];
  onSave: (d: ProductFormData, progress: (text: string) => void) => Promise<void>;
  onClose: () => void;
}) {
  const [form, setForm] = useState<ProductFormData>({
    name:         product?.name         ?? "",
    categorySlug: product?.categorySlug ?? categories[0]?.slug ?? "",
    description:  product?.description  ?? "",
    status:       product?.status       ?? "available",
    isFeatured:   product?.tags.includes("featured") ?? false,
    isNew:        product?.tags.includes("new")       ?? false,
    // Existing photos/videos are loaded so they can be reordered or removed.
    media: (product?.media ?? []).map((m) => ({
      key: m.id, id: m.id, type: m.type, url: m.url, name: m.alt || (m.type === "video" ? "Video" : "Ảnh"),
    })),
  });
  const { run, isBusy } = useBusy();
  const saving = isBusy("save");
  const [progress, setProgress] = useState("");
  const [error, setError]       = useState("");

  const set = (patch: Partial<ProductFormData>) => setForm((f) => ({ ...f, ...patch }));

  const submit = async () => {
    if (!form.name.trim()) { setError("Vui lòng nhập tên sản phẩm"); return; }
    if (!form.categorySlug) { setError("Vui lòng chọn danh mục"); return; }
    setError(""); setProgress("");
    const done = await run("save", async () => {
      try {
        await onSave(form, setProgress);
        return true;
      } catch (e) {
        setError((e as Error).message);
        setProgress("");
        return false;
      }
    });
    if (done) onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black/55 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={(e) => e.target === e.currentTarget && !saving && onClose()}
    >
      <div className="bg-white w-full sm:max-w-xl rounded-t-2xl sm:rounded-2xl shadow-modal max-h-[96vh] overflow-y-auto animate-slide-up sm:animate-fade-in">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-surface-100 flex items-center justify-between px-6 py-4 z-10">
          <h2 className="font-display font-semibold text-lg text-surface-800">
            {mode === "add" ? "Thêm sản phẩm" : "Chỉnh sửa sản phẩm"}
          </h2>
          <button onClick={onClose} disabled={saving} className="p-2 rounded-xl hover:bg-surface-100 transition-colors">
            <X size={18} aria-hidden />
          </button>
        </div>

        <div className="p-5 flex flex-col gap-5">
          {error && <div role="alert" className="p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">{error}</div>}

          {/* Media */}
          <MediaUploader media={form.media} onChange={(m) => set({ media: m })} />

          <div className="h-px bg-surface-100" />

          {/* Name */}
          <div>
            <label className="text-sm font-medium text-surface-700 block mb-1.5">
              Tên sản phẩm <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => set({ name: e.target.value })}
              placeholder="VD: Cá Koi Kohaku Nhật"
              className="h-11 w-full rounded-xl border border-surface-200 px-4 text-sm outline-none focus:border-brand-500 focus:ring-3 focus:ring-brand-100 transition-all"
            />
          </div>

          {/* Category */}
          <div>
            <label className="text-sm font-medium text-surface-700 block mb-1.5">Danh mục</label>
            <select value={form.categorySlug} onChange={(e) => set({ categorySlug: e.target.value })}
              className="h-11 w-full rounded-xl border border-surface-200 bg-white px-4 text-sm outline-none focus:border-brand-500 focus:ring-3 focus:ring-brand-100 transition-all">
              {categories.map((c) => (
                <option key={c.slug} value={c.slug}>{c.name}{c.visible === false ? " (đang ẩn)" : ""}</option>
              ))}
            </select>
          </div>

          {/* Status */}
          <div>
            <label className="text-sm font-medium text-surface-700 block mb-1.5">Trạng thái</label>
            <select value={form.status} onChange={(e) => set({ status: e.target.value as ProductStatus })}
              className="h-11 w-full rounded-xl border border-surface-200 bg-white px-4 text-sm outline-none focus:border-brand-500 focus:ring-3 focus:ring-brand-100 transition-all">
              <option value="available">Còn hàng</option>
              <option value="out_of_stock">Hết hàng</option>
              <option value="hidden">Ẩn</option>
            </select>
          </div>

          {/* Description */}
          <Textarea
            label="Mô tả sản phẩm"
            value={form.description}
            onChange={(e) => set({ description: e.target.value })}
            placeholder="Mô tả chi tiết về sản phẩm..."
            className="min-h-[100px]"
          />

          {/* Tags — explicit typed handlers to fix checkbox behavior */}
          <div>
            <p className="text-sm font-medium text-surface-700 mb-3">Nhãn</p>
            <div className="flex flex-col gap-2.5">
              <label className="flex items-center gap-3 cursor-pointer select-none">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={form.isFeatured}
                    onChange={(e) => set({ isFeatured: e.target.checked })}
                    className="sr-only"
                  />
                  <div className={cn(
                    "w-5 h-5 rounded border-2 flex items-center justify-center transition-all",
                    form.isFeatured
                      ? "border-brand-500 bg-brand-500"
                      : "border-surface-300 bg-white hover:border-brand-400"
                  )}>
                    {form.isFeatured && (
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 12 12">
                        <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-surface-800">Nổi bật</p>
                  <p className="text-xs text-surface-400">Hiển thị ở mục sản phẩm nổi bật trang chủ</p>
                </div>
              </label>

              <label className="flex items-center gap-3 cursor-pointer select-none">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={form.isNew}
                    onChange={(e) => set({ isNew: e.target.checked })}
                    className="sr-only"
                  />
                  <div className={cn(
                    "w-5 h-5 rounded border-2 flex items-center justify-center transition-all",
                    form.isNew
                      ? "border-brand-500 bg-brand-500"
                      : "border-surface-300 bg-white hover:border-brand-400"
                  )}>
                    {form.isNew && (
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 12 12">
                        <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-surface-800">Mới về</p>
                  <p className="text-xs text-surface-400">{'Hiển thị nhãn "Mới về" trên sản phẩm'}</p>
                </div>
              </label>
            </div>
          </div>

          {progress && <p className="text-xs text-brand-600 animate-pulse" aria-live="polite">{progress}</p>}

          {/* Kept in view on phones: these forms are longer than the screen. */}
          <div className="sticky bottom-0 z-10 -mx-5 px-5 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] bg-white border-t border-surface-100 sm:static sm:mx-0 sm:px-0 sm:pb-0 sm:pt-1 sm:border-0 flex gap-3">
            <Button variant="primary" className="flex-1" onClick={submit} loading={saving}>
              {mode === "add" ? "Thêm sản phẩm" : "Lưu thay đổi"}
            </Button>
            <Button variant="outline" onClick={onClose} disabled={saving}>Hủy</Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main ──
export function AdminProductsClient({ initialProducts, categories, configured }: {
  initialProducts: Product[];
  categories: Category[];
  configured: boolean;
}) {
  const [products,  setProducts]  = useState<Product[]>(initialProducts);
  const [search,    setSearch]    = useState("");
  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [editing,   setEditing]   = useState<Product | null>(null);
  const [toast,     setToast]     = useState<string | null>(null);
  const { run, isBusy } = useBusy();

  const msg = (t: string) => { setToast(t); setTimeout(() => setToast(null), 3000); };

  const filtered = useMemo(() => {
    if (!search.trim()) return products;
    const q = search.toLowerCase();
    return products.filter((p) =>
      p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q)
    );
  }, [products, search]);

  const reload = async () => {
    const { products: fresh } = await adminApi<{ products: Product[] }>("/api/admin/products");
    setProducts(fresh);
  };

  const toggleStatus = (p: Product) => run(`row:${p.id}`, async () => {
    const next: ProductStatus = p.status === "hidden" ? "available" : "hidden";
    setProducts((prev) => prev.map((x) => (x.id === p.id ? { ...x, status: next } : x)));
    try {
      await adminApi(`/api/admin/products/${p.id}`, { method: "PATCH", body: { status: next } });
      msg((next === "available" ? "Đã hiện" : "Đã ẩn") + ` "${p.name}"`);
    } catch (e) {
      setProducts((prev) => prev.map((x) => (x.id === p.id ? { ...x, status: p.status } : x)));
      msg((e as Error).message);
    }
  });

  const deleteProduct = (p: Product) => {
    if (!confirm(`Xóa "${p.name}"? Ảnh và video của sản phẩm cũng sẽ bị xóa.`)) return;
    return run(`row:${p.id}`, async () => {
      try {
        await adminApi(`/api/admin/products/${p.id}`, { method: "DELETE" });
        setProducts((prev) => prev.filter((x) => x.id !== p.id));
        msg(`Đã xóa "${p.name}"`);
      } catch (e) { msg((e as Error).message); }
    });
  };

  // Upload new files first (straight to Storage), then save the product.
  // The modal closes itself once this resolves.
  const handleSave = async (data: ProductFormData, progress: (text: string) => void) => {
    const pending = data.media.filter((m) => m.file);
    const media: { id?: string; type: "image" | "video"; url: string; storagePath?: string }[] = [];
    let done = 0;
    for (const m of data.media) {
      if (m.file) {
        progress(`Đang tải lên ${++done}/${pending.length}: ${m.name}`);
        const up = await uploadMedia(bucketFor(m.type), m.file, { shrunk: true });
        media.push({ type: m.type, url: up.url, storagePath: up.path });
      } else {
        media.push({ id: m.id, type: m.type, url: m.url });
      }
    }
    progress("Đang lưu sản phẩm…");

    const tags: ("featured" | "new")[] = [];
    if (data.isFeatured) tags.push("featured");
    if (data.isNew)      tags.push("new");
    const body = {
      name: data.name, categorySlug: data.categorySlug, description: data.description,
      status: data.status, tags, media,
    };

    if (modalMode === "add") {
      await adminApi("/api/admin/products", { method: "POST", body });
      msg(`Đã thêm "${data.name}"`);
    } else if (editing) {
      await adminApi(`/api/admin/products/${editing.id}`, { method: "PATCH", body });
      msg(`Đã cập nhật "${data.name}"`);
    }
    data.media.forEach((m) => m.file && URL.revokeObjectURL(m.url));
    await reload();
  };

  const sLabel   = (s: ProductStatus) => s === "available" ? "Còn hàng" : s === "out_of_stock" ? "Hết hàng" : "Ẩn";
  const sVariant = (s: ProductStatus): "success" | "out" | "default" =>
    s === "available" ? "success" : s === "out_of_stock" ? "out" : "default";

  return (
    <div>
      <div className="flex items-center justify-between mb-6 md:mb-8 gap-3 flex-wrap">
        <div>
          <h1 className="font-display font-semibold text-2xl md:text-3xl text-surface-800">Quản lý sản phẩm</h1>
          <p className="text-sm text-surface-500 mt-1">{products.length} sản phẩm</p>
        </div>
        <Button variant="primary" disabled={!configured || categories.length === 0}
          onClick={() => { setEditing(null); setModalMode("add"); }}>
          <Plus size={15} aria-hidden /> Thêm sản phẩm
        </Button>
      </div>

      {!configured && <NotConfiguredNotice />}
      {configured && categories.length === 0 && (
        <p className="mb-5 p-4 rounded-xl border border-brand-200 bg-brand-50 text-sm text-brand-700">
          Chưa có danh mục nào. Hãy tạo danh mục ở mục <strong>Danh mục</strong> trước, rồi quay lại thêm sản phẩm.
        </p>
      )}

      <div className="relative max-w-xs mb-5">
        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-400 pointer-events-none" aria-hidden />
        <input type="search" value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Tìm sản phẩm..."
          className="w-full pl-9 pr-4 py-2 rounded-xl border border-surface-200 bg-white text-sm outline-none focus:border-brand-500 focus:ring-3 focus:ring-brand-100" />
      </div>

      {/* Phones: one card per product, actions always in reach. */}
      <ul className="md:hidden flex flex-col gap-2.5">
        {filtered.map((p) => {
          const rowBusy = isBusy(`row:${p.id}`);
          return (
            <li key={p.id} className={cn("bg-white rounded-xl border border-surface-200 shadow-card p-3 flex gap-3", p.status === "hidden" && "opacity-60")}>
              <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 border border-surface-200">
                <ProductThumbnail name={p.name} imageUrl={getPrimaryImageUrl(p)} />
              </div>
              <div className="flex-1 min-w-0 flex flex-col gap-1.5">
                <p className="text-sm font-semibold text-surface-800 line-clamp-2 leading-snug">{p.name}</p>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <Badge variant={sVariant(p.status)} className="text-[10px]">{sLabel(p.status)}</Badge>
                  {p.tags.includes("new")      && <Badge variant="new"      className="text-[10px]">Mới</Badge>}
                  {p.tags.includes("featured") && <Badge variant="featured" className="text-[10px]">Nổi bật</Badge>}
                  <span className="text-xs text-surface-400 truncate">{p.category}</span>
                </div>
                <div className="flex items-center gap-1 -ml-2">
                  <button onClick={() => { setEditing(p); setModalMode("edit"); }}
                    className="w-10 h-10 inline-flex items-center justify-center rounded-lg text-surface-500 active:bg-brand-50" aria-label={`Sửa ${p.name}`}>
                    <Edit2 size={16} aria-hidden />
                  </button>
                  <button onClick={() => toggleStatus(p)} disabled={rowBusy}
                    className="w-10 h-10 inline-flex items-center justify-center rounded-lg text-surface-500 active:bg-amber-50 disabled:pointer-events-none"
                    aria-label={p.status === "hidden" ? `Hiện ${p.name}` : `Ẩn ${p.name}`}>
                    {rowBusy ? <Loader2 size={16} className="animate-spin" aria-hidden />
                      : p.status === "hidden" ? <Eye size={16} aria-hidden /> : <EyeOff size={16} aria-hidden />}
                  </button>
                  <button onClick={() => deleteProduct(p)} disabled={rowBusy}
                    className="w-10 h-10 inline-flex items-center justify-center rounded-lg text-surface-500 active:bg-red-50 disabled:opacity-30 disabled:pointer-events-none"
                    aria-label={`Xóa ${p.name}`}>
                    <Trash2 size={16} aria-hidden />
                  </button>
                </div>
              </div>
            </li>
          );
        })}
        {filtered.length === 0 && (
          <li className="py-12 text-center text-sm text-surface-400 bg-white rounded-xl border border-surface-200">
            {products.length === 0 ? "Chưa có sản phẩm nào" : "Không tìm thấy sản phẩm"}
          </li>
        )}
      </ul>

      <div className="hidden md:block bg-white rounded-xl border border-surface-200 shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[540px]">
            <thead>
              <tr className="bg-surface-50 border-b border-surface-200">
                {["Sản phẩm", "Danh mục", "Trạng thái", "Nhãn", "Thao tác"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-surface-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((p, i) => {
                const rowBusy = isBusy(`row:${p.id}`);
                return (
                <tr key={p.id} className={cn("hover:bg-surface-50 transition-colors", i < filtered.length - 1 && "border-b border-surface-100")}>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-3">
                      {/* Image thumbnail */}
                      <div className="w-10 h-10 rounded-xl overflow-hidden shrink-0 border border-surface-200">
                        <ProductThumbnail name={p.name} imageUrl={getPrimaryImageUrl(p)} />
                      </div>
                      <p className="text-sm font-medium text-surface-800 truncate max-w-[160px]">{p.name}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3.5"><span className="text-sm text-surface-600">{p.category}</span></td>
                  <td className="px-4 py-3.5"><Badge variant={sVariant(p.status)}>{sLabel(p.status)}</Badge></td>
                  <td className="px-4 py-3.5">
                    <div className="flex gap-1.5">
                      {p.tags.length === 0 && <span className="text-xs text-surface-300">—</span>}
                      {p.tags.includes("new")      && <Badge variant="new"      className="text-[10px]">Mới</Badge>}
                      {p.tags.includes("featured") && <Badge variant="featured" className="text-[10px]">Nổi bật</Badge>}
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-1">
                      <button onClick={() => { setEditing(p); setModalMode("edit"); }}
                        className="p-2 rounded-lg text-surface-400 hover:text-brand-600 hover:bg-brand-50 transition-all" title="Sửa">
                        <Edit2 size={14} aria-hidden />
                      </button>
                      <button onClick={() => toggleStatus(p)} disabled={rowBusy}
                        className="p-2 rounded-lg text-surface-400 hover:text-amber-600 hover:bg-amber-50 disabled:pointer-events-none transition-all"
                        title={p.status === "hidden" ? "Hiện" : "Ẩn"}>
                        {rowBusy ? <Loader2 size={14} className="animate-spin" aria-label="Đang xử lý" />
                          : p.status === "hidden" ? <Eye size={14} aria-hidden /> : <EyeOff size={14} aria-hidden />}
                      </button>
                      <button onClick={() => deleteProduct(p)} disabled={rowBusy}
                        className="p-2 rounded-lg text-surface-400 hover:text-red-600 hover:bg-red-50 disabled:opacity-30 disabled:pointer-events-none transition-all" title="Xóa">
                        <Trash2 size={14} aria-hidden />
                      </button>
                    </div>
                  </td>
                </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-16 text-center text-sm text-surface-400">{products.length === 0 ? "Chưa có sản phẩm nào" : "Không tìm thấy sản phẩm"}</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {modalMode && (
        <ProductModal mode={modalMode} product={editing} categories={categories} onSave={handleSave}
          onClose={() => { setModalMode(null); setEditing(null); }} />
      )}

      {toast && (
        <div role="status" aria-live="polite"
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-surface-800 text-white text-sm font-medium px-5 py-3 rounded-xl shadow-float animate-fade-up whitespace-nowrap">
          {toast}
        </div>
      )}
    </div>
  );
}
