import { NextRequest, NextResponse } from "next/server"
import { sql, getTenantId } from "@/lib/db"
import type { CRMLead } from "@/types/crm"

export async function GET(request: NextRequest) {
  try {
    const tenantId = getTenantId()
    const searchParams = request.nextUrl.searchParams
    const search = searchParams.get("search") || ""
    const status = searchParams.get("status")
    const temperature = searchParams.get("temperature")
    const source = searchParams.get("source")
    const limit = parseInt(searchParams.get("limit") || "50")
    const offset = parseInt(searchParams.get("offset") || "0")

    let whereClause = sql`tenant_id = ${tenantId}`
    
    if (search) {
      whereClause = sql`${whereClause} AND (
        name ILIKE ${"%" + search + "%"} 
        OR email ILIKE ${"%" + search + "%"}
        OR company ILIKE ${"%" + search + "%"}
      )`
    }
    
    if (status) {
      whereClause = sql`${whereClause} AND status = ${status}`
    }
    
    if (temperature) {
      whereClause = sql`${whereClause} AND temperature = ${temperature}`
    }
    
    if (source) {
      whereClause = sql`${whereClause} AND source = ${source}`
    }

    const leads = await sql`
      SELECT * FROM crm_leads 
      WHERE ${whereClause}
      ORDER BY created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    ` as CRMLead[]

    const countResult = await sql`
      SELECT COUNT(*) as total FROM crm_leads WHERE tenant_id = ${tenantId}
    `
    const total = parseInt(countResult[0]?.total || "0")

    return NextResponse.json({ leads, total })
  } catch (error) {
    console.error("Error fetching leads:", error)
    return NextResponse.json(
      { error: "Failed to fetch leads" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const tenantId = getTenantId()
    const body = await request.json()

    const result = await sql`
      INSERT INTO crm_leads (
        tenant_id, name, email, phone, whatsapp, company, position,
        status, temperature, score, source,
        utm_source, utm_medium, utm_campaign, utm_term, utm_content,
        landing_page, referrer, interested_products, estimated_value,
        assigned_to, tags, notes, custom_fields
      ) VALUES (
        ${tenantId}, ${body.name}, ${body.email || null},
        ${body.phone || null}, ${body.whatsapp || null},
        ${body.company || null}, ${body.position || null},
        ${body.status || "new"}, ${body.temperature || "cold"},
        ${body.score || 0}, ${body.source || null},
        ${body.utm_source || null}, ${body.utm_medium || null},
        ${body.utm_campaign || null}, ${body.utm_term || null},
        ${body.utm_content || null}, ${body.landing_page || null},
        ${body.referrer || null}, ${body.interested_products || []},
        ${body.estimated_value || null}, ${body.assigned_to || null},
        ${body.tags || []}, ${body.notes || null},
        ${JSON.stringify(body.custom_fields || {})}
      )
      RETURNING *
    `

    return NextResponse.json(result[0], { status: 201 })
  } catch (error) {
    console.error("Error creating lead:", error)
    return NextResponse.json(
      { error: "Failed to create lead" },
      { status: 500 }
    )
  }
}
