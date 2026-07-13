"use client";

import React, { useState } from "react";
import { Plus, Edit2, Trash2, X, ArrowUp, ArrowDown } from "lucide-react";
import { cn, slugify } from "@/lib/utils";
import { Button } from "@/components/ui/Button";

interface Category {
  id: string; slug: string; name: string; description: string;
  productCount: number; visible: boolean; order: number;
}

const INITIAL: Category[] = [
  { id:"c1", slug:"ca-koi",       name:"Cá Koi",       description:"Cá chép Koi Việt & Nhật nhập khẩu chính hãng", productCount:12, visible:true, order:1 },
  { id:"c2", slug:"ca-dia",       name:"Cá Đĩa",       description:"Vua của cá nhiệt đới nước ngọt",               productCount:8,  visible:true, order:2 },
  { id:"c3", slug:"ca-la-han",    name:"Cá La Hán",    description:"Biểu tượng may mắn và thịnh vượng",             productCount:6,  visible:true, order:3 },
  { id:"c4", slug:"ca-nhiet-doi", name:"Cá Nhiệt Đới", description:"Đa dạng các loài cá nhiệt đới",                 productCount:20, visible:true, order:4 },
  { id:"c5", slug:"ca-rong",      name:"Cá Rồng",      description:"Loài cá quý hiếm nhất trong thế giới cá cảnh",  productCount:4,  visible:true, order:5 },
  { id:"c6", slug:"phu-kien",     name:"Phụ Kiện",     description:"Thiết bị, thức ăn và phụ kiện hồ cá",           productCount:30, visible:true, order:6 },
];

type ModalMode = "add" | "edit" | null;

