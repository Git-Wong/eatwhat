import { getSupabase } from "@/lib/supabase-server";

const BUCKET = "dish-images";
const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");
    if (!(file instanceof File)) return Response.json({ error: "请选择图片" }, { status: 400 });
    if (!ALLOWED_TYPES.has(file.type)) return Response.json({ error: "仅支持 JPG、PNG、WebP 或 GIF" }, { status: 400 });
    if (file.size > MAX_BYTES) return Response.json({ error: "图片不能超过 5MB" }, { status: 400 });

    const supabase = getSupabase();
    const extension = file.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
    const path = `recipes/${Date.now()}-${crypto.randomUUID()}.${extension}`;
    const bytes = new Uint8Array(await file.arrayBuffer());
    let result = await supabase.storage.from(BUCKET).upload(path, bytes, { contentType: file.type, upsert: false });

    if (result.error?.message.toLowerCase().includes("bucket not found")) {
      const created = await supabase.storage.createBucket(BUCKET, { public: true, fileSizeLimit: MAX_BYTES, allowedMimeTypes: [...ALLOWED_TYPES] });
      if (created.error) throw created.error;
      result = await supabase.storage.from(BUCKET).upload(path, bytes, { contentType: file.type, upsert: false });
    }
    if (result.error) throw result.error;

    const { data } = supabase.storage.from(BUCKET).getPublicUrl(result.data.path);
    return Response.json({ url: data.publicUrl });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "图片上传失败" }, { status: 500 });
  }
}

export const runtime = "nodejs";
