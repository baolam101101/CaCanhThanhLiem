"use client";

import React, { useState, useMemo, useRef } from "react";
import { Plus, Search, Edit2, Eye, EyeOff, Trash2, X, Upload, Video, ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
import { MediaPreviewModal } from "@/components/admin/MediaPreviewModal";
import type { Product, ProductStatus, CategorySlug } from "@/types";
import { MOCK_CATEGORIES } from "@/lib/data";

interface MediaItem {
  id: string;
  type: "image" | "video";
  dataUrl: string;
  name: string;
}

interface ProductFormData {
  name: string;
  category: string;
  description: string;
  status: ProductStatus;
  isFeatured: boolean;
  isNew: boolean;
  media: MediaItem[];
}

type ModalMode = "add" | "edit" | null;

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
  const [loading, setLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [overIdx, setOverIdx] = useState<number | null>(null);
  const [previewIdx, setPreviewIdx] = useState<number | null>(null);
  const [replaceTargetId, setReplaceTargetId] = useState<string | null>(null);

  const readFile = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      if (file.size > 50 * 1024 * 1024) { reject(new Error(file.name + " vượt 50MB")); return; }
      const r = new FileReader();
      r.onload  = () => resolve(r.result as string);
      r.onerror = () => reject(new Error("Không đọc được file"));
      r.readAsDataURL(file);
    });

  const addFiles = async (files: FileList | null, type: "image" | "video") => {
    if (!files || files.length === 0) return;
    setLoading(true);
    const items: MediaItem[] = [];
    for (const file of Array.from(files)) {
      try {
        const dataUrl = await readFile(file);
        items.push({ id: "m_" + Date.now() + "_" + Math.random().toString(36).slice(2,6), type, dataUrl, name: file.name });
      } catch (err) { alert((err as Error).message); }
    }
    onChange([...media, ...items]);
    setLoading(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault(); setDragOver(false);
    const files = e.dataTransfer.files;
    if (!files.length) return;
    const type = files[0].type.startsWith("video/") ? "video" : "image";
    await addFiles(files, type);
  };

  const remove = (id: string) => onChange(media.filter((m) => m.id !== id));

  const replaceMedia = async (file: File) => {
    if (!replaceTargetId) return;
    const target = media.find((m) => m.id === replaceTargetId);
    if (!target) return;
    try {
      const dataUrl = await readFile(file);
      const type: "image" | "video" = file.type.startsWith("video/") ? "video" : "image";
      onChange(media.map((m) => m.id === replaceTargetId ? { ...m, dataUrl, name: file.name, type } : m));
    } catch (err) { alert((err as Error).message); }
    setReplaceTargetId(null);
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
          <p className="text-xs text-surface-400 mt-0.5">Ảnh đầu tiên là ảnh đại diện · Kéo thả để sắp xếp</p>
        </div>
        <div className="flex gap-2">
          <input ref={imgRef} type="file" accept="image/*" multiple className="hidden"
            onChange={(e) => addFiles(e.target.files, "image")} />
          <input ref={vidRef} type="file" accept="video/*" multiple className="hidden"
            onChange={(e) => addFiles(e.target.files, "video")} />
          <input ref={replaceRef} type="file" accept="image/*,video/*" className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) replaceMedia(f); e.target.value = ""; }} />
          <button type="button" onClick={() => imgRef.current?.click()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-surface-200 text-xs font-medium text-surface-600 hover:border-brand-400 hover:text-brand-600 transition-all">
            <ImageIcon size={13} aria-hidden /> Thêm ảnh
          </button>
          <button type="button" onClick={() => vidRef.current?.click()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-surface-200 text-xs font-medium text-surface-600 hover:border-brand-400 hover:text-brand-600 transition-all">
            <Video size={13} aria-hidden /> Thêm video
          </button>
        </div>
      </div>

      {loading && <p className="text-xs text-brand-600 animate-pulse">Đang xử lý file...</p>}

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
          <p className="text-xs text-surface-400 mt-1">JPG, PNG, WebP, MP4 — Tối đa 50MB mỗi file</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {media.map((item, i) => (
            <div
              key={item.id}
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
                i === 0 && "ring-2 ring-brand-300 ring-offset-1"
              )}>
              <div className="aspect-square">
                {item.type === "image"
                  ? <img src={item.dataUrl} alt={item.name} className="w-full h-full object-cover" />
                  : <video src={item.dataUrl} className="w-full h-full object-cover" muted playsInline />
                }
              </div>
              {/* Hover overlay — click opens preview, X removes directly */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); remove(item.id); }}
                  className="opacity-0 group-hover:opacity-100 w-7 h-7 rounded-full bg-red-600 text-white flex items-center justify-center transition-all hover:bg-red-700 absolute top-1 right-1"
                  aria-label="Xóa">
                  <Trash2 size={12} aria-hidden />
                </button>
              </div>
              {/* Badge */}
              <div className="absolute top-1 left-1 flex gap-1">
                {i === 0 && (
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-brand-500 text-white">Bìa</span>
                )}
                {item.type === "video" && (
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-black/60 text-white">VID</span>
                )}
              </div>
            </div>
          ))}
          {/* Add more */}
          <button type="button" onClick={() => imgRef.current?.click()}
            className="aspect-square rounded-xl border-2 border-dashed border-surface-200 hover:border-brand-400 hover:bg-brand-50 transition-all flex flex-col items-center justify-center gap-1 text-surface-400 hover:text-brand-600">
            <Plus size={18} aria-hidden />
            <span className="text-[10px] font-medium">Thêm</span>
          </button>
        </div>
      )}

      {previewIdx !== null && media[previewIdx] && (
        <MediaPreviewModal
          media={{ type: media[previewIdx].type, src: media[previewIdx].dataUrl, name: media[previewIdx].name }}
          onClose={() => setPreviewIdx(null)}
          onReplace={() => {
            setReplaceTargetId(media[previewIdx].id);
            setPreviewIdx(null);
            replaceRef.current?.click();
          }}
          onDelete={() => {
            remove(media[previewIdx].id);
            setPreviewIdx(null);
          }}
        />
      )}
    </div>
  );
}

