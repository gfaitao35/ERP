import { NextResponse } from "next/server"
import { sql, getTenantId } from "@/lib/db"

export async function GET() {
  try {
    const tenantId = getTenantId()

    // Get leads stats
    const leadsStats = await sql`
      SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE created_at >= date_trunc('month', CURRENT_DATE)) as this_month,
        COUNT(*) FILTER (WHERE created_at >= date_trunc('month', CURRENT_DATE - INTERVAL '1 month') 
          AND created_at < date_trunc('month', CURRENT_DATE)) as last_month
      FROM crm_leads WHERE tenant_id = ${tenantId}
    `

    // Get leads by source
    const leadsBySource = await sql`
      SELECT COALESCE(source, 'Direto') as source, COUNT(*) as count
      FROM crm_leads WHERE tenant_id = ${tenantId}
      GROUP BY source ORDER BY count DESC LIMIT 10
    `

    // Get leads by status
    const leadsByStatus = await sql`
      SELECT status, COUNT(*) as count
      FROM crm_leads WHERE tenant_id = ${tenantId}
      GROUP BY status ORDER BY count DESC
    `

    // Get opportunities stats
    const oppStats = await sql`
      SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE status = 'open') as open,
        COUNT(*) FILTER (WHERE status = 'won') as won,
        COUNT(*) FILTER (WHERE status = 'lost') as lost,
        COALESCE(SUM(value) FILTER (WHERE status = 'open'), 0) as pipeline_value,
        COALESCE(SUM(value) FILTER (WHERE status = 'won'), 0) as won_value,
        COALESCE(AVG(value) FILTER (WHERE status = 'won'), 0) as avg_ticket
      FROM crm_opportunities WHERE tenant_id = ${tenantId}
    `

    // Get opportunities by stage
    const oppByStage = await sql`
      SELECT 
        s.name as stage,
        s.color,
        COUNT(o.id) as count,
        COALESCE(SUM(o.value), 0) as value
      FROM crm_pipeline_stages s
      LEFT JOIN crm_opportunities o ON s.id = o.stage_id AND o.status = 'open'
      WHERE s.tenant_id = ${tenantId} AND s.is_active = true
      GROUP BY s.id, s.name, s.color, s.position
      ORDER BY s.position
    `

    // Get recent activities
    const recentActivities = await sql`
      SELECT 
        i.*,
        c.name as customer_name,
        l.name as lead_name
      FROM crm_interactions i
      LEFT JOIN crm_customers c ON i.customer_id = c.id
      LEFT JOIN crm_leads l ON i.lead_id = l.id
      WHERE i.tenant_id = ${tenantId}
      ORDER BY i.created_at DESC
      LIMIT 10
    `

    // Get upcoming tasks
    const upcomingTasks = await sql`
      SELECT * FROM crm_tasks
      WHERE tenant_id = ${tenantId} 
        AND status IN ('pending', 'in_progress')
        AND due_date >= NOW()
      ORDER BY due_date ASC
      LIMIT 10
    `

    // Get top customers
    const topCustomers = await sql`
      SELECT 
        c.*,
        COALESCE(SUM(o.value) FILTER (WHERE o.status = 'won'), 0) as total_value
      FROM crm_customers c
      LEFT JOIN crm_opportunities o ON c.id = o.customer_id
      WHERE c.tenant_id = ${tenantId}
      GROUP BY c.id
      ORDER BY total_value DESC
      LIMIT 5
    `

    // Get customers by classification
    const customersByClass = await sql`
      SELECT classification, COUNT(*) as count
      FROM crm_customers WHERE tenant_id = ${tenantId}
      GROUP BY classification
    `

    // Calculate conversion rate
    const totalLeads = parseInt(leadsStats[0]?.total || "0")
    const wonOpps = parseInt(oppStats[0]?.won || "0")
    const conversionRate = totalLeads > 0 ? (wonOpps / totalLeads) * 100 : 0

    // Calculate leads growth
    const thisMonth = parseInt(leadsStats[0]?.this_month || "0")
    const lastMonth = parseInt(leadsStats[0]?.last_month || "0")
    const leadsGrowth = lastMonth > 0 ? ((thisMonth - lastMonth) / lastMonth) * 100 : 0

    return NextResponse.json({
      kpis: {
        totalLeads: parseInt(leadsStats[0]?.total || "0"),
        leadsThisMonth: thisMonth,
        leadsGrowth,
        totalOpportunities: parseInt(oppStats[0]?.total || "0"),
        openOpportunities: parseInt(oppStats[0]?.open || "0"),
        pipelineValue: parseFloat(oppStats[0]?.pipeline_value || "0"),
        wonOpportunities: parseInt(oppStats[0]?.won || "0"),
        wonValue: parseFloat(oppStats[0]?.won_value || "0"),
        lostOpportunities: parseInt(oppStats[0]?.lost || "0"),
        conversionRate,
        averageTicket: parseFloat(oppStats[0]?.avg_ticket || "0"),
      },
      leadsBySource,
      leadsByStatus,
      opportunitiesByStage: oppByStage,
      customersByClassification: customersByClass,
      recentActivities,
      upcomingTasks,
      topCustomers,
    })
  } catch (error) {
    console.error("Error fetching dashboard:", error)
    return NextResponse.json(
      { error: "Failed to fetch dashboard data" },
      { status: 500 }
    )
  }
}
