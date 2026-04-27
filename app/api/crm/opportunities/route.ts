import { NextRequest, NextResponse } from "next/server"
import { sql, getTenantId } from "@/lib/db"
import type { CRMOpportunity } from "@/types/crm"

export async function GET(request: NextRequest) {
  try {
    const tenantId = getTenantId()
    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get("status")
    const stageId = searchParams.get("stage_id")
    const customerId = searchParams.get("customer_id")
    const limit = parseInt(searchParams.get("limit") || "50")
    const offset = parseInt(searchParams.get("offset") || "0")

    const opportunities = await sql`
      SELECT 
        o.*,
        c.name as customer_name,
        c.email as customer_email,
        l.name as lead_name,
        l.email as lead_email,
        s.name as stage_name,
        s.color as stage_color
      FROM crm_opportunities o
      LEFT JOIN crm_customers c ON o.customer_id = c.id
      LEFT JOIN crm_leads l ON o.lead_id = l.id
      LEFT JOIN crm_pipeline_stages s ON o.stage_id = s.id
      WHERE o.tenant_id = ${tenantId}
      ${status ? sql`AND o.status = ${status}` : sql``}
      ${stageId ? sql`AND o.stage_id = ${stageId}` : sql``}
      ${customerId ? sql`AND o.customer_id = ${customerId}` : sql``}
      ORDER BY o.created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    ` as CRMOpportunity[]

    const countResult = await sql`
      SELECT COUNT(*) as total FROM crm_opportunities WHERE tenant_id = ${tenantId}
    `
    const total = parseInt(countResult[0]?.total || "0")

    return NextResponse.json({ opportunities, total })
  } catch (error) {
    console.error("Error fetching opportunities:", error)
    return NextResponse.json(
      { error: "Failed to fetch opportunities" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const tenantId = getTenantId()
    const body = await request.json()

    // If no stage_id provided, get the first stage
    let stageId = body.stage_id
    if (!stageId) {
      const stages = await sql`
        SELECT id FROM crm_pipeline_stages 
        WHERE tenant_id = ${tenantId} AND is_active = true
        ORDER BY position ASC
        LIMIT 1
      `
      stageId = stages[0]?.id
    }

    if (!stageId) {
      return NextResponse.json(
        { error: "No pipeline stages found" },
        { status: 400 }
      )
    }

    // Get stage probability
    const stageResult = await sql`
      SELECT probability FROM crm_pipeline_stages WHERE id = ${stageId}
    `
    const probability = stageResult[0]?.probability || 0

    const result = await sql`
      INSERT INTO crm_opportunities (
        tenant_id, customer_id, lead_id, stage_id, title, description,
        value, probability, expected_close_date, source, utm_campaign,
        assigned_to, products, tags, notes, custom_fields
      ) VALUES (
        ${tenantId}, ${body.customer_id || null}, ${body.lead_id || null},
        ${stageId}, ${body.title}, ${body.description || null},
        ${body.value || 0}, ${probability},
        ${body.expected_close_date || null}, ${body.source || null},
        ${body.utm_campaign || null}, ${body.assigned_to || null},
        ${JSON.stringify(body.products || [])}, ${body.tags || []},
        ${body.notes || null}, ${JSON.stringify(body.custom_fields || {})}
      )
      RETURNING *
    `

    return NextResponse.json(result[0], { status: 201 })
  } catch (error) {
    console.error("Error creating opportunity:", error)
    return NextResponse.json(
      { error: "Failed to create opportunity" },
      { status: 500 }
    )
  }
}
