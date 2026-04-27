import { NextResponse } from "next/server"
import { sql, getTenantId } from "@/lib/db"
import type { CRMPipelineStage } from "@/types/crm"

export async function GET() {
  try {
    const tenantId = getTenantId()

    const stages = await sql`
      SELECT * FROM crm_pipeline_stages 
      WHERE tenant_id = ${tenantId} AND is_active = true
      ORDER BY position ASC
    ` as CRMPipelineStage[]

    return NextResponse.json({ stages })
  } catch (error) {
    console.error("Error fetching stages:", error)
    return NextResponse.json(
      { error: "Failed to fetch stages" },
      { status: 500 }
    )
  }
}
