import { NextRequest, NextResponse } from "next/server";
import { query, queryOne } from "@/lib/db";
import { hash } from "bcryptjs";

// Helper: valida token do ERP (usuário TI ou MASTER logado)
function getAuthUser(req: NextRequest): { userId: string; tenantId: string; role: string } | null {
  try {
    const sessionStr = req.headers.get("x-erp-session");
    if (!sessionStr) return null;
    return JSON.parse(Buffer.from(sessionStr, "base64").toString());
  } catch {
    return null;
  }
}

// GET /api/ti/users — lista usuários do tenant
export async function GET(req: NextRequest) {
  const session = getAuthUser(req);
  if (!session) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { tenantId, role } = session;
  if (!["MASTER", "TI", "ADMINISTRATIVO"].includes(role)) {
    return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
  }

  const users = await query(`
    SELECT id, name, email, role, department, is_active, permissions, created_at, last_login
    FROM users 
    WHERE tenant_id = $1
    ORDER BY name
  `, [tenantId]);

  return NextResponse.json({ success: true, data: users });
}

// POST /api/ti/users — cria usuário no tenant
export async function POST(req: NextRequest) {
  const session = getAuthUser(req);
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const { tenantId, role } = session;
  if (!["MASTER", "TI", "ADMINISTRATIVO"].includes(role)) {
    return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
  }

  const body = await req.json();
  const { name, email, password, userRole, department, permissions } = body;

  if (!name || !email || !password || !userRole) {
    return NextResponse.json({ error: "Campos obrigatórios: name, email, password, userRole" }, { status: 400 });
  }

  const existing = await queryOne(`SELECT id FROM users WHERE tenant_id = $1 AND email = $2`, [tenantId, email]);
  if (existing) {
    return NextResponse.json({ error: "E-mail já cadastrado nesta empresa" }, { status: 409 });
  }

  const passwordHash = await hash(password, 10);

  const [user] = await query(`
    INSERT INTO users (tenant_id, email, password_hash, name, role, department, permissions)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING id, name, email, role, department, is_active, permissions, created_at
  `, [tenantId, email, passwordHash, name, userRole, department ?? null, permissions ?? []]);

  return NextResponse.json({ success: true, data: user }, { status: 201 });
}
