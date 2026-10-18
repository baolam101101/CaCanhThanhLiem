"use client";

import React, { useState } from "react";
import { Plus, Edit2, Trash2, X, ArrowUp, ArrowDown, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { NotConfiguredNotice } from "@/components/admin/NotConfiguredNotice";
import { adminApi } from "@/lib/admin/client";
import { useBusy } from "@/lib/hooks/use-busy";
import type { Category } from "@/types";

type ModalMode = "add" | "edit" | null;

export function AdminCategoriesClient({ initialCategories, configured }: { initialCategories: Category[]; configured: boolean }) {
  const [cats,    setCats]    = useState<Category[]>(initialCategories);
  const [mode,    setMode]    = useState<ModalMode>(null);
  const [editing, setEditing] = useState<Category | null>(null);
  const [form,    setForm]    = useState({ name: "", description: "" });
  const [err,     setErr]     = useState("");
  const [toast,   setToast]   = useState<string | null>(null);
  const { run, isBusy } = useBusy();
  const saving = isBusy("save");

  const msg = (t: string) => { setToast(t); setTimeout(() => setToast(null), 3000); };
  const sorted = [...cats].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));

  const reload = async () => {
    const { categories } = await adminApi<{ categories: Category[] }>("/api/admin/categories");
    setCats(categories);
  };

  const open = (m: ModalMode, cat?: Category) => {
    setMode(m); setEditing(cat ?? null); setErr("");
    setForm(cat ? { name: cat.name, description: cat.description } : { name: "", description: "" });
  };

  const save = async () => {
    const name = form.name.trim();
    if (!name) { setErr("Vui lòng nhập tên danh mục"); return; }
    setErr("");
    const done = await run("save", async () => {
      try {
        if (mode === "add") {
          await adminApi("/api/admin/categories", { method: "POST", body: { name, description: form.description } });
          msg(`Đã thêm danh mục "${name}"`);
        } else if (editing) {
          await adminApi(`/api/admin/categories/${editing.id}`, { method: "PATCH", body: { name, description: form.description } });
          msg(`Đã cập nhật "${name}"`);
        }
        await reload();
        return true;
      } catch (e) {
        setErr((e as Error).message);
        return false;
      }
    });
    if (done) { setMode(null); setEditing(null); }
  };

  const del = (cat: Category) => {
    if (cat.count > 0) { msg(`Không thể xóa — còn ${cat.count} sản phẩm`); return; }
    if (!confirm(`Xóa danh mục "${cat.name}"?`)) return;
    return run(`row:${cat.id}`, async () => {
      try {
        await adminApi(`/api/admin/categories/${cat.id}`, { method: "DELETE" });
        setCats((p) => p.filter((x) => x.id !== cat.id));
        msg(`Đã xóa "${cat.name}"`);
      } catch (e) { msg((e as Error).message); }
    });
  };

  const toggle = (cat: Category) => run(`row:${cat.id}`, async () => {
    const visible = !(cat.visible ?? true);
    setCats((p) => p.map((c) => c.id === cat.id ? { ...c, visible } : c));
    try {
      await adminApi(`/api/admin/categories/${cat.id}`, { method: "PATCH", body: { visible } });
    } catch (e) {
      setCats((p) => p.map((c) => c.id === cat.id ? { ...c, visible: !visible } : c));
      msg((e as Error).message);
    }
  });

  const move = (id: string | undefined, dir: "up" | "down") => run("reorder", async () => {
    const arr = [...sorted];
    const i = arr.findIndex((c) => c.id === id);
    const j = dir === "up" ? i - 1 : i + 1;
    if (j < 0 || j >= arr.length) return;
    [arr[i], arr[j]] = [arr[j], arr[i]];
    const previous = cats;
    setCats(arr.map((c, k) => ({ ...c, sortOrder: k + 1 })));
    try {
      await adminApi("/api/admin/reorder", { method: "POST", body: { table: "categories", ids: arr.map((c) => c.id) } });
    } catch (e) {
      setCats(previous);
      msg((e as Error).message);
    }
  });
  const reordering = isBusy("reorder");

  return (
    <div>
      <div className="flex items-center justify-between mb-6 md:mb-8 gap-3 flex-wrap">
        <div>
          <h1 className="font-display font-semibold text-2xl md:text-3xl text-surface-800">Quản lý danh mục</h1>
          <p className="text-sm text-surface-500 mt-1">{cats.length} danh mục</p>
        </div>
        <Button variant="primary" onClick={() => open("add")} disabled={!configured}><Plus size={15} /> Thêm danh mục</Button>
      </div>

      {!configured && <NotConfiguredNotice />}

      {configured && cats.length === 0 && (
        <p className="py-16 text-center text-sm text-surface-400 bg-white rounded-xl border border-surface-200">
          Chưa có danh mục nào. Bấm “Thêm danh mục” để tạo danh mục đầu tiên.
        </p>
      )}

      <div className="flex flex-col gap-2">
        {sorted.map((cat, i) => {
          const rowBusy = isBusy(`row:${cat.id}`);
          return (
          <div key={cat.id} className={cn("bg-white rounded-xl border border-surface-200 shadow-card flex items-center gap-3 px-4 py-3.5", !cat.visible && "opacity-55")}>
            <div className="w-1 self-stretch rounded-full shrink-0" style={{ backgroundColor: "#A8CF36", opacity: cat.visible ? 1 : 0.4 }} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-0.5">
                <p className="font-semibold text-sm text-surface-800">{cat.name}</p>
                {!cat.visible && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-surface-100 text-surface-500">Ẩn</span>}
                <span className="text-[10px] text-surface-400 bg-surface-50 px-2 py-0.5 rounded-full">{cat.count} sp</span>
              </div>
              {cat.description && <p className="text-xs text-surface-500 truncate hidden sm:block">{cat.description}</p>}

            </div>
            <div className="flex flex-col gap-0.5 shrink-0">
              <button onClick={() => move(cat.id, "up")} disabled={i === 0 || reordering} className="w-9 h-9 md:w-7 md:h-7 inline-flex items-center justify-center rounded-lg text-surface-400 hover:text-brand-600 hover:bg-brand-50 disabled:opacity-20 transition-all"><ArrowUp size={13} /></button>
              <button onClick={() => move(cat.id, "down")} disabled={i === sorted.length - 1 || reordering} className="w-9 h-9 md:w-7 md:h-7 inline-flex items-center justify-center rounded-lg text-surface-400 hover:text-brand-600 hover:bg-brand-50 disabled:opacity-20 transition-all"><ArrowDown size={13} /></button>
            </div>
            <div className="flex items-center gap-1 pl-2 border-l border-surface-100 shrink-0">
              <button onClick={() => open("edit", cat)} className="w-10 h-10 md:w-8 md:h-8 inline-flex items-center justify-center rounded-lg text-surface-400 hover:text-brand-600 hover:bg-brand-50 transition-all" title="Sửa"><Edit2 size={14} /></button>
              <button onClick={() => toggle(cat)} disabled={rowBusy} className="w-10 h-10 md:w-8 md:h-8 inline-flex items-center justify-center rounded-lg text-xs font-semibold text-surface-400 hover:text-amber-700 hover:bg-amber-50 disabled:pointer-events-none transition-all">
                {rowBusy ? <Loader2 size={14} className="animate-spin" aria-label="Đang xử lý" /> : cat.visible ? "Ẩn" : "Hiện"}
              </button>
              <button onClick={() => del(cat)} disabled={rowBusy} className="w-10 h-10 md:w-8 md:h-8 inline-flex items-center justify-center rounded-lg text-surface-400 hover:text-red-600 hover:bg-red-50 disabled:opacity-30 disabled:pointer-events-none transition-all" title="Xóa"><Trash2 size={14} /></button>
            </div>
          </div>
          );
        })}
      </div>

      {mode && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={(e) => e.target === e.currentTarget && !saving && setMode(null)}>
          <div className="bg-white w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl shadow-modal max-h-[92vh] overflow-y-auto animate-slide-up sm:animate-fade-in">
            <div className="sticky top-0 bg-white border-b border-surface-100 flex items-center justify-between px-6 py-4 z-10">
              <h2 className="font-display font-semibold text-lg">{mode === "add" ? "Thêm danh mục" : "Chỉnh sửa danh mục"}</h2>
              <button onClick={() => setMode(null)} disabled={saving} className="p-2 rounded-xl hover:bg-surface-100 transition-colors"><X size={18} /></button>
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
                <Button variant="primary" className="flex-1" onClick={save} loading={saving}>{mode === "add" ? "Thêm danh mục" : "Lưu thay đổi"}</Button>
                <Button variant="outline" onClick={() => setMode(null)} disabled={saving}>Hủy</Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {toast && <div role="status" aria-live="polite" className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-surface-800 text-white text-sm font-medium px-5 py-3 rounded-xl shadow-float animate-fade-up whitespace-nowrap">{toast}</div>}
    </div>
  );
}
