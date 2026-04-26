import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { hash } from "bcryptjs";

function getAuthUser(req: NextRequest): { userId: string; tenantId: string; role: string } | null {
  try {
    const sessionStr = req.headers.get("x-erp-session");
    if (!sessionStr) return null;
    return JSON.parse(Buffer.from(sessionStr, "base64").toString());
  } catch {
    return null;
  }
}

// PATCH /api/ti/users/[id]
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = getAuthUser(req);
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const { tenantId, role } = session;
  if (!["MASTER", "TI", "ADMINISTRATIVO"].includes(role)) {
    return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
  }

  const body = await req.json();
  const { name, userRole, department, permissions, is_active, password } = body;

  let passwordHash: string | undefined;
  if (password) {
    passwordHash = await hash(password, 10);
  }

  const [user] = await query(`
    UPDATE users SET
      name = COALESCE($1, name),
      role = COALESCE($2, role),
      department = COALESCE($3, department),
      permissions = COALESCE($4, permissions),
      is_active = COALESCE($5, is_active),
      password_hash = COALESCE($6, password_hash)
    WHERE id = $7 AND tenant_id = $8
    RETURNING id, name, email, role, department, is_active, permissions, created_at
  `, [name, userRole, department, permissions, is_active, passwordHash ?? null, params.id, tenantId]);

  if (!user) {
    return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
  }

  return NextResponse.json({ success: true, data: user });
}

// DELETE /api/ti/users/[id]
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = getAuthUser(req);
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const { tenantId, role } = session;
  if (!["MASTER", "TI"].includes(role)) {
    return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
  }

  // Soft delete — desativa ao invés de excluir
  await query(`UPDATE users SET is_active = false WHERE id = $1 AND tenant_id = $2`, [params.id, tenantId]);
  return NextResponse.json({ success: true });
}