export function AdminCategoriesClient() {
  const [cats,    setCats]    = useState<Category[]>(INITIAL);
  const [mode,    setMode]    = useState<ModalMode>(null);
  const [editing, setEditing] = useState<Category | null>(null);
  const [form,    setForm]    = useState({ name: "", description: "" });
  const [err,     setErr]     = useState("");
  const [toast,   setToast]   = useState<string | null>(null);

  const msg = (t: string) => { setToast(t); setTimeout(() => setToast(null), 3000); };
  const sorted = [...cats].sort((a, b) => a.order - b.order);

  const open = (m: ModalMode, cat?: Category) => {
    setMode(m); setEditing(cat ?? null); setErr("");
    setForm(cat ? { name: cat.name, description: cat.description } : { name: "", description: "" });
  };

  const save = () => {
    const name = form.name.trim();
    if (!name) { setErr("Vui lòng nhập tên danh mục"); return; }
    const slug = slugify(name);
    if (mode === "add") {
      if (cats.find((c) => c.slug === slug)) { setErr("Danh mục này đã tồn tại"); return; }
      setCats((p) => [...p, { id: `c_${Date.now()}`, slug, name, description: form.description, productCount: 0, visible: true, order: p.length + 1 }]);
      msg(`Đã thêm danh mục "${name}"`);
    } else if (editing) {
      setCats((p) => p.map((c) => c.id === editing.id ? { ...c, name, slug, description: form.description } : c));
      msg(`Đã cập nhật "${name}"`);
    }
    setMode(null); setEditing(null);
  };

  const del = (id: string) => {
    const c = cats.find((x) => x.id === id);
    if (!c) return;
    if (c.productCount > 0) { msg(`Không thể xóa — còn ${c.productCount} sản phẩm`); return; }
    if (!confirm(`Xóa danh mục "${c.name}"?`)) return;
    setCats((p) => p.filter((x) => x.id !== id)); msg(`Đã xóa "${c.name}"`);
  };

  const toggle = (id: string) => setCats((p) => p.map((c) => c.id === id ? { ...c, visible: !c.visible } : c));

  const move = (id: string, dir: "up" | "down") => {
    setCats((prev) => {
      const arr = [...prev].sort((a, b) => a.order - b.order);
      const i = arr.findIndex((c) => c.id === id);
      const j = dir === "up" ? i - 1 : i + 1;
      if (j < 0 || j >= arr.length) return prev;
      [arr[i].order, arr[j].order] = [arr[j].order, arr[i].order];
      return arr;
    });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6 md:mb-8 gap-3 flex-wrap">
        <div>
          <h1 className="font-display font-semibold text-2xl md:text-3xl text-surface-800">Quản lý danh mục</h1>
          <p className="text-sm text-surface-500 mt-1">{cats.length} danh mục</p>
        </div>
        <Button variant="primary" onClick={() => open("add")}><Plus size={15} /> Thêm danh mục</Button>
      </div>

      <div className="flex flex-col gap-2">
        {sorted.map((cat, i) => (
          <div key={cat.id} className={cn("bg-white rounded-xl border border-surface-200 shadow-card flex items-center gap-3 px-4 py-3.5", !cat.visible && "opacity-55")}>
            <div className="w-1 self-stretch rounded-full shrink-0" style={{ backgroundColor: "#A8CF36", opacity: cat.visible ? 1 : 0.4 }} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-0.5">
                <p className="font-semibold text-sm text-surface-800">{cat.name}</p>
                {!cat.visible && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-surface-100 text-surface-500">Ẩn</span>}
                <span className="text-[10px] text-surface-400 bg-surface-50 px-2 py-0.5 rounded-full">{cat.productCount} sp</span>
              </div>
              {cat.description && <p className="text-xs text-surface-500 truncate hidden sm:block">{cat.description}</p>}

            </div>
            <div className="flex flex-col gap-0.5 shrink-0">
              <button onClick={() => move(cat.id, "up")} disabled={i === 0} className="p-1.5 rounded-lg text-surface-400 hover:text-brand-600 hover:bg-brand-50 disabled:opacity-20 transition-all"><ArrowUp size={13} /></button>
              <button onClick={() => move(cat.id, "down")} disabled={i === sorted.length - 1} className="p-1.5 rounded-lg text-surface-400 hover:text-brand-600 hover:bg-brand-50 disabled:opacity-20 transition-all"><ArrowDown size={13} /></button>
            </div>
            <div className="flex items-center gap-1 pl-2 border-l border-surface-100 shrink-0">
              <button onClick={() => open("edit", cat)} className="p-2 rounded-lg text-surface-400 hover:text-brand-600 hover:bg-brand-50 transition-all" title="Sửa"><Edit2 size={14} /></button>
              <button onClick={() => toggle(cat.id)} className="p-2 rounded-lg text-xs font-semibold text-surface-400 hover:text-amber-700 hover:bg-amber-50 transition-all">{cat.visible ? "Ẩn" : "Hiện"}</button>
              <button onClick={() => del(cat.id)} className="p-2 rounded-lg text-surface-400 hover:text-red-600 hover:bg-red-50 transition-all" title="Xóa"><Trash2 size={14} /></button>
            </div>
          </div>
        ))}
      </div>

      {mode && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={(e) => e.target === e.currentTarget && setMode(null)}>
          <div className="bg-white w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl shadow-modal max-h-[92vh] overflow-y-auto animate-slide-up sm:animate-fade-in">
            <div className="sticky top-0 bg-white border-b border-surface-100 flex items-center justify-between px-6 py-4 z-10">
              <h2 className="font-display font-semibold text-lg">{mode === "add" ? "Thêm danh mục" : "Chỉnh sửa danh mục"}</h2>
              <button onClick={() => setMode(null)} className="p-2 rounded-xl hover:bg-surface-100 transition-colors"><X size={18} /></button>
            </div>
            <div className="p-6 flex flex-col gap-4">
              {err && <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">{err}</div>}
              <div>
                <label className="text-sm font-medium text-surface-700 block mb-1.5">Tên danh mục <span className="text-red-500">*</span></label>
                <input type="text" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="VD: Cá Koi Nhật Bản" autoFocus
                  className="h-11 w-full rounded-xl border border-surface-200 px-4 text-sm outline-none focus:border-brand-500 focus:ring-3 focus:ring-brand-100 transition-all" />
              </div>
              <div>
                <label className="text-sm font-medium text-surface-700 block mb-1.5">Mô tả <span className="text-surface-400 font-normal text-xs">(không bắt buộc)</span></label>
                <textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  placeholder="Mô tả ngắn về danh mục..." rows={3}
                  className="w-full rounded-xl border border-surface-200 px-4 py-3 text-sm outline-none focus:border-brand-500 focus:ring-3 focus:ring-brand-100 transition-all resize-none" />
              </div>
              <div className="flex gap-3 pt-1">
                <Button variant="primary" className="flex-1" onClick={save}>{mode === "add" ? "Thêm danh mục" : "Lưu thay đổi"}</Button>
                <Button variant="outline" onClick={() => setMode(null)}>Hủy</Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {toast && <div role="status" aria-live="polite" className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-surface-800 text-white text-sm font-medium px-5 py-3 rounded-xl shadow-float animate-fade-up whitespace-nowrap">{toast}</div>}
    </div>
  );
}
