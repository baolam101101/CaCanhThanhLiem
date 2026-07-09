"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Lock, User, ArrowRight, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export function AdminLoginClient() {
  const router = useRouter();
  const [form,    setForm]    = useState({ username: "", password: "" });
  const [showPw,  setShowPw]  = useState(false);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.username.trim() || !form.password.trim()) { setError("Vui long dien day du thong tin"); return; }
    setLoading(true); setError("");
    try {
      const res  = await fetch("/api/admin/login", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(form) });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Dang nhap that bai"); return; }
      router.push("/admin"); router.refresh();
    } catch { setError("Khong the ket noi. Vui long thu lai."); }
    finally   { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-5 bg-surface-50">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-14 h-14 rounded-xl overflow-hidden mb-4" style={{ border: "2px solid #A8CF36" }}>
            <Image src="/images/logo.jpg" alt="Logo" width={56} height={56} className="object-cover w-full h-full" />
          </div>
          <p className="font-display font-semibold text-xl text-surface-800">Ca Canh Thanh Liem</p>
          <p className="text-sm text-surface-400 mt-1">He thong quan tri</p>
        </div>

        {error && (
          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-red-50 border border-red-200 mb-5">
            <AlertCircle size={15} className="text-red-500 mt-0.5 shrink-0" aria-hidden />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-surface-700" htmlFor="login-u">Ten dang nhap</label>
            <div className="relative">
              <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-400 pointer-events-none" aria-hidden />
              <input id="login-u" type="text" value={form.username}
                onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))}
                placeholder="admin" autoComplete="username" autoCapitalize="none" disabled={loading}
                className={cn("w-full h-12 pl-10 pr-4 rounded-xl border bg-white text-sm outline-none transition-all", "border-surface-200 hover:border-surface-300 focus:border-brand-500 focus:ring-3 focus:ring-brand-100", loading && "opacity-60")} />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-surface-700" htmlFor="login-p">Mat khau</label>
            <div className="relative">
              <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-400 pointer-events-none" aria-hidden />
              <input id="login-p" type={showPw ? "text" : "password"} value={form.password}
                onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                placeholder="••••••••" autoComplete="current-password" disabled={loading}
                className={cn("w-full h-12 pl-10 pr-12 rounded-xl border bg-white text-sm outline-none transition-all", "border-surface-200 hover:border-surface-300 focus:border-brand-500 focus:ring-3 focus:ring-brand-100", loading && "opacity-60")} />
              <button type="button" onClick={() => setShowPw((v) => !v)} disabled={loading}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-600 p-1 rounded"
                aria-label={showPw ? "An mat khau" : "Hien mat khau"}>
                {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>
          <button type="submit" disabled={loading}
            className={cn("mt-1 h-12 w-full rounded-xl text-sm font-semibold flex items-center justify-center gap-2 text-surface-900 transition-all hover:brightness-95 active:scale-[0.99]", loading && "opacity-60 cursor-not-allowed")}
            style={{ backgroundColor: "#A8CF36" }}>
            {loading
              ? <><svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>Dang dang nhap...</>
              : <>Dang nhap<ArrowRight size={16} aria-hidden /></>
            }
          </button>
        </form>
        <p className="text-xs text-surface-400 text-center mt-8">
          Mac dinh: <code className="font-mono bg-surface-100 px-1.5 py-0.5 rounded text-surface-500">admin</code> / <code className="font-mono bg-surface-100 px-1.5 py-0.5 rounded text-surface-500">TL@Admin2025</code>
        </p>
      </div>
    </div>
  );
}
