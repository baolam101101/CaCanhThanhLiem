"use client";

import React, { useState, useRef } from "react";
import { Plus, Trash2, Eye, EyeOff, X, Upload, Video, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { MediaPreviewModal } from "@/components/admin/MediaPreviewModal";
import { NotConfiguredNotice } from "@/components/admin/NotConfiguredNotice";
import { adminApi, uploadMedia } from "@/lib/admin/client";
import { useBusy } from "@/lib/hooks/use-busy";
import { checkFileForBucket } from "@/lib/admin/media";
import type { AdminVideo } from "@/lib/admin/repo";

// Clips for the homepage "Video thực tế" section (bucket site-videos).
export function AdminVideosClient({ initialVideos, configured }: { initialVideos: AdminVideo[]; configured: boolean }) {
  const [videos,   setVideos]   = useState<AdminVideo[]>(initialVideos);
  const [showForm, setShowForm] = useState(false);
  const [form,     setForm]     = useState<{ title: string; file: File | null; preview: string }>({ title: "", file: null, preview: "" });
  const { run, isBusy } = useBusy();
  const saving = isBusy("save");
  const [formErr,  setFormErr]  = useState("");
  const [toast,    setToast]    = useState<string|null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [previewing, setPreviewing] = useState<AdminVideo | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const msg = (t: string) => { setToast(t); setTimeout(() => setToast(null), 3000); };

  const closeForm = () => {
    if (saving) return;
    if (form.preview) URL.revokeObjectURL(form.preview);
    setForm({ title: "", file: null, preview: "" }); setFormErr(""); setShowForm(false);
  };

  const handleFile = (file: File) => {
    const problem = checkFileForBucket("site-videos", file);
    if (problem) { setFormErr(problem); return; }
    setFormErr("");
    if (form.preview) URL.revokeObjectURL(form.preview);
    setForm((f) => ({ ...f, file, preview: URL.createObjectURL(file) }));
  };

  const save = async () => {
    if (!form.file) { setFormErr("Vui lòng chọn file video"); return; }
    if (!form.title.trim()) { setFormErr("Vui lòng nhập tiêu đề video"); return; }
    setFormErr("");
    const file = form.file;
    const done = await run("save", async () => {
      try {
        const up = await uploadMedia("site-videos", file);
        await adminApi("/api/admin/videos", {
          method: "POST",
          body: { title: form.title, videoUrl: up.url, storagePath: up.path, fileName: file.name },
        });
        const { videos: fresh } = await adminApi<{ videos: AdminVideo[] }>("/api/admin/videos");
        setVideos(fresh);
        return true;
      } catch (e) {
        setFormErr((e as Error).message);
        return false;
      }
    });
    if (done) {
      URL.revokeObjectURL(form.preview);
      setForm({ title: "", file: null, preview: "" });
      setShowForm(false);
      msg("Đã thêm video thành công");
    }
  };

  const toggle = (v: AdminVideo) => run(`row:${v.id}`, async () => {
    const visible = !v.visible;
    setVideos((list) => list.map((x) => (x.id === v.id ? { ...x, visible } : x)));
    try {
      await adminApi(`/api/admin/videos/${v.id}`, { method: "PATCH", body: { visible } });
      msg(visible ? "Đã hiện video" : "Đã ẩn video");
    } catch (e) {
      setVideos((list) => list.map((x) => (x.id === v.id ? { ...x, visible: v.visible } : x)));
      msg((e as Error).message);
    }
  });

  const del = (id: string) => {
    const v = videos.find((x) => x.id === id);
    if (!v || !confirm(`Xoá video "${v.title}"?`)) return;
    return run(`row:${id}`, async () => {
      try {
        await adminApi(`/api/admin/videos/${id}`, { method: "DELETE" });
        setVideos((list) => list.filter((x) => x.id !== id));
        msg("Đã xoá video");
      } catch (e) { msg((e as Error).message); }
    });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6 md:mb-8 gap-3 flex-wrap">
        <div>
          <h1 className="font-display font-semibold text-2xl md:text-3xl text-surface-800">Quản lý Video</h1>
          <p className="text-sm text-surface-500 mt-1">{videos.filter((v)=>v.visible).length}/{videos.length} đang hiển thị</p>
        </div>
        <Button variant="primary" disabled={!configured} onClick={() => setShowForm(true)}><Plus size={15} /> Tạo video mới</Button>
      </div>

      {!configured && <NotConfiguredNotice />}

      <div className="flex flex-col gap-2.5">
        {videos.map((v) => {
          const rowBusy = isBusy(`row:${v.id}`);
          return (
          <div key={v.id} className={cn("bg-white rounded-xl border border-surface-200 shadow-card flex items-center gap-4 px-4 py-3.5 transition-opacity",!v.visible&&"opacity-55")}>
            <button
              onClick={() => v.url && setPreviewing(v)}
              disabled={!v.url}
              className={cn(
                "w-14 h-10 rounded-lg bg-surface-100 border border-surface-200 overflow-hidden shrink-0 flex items-center justify-center transition-all",
                v.url && "hover:ring-2 hover:ring-brand-300 cursor-pointer"
              )}
              aria-label={v.url ? "Xem video" : undefined}
            >
              {v.url ? <video src={`${v.url}#t=0.1`} preload="metadata" className="w-full h-full object-cover" muted playsInline /> : <Video size={16} className="text-surface-400" />}
            </button>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-surface-800 truncate">{v.title}</p>
              <p className="text-xs text-surface-400 mt-0.5">{new Date(v.uploadedAt).toLocaleDateString("vi-VN")}</p>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <button onClick={() => toggle(v)} disabled={rowBusy} className="p-2 rounded-lg text-surface-400 hover:text-amber-600 hover:bg-amber-50 disabled:pointer-events-none transition-all" title={v.visible?"Ẩn":"Hiện"}>
                {rowBusy ? <Loader2 size={15} className="animate-spin" aria-label="Đang xử lý" /> : v.visible?<EyeOff size={15} aria-hidden />:<Eye size={15} aria-hidden />}
              </button>
              <button onClick={() => del(v.id)} disabled={rowBusy} className="p-2 rounded-lg text-surface-400 hover:text-red-600 hover:bg-red-50 disabled:opacity-30 disabled:pointer-events-none transition-all" title="Xóa"><Trash2 size={15} aria-hidden /></button>
            </div>
          </div>
          );
        })}
        {videos.length===0&&(
          <div className="text-center py-16 text-surface-400">
            <Video size={40} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">{'Chưa có video nào. Bấm "Tạo video mới" để bắt đầu.'}</p>
          </div>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/55 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={(e) => e.target===e.currentTarget&&closeForm()}>
          <div className="bg-white w-full sm:max-w-lg rounded-t-2xl sm:rounded-2xl shadow-modal max-h-[92vh] overflow-y-auto animate-slide-up sm:animate-fade-in">
            <div className="sticky top-0 bg-white border-b border-surface-100 flex items-center justify-between px-6 py-4 z-10">
              <h2 className="font-display font-semibold text-lg text-surface-800">Tạo video mới</h2>
              <button onClick={closeForm} disabled={saving} className="p-2 rounded-xl hover:bg-surface-100 transition-colors"><X size={18} aria-hidden /></button>
            </div>
            <div className="p-5 flex flex-col gap-5">
              {formErr && <div role="alert" className="p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">{formErr}</div>}
              <input ref={fileRef} type="file" accept="video/mp4,video/webm,video/quicktime" className="hidden" onChange={(e)=>{const f=e.target.files?.[0];if(f)handleFile(f);e.target.value="";}} />
              <div
                onDragOver={(e)=>{e.preventDefault();setDragOver(true);}}
                onDragLeave={()=>setDragOver(false)}
                onDrop={(e)=>{e.preventDefault();setDragOver(false);const f=e.dataTransfer.files?.[0];if(f)handleFile(f);}}
                onClick={()=>fileRef.current?.click()}
                className={cn("rounded-xl border-2 border-dashed p-8 text-center cursor-pointer transition-all",dragOver?"border-brand-400 bg-brand-50":"border-surface-200 hover:border-brand-400 hover:bg-surface-50")}>
                {form.preview ? (
                  <div className="flex flex-col items-center gap-2">
                    <video src={form.preview} className="w-full max-h-32 rounded-lg object-contain bg-black" muted playsInline controls onClick={(e)=>e.stopPropagation()} />
                    <p className="text-xs text-surface-500">{form.file?.name}</p>
                    <p className="text-xs text-brand-600">Bấm để đổi video khác</p>
                  </div>
                ) : (
                  <>
                    <Upload size={28} className="mx-auto mb-2 text-surface-300" aria-hidden />
                    <p className="text-sm font-medium text-surface-700">Kéo thả video vào đây</p>
                    <p className="text-xs text-surface-400 mt-1">hoặc bấm chọn file · MP4, MOV, WebM · Tối đa 50 MB</p>
                  </>
                )}
              </div>
              <div>
                <label className="text-sm font-medium text-surface-700 block mb-1.5">Tiêu đề video <span className="text-red-500">*</span></label>
                <input type="text" value={form.title} onChange={(e)=>setForm((f)=>({...f,title:e.target.value}))} placeholder="VD: Cá Koi Nhật mới về tháng 6" onKeyDown={(e)=>{ if (e.key==="Enter" && !saving) save(); }}
                  className="h-11 w-full rounded-xl border border-surface-200 px-4 text-sm outline-none focus:border-brand-500 focus:ring-3 focus:ring-brand-100 transition-all" />
              </div>
              {saving && <p className="text-xs text-brand-600 animate-pulse" aria-live="polite">Đang tải video lên, video lớn có thể mất vài phút…</p>}
              <div className="flex gap-3 pt-1">
                <Button variant="primary" className="flex-1" onClick={save} loading={saving}>Lưu video</Button>
                <Button variant="outline" onClick={closeForm} disabled={saving}>Hủy</Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {toast&&<div role="status" aria-live="polite" className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-surface-800 text-white text-sm font-medium px-5 py-3 rounded-xl shadow-float animate-fade-up whitespace-nowrap">{toast}</div>}

      {previewing && previewing.url && (
        <MediaPreviewModal
          media={{ type: "video", src: previewing.url, name: previewing.title }}
          onClose={() => setPreviewing(null)}
          onDelete={() => { del(previewing.id); setPreviewing(null); }}
        />
      )}
    </div>
  );
}
