import { NextRequest, NextResponse } from "next/server";
import { verify } from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET ?? "erp-saas-secret-change-in-prod";

export interface SaasAdminPayload {
  id: string;
  email: string;
  name: string;
  role: "SAAS_ADMIN";
}

export function verifySaasAdmin(req: NextRequest): SaasAdminPayload | null {
  try {
    const token = req.cookies.get("saas_admin_token")?.value;
    if (!token) return null;
    const payload = verify(token, JWT_SECRET) as SaasAdminPayload;
    if (payload.role !== "SAAS_ADMIN") return null;
    return payload;
  } catch {
    return null;
  }
}

export function unauthorizedResponse() {
  return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
}
