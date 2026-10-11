"use client";
import React, { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import type { ContactFormData, FormState } from "@/types";

const SUBJECTS = ["Hỏi về cá Koi","Yêu cầu báo giá","Tư vấn hồ cá","Hỏi về phụ kiện","Khiếu nại / Góp ý","Khác"];
const INITIAL: ContactFormData = { name: "", phone: "", subject: SUBJECTS[0], message: "" };

export function ContactClient() {
  const [form, setForm]           = useState<ContactFormData>(INITIAL);
  // Honeypot: hidden from people, filled in by spam bots.
  const [website, setWebsite]     = useState("");
  const [errors, setErrors]       = useState<Partial<ContactFormData>>({});
  const [formState, setFormState] = useState<FormState>({ status: "idle" });

  const set = <K extends keyof ContactFormData>(f: K, v: ContactFormData[K]) => {
    setForm((p) => ({ ...p, [f]: v }));
    if (errors[f]) setErrors((p) => ({ ...p, [f]: "" }));
  };

  const validate = () => {
    const e: Partial<ContactFormData> = {};
    if (!form.name.trim())    e.name    = "Vui lòng nhập họ tên";
    if (!form.phone.trim())   e.phone   = "Vui lòng nhập số điện thoại";
    else if (form.phone.replace(/\D/g, "").length < 8) e.phone = "Số điện thoại không hợp lệ";
    if (!form.message.trim()) e.message = "Vui lòng nhập nội dung";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    setFormState({ status: "loading" });
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, website }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setFormState({ status: "error", message: data.error ?? "Chưa gửi được tin nhắn, vui lòng thử lại" });
        return;
      }
      setFormState({ status: "success" });
    } catch {
      setFormState({ status: "error", message: "Không kết nối được máy chủ, vui lòng kiểm tra mạng rồi thử lại" });
    }
  };

  if (formState.status === "success") return (
    <div className="bg-white rounded-3xl border border-surface-200 shadow-lifted p-10 text-center">
      <div className="flex justify-center mb-5">
        <div className="w-16 h-16 rounded-full border-2 flex items-center justify-center" style={{ backgroundColor: "#f6fbea", borderColor: "#d4eba3" }}>
          <CheckCircle2 size={32} style={{ color: "#739620" }} />
        </div>
      </div>
      <h3 className="font-display text-2xl font-light text-surface-800 mb-3">Đã gửi thành công!</h3>
      <p className="text-sm text-surface-500 leading-relaxed mb-6">Chúng tôi sẽ liên hệ lại với bạn sớm nhất.</p>
      <Button variant="secondary" onClick={() => { setFormState({ status: "idle" }); setForm(INITIAL); }}>
        Gửi tin nhắn khác
      </Button>
    </div>
  );

  return (
    <form onSubmit={handleSubmit} noValidate className="relative bg-white rounded-3xl border border-surface-200 shadow-lifted p-7">
      <div className="mb-6">
        <h2 className="font-display text-2xl font-light text-surface-800 mb-2">Gửi tin nhắn</h2>
        <p className="text-sm text-surface-500">Có câu hỏi về cá Koi? Chúng tôi tư vấn miễn phí.</p>
      </div>
      <div className="flex flex-col gap-4">
        <Input label="Họ và tên" placeholder="Nguyễn Văn A" value={form.name} onChange={(e) => set("name", e.target.value)} error={errors.name} required autoComplete="name" />
        <Input label="Số điện thoại" type="tel" placeholder="0931 444 240" value={form.phone} onChange={(e) => set("phone", e.target.value)} error={errors.phone} required autoComplete="tel" />
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-surface-600">Chủ đề</label>
          <select value={form.subject} onChange={(e) => set("subject", e.target.value)} className="h-11 w-full rounded-xl border border-surface-200 bg-white px-4 text-sm outline-none focus:border-brand-400 focus:ring-3 focus:ring-brand-100">
            {SUBJECTS.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <Textarea label="Nội dung" placeholder="Mô tả chi tiết câu hỏi..." value={form.message} onChange={(e) => set("message", e.target.value)} error={errors.message} required className="min-h-[120px]" />
      </div>
      {/* Honeypot — keep it out of sight and out of the tab order. */}
      <div aria-hidden="true" style={{ position: "absolute", left: "-10000px", width: 1, height: 1, overflow: "hidden" }}>
        <label>Website<input type="text" tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} /></label>
      </div>
      {formState.status === "error" && (
        <p role="alert" className="mt-5 p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">{formState.message}</p>
      )}
      <Button type="submit" variant="primary" size="lg" loading={formState.status === "loading"} className="w-full mt-6">
        Gửi tin nhắn
      </Button>
    </form>
  );
}
