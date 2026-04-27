import { NextRequest, NextResponse } from "next/server"
import { sql, getTenantId } from "@/lib/db"
import type { CRMCustomer, CRMInteraction, CRMOpportunity } from "@/types/crm"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const tenantId = getTenantId()

    // Get customer
    const customers = await sql`
      SELECT * FROM crm_customers 
      WHERE id = ${id} AND tenant_id = ${tenantId}
    ` as CRMCustomer[]

    if (customers.length === 0) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 })
    }

    const customer = customers[0]

    // Get interactions
    const interactions = await sql`
      SELECT * FROM crm_interactions 
      WHERE customer_id = ${id} AND tenant_id = ${tenantId}
      ORDER BY created_at DESC
      LIMIT 50
    ` as CRMInteraction[]

    // Get opportunities
    const opportunities = await sql`
      SELECT o.*, s.name as stage_name, s.color as stage_color
      FROM crm_opportunities o
      LEFT JOIN crm_pipeline_stages s ON o.stage_id = s.id
      WHERE o.customer_id = ${id} AND o.tenant_id = ${tenantId}
      ORDER BY o.created_at DESC
    ` as (CRMOpportunity & { stage_name: string; stage_color: string })[]

    return NextResponse.json({
      customer,
      interactions,
      opportunities,
    })
  } catch (error) {
    console.error("Error fetching customer:", error)
    return NextResponse.json(
      { error: "Failed to fetch customer" },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const tenantId = getTenantId()
    const body = await request.json()

    const result = await sql`
      UPDATE crm_customers SET
        type = COALESCE(${body.type}, type),
        name = COALESCE(${body.name}, name),
        email = COALESCE(${body.email}, email),
        phone = COALESCE(${body.phone}, phone),
        whatsapp = COALESCE(${body.whatsapp}, whatsapp),
        cpf_cnpj = COALESCE(${body.cpf_cnpj}, cpf_cnpj),
        ie = COALESCE(${body.ie}, ie),
        im = COALESCE(${body.im}, im),
        cep = COALESCE(${body.cep}, cep),
        street = COALESCE(${body.street}, street),
        number = COALESCE(${body.number}, number),
        complement = COALESCE(${body.complement}, complement),
        neighborhood = COALESCE(${body.neighborhood}, neighborhood),
        city = COALESCE(${body.city}, city),
        state = COALESCE(${body.state}, state),
        tags = COALESCE(${body.tags}, tags),
        notes = COALESCE(${body.notes}, notes),
        assigned_to = COALESCE(${body.assigned_to}, assigned_to),
        updated_at = NOW()
      WHERE id = ${id} AND tenant_id = ${tenantId}
      RETURNING *
    `

    if (result.length === 0) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 })
    }

    return NextResponse.json(result[0])
  } catch (error) {
    console.error("Error updating customer:", error)
    return NextResponse.json(
      { error: "Failed to update customer" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const tenantId = getTenantId()

    const result = await sql`
      DELETE FROM crm_customers 
      WHERE id = ${id} AND tenant_id = ${tenantId}
      RETURNING id
    `

    if (result.length === 0) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting customer:", error)
    return NextResponse.json(
      { error: "Failed to delete customer" },
      { status: 500 }
    )
  }
}
