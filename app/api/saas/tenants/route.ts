import { NextRequest, NextResponse } from "next/server";
import { query, queryOne } from "@/lib/db";
import { verifySaasAdmin, unauthorizedResponse } from "@/lib/saas-auth";

// GET /api/saas/tenants — lista todas as empresas
export async function GET(req: NextRequest) {
  const admin = verifySaasAdmin(req);
  if (!admin) return unauthorizedResponse();

  const tenants = await query(`
    SELECT 
      t.*,
      COUNT(u.id) FILTER (WHERE u.is_active = true) as active_users,
      COUNT(u.id) as total_users
    FROM tenants t
    LEFT JOIN users u ON u.tenant_id = t.id
    GROUP BY t.id
    ORDER BY t.created_at DESC
  `);

  return NextResponse.json({ success: true, data: tenants });
}

// POST /api/saas/tenants — cria nova empresa
export async function POST(req: NextRequest) {
  const admin = verifySaasAdmin(req);
  if (!admin) return unauthorizedResponse();

  const body = await req.json();
  const { name, slug, plan, modules, currency, timezone } = body;

  if (!name || !slug) {
    return NextResponse.json({ error: "Nome e slug são obrigatórios" }, { status: 400 });
  }

  // Verifica slug único
  const existing = await queryOne(`SELECT id FROM tenants WHERE slug = $1`, [slug]);
  if (existing) {
    return NextResponse.json({ error: "Esse slug já está em uso" }, { status: 409 });
  }

  const [tenant] = await query(`
    INSERT INTO tenants (name, slug, plan, modules, currency, timezone)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *
  `, [
    name,
    slug.toLowerCase().replace(/[^a-z0-9-]/g, "-"),
    plan ?? "starter",
    modules ?? ["all"],
    currency ?? "BRL",
    timezone ?? "America/Sao_Paulo",
  ]);

  return NextResponse.json({ success: true, data: tenant }, { status: 201 });
}
