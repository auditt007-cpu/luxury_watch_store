import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";

export async function saveUploads(sourceId: string, form: FormData) {
  const files = form.getAll("files").filter((item): item is File => item instanceof File && item.size > 0);
  if (!files.length) return [] as string[];

  const dir = path.join(process.cwd(), "public", "uploads", "goods", sourceId);
  await mkdir(dir, { recursive: true });
  const saved: string[] = [];
  for (const file of files) {
    const ext = path.extname(file.name || "") || ".jpg";
    const name = `${Date.now()}-${randomUUID().slice(0, 8)}${ext}`;
    const buf = Buffer.from(await file.arrayBuffer());
    await writeFile(path.join(dir, name), buf);
    saved.push(`/uploads/goods/${sourceId}/${name}`);
  }
  return saved;
}

export function parseExistingImages(form: FormData) {
  try {
    const parsed = JSON.parse(String(form.get("existingImages") || "[]"));
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
}
