import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { adminLoginSchema } from "@/lib/validation";
import { signAdminToken } from "@/lib/jwt";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = adminLoginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Вкажіть логін та пароль" }, { status: 400 });
  }
  const { login, password } = parsed.data;

  try {
    const admin = await prisma.admin.findUnique({ where: { login } });
    if (!admin) {
      // Same generic error for missing user vs wrong password to avoid user enumeration
      return NextResponse.json({ error: "Невірний логін або пароль" }, { status: 401 });
    }

    const valid = await bcrypt.compare(password, admin.passwordHash);
    if (!valid) {
      return NextResponse.json({ error: "Невірний логін або пароль" }, { status: 401 });
    }

    const token = signAdminToken({ adminId: admin.id, login: admin.login, role: admin.role });
    return NextResponse.json({ token, admin: { id: admin.id, login: admin.login, role: admin.role } });
  } catch (err) {
    console.error("[POST /api/admin/login]", err);
    return NextResponse.json({ error: "Помилка сервера" }, { status: 500 });
  }
}
