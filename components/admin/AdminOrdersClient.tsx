"use client";

import React, { useState } from "react";
import { Phone, Mail, CheckCircle2, X, Eye, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import type { OrderStatus } from "@/types";

interface Order {
  id: string;
  customerName: string;
  phone: string;
  email: string;
  items: string[];
  status: OrderStatus;
  createdAt: Date;
  note: string;
}

interface AdminOrdersClientProps {
  initialOrders: Order[];
}

const STATUS_CONFIG: Record<OrderStatus, { label: string; badgeVariant: "pending" | "brand" | "completed" | "danger" }> = {
  pending:   { label: "Chờ xử lý",  badgeVariant: "pending"   },
  contacted: { label: "Đã liên hệ", badgeVariant: "brand"     },
  completed: { label: "Hoàn thành", badgeVariant: "completed"  },
  cancelled: { label: "Đã hủy",     badgeVariant: "danger"     },
};

export function AdminOrdersClient({ initialOrders }: AdminOrdersClientProps) {
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [filterStatus, setFilterStatus] = useState<OrderStatus | "all">("all");
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const updateStatus = (id: string, status: OrderStatus) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === id ? { ...o, status } : o))
    );
    setSelectedOrder((prev) => prev?.id === id ? { ...prev, status } : prev);
    showToast(`Đã cập nhật trạng thái đơn #${id}`);
  };

  const filtered = orders.filter(
    (o) => filterStatus === "all" || o.status === filterStatus
  );

  const counts = {
    all:       orders.length,
    pending:   orders.filter((o) => o.status === "pending").length,
    contacted: orders.filter((o) => o.status === "contacted").length,
    completed: orders.filter((o) => o.status === "completed").length,
    cancelled: orders.filter((o) => o.status === "cancelled").length,
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-display text-3xl font-light text-surface-800">Yêu cầu đặt hàng</h1>
        <p className="text-sm text-surface-400 mt-1">
          {counts.pending > 0 && (
            <span className="text-amber-600 font-semibold">{counts.pending} đơn chờ xử lý · </span>
          )}
          {orders.length} tổng đơn hàng
        </p>
      </div>

      {/* Status tabs */}
      <div className="flex gap-2 flex-wrap mb-6">
        {(["all", "pending", "contacted", "completed", "cancelled"] as const).map((s) => (
          <button
            key={s}
            onClick={() => setFilterStatus(s)}
            className={cn(
              "px-4 py-2 rounded-full text-sm font-medium border transition-all",
              filterStatus === s
                ? "bg-surface-800 text-white border-surface-800"
                : "bg-white text-surface-600 border-surface-200 hover:border-surface-400"
            )}
          >
            {s === "all" ? "Tất cả" : STATUS_CONFIG[s].label}{" "}
            <span className="opacity-60">({counts[s]})</span>
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-surface-200 shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full" role="table" aria-label="Danh sách đơn hàng">
            <thead>
              <tr className="bg-surface-50 border-b border-surface-200">
                {["Mã đơn", "Khách hàng", "Sản phẩm", "Ngày", "Trạng thái", "Hành động"].map((h) => (
                  <th key={h} scope="col" className="px-5 py-3.5 text-left text-xs font-semibold text-surface-400 uppercase tracking-wider whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((order, i) => (
                <tr
                  key={order.id}
                  className={cn(
                    "transition-colors hover:bg-surface-50",
                    i < filtered.length - 1 && "border-b border-surface-100",
                    order.status === "pending" && "bg-amber-50/30"
                  )}
                >
                  <td className="px-5 py-4">
                    <span className="font-mono text-sm font-semibold text-brand-700">
                      #{order.id}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <p className="text-sm font-semibold text-surface-800">{order.customerName}</p>
                    <a href={`tel:${order.phone}`} className="text-xs text-brand-600 hover:underline">{order.phone}</a>
                  </td>
                  <td className="px-5 py-4">
                    <p className="text-sm text-surface-600 line-clamp-1 max-w-[200px]">
                      {order.items.join(", ")}
                    </p>
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-xs text-surface-400">
                      {order.createdAt.toLocaleDateString("vi-VN")}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <Badge variant={STATUS_CONFIG[order.status].badgeVariant}>
                      {STATUS_CONFIG[order.status].label}
                    </Badge>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="p-2 rounded-lg text-surface-400 hover:text-brand-600 hover:bg-brand-50 transition-all"
                        title="Xem chi tiết"
                        aria-label={`Xem chi tiết đơn #${order.id}`}
                      >
                        <Eye size={15} aria-hidden />
                      </button>
                      {order.status === "pending" && (
                        <button
                          onClick={() => updateStatus(order.id, "contacted")}
                          className="p-2 rounded-lg text-surface-400 hover:text-green-600 hover:bg-green-50 transition-all"
                          title="Đánh dấu đã liên hệ"
                          aria-label="Đánh dấu đã liên hệ"
                        >
                          <Phone size={15} aria-hidden />
                        </button>
                      )}
                      {order.status === "contacted" && (
                        <button
                          onClick={() => updateStatus(order.id, "completed")}
                          className="p-2 rounded-lg text-surface-400 hover:text-brand-600 hover:bg-brand-50 transition-all"
                          title="Đánh dấu hoàn thành"
                          aria-label="Hoàn thành"
                        >
                          <CheckCircle2 size={15} aria-hidden />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-16 text-center text-sm text-surface-400">
                    Không có đơn hàng nào
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order detail modal */}
      {selectedOrder && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal
          aria-labelledby="order-modal-title"
          onClick={(e) => e.target === e.currentTarget && setSelectedOrder(null)}
        >
          <div className="bg-white rounded-3xl shadow-float w-full max-w-md">
            <div className="flex items-center justify-between px-7 py-5 border-b border-surface-100">
              <h2 id="order-modal-title" className="font-display text-xl font-light text-surface-800">
                Đơn hàng #{selectedOrder.id}
              </h2>
              <button onClick={() => setSelectedOrder(null)} className="p-2 rounded-lg hover:bg-surface-100" aria-label="Đóng">
                <X size={18} aria-hidden />
              </button>
            </div>

            <div className="p-7 flex flex-col gap-5">
              {/* Customer */}
              <div>
                <p className="text-xs font-semibold text-surface-400 uppercase tracking-wider mb-2">Khách hàng</p>
                <p className="font-semibold text-surface-800">{selectedOrder.customerName}</p>
                <a href={`tel:${selectedOrder.phone}`} className="flex items-center gap-2 text-sm text-brand-600 mt-1">
                  <Phone size={13} /> {selectedOrder.phone}
                </a>
                {selectedOrder.email && (
                  <a href={`mailto:${selectedOrder.email}`} className="flex items-center gap-2 text-sm text-brand-600 mt-1">
                    <Mail size={13} /> {selectedOrder.email}
                  </a>
                )}
              </div>

              {/* Items */}
              <div>
                <p className="text-xs font-semibold text-surface-400 uppercase tracking-wider mb-2">Sản phẩm đặt</p>
                <ul className="flex flex-col gap-1">
                  {selectedOrder.items.map((item, i) => (
                    <li key={i} className="text-sm text-surface-700 flex items-center gap-2">
                      <span className="text-brand-400" aria-hidden>•</span> {item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Note */}
              {selectedOrder.note && (
                <div>
                  <p className="text-xs font-semibold text-surface-400 uppercase tracking-wider mb-2">Ghi chú</p>
                  <p className="text-sm text-surface-600 bg-surface-50 rounded-xl p-3">{selectedOrder.note}</p>
                </div>
              )}

              {/* Meta */}
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-1.5 text-surface-400">
                  <Clock size={13} />
                  {selectedOrder.createdAt.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" })}
                </div>
                <Badge variant={STATUS_CONFIG[selectedOrder.status].badgeVariant}>
                  {STATUS_CONFIG[selectedOrder.status].label}
                </Badge>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2 border-t border-surface-100">
                {selectedOrder.status === "pending" && (
                  <Button variant="primary" size="md" className="flex-1" onClick={() => updateStatus(selectedOrder.id, "contacted")}>
                    <Phone size={15} /> Đã liên hệ
                  </Button>
                )}
                {selectedOrder.status === "contacted" && (
                  <Button variant="primary" size="md" className="flex-1" onClick={() => updateStatus(selectedOrder.id, "completed")}>
                    <CheckCircle2 size={15} /> Hoàn thành
                  </Button>
                )}
                {(selectedOrder.status === "pending" || selectedOrder.status === "contacted") && (
                  <Button variant="outline" size="md" onClick={() => updateStatus(selectedOrder.id, "cancelled")}>
                    Hủy đơn
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div role="status" aria-live="polite" className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-surface-800 text-white text-sm font-medium px-5 py-3 rounded-xl shadow-float animate-fade-up">
          {toast}
        </div>
      )}
    </div>
  );
}
