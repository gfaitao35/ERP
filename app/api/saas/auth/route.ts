import { NextRequest, NextResponse } from "next/server";
import { queryOne } from "@/lib/db";
import { compare } from "bcryptjs";
import { sign } from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET ?? "erp-saas-secret-change-in-prod";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email e senha são obrigatórios" }, { status: 400 });
    }

    const admin = await queryOne<{ id: string; email: string; name: string; password_hash: string; is_active: boolean }>(
      `SELECT id, email, name, password_hash, is_active FROM saas_admins WHERE email = $1`,
      [email]
    );

    if (!admin || !admin.is_active) {
      return NextResponse.json({ error: "Credenciais inválidas" }, { status: 401 });
    }

    const valid = await compare(password, admin.password_hash);
    if (!valid) {
      return NextResponse.json({ error: "Credenciais inválidas" }, { status: 401 });
    }

    const token = sign(
      { id: admin.id, email: admin.email, name: admin.name, role: "SAAS_ADMIN" },
      JWT_SECRET,
      { expiresIn: "8h" }
    );

    const response = NextResponse.json({
      success: true,
      admin: { id: admin.id, email: admin.email, name: admin.name },
    });

    response.cookies.set("saas_admin_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 8, // 8h
    });

    return response;
  } catch (error) {
    console.error("SaaS Admin login error:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}

export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.cookies.delete("saas_admin_token");
  return response;
}
