import { NextRequest, NextResponse } from "next/server"
import { sql, getTenantId } from "@/lib/db"
import type { CRMInteraction } from "@/types/crm"

export async function GET(request: NextRequest) {
  try {
    const tenantId = getTenantId()
    const searchParams = request.nextUrl.searchParams
    const customerId = searchParams.get("customer_id")
    const leadId = searchParams.get("lead_id")
    const opportunityId = searchParams.get("opportunity_id")
    const type = searchParams.get("type")
    const limit = parseInt(searchParams.get("limit") || "50")
    const offset = parseInt(searchParams.get("offset") || "0")

    const interactions = await sql`
      SELECT * FROM crm_interactions 
      WHERE tenant_id = ${tenantId}
      ${customerId ? sql`AND customer_id = ${customerId}` : sql``}
      ${leadId ? sql`AND lead_id = ${leadId}` : sql``}
      ${opportunityId ? sql`AND opportunity_id = ${opportunityId}` : sql``}
      ${type ? sql`AND type = ${type}` : sql``}
      ORDER BY created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    ` as CRMInteraction[]

    return NextResponse.json({ interactions })
  } catch (error) {
    console.error("Error fetching interactions:", error)
    return NextResponse.json(
      { error: "Failed to fetch interactions" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const tenantId = getTenantId()
    const body = await request.json()

    const result = await sql`
      INSERT INTO crm_interactions (
        tenant_id, customer_id, lead_id, opportunity_id,
        type, direction, subject, content, outcome,
        duration_minutes, scheduled_at, completed_at, performed_by
      ) VALUES (
        ${tenantId}, ${body.customer_id || null}, ${body.lead_id || null},
        ${body.opportunity_id || null}, ${body.type}, ${body.direction || null},
        ${body.subject || null}, ${body.content || null}, ${body.outcome || null},
        ${body.duration_minutes || null}, ${body.scheduled_at || null},
        ${body.completed_at || null}, ${body.performed_by || null}
      )
      RETURNING *
    `

    // Update last_contact_at for lead if applicable
    if (body.lead_id) {
      await sql`
        UPDATE crm_leads SET last_contact_at = NOW() WHERE id = ${body.lead_id}
      `
    }

    return NextResponse.json(result[0], { status: 201 })
  } catch (error) {
    console.error("Error creating interaction:", error)
    return NextResponse.json(
      { error: "Failed to create interaction" },
      { status: 500 }
    )
  }
}
