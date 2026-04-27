import { NextRequest, NextResponse } from "next/server"
import { sql, getTenantId } from "@/lib/db"
import type { CRMPipelineStage, CRMOpportunity } from "@/types/crm"

export async function GET() {
  try {
    const tenantId = getTenantId()

    // Get all pipeline stages
    const stages = await sql`
      SELECT * FROM crm_pipeline_stages 
      WHERE tenant_id = ${tenantId} AND is_active = true
      ORDER BY position ASC
    ` as CRMPipelineStage[]

    // Get all open opportunities with customer/lead info
    const opportunities = await sql`
      SELECT 
        o.*,
        c.name as customer_name,
        c.email as customer_email,
        c.classification as customer_classification,
        l.name as lead_name,
        l.email as lead_email,
        l.temperature as lead_temperature
      FROM crm_opportunities o
      LEFT JOIN crm_customers c ON o.customer_id = c.id
      LEFT JOIN crm_leads l ON o.lead_id = l.id
      WHERE o.tenant_id = ${tenantId} AND o.status = 'open'
      ORDER BY o.stage_changed_at DESC
    ` as (CRMOpportunity & {
      customer_name?: string
      customer_email?: string
      customer_classification?: string
      lead_name?: string
      lead_email?: string
      lead_temperature?: string
    })[]

    // Group opportunities by stage
    const pipeline = stages.map((stage) => ({
      ...stage,
      opportunities: opportunities.filter((opp) => opp.stage_id === stage.id),
      totalValue: opportunities
        .filter((opp) => opp.stage_id === stage.id)
        .reduce((sum, opp) => sum + Number(opp.value), 0),
    }))

    // Calculate totals
    const totals = {
      totalOpportunities: opportunities.length,
      totalValue: opportunities.reduce((sum, opp) => sum + Number(opp.value), 0),
      weightedValue: opportunities.reduce(
        (sum, opp) => sum + Number(opp.value) * (opp.probability / 100),
        0
      ),
    }

    return NextResponse.json({ pipeline, totals })
  } catch (error) {
    console.error("Error fetching pipeline:", error)
    return NextResponse.json(
      { error: "Failed to fetch pipeline" },
      { status: 500 }
    )
  }
}
