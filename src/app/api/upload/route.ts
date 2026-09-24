import { put } from "@vercel/blob";
import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/adminAuth";

export const runtime = "nodejs";

const MAX_FILE_SIZE = 10 * 1024 * 1024;

const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
]);

export async function POST(req: NextRequest) {
  const admin = requireAdmin(req);

  if (!admin) {
    return NextResponse.json(
      { error: "Немає доступу" },
      { status: 401 }
    );
  }

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json(
      { error: "Сховище зображень не налаштоване" },
      { status: 500 }
    );
  }

  const formData = await req.formData().catch(() => null);
  const value = formData?.get("file");

  if (!(value instanceof File)) {
    return NextResponse.json(
      { error: "Файл не передано" },
      { status: 400 }
    );
  }

  if (!ALLOWED_TYPES.has(value.type)) {
    return NextResponse.json(
      { error: "Дозволені JPG, PNG, WEBP, GIF або AVIF" },
      { status: 400 }
    );
  }

  if (value.size > MAX_FILE_SIZE) {
    return NextResponse.json(
      { error: "Максимальний розмір файлу: 10 МБ" },
      { status: 400 }
    );
  }

  const safeName = value.name
    .replace(/[^a-zA-Z0-9._-]/g, "-")
    .replace(/-+/g, "-");

  const blob = await put(
    `products/${Date.now()}-${safeName || "image"}`,
    value,
    {
      access: "public",
      addRandomSuffix: true,
    }
  );

  return NextResponse.json({ url: blob.url });
}