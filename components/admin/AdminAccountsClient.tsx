"use client";

import React, { useState } from "react";
import { Plus, Trash2, X, Shield, User, Eye, EyeOff, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import type { Account } from "@/lib/auth/accounts";

interface AdminAccountsClientProps {
  initialAccounts: Account[];
}

export function AdminAccountsClient({ initialAccounts }: AdminAccountsClientProps) {
  const [accounts, setAccounts] = useState<Account[]>(initialAccounts);
  const [showModal, setShowModal] = useState(false);
  const [toast, setToast]         = useState<{ msg: string; ok: boolean } | null>(null);
  const [loading, setLoading]     = useState(false);
  const [form, setForm] = useState({ username: "", password: "", displayName: "" });
  const [showPw, setShowPw] = useState(false);
  const [formError, setFormError] = useState("");

  const showMsg = (msg: string, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3500);
  };

  const loadAccounts = async () => {
    const res = await fetch("/api/admin/accounts");
    if (res.ok) {
      const data = await res.json();
      setAccounts(data.accounts);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    if (!form.username.trim() || !form.password.trim() || !form.displayName.trim()) {
      setFormError("Vui lòng điền đầy đủ thông tin"); return;
    }
    if (form.password.length < 6) {
      setFormError("Mật khẩu tối thiểu 6 ký tự"); return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/admin/accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { setFormError(data.error); return; }
      await loadAccounts();
      setShowModal(false);
      setForm({ username: "", password: "", displayName: "" });
      showMsg("Đã tạo tài khoản thành công!");
    } catch {
      setFormError("Lỗi kết nối");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Xóa tài khoản "${name}"? Hành động không thể hoàn tác.`)) return;
    const res = await fetch("/api/admin/accounts", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    const data = await res.json();
    if (!res.ok) { showMsg(data.error, false); return; }
    await loadAccounts();
    showMsg(`Đã xóa tài khoản "${name}"`);
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-light text-surface-800">
            Quản lý tài khoản
          </h1>
          <p className="text-sm text-surface-400 mt-1">
            {accounts.length} tài khoản — chỉ Admin gốc có quyền trang này
          </p>
        </div>
        <Button variant="primary" onClick={() => setShowModal(true)}>
          <Plus size={15} /> Tạo tài khoản
        </Button>
      </div>

      {/* Accounts list */}
      <div className="bg-white rounded-2xl border border-surface-200 shadow-card overflow-hidden">
        <ul role="list">
          {accounts.map((acc, i) => (
            <li
              key={acc.id}
              className={cn(
                "flex items-center gap-4 px-5 py-4 transition-colors hover:bg-surface-50",
                i < accounts.length - 1 && "border-b border-surface-100"
              )}
            >
              {/* Avatar */}
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-surface-900 shrink-0"
                style={{ backgroundColor: acc.role === "superadmin" ? "#A8CF36" : "#e0ddd5" }}
              >
                {acc.displayName.charAt(0).toUpperCase()}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-sm font-semibold text-surface-800">{acc.displayName}</p>
                  {acc.role === "superadmin" ? (
                    <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full text-surface-900"
                      style={{ backgroundColor: "#A8CF36" }}>
                      <Shield size={10} /> Superadmin
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-surface-100 text-surface-600">
                      <User size={10} /> Nhân viên
                    </span>
                  )}
                </div>
                <p className="text-xs text-surface-400 font-mono mt-0.5">@{acc.username}</p>
              </div>

              {/* Created */}
              <div className="hidden sm:block text-right shrink-0">
                <p className="text-xs text-surface-400">
                  {new Date(acc.createdAt).toLocaleDateString("vi-VN")}
                </p>
              </div>

              {/* Delete */}
              {acc.role !== "superadmin" && (
                <button
                  onClick={() => handleDelete(acc.id, acc.displayName)}
                  className="p-2 rounded-lg text-surface-400 hover:text-red-600 hover:bg-red-50 transition-all shrink-0"
                  aria-label={`Xóa tài khoản ${acc.displayName}`}
                >
                  <Trash2 size={15} />
                </button>
              )}
            </li>
          ))}
        </ul>
      </div>

      {/* Info box */}
      <div className="mt-5 p-4 rounded-2xl bg-brand-50 border border-brand-100">
        <p className="text-sm text-brand-700 font-medium mb-1">Phân quyền tài khoản</p>
        <ul className="text-sm text-brand-600 space-y-1">
          <li>• <strong>Superadmin</strong>: Toàn quyền — thêm/xóa sản phẩm, video, banner, tài khoản</li>
          <li>• <strong>Nhân viên</strong>: Thêm/sửa/xóa sản phẩm, video, banner — không quản lý tài khoản</li>
        </ul>
      </div>

      {/* Create modal */}
      {showModal && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
          onClick={(e) => e.target === e.currentTarget && setShowModal(false)}
        >
          <div className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl shadow-float p-7">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-xl font-light text-surface-800">Tạo tài khoản mới</h2>
              <button onClick={() => setShowModal(false)} className="p-2 rounded-lg hover:bg-surface-100">
                <X size={18} />
              </button>
            </div>

            {formError && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-200 mb-4">
                <AlertCircle size={15} className="text-red-500 shrink-0" />
                <p className="text-sm text-red-700">{formError}</p>
              </div>
            )}

            <form onSubmit={handleCreate} className="flex flex-col gap-4">
              {[
                { key: "displayName", label: "Họ tên hiển thị", placeholder: "VD: Nguyễn Văn A", type: "text" },
                { key: "username",    label: "Tên đăng nhập",   placeholder: "VD: nhanvien1",   type: "text" },
              ].map(({ key, label, placeholder, type }) => (
                <div key={key} className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-surface-600">{label}</label>
                  <input
                    type={type}
                    value={form[key as keyof typeof form]}
                    onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                    placeholder={placeholder}
                    autoCapitalize="none"
                    className="h-11 w-full rounded-xl border border-surface-200 px-4 text-sm outline-none focus:border-brand-400 focus:ring-3 focus:ring-brand-100"
                  />
                </div>
              ))}

              {/* Password */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-surface-600">Mật khẩu</label>
                <div className="relative">
                  <input
                    type={showPw ? "text" : "password"}
                    value={form.password}
                    onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                    placeholder="Tối thiểu 6 ký tự"
                    className="h-11 w-full rounded-xl border border-surface-200 px-4 pr-11 text-sm outline-none focus:border-brand-400 focus:ring-3 focus:ring-brand-100"
                  />
                  <button type="button" onClick={() => setShowPw((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-600">
                    {showPw ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-surface-50 text-xs text-surface-500">
                ℹ Tài khoản mới sẽ có vai trò <strong>Nhân viên</strong> — có thể quản lý sản phẩm, video, banner nhưng không tạo/xóa tài khoản.
              </div>

              <div className="flex gap-3 pt-1">
                <Button type="submit" variant="primary" className="flex-1" loading={loading}>
                  Tạo tài khoản
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowModal(false)}>
                  Hủy
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div role="status" aria-live="polite"
          className={cn(
            "fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-xl shadow-float text-sm font-medium animate-fade-up",
            toast.ok ? "bg-surface-800 text-white" : "bg-red-600 text-white"
          )}>
          {toast.msg}
        </div>
      )}
    </div>
  );
}
