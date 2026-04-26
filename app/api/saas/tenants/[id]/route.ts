import { NextRequest, NextResponse } from "next/server";
import { query, queryOne } from "@/lib/db";
import { verifySaasAdmin, unauthorizedResponse } from "@/lib/saas-auth";

// PATCH /api/saas/tenants/[id] — atualiza empresa
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const admin = verifySaasAdmin(req);
  if (!admin) return unauthorizedResponse();

  const body = await req.json();
  const { name, plan, modules, is_active, currency, timezone } = body;

  const [tenant] = await query(`
    UPDATE tenants 
    SET 
      name = COALESCE($1, name),
      plan = COALESCE($2, plan),
      modules = COALESCE($3, modules),
      is_active = COALESCE($4, is_active),
      currency = COALESCE($5, currency),
      timezone = COALESCE($6, timezone)
    WHERE id = $7
    RETURNING *
  `, [name, plan, modules, is_active, currency, timezone, params.id]);

  if (!tenant) {
    return NextResponse.json({ error: "Empresa não encontrada" }, { status: 404 });
  }

  return NextResponse.json({ success: true, data: tenant });
}

// DELETE /api/saas/tenants/[id] — desativa empresa
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const admin = verifySaasAdmin(req);
  if (!admin) return unauthorizedResponse();

  await query(`UPDATE tenants SET is_active = false WHERE id = $1`, [params.id]);
  return NextResponse.json({ success: true });
}

// GET /api/saas/tenants/[id] — detalhe com usuários
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const admin = verifySaasAdmin(req);
  if (!admin) return unauthorizedResponse();

  const tenant = await queryOne(`SELECT * FROM tenants WHERE id = $1`, [params.id]);
  if (!tenant) {
    return NextResponse.json({ error: "Empresa não encontrada" }, { status: 404 });
  }

  const users = await query(`
    SELECT id, name, email, role, department, is_active, permissions, created_at, last_login
    FROM users WHERE tenant_id = $1 ORDER BY name
  `, [params.id]);

  return NextResponse.json({ success: true, data: { ...tenant as object, users } });
}
