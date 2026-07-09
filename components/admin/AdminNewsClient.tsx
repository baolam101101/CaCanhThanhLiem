"use client";

import React, { useState, useMemo, useRef } from "react";
import {
  Plus, Search, Edit2, Eye, EyeOff, Trash2, X, Upload,
  Heading2, Pilcrow, List as ListIcon, ImageIcon, GripVertical, AlertCircle,
} from "lucide-react";
import { cn, slugify } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
import { MediaPreviewModal } from "@/components/admin/MediaPreviewModal";
import { ImageCropTool, computeCroppedImageStyle } from "@/components/admin/ImageCropTool";
import type { NewsArticle, NewsContentBlock } from "@/types";

type ModalMode = "add" | "edit" | null;

interface NewsFormData {
  title: string;
  excerpt: string;
  featuredImage: string;
  featuredImagePosX: number;
  featuredImagePosY: number;
  featuredImageZoom: number;
  published: boolean;
  content: NewsContentBlock[];
}

function formatDate(d: Date): string {
  return new Date(d).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function emptyBlock(type: NewsContentBlock["type"]): NewsContentBlock {
  switch (type) {
    case "heading":   return { type: "heading", text: "" };
    case "paragraph": return { type: "paragraph", text: "" };
    case "list":      return { type: "list", items: [""] };
    case "image":     return { type: "image", url: "", caption: "" };
  }
}

// ── Block-based content editor ──
// Not a full rich-text editor, but supports the required block types
// (heading, paragraph, list, inline image) per the Phase 1 UI/mock
// scope. Each block can be reordered and removed; images upload via
// FileReader → base64 preview, same pattern as MediaUploader elsewhere
// in Admin, ready to be swapped for real Supabase Storage uploads
// in Phase 2 without changing this component's external shape.
function ContentEditor({ blocks, onChange }: { blocks: NewsContentBlock[]; onChange: (b: NewsContentBlock[]) => void }) {
  const imgRefs = useRef<Record<number, HTMLInputElement | null>>({});

  const updateBlock = (i: number, block: NewsContentBlock) => {
    const next = [...blocks]; next[i] = block; onChange(next);
  };
  const removeBlock = (i: number) => onChange(blocks.filter((_, idx) => idx !== i));
  const addBlock = (type: NewsContentBlock["type"]) => onChange([...blocks, emptyBlock(type)]);
  const moveBlock = (i: number, dir: "up" | "down") => {
    const j = dir === "up" ? i - 1 : i + 1;
    if (j < 0 || j >= blocks.length) return;
    const next = [...blocks];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };

  const handleImageFile = (i: number, file: File) => {
    if (!file.type.startsWith("image/")) { alert("Vui lòng chọn file ảnh"); return; }
    const r = new FileReader();
    r.onload = () => updateBlock(i, { type: "image", url: r.result as string, caption: (blocks[i] as { caption?: string }).caption ?? "" });
    r.readAsDataURL(file);
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-surface-700">Nội dung bài viết</label>
        <div className="flex gap-1.5">
          <button type="button" onClick={() => addBlock("heading")}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-surface-200 text-xs font-medium text-surface-600 hover:border-brand-400 hover:text-brand-600 transition-all">
            <Heading2 size={13} aria-hidden /> Tiêu đề
          </button>
          <button type="button" onClick={() => addBlock("paragraph")}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-surface-200 text-xs font-medium text-surface-600 hover:border-brand-400 hover:text-brand-600 transition-all">
            <Pilcrow size={13} aria-hidden /> Đoạn văn
          </button>
          <button type="button" onClick={() => addBlock("list")}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-surface-200 text-xs font-medium text-surface-600 hover:border-brand-400 hover:text-brand-600 transition-all">
            <ListIcon size={13} aria-hidden /> Danh sách
          </button>
          <button type="button" onClick={() => addBlock("image")}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-surface-200 text-xs font-medium text-surface-600 hover:border-brand-400 hover:text-brand-600 transition-all">
            <ImageIcon size={13} aria-hidden /> Ảnh
          </button>
        </div>
      </div>

      {blocks.length === 0 && (
        <p className="text-xs text-surface-400 py-6 text-center border-2 border-dashed border-surface-200 rounded-xl">
          Chưa có nội dung — bấm các nút phía trên để thêm khối nội dung
        </p>
      )}

      <div className="flex flex-col gap-2.5">
        {blocks.map((block, i) => (
          <div key={i} className="rounded-xl border border-surface-200 p-3 bg-surface-50/50">
            <div className="flex items-center justify-between mb-2">
              <span className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-surface-400">
                <GripVertical size={12} aria-hidden />
                {block.type === "heading" ? "Tiêu đề" : block.type === "paragraph" ? "Đoạn văn" : block.type === "list" ? "Danh sách" : "Ảnh"}
              </span>
              <div className="flex items-center gap-1">
                <button type="button" onClick={() => moveBlock(i, "up")} disabled={i === 0}
                  className="p-1 rounded text-surface-400 hover:text-brand-600 disabled:opacity-25 transition-all text-xs">↑</button>
                <button type="button" onClick={() => moveBlock(i, "down")} disabled={i === blocks.length - 1}
                  className="p-1 rounded text-surface-400 hover:text-brand-600 disabled:opacity-25 transition-all text-xs">↓</button>
                <button type="button" onClick={() => removeBlock(i)}
                  className="p-1 rounded text-surface-400 hover:text-red-600 transition-all"><Trash2 size={13} aria-hidden /></button>
              </div>
            </div>

            {block.type === "heading" && (
              <input type="text" value={block.text} onChange={(e) => updateBlock(i, { type: "heading", text: e.target.value })}
                placeholder="Nhập tiêu đề phụ..."
                className="w-full h-10 rounded-lg border border-surface-200 px-3 text-sm font-semibold outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100" />
            )}

            {block.type === "paragraph" && (
              <textarea value={block.text} onChange={(e) => updateBlock(i, { type: "paragraph", text: e.target.value })}
                placeholder="Nhập nội dung đoạn văn..." rows={3}
                className="w-full rounded-lg border border-surface-200 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100 resize-none" />
            )}

            {block.type === "list" && (
              <div className="flex flex-col gap-1.5">
                {block.items.map((item, ii) => (
                  <div key={ii} className="flex items-center gap-1.5">
                    <input type="text" value={item}
                      onChange={(e) => {
                        const items = [...block.items]; items[ii] = e.target.value;
                        updateBlock(i, { type: "list", items });
                      }}
                      placeholder={`Mục ${ii + 1}`}
                      className="flex-1 h-9 rounded-lg border border-surface-200 px-3 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100" />
                    <button type="button"
                      onClick={() => updateBlock(i, { type: "list", items: block.items.filter((_, x) => x !== ii) })}
                      className="p-1.5 text-surface-400 hover:text-red-600 transition-colors"><X size={14} aria-hidden /></button>
                  </div>
                ))}
                <button type="button" onClick={() => updateBlock(i, { type: "list", items: [...block.items, ""] })}
                  className="text-xs text-brand-600 hover:underline self-start mt-0.5">+ Thêm mục</button>
              </div>
            )}

            {block.type === "image" && (
              <div className="flex flex-col gap-2">
                <input ref={(el) => { imgRefs.current[i] = el; }} type="file" accept="image/*" className="hidden"
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) handleImageFile(i, f); e.target.value = ""; }} />
                {block.url ? (
                  <div className="relative rounded-lg overflow-hidden aspect-video bg-surface-100">
                    <img src={block.url} alt="" className="w-full h-full object-cover" />
                    <button type="button" onClick={() => imgRefs.current[i]?.click()}
                      className="absolute bottom-2 right-2 px-2.5 py-1 rounded-lg bg-black/60 text-white text-xs font-medium hover:bg-black/75 transition-colors">
                      Đổi ảnh
                    </button>
                  </div>
                ) : (
                  <button type="button" onClick={() => imgRefs.current[i]?.click()}
                    className="flex items-center justify-center gap-2 py-6 rounded-lg border-2 border-dashed border-surface-200 hover:border-brand-400 hover:bg-brand-50 transition-all text-sm text-surface-500">
                    <Upload size={15} aria-hidden /> Chọn ảnh
                  </button>
                )}
                <input type="text" value={block.caption ?? ""} onChange={(e) => updateBlock(i, { ...block, caption: e.target.value })}
                  placeholder="Chú thích ảnh (không bắt buộc)"
                  className="h-9 rounded-lg border border-surface-200 px-3 text-xs outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100" />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function NewsModal({
  mode, article, existingTitles, onSave, onClose,
}: {
  mode: "add" | "edit";
  article: NewsArticle | null;
  existingTitles: { id: string; title: string }[];
  onSave: (d: NewsFormData) => void;
  onClose: () => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState<NewsFormData>({
    title:               article?.title               ?? "",
    excerpt:             article?.excerpt             ?? "",
    featuredImage:       article?.featuredImage       ?? "",
    featuredImagePosX:   article?.featuredImagePosX   ?? 50,
    featuredImagePosY:   article?.featuredImagePosY   ?? 50,
    featuredImageZoom:   article?.featuredImageZoom   ?? 1,
    published:           article?.published           ?? true,
    content:             article?.content             ?? [],
  });
  const [titleError, setTitleError] = useState("");
  const [previewImg, setPreviewImg] = useState(false);

  const upd = (p: Partial<NewsFormData>) => setForm((f) => ({ ...f, ...p }));

  const handleFeaturedImage = (file: File) => {
    if (!file.type.startsWith("image/")) { alert("Vui lòng chọn file ảnh"); return; }
    if (file.size > 15 * 1024 * 1024) { alert("Ảnh tối đa 15MB"); return; }
    const r = new FileReader();
    // Reset crop position to center on every new upload so the user
    // starts from a neutral position and can drag to any edge
    r.onload = () => upd({ featuredImage: r.result as string, featuredImagePosX: 50, featuredImagePosY: 50, featuredImageZoom: 1 });
    r.readAsDataURL(file);
  };

  const checkDuplicateTitle = (title: string): boolean => {
    const norm = title.trim().toLowerCase();
    if (!norm) return false;
    return existingTitles.some((t) => t.id !== article?.id && t.title.trim().toLowerCase() === norm);
  };

  const handleTitleChange = (value: string) => {
    upd({ title: value });
    setTitleError(checkDuplicateTitle(value) ? "Tiêu đề này đã tồn tại — vui lòng chọn tiêu đề khác" : "");
  };

  const save = () => {
    if (!form.title.trim()) { alert("Vui lòng nhập tiêu đề"); return; }
    if (checkDuplicateTitle(form.title)) { setTitleError("Tiêu đề này đã tồn tại — vui lòng chọn tiêu đề khác"); return; }
    if (!form.featuredImage) { alert("Vui lòng chọn ảnh đại diện"); return; }
    if (!form.excerpt.trim()) { alert("Vui lòng nhập mô tả ngắn"); return; }
    onSave(form);
  };

  return (
    <div className="fixed inset-0 bg-black/55 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bg-white w-full sm:max-w-2xl rounded-t-2xl sm:rounded-2xl shadow-modal max-h-[96vh] overflow-y-auto animate-slide-up sm:animate-fade-in">
        <div className="sticky top-0 bg-white border-b border-surface-100 flex items-center justify-between px-6 py-4 z-10">
          <h2 className="font-display font-semibold text-lg text-surface-800">
            {mode === "add" ? "Thêm tin tức" : "Chỉnh sửa tin tức"}
          </h2>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-surface-100 transition-colors"><X size={18} aria-hidden /></button>
        </div>

        <div className="p-5 flex flex-col gap-5">
          {/* Title */}
          <div>
            <label className="text-sm font-medium text-surface-700 block mb-1.5">
              Tiêu đề <span className="text-red-500">*</span>
            </label>
            <input
              type="text" value={form.title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="VD: Cá Koi F1 chất lượng cao vừa nhập về"
              className={cn(
                "h-11 w-full rounded-xl border px-4 text-sm outline-none transition-all",
                titleError ? "border-red-400 focus:ring-3 focus:ring-red-100" : "border-surface-200 focus:border-brand-500 focus:ring-3 focus:ring-brand-100"
              )} />
            {titleError && (
              <p className="flex items-center gap-1.5 text-xs text-red-600 mt-1.5">
                <AlertCircle size={12} aria-hidden /> {titleError}
              </p>
            )}
          </div>

          {/* Featured image — uses same crop engine as Banner.
              No URL or path is ever shown to the user (Issue 10).
              Layout: [ImageCropTool preview] then [Xem ảnh][Đổi ảnh] row. */}
          <div>
            <label className="text-sm font-medium text-surface-700 block mb-1.5">
              Ảnh đại diện <span className="text-red-500">*</span>
            </label>
            <input ref={fileRef} type="file" accept="image/*" className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFeaturedImage(f); e.target.value = ""; }} />
            {form.featuredImage ? (
              <div className="flex flex-col gap-3">
                {/* Crop tool — same engine as banner, allows drag/zoom at every level */}
                <ImageCropTool
                  src={form.featuredImage}
                  aspectRatio="16/9"
                  posX={form.featuredImagePosX} posY={form.featuredImagePosY} zoom={form.featuredImageZoom}
                  onPosX={(v) => upd({ featuredImagePosX: v })}
                  onPosY={(v) => upd({ featuredImagePosY: v })}
                  onZoom={(v) => upd({ featuredImageZoom: v })}
                />
                {/* Action buttons — thumbnail + Xem ảnh + Đổi ảnh, no URL */}
                <div className="flex gap-2">
                  <button type="button" onClick={() => setPreviewImg(true)}
                    className="flex-1 h-10 rounded-xl border border-surface-200 text-sm font-medium text-surface-700 hover:border-brand-400 hover:text-brand-700 transition-all">
                    Xem ảnh
                  </button>
                  <button type="button" onClick={() => fileRef.current?.click()}
                    className="flex-1 h-10 rounded-xl border border-surface-200 text-sm font-medium text-surface-700 hover:border-brand-400 hover:text-brand-700 transition-all">
                    Đổi ảnh
                  </button>
                </div>
              </div>
            ) : (
              <button type="button" onClick={() => fileRef.current?.click()}
                className="w-full flex flex-col items-center justify-center gap-2 py-8 rounded-xl border-2 border-dashed border-surface-200 hover:border-brand-400 hover:bg-brand-50 transition-all">
                <Upload size={22} className="text-surface-400" aria-hidden />
                <p className="text-sm font-medium text-surface-700">Nhấn để chọn ảnh đại diện</p>
                <p className="text-xs text-surface-400">JPG, PNG, WebP — Tối đa 15MB</p>
              </button>
            )}
          </div>

          {/* Excerpt */}
          <Textarea
            label="Mô tả ngắn"
            value={form.excerpt}
            onChange={(e) => upd({ excerpt: e.target.value })}
            placeholder="Mô tả ngắn hiển thị ở danh sách tin tức..."
            className="min-h-[80px]"
          />

          <div className="h-px bg-surface-100" />

          {/* Content blocks */}
          <ContentEditor blocks={form.content} onChange={(c) => upd({ content: c })} />

          {/* Published toggle */}
          <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl border border-surface-100 hover:bg-surface-50 transition-colors">
            <div className="relative">
              <input type="checkbox" className="sr-only" checked={form.published} onChange={(e) => upd({ published: e.target.checked })} />
              <div className={cn("w-10 h-5 rounded-full transition-colors", form.published ? "bg-brand-500" : "bg-surface-300")} />
              <div className={cn("absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform", form.published ? "translate-x-5" : "translate-x-0.5")} />
            </div>
            <span className="text-sm font-medium text-surface-700">Hiển thị bài viết này</span>
          </label>

          <div className="flex gap-3 pt-1">
            <Button variant="primary" className="flex-1" onClick={save}>
              {mode === "add" ? "Thêm tin tức" : "Lưu thay đổi"}
            </Button>
            <Button variant="outline" onClick={onClose}>Hủy</Button>
          </div>
        </div>
      </div>

      {previewImg && form.featuredImage && (
        <MediaPreviewModal
          media={{ type: "image", src: form.featuredImage, name: form.title }}
          onClose={() => setPreviewImg(false)}
          onReplace={() => { setPreviewImg(false); fileRef.current?.click(); }}
        />
      )}
    </div>
  );
}

export function AdminNewsClient({ initialNews }: { initialNews: NewsArticle[] }) {
  const [news,      setNews]      = useState<NewsArticle[]>(initialNews);
  const [search,    setSearch]    = useState("");
  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [editing,   setEditing]   = useState<NewsArticle | null>(null);
  const [previewing,setPreviewing]= useState<NewsArticle | null>(null);
  const [toast,     setToast]     = useState<string | null>(null);

  const msg = (t: string) => { setToast(t); setTimeout(() => setToast(null), 3000); };

  const filtered = useMemo(() => {
    if (!search.trim()) return news;
    const q = search.toLowerCase();
    return news.filter((n) => n.title.toLowerCase().includes(q));
  }, [news, search]);

  const toggleVisible = (id: string) => {
    setNews((prev) => prev.map((n) => {
      if (n.id !== id) return n;
      msg(`${!n.published ? "Đã hiện" : "Đã ẩn"} "${n.title}"`);
      return { ...n, published: !n.published, updatedAt: new Date() };
    }));
  };

  const deleteNews = (id: string) => {
    const n = news.find((x) => x.id === id);
    if (!n || !confirm(`Xóa tin tức "${n.title}"?`)) return;
    setNews((prev) => prev.filter((x) => x.id !== id));
    msg(`Đã xóa "${n.title}"`);
  };

  const handleSave = (data: NewsFormData) => {
    if (modalMode === "add") {
      const newArticle: NewsArticle = {
        id: String(Date.now()),
        slug: slugify(data.title),
        title: data.title,
        excerpt: data.excerpt,
        content: data.content,
        featuredImage:     data.featuredImage,
        featuredImagePosX: data.featuredImagePosX,
        featuredImagePosY: data.featuredImagePosY,
        featuredImageZoom: data.featuredImageZoom,
        published: data.published,
        displayOrder: news.length + 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      setNews((p) => [newArticle, ...p]);
      msg(`Đã thêm "${data.title}"`);
    } else if (editing) {
      setNews((p) => p.map((x) => x.id === editing.id
        ? {
            ...x, title: data.title, slug: slugify(data.title), excerpt: data.excerpt,
            content: data.content, featuredImage: data.featuredImage,
            featuredImagePosX: data.featuredImagePosX,
            featuredImagePosY: data.featuredImagePosY,
            featuredImageZoom: data.featuredImageZoom,
            published: data.published, updatedAt: new Date(),
          }
        : x
      ));
      msg(`Đã cập nhật "${data.title}"`);
    }
    setModalMode(null); setEditing(null);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6 md:mb-8 gap-3 flex-wrap">
        <div>
          <h1 className="font-display font-semibold text-2xl md:text-3xl text-surface-800">Quản lý Tin tức</h1>
          <p className="text-sm text-surface-500 mt-1">{news.length} bài viết</p>
        </div>
        <Button variant="primary" onClick={() => { setEditing(null); setModalMode("add"); }}>
          <Plus size={15} aria-hidden /> Thêm tin tức
        </Button>
      </div>

      <div className="relative max-w-xs mb-5">
        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-400 pointer-events-none" aria-hidden />
        <input type="search" value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Tìm tin tức..."
          className="w-full pl-9 pr-4 py-2 rounded-xl border border-surface-200 bg-white text-sm outline-none focus:border-brand-500 focus:ring-3 focus:ring-brand-100" />
      </div>

      <div className="flex flex-col gap-2.5">
        {filtered.map((n) => (
          <div key={n.id} className={cn("bg-white rounded-xl border border-surface-200 shadow-card flex items-center gap-3 px-4 py-3 transition-opacity", !n.published && "opacity-55")}>
            <button onClick={() => setPreviewing(n)} className="relative shrink-0 rounded-lg overflow-hidden w-16 h-12 hover:ring-2 hover:ring-brand-300 transition-all" aria-label="Xem ảnh lớn">
              <img src={n.featuredImage} alt="" style={computeCroppedImageStyle(n.featuredImagePosX ?? 50, n.featuredImagePosY ?? 50, n.featuredImageZoom ?? 1)} />
            </button>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                {!n.published && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-surface-100 text-surface-500">Ẩn</span>}
                <span className="text-[10px] text-surface-400">{formatDate(n.createdAt)}</span>
              </div>
              <p className="text-sm font-medium text-surface-800 truncate">{n.title}</p>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <button onClick={() => { setEditing(n); setModalMode("edit"); }}
                className="p-2 rounded-lg text-surface-400 hover:text-brand-600 hover:bg-brand-50 transition-all" title="Sửa">
                <Edit2 size={14} aria-hidden />
              </button>
              <button onClick={() => toggleVisible(n.id)}
                className="p-2 rounded-lg text-surface-400 hover:text-amber-600 hover:bg-amber-50 transition-all"
                title={n.published ? "Ẩn" : "Hiện"}>
                {n.published ? <EyeOff size={14} aria-hidden /> : <Eye size={14} aria-hidden />}
              </button>
              <button onClick={() => deleteNews(n.id)}
                className="p-2 rounded-lg text-surface-400 hover:text-red-600 hover:bg-red-50 transition-all" title="Xóa">
                <Trash2 size={14} aria-hidden />
              </button>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-16 text-surface-400">
            <p className="text-sm">Không tìm thấy tin tức</p>
          </div>
        )}
      </div>

      {modalMode && (
        <NewsModal
          mode={modalMode}
          article={editing}
          existingTitles={news.map((n) => ({ id: n.id, title: n.title }))}
          onSave={handleSave}
          onClose={() => { setModalMode(null); setEditing(null); }}
        />
      )}

      {previewing && (
        <MediaPreviewModal
          media={{ type: "image", src: previewing.featuredImage, name: previewing.title }}
          onClose={() => setPreviewing(null)}
          onReplace={() => { setEditing(previewing); setModalMode("edit"); setPreviewing(null); }}
          onDelete={() => { deleteNews(previewing.id); setPreviewing(null); }}
        />
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
