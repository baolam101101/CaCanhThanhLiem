import { NextResponse } from "next/server";
import { adminContext, dbError, jsonError, readJson, revalidateSiteData } from "@/lib/admin/server";

const ORDERED_TABLES = ["categories", "banners"] as const;
type OrderedTable = (typeof ORDERED_TABLES)[number];

// POST { table, ids } — ids in their new display order; sort_order = position.
export async function POST(req: Request) {
  const ctx = await adminContext();
  if (ctx instanceof NextResponse) return ctx;

  const body = await readJson<{ table?: unknown; ids?: unknown }>(req);
  const table = body?.table as OrderedTable;
  const ids = body?.ids;
  if (!ORDERED_TABLES.includes(table)) return jsonError(400, "Bảng không hợp lệ");
  if (!Array.isArray(ids) || ids.length > 500 || !ids.every((x) => typeof x === "string")) {
    return jsonError(400, "Danh sách sắp xếp không hợp lệ");
  }

  const results = await Promise.all(
    (ids as string[]).map((id, i) => ctx.db.from(table).update({ sort_order: i + 1 }).eq("id", id))
  );
  const failed = results.find((r) => r.error);
  if (failed) return dbError(failed.error, "thứ tự");

  revalidateSiteData();
  return NextResponse.json({ ok: true });
}