// ── Product Modal ──
function ProductModal({ mode, product, onSave, onClose }: {
  mode: "add" | "edit";
  product: Product | null;
  onSave: (d: ProductFormData) => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState<ProductFormData>({
    name:        product?.name        ?? "",
    category:    product?.category    ?? MOCK_CATEGORIES[0].name,
    description: product?.description ?? "",
    status:      product?.status      ?? "available",
    isFeatured:  product?.tags.includes("featured") ?? false,
    isNew:       product?.tags.includes("new")       ?? false,
    media:       [],
  });

  const set = (patch: Partial<ProductFormData>) => setForm((f) => ({ ...f, ...patch }));

  return (
    <div
      className="fixed inset-0 bg-black/55 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white w-full sm:max-w-xl rounded-t-2xl sm:rounded-2xl shadow-modal max-h-[96vh] overflow-y-auto animate-slide-up sm:animate-fade-in">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-surface-100 flex items-center justify-between px-6 py-4 z-10">
          <h2 className="font-display font-semibold text-lg text-surface-800">
            {mode === "add" ? "Thêm sản phẩm" : "Chỉnh sửa sản phẩm"}
          </h2>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-surface-100 transition-colors">
            <X size={18} aria-hidden />
          </button>
        </div>

        <div className="p-5 flex flex-col gap-5">
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
            <select value={form.category} onChange={(e) => set({ category: e.target.value })}
              className="h-11 w-full rounded-xl border border-surface-200 bg-white px-4 text-sm outline-none focus:border-brand-500 focus:ring-3 focus:ring-brand-100 transition-all">
              {MOCK_CATEGORIES.map((c) => <option key={c.slug} value={c.name}>{c.name}</option>)}
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

          <div className="flex gap-3 pt-1">
            <Button
              variant="primary"
              className="flex-1"
              onClick={() => {
                if (!form.name.trim()) { alert("Vui lòng nhập tên sản phẩm"); return; }
                onSave(form);
              }}
            >
              {mode === "add" ? "Thêm sản phẩm" : "Lưu thay đổi"}
            </Button>
            <Button variant="outline" onClick={onClose}>Hủy</Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main ──
export function AdminProductsClient({ initialProducts }: { initialProducts: Product[] }) {
  const [products,  setProducts]  = useState<Product[]>(initialProducts);
  const [search,    setSearch]    = useState("");
  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [editing,   setEditing]   = useState<Product | null>(null);
  const [toast,     setToast]     = useState<string | null>(null);

  const msg = (t: string) => { setToast(t); setTimeout(() => setToast(null), 3000); };

  const filtered = useMemo(() => {
    if (!search.trim()) return products;
    const q = search.toLowerCase();
    return products.filter((p) =>
      p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q)
    );
  }, [products, search]);

  const toggleStatus = (id: string) => {
    setProducts((prev) => prev.map((p) => {
      if (p.id !== id) return p;
      const next: ProductStatus = p.status === "available" ? "hidden" : "available";
      msg((next === "available" ? "Đã hiện" : "Đã ẩn") + ` "${p.name}"`);
      return { ...p, status: next, updatedAt: new Date() };
    }));
  };

  const deleteProduct = (id: string) => {
    const p = products.find((x) => x.id === id);
    if (!p || !confirm(`Xóa "${p.name}"?`)) return;
    setProducts((prev) => prev.filter((x) => x.id !== id));
    msg(`Đã xóa "${p.name}"`);
  };

  const handleSave = (data: ProductFormData) => {
    const tags: ("featured" | "new")[] = [];
    if (data.isFeatured) tags.push("featured");
    if (data.isNew)      tags.push("new");

    if (modalMode === "add") {
      const slug = data.name.toLowerCase().replace(/\s+/g, "-").replace(/[^\w-]/g, "");
      const newP: Product = {
        id: String(Date.now()), slug, name: data.name, latin: "",
        category: data.category,
        categorySlug: (MOCK_CATEGORIES.find((c) => c.name === data.category)?.slug ?? "ca-koi") as CategorySlug,
        emoji: "",
        status: data.status, tags, description: data.description,
        specs: { size:"", temperature:"", ph:"", origin:"", minTankSize:"", careLevel:"Dễ chăm sóc" },
        createdAt: new Date(), updatedAt: new Date(),
      };
      setProducts((p) => [newP, ...p]);
      msg(`Đã thêm "${data.name}"`);
    } else if (editing) {
      setProducts((p) => p.map((x) => x.id === editing.id
        ? { ...x, name: data.name, category: data.category, description: data.description, status: data.status, tags, updatedAt: new Date() }
        : x
      ));
      msg(`Đã cập nhật "${data.name}"`);
    }
    setModalMode(null); setEditing(null);
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
        <Button variant="primary" onClick={() => { setEditing(null); setModalMode("add"); }}>
          <Plus size={15} aria-hidden /> Thêm sản phẩm
        </Button>
      </div>

      <div className="relative max-w-xs mb-5">
        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-400 pointer-events-none" aria-hidden />
        <input type="search" value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Tìm sản phẩm..."
          className="w-full pl-9 pr-4 py-2 rounded-xl border border-surface-200 bg-white text-sm outline-none focus:border-brand-500 focus:ring-3 focus:ring-brand-100" />
      </div>

      <div className="bg-white rounded-xl border border-surface-200 shadow-card overflow-hidden">
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
              {filtered.map((p, i) => (
                <tr key={p.id} className={cn("hover:bg-surface-50 transition-colors", i < filtered.length - 1 && "border-b border-surface-100")}>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-3">
                      {/* Image thumbnail — no emoji */}
                      <div className="w-10 h-10 rounded-xl overflow-hidden shrink-0 border border-surface-200">
                        <ProductThumbnail name={p.name} />
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
                      <button onClick={() => toggleStatus(p.id)}
                        className="p-2 rounded-lg text-surface-400 hover:text-amber-600 hover:bg-amber-50 transition-all"
                        title={p.status === "hidden" ? "Hiện" : "Ẩn"}>
                        {p.status === "hidden" ? <Eye size={14} aria-hidden /> : <EyeOff size={14} aria-hidden />}
                      </button>
                      <button onClick={() => deleteProduct(p.id)}
                        className="p-2 rounded-lg text-surface-400 hover:text-red-600 hover:bg-red-50 transition-all" title="Xóa">
                        <Trash2 size={14} aria-hidden />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-16 text-center text-sm text-surface-400">Không tìm thấy sản phẩm</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {modalMode && (
        <ProductModal mode={modalMode} product={editing} onSave={handleSave}
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
