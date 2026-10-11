import { str } from "@/lib/admin/server";

// Validate banner fields (camelCase body → snake_case columns).
export function parseBannerFields(body: Record<string, unknown>, partial: boolean): { error: string } | { fields: Record<string, unknown> } {
  const f: Record<string, unknown> = {};

  if (!partial || body.imageUrl !== undefined) {
    const url = str(body.imageUrl, 2000);
    if (!/^https?:\/\//.test(url)) return { error: "Vui lòng chọn ảnh banner" };
    f.image_url = url;
  }
  // Only a newly uploaded image carries a storage path. An edit that keeps
  // the same image must not clear it, or the file could never be deleted.
  if (typeof body.storagePath === "string") f.storage_path = body.storagePath;
  else if (!partial) f.storage_path = null;
  if (body.imageName !== undefined) f.image_name = str(body.imageName, 300);
  for (const [key, col] of [["objectPositionX", "object_position_x"], ["objectPositionY", "object_position_y"], ["zoom", "zoom"]] as const) {
    if (body[key] !== undefined) {
      const n = Number(body[key]);
      if (!Number.isFinite(n)) return { error: "Vị trí ảnh không hợp lệ" };
      f[col] = n;
    }
  }
  if (body.fit !== undefined) {
    if (body.fit !== "cover" && body.fit !== "contain") return { error: "Kiểu hiển thị không hợp lệ" };
    f.fit = body.fit;
  }
  if (body.background !== undefined) {
    const bg = str(body.background, 20);
    if (bg && !/^#[0-9a-fA-F]{6}$/.test(bg)) return { error: "Màu nền không hợp lệ" };
    f.background = bg || null;
  }
  if (typeof body.visible === "boolean") f.visible = body.visible;
  return { fields: f };
}
