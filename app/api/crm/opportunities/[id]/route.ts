import { NextRequest, NextResponse } from "next/server"
import { sql, getTenantId } from "@/lib/db"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const tenantId = getTenantId()

    const result = await sql`
      SELECT 
        o.*,
        c.name as customer_name,
        c.email as customer_email,
        c.phone as customer_phone,
        l.name as lead_name,
        l.email as lead_email,
        s.name as stage_name,
        s.color as stage_color
      FROM crm_opportunities o
      LEFT JOIN crm_customers c ON o.customer_id = c.id
      LEFT JOIN crm_leads l ON o.lead_id = l.id
      LEFT JOIN crm_pipeline_stages s ON o.stage_id = s.id
      WHERE o.id = ${id} AND o.tenant_id = ${tenantId}
    `

    if (result.length === 0) {
      return NextResponse.json({ error: "Opportunity not found" }, { status: 404 })
    }

    return NextResponse.json(result[0])
  } catch (error) {
    console.error("Error fetching opportunity:", error)
    return NextResponse.json(
      { error: "Failed to fetch opportunity" },
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

    // Check if stage is changing
    let stageChanged = false
    let newProbability = body.probability

    if (body.stage_id) {
      const currentOpp = await sql`
        SELECT stage_id FROM crm_opportunities WHERE id = ${id}
      `
      if (currentOpp[0]?.stage_id !== body.stage_id) {
        stageChanged = true
        // Get new stage probability
        const stageResult = await sql`
          SELECT probability, is_won, is_lost FROM crm_pipeline_stages WHERE id = ${body.stage_id}
        `
        newProbability = stageResult[0]?.probability || 0
        
        // Update status if won or lost stage
        if (stageResult[0]?.is_won) {
          body.status = "won"
          body.actual_close_date = new Date().toISOString().split("T")[0]
        } else if (stageResult[0]?.is_lost) {
          body.status = "lost"
          body.actual_close_date = new Date().toISOString().split("T")[0]
        }
      }
    }

    const result = await sql`
      UPDATE crm_opportunities SET
        customer_id = COALESCE(${body.customer_id}, customer_id),
        lead_id = COALESCE(${body.lead_id}, lead_id),
        stage_id = COALESCE(${body.stage_id}, stage_id),
        title = COALESCE(${body.title}, title),
        description = COALESCE(${body.description}, description),
        value = COALESCE(${body.value}, value),
        probability = COALESCE(${newProbability}, probability),
        expected_close_date = COALESCE(${body.expected_close_date}, expected_close_date),
        actual_close_date = COALESCE(${body.actual_close_date}, actual_close_date),
        status = COALESCE(${body.status}, status),
        lost_reason = COALESCE(${body.lost_reason}, lost_reason),
        won_reason = COALESCE(${body.won_reason}, won_reason),
        assigned_to = COALESCE(${body.assigned_to}, assigned_to),
        tags = COALESCE(${body.tags}, tags),
        notes = COALESCE(${body.notes}, notes),
        updated_at = NOW(),
        stage_changed_at = ${stageChanged ? sql`NOW()` : sql`stage_changed_at`}
      WHERE id = ${id} AND tenant_id = ${tenantId}
      RETURNING *
    `

    if (result.length === 0) {
      return NextResponse.json({ error: "Opportunity not found" }, { status: 404 })
    }

    // Log interaction if stage changed
    if (stageChanged) {
      await sql`
        INSERT INTO crm_interactions (
          tenant_id, customer_id, lead_id, opportunity_id,
          type, subject, content
        ) VALUES (
          ${tenantId}, ${result[0].customer_id}, ${result[0].lead_id}, ${id},
          'status_change', 'Oportunidade movida de estágio',
          ${"Oportunidade movida para novo estágio"}
        )
      `
    }

    return NextResponse.json(result[0])
  } catch (error) {
    console.error("Error updating opportunity:", error)
    return NextResponse.json(
      { error: "Failed to update opportunity" },
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
      DELETE FROM crm_opportunities 
      WHERE id = ${id} AND tenant_id = ${tenantId}
      RETURNING id
    `

    if (result.length === 0) {
      return NextResponse.json({ error: "Opportunity not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting opportunity:", error)
    return NextResponse.json(
      { error: "Failed to delete opportunity" },
      { status: 500 }
    )
  }
}
