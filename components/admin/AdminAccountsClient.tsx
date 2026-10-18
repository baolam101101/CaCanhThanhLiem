"use client";

import React, { useState } from "react";
import { Plus, Trash2, X, Shield, User, Eye, EyeOff, AlertCircle, KeyRound, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { useBusy } from "@/lib/hooks/use-busy";
import type { Account } from "@/lib/auth/accounts";

interface AdminAccountsClientProps {
  initialAccounts: Account[];
  currentUserId: string;
}

const MIN_PASSWORD = 8;

export function AdminAccountsClient({ initialAccounts, currentUserId }: AdminAccountsClientProps) {
  // Password change: the account being edited, the two inputs, and state.
  const [pwTarget, setPwTarget] = useState<Account | null>(null);
  const [pwForm, setPwForm]     = useState({ password: "", confirm: "" });
  const [pwError, setPwError]   = useState("");
  const { run, isBusy } = useBusy();
  const pwSaving = isBusy("password");
  const [accounts, setAccounts] = useState<Account[]>(initialAccounts);
  const [showModal, setShowModal] = useState(false);
  const [toast, setToast]         = useState<{ msg: string; ok: boolean } | null>(null);
  const loading = isBusy("create");
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
    if (form.password.length < MIN_PASSWORD) {
      setFormError(`Mật khẩu tối thiểu ${MIN_PASSWORD} ký tự`); return;
    }
    const done = await run("create", async () => {
      try {
        const res = await fetch("/api/admin/accounts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        const data = await res.json();
        if (!res.ok) { setFormError(data.error); return false; }
        await loadAccounts();
        return true;
      } catch {
        setFormError("Lỗi kết nối");
        return false;
      }
    });
    if (done) {
      setShowModal(false);
      setForm({ username: "", password: "", displayName: "" });
      showMsg("Đã tạo tài khoản thành công!");
    }
  };

  const handleDelete = (id: string, name: string) => {
    if (!confirm(`Xóa tài khoản "${name}"? Hành động không thể hoàn tác.`)) return;
    return run(`row:${id}`, async () => {
      try {
        const res = await fetch("/api/admin/accounts", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) { showMsg(data.error ?? "Không xóa được tài khoản", false); return; }
        await loadAccounts();
        showMsg(`Đã xóa tài khoản "${name}"`);
      } catch {
        showMsg("Lỗi kết nối", false);
      }
    });
  };

  const openPassword = (acc: Account) => {
    setPwTarget(acc); setPwForm({ password: "", confirm: "" }); setPwError("");
  };

  const handlePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pwTarget) return;
    if (pwForm.password.length < MIN_PASSWORD) { setPwError(`Mật khẩu tối thiểu ${MIN_PASSWORD} ký tự`); return; }
    if (pwForm.password !== pwForm.confirm) { setPwError("Hai mật khẩu không khớp"); return; }
    setPwError("");
    const target = pwTarget;
    const done = await run("password", async () => {
      try {
        const res = await fetch("/api/admin/accounts", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: target.id, password: pwForm.password }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) { setPwError(data.error ?? "Không đổi được mật khẩu"); return false; }
        return true;
      } catch {
        setPwError("Lỗi kết nối");
        return false;
      }
    });
    if (done) {
      showMsg(`Đã đổi mật khẩu cho "${target.displayName}"`);
      setPwTarget(null);
    }
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

              {/* Change password */}
              <button
                onClick={() => openPassword(acc)}
                className="w-10 h-10 md:w-8 md:h-8 inline-flex items-center justify-center rounded-lg text-surface-400 hover:text-brand-600 hover:bg-brand-50 transition-all shrink-0"
                aria-label={`Đổi mật khẩu ${acc.displayName}`}
                title="Đổi mật khẩu"
              >
                <KeyRound size={15} />
              </button>

              {/* Delete */}
              {acc.role !== "superadmin" && acc.id !== currentUserId && (
                <button
                  onClick={() => handleDelete(acc.id, acc.displayName)}
                  disabled={isBusy(`row:${acc.id}`)}
                  className="w-10 h-10 md:w-8 md:h-8 inline-flex items-center justify-center rounded-lg text-surface-400 hover:text-red-600 hover:bg-red-50 disabled:pointer-events-none transition-all shrink-0"
                  aria-label={`Xóa tài khoản ${acc.displayName}`}
                >
                  {isBusy(`row:${acc.id}`) ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
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

      {/* Change-password modal */}
      {pwTarget && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
          onClick={(e) => e.target === e.currentTarget && !pwSaving && setPwTarget(null)}
        >
          <form onSubmit={handlePassword} className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl shadow-float p-7 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-xl font-light text-surface-800">Đổi mật khẩu</h2>
              <button type="button" onClick={() => setPwTarget(null)} disabled={pwSaving} className="p-2 rounded-lg hover:bg-surface-100">
                <X size={18} />
              </button>
            </div>
            <p className="text-sm text-surface-500">Tài khoản: <strong>{pwTarget.displayName}</strong> (@{pwTarget.username})</p>
            {pwError && (
              <div role="alert" className="flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">
                <AlertCircle size={15} className="shrink-0" /> {pwError}
              </div>
            )}
            <input type="password" autoComplete="new-password" placeholder={`Mật khẩu mới (tối thiểu ${MIN_PASSWORD} ký tự)`}
              value={pwForm.password} onChange={(e) => setPwForm((f) => ({ ...f, password: e.target.value }))}
              className="h-11 w-full rounded-xl border border-surface-200 px-4 text-sm outline-none focus:border-brand-500 focus:ring-3 focus:ring-brand-100" />
            <input type="password" autoComplete="new-password" placeholder="Nhập lại mật khẩu mới"
              value={pwForm.confirm} onChange={(e) => setPwForm((f) => ({ ...f, confirm: e.target.value }))}
              className="h-11 w-full rounded-xl border border-surface-200 px-4 text-sm outline-none focus:border-brand-500 focus:ring-3 focus:ring-brand-100" />
            <div className="flex gap-3 pt-1">
              <Button type="submit" variant="primary" className="flex-1" loading={pwSaving}>Đổi mật khẩu</Button>
              <Button type="button" variant="outline" onClick={() => setPwTarget(null)} disabled={pwSaving}>Hủy</Button>
            </div>
          </form>
        </div>
      )}

      {/* Create modal */}
      {showModal && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
          onClick={(e) => e.target === e.currentTarget && !loading && setShowModal(false)}
        >
          <div className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl shadow-float p-7">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-xl font-light text-surface-800">Tạo tài khoản mới</h2>
              <button onClick={() => setShowModal(false)} disabled={loading} className="p-2 rounded-lg hover:bg-surface-100">
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
                    placeholder={`Tối thiểu ${MIN_PASSWORD} ký tự`}
                    className="h-11 w-full rounded-xl border border-surface-200 px-4 pr-11 text-sm outline-none focus:border-brand-400 focus:ring-3 focus:ring-brand-100"
                  />
                  <button type="button" onClick={() => setShowPw((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-600">
                    {showPw ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-surface-50 text-xs text-surface-500">
                Tài khoản mới sẽ có vai trò <strong>Nhân viên</strong> — có thể quản lý sản phẩm, video, banner nhưng không tạo/xóa tài khoản.
              </div>

              <div className="flex gap-3 pt-1">
                <Button type="submit" variant="primary" className="flex-1" loading={loading}>
                  Tạo tài khoản
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowModal(false)} disabled={loading}>
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
