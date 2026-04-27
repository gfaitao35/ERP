import { NextRequest, NextResponse } from "next/server"
import { sql, getTenantId } from "@/lib/db"
import type { CRMCustomer } from "@/types/crm"

export async function GET(request: NextRequest) {
  try {
    const tenantId = getTenantId()
    const searchParams = request.nextUrl.searchParams
    const search = searchParams.get("search") || ""
    const classification = searchParams.get("classification")
    const limit = parseInt(searchParams.get("limit") || "50")
    const offset = parseInt(searchParams.get("offset") || "0")

    let customers: CRMCustomer[]

    if (search) {
      customers = await sql`
        SELECT * FROM crm_customers 
        WHERE tenant_id = ${tenantId}
        AND (
          name ILIKE ${"%" + search + "%"} 
          OR email ILIKE ${"%" + search + "%"}
          OR cpf_cnpj ILIKE ${"%" + search + "%"}
        )
        ${classification ? sql`AND classification = ${classification}` : sql``}
        ORDER BY score_rfm DESC, name ASC
        LIMIT ${limit} OFFSET ${offset}
      ` as CRMCustomer[]
    } else {
      customers = await sql`
        SELECT * FROM crm_customers 
        WHERE tenant_id = ${tenantId}
        ${classification ? sql`AND classification = ${classification}` : sql``}
        ORDER BY score_rfm DESC, name ASC
        LIMIT ${limit} OFFSET ${offset}
      ` as CRMCustomer[]
    }

    const countResult = await sql`
      SELECT COUNT(*) as total FROM crm_customers WHERE tenant_id = ${tenantId}
    `
    const total = parseInt(countResult[0]?.total || "0")

    return NextResponse.json({ customers, total })
  } catch (error) {
    console.error("Error fetching customers:", error)
    return NextResponse.json(
      { error: "Failed to fetch customers" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const tenantId = getTenantId()
    const body = await request.json()

    const result = await sql`
      INSERT INTO crm_customers (
        tenant_id, type, name, email, phone, whatsapp, cpf_cnpj,
        ie, im, cep, street, number, complement, neighborhood, city, state,
        utm_source, utm_medium, utm_campaign, utm_term, utm_content,
        first_touch_channel, tags, notes, assigned_to
      ) VALUES (
        ${tenantId}, ${body.type || "pf"}, ${body.name}, ${body.email || null},
        ${body.phone || null}, ${body.whatsapp || null}, ${body.cpf_cnpj || null},
        ${body.ie || null}, ${body.im || null}, ${body.cep || null},
        ${body.street || null}, ${body.number || null}, ${body.complement || null},
        ${body.neighborhood || null}, ${body.city || null}, ${body.state || null},
        ${body.utm_source || null}, ${body.utm_medium || null},
        ${body.utm_campaign || null}, ${body.utm_term || null},
        ${body.utm_content || null}, ${body.first_touch_channel || null},
        ${body.tags || []}, ${body.notes || null}, ${body.assigned_to || null}
      )
      RETURNING *
    `

    return NextResponse.json(result[0], { status: 201 })
  } catch (error) {
    console.error("Error creating customer:", error)
    return NextResponse.json(
      { error: "Failed to create customer" },
      { status: 500 }
    )
  }
}
