-- Dashboard snapshot storage for multi-role analytics
-- Provides persisted payloads for role-specific dashboards that can
-- be served quickly from the API without recalculating heavy metrics.

CREATE TABLE IF NOT EXISTS dashboard_snapshots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID,
  location_ids UUID[],
  role_level TEXT NOT NULL CHECK (role_level IN ('executive', 'clinical', 'operations', 'billing', 'patient', 'general')),
  data_mode TEXT NOT NULL CHECK (data_mode IN ('actual', 'demo')),
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  payload JSONB NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_dashboard_snapshots_org_role_mode
  ON dashboard_snapshots(org_id, role_level, data_mode, period_end DESC);

CREATE INDEX IF NOT EXISTS idx_dashboard_snapshots_role_mode
  ON dashboard_snapshots(role_level, data_mode, period_end DESC);

CREATE OR REPLACE FUNCTION update_dashboard_snapshots_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_dashboard_snapshots_updated_at ON dashboard_snapshots;
CREATE TRIGGER trg_dashboard_snapshots_updated_at
BEFORE UPDATE ON dashboard_snapshots
FOR EACH ROW
EXECUTE FUNCTION update_dashboard_snapshots_updated_at();

-- Seed baseline demo data for each major role profile so that
-- organizations immediately see a meaningful dashboard experience.
-- These payloads can later be replaced by ETL jobs that calculate
-- organization-specific metrics.

WITH upsert_demo AS (
  SELECT COUNT(*) AS existing
  FROM dashboard_snapshots
  WHERE org_id IS NULL
    AND role_level = 'executive'
    AND data_mode = 'demo'
)
INSERT INTO dashboard_snapshots (org_id, role_level, data_mode, period_start, period_end, payload)
SELECT
  NULL,
  'executive',
  'demo',
  (CURRENT_DATE - INTERVAL '30 days')::date,
  CURRENT_DATE,
  $$
  {
    "meta": {
      "title": "Executive Outcomes",
      "description": "Financial and operational signals that impact growth and compliance.",
      "defaultActions": [
        { "label": "Export KPI Pack", "href": "/rcm/reports" },
        { "label": "Schedule Ops Review", "href": "/appointments?type=review" }
      ],
      "recommendedFilters": ["Last 30 Days", "All Locations"],
      "owner": "executive"
    },
    "summary": [
      {
        "id": "net_revenue",
        "title": "Net Revenue (MTD)",
        "value": 245000,
        "displayValue": "$245K",
        "change": 4.2,
        "changeDirection": "up",
        "changeLabel": "vs last month",
        "target": 240000,
        "status": "on_track",
        "trend": [210000, 224000, 235000, 245000]
      },
      {
        "id": "claim_denial_rate",
        "title": "Claim Denial Rate",
        "value": 0.048,
        "displayValue": "4.8%",
        "change": -1.2,
        "changeDirection": "down",
        "changeLabel": "vs prior period",
        "target": 0.05,
        "status": "needs_attention",
        "trend": [0.062, 0.057, 0.053, 0.048]
      },
      {
        "id": "patient_satisfaction",
        "title": "Patient Satisfaction",
        "value": 88,
        "displayValue": "88 / 100",
        "change": 6,
        "changeDirection": "up",
        "changeLabel": "vs last quarter",
        "target": 90,
        "status": "trending_up",
        "trend": [80, 82, 85, 88]
      },
      {
        "id": "cash_collected",
        "title": "Cash Collected",
        "value": 182000,
        "displayValue": "$182K",
        "change": 7.5,
        "changeDirection": "up",
        "changeLabel": "vs prior month",
        "target": 175000,
        "status": "on_track",
        "trend": [150000, 162000, 169000, 182000]
      }
    ],
    "sections": [
      {
        "id": "executive-performance-drivers",
        "title": "Performance Drivers",
        "description": "Understand the levers that moved revenue and quality this period.",
        "type": "table",
        "table": {
          "columns": [
            { "key": "metric", "label": "Metric" },
            { "key": "current", "label": "Current" },
            { "key": "target", "label": "Target" },
            { "key": "delta", "label": "Δ" },
            { "key": "owner", "label": "Owner" }
          ],
          "rows": [
            { "metric": "Outpatient Revenue", "current": "$145K", "target": "$150K", "delta": "+6.5%", "owner": "Service Line Ops", "status": "positive" },
            { "metric": "Readmission Rate", "current": "8.2%", "target": "7.5%", "delta": "+0.7pp", "owner": "Care Management", "status": "warning" },
            { "metric": "AR > 90 Days", "current": "$38K", "target": "$25K", "delta": "-12.0%", "owner": "Revenue Cycle", "status": "warning" }
          ]
        },
        "actions": [
          { "label": "Review Denial Workbench", "href": "/rcm/denials", "variant": "primary" },
          { "label": "Drill into Readmissions", "href": "/quality/readmissions" }
        ]
      },
      {
        "id": "executive-worklist",
        "title": "Executive Worklist",
        "description": "Focus for this week to keep momentum.",
        "type": "worklist",
        "items": [
          { "title": "Approve cardiology expansion forecast", "due": "Today", "impact": "Revenue", "owner": "CFO" },
          { "title": "Confirm payor contract renegotiation scope", "due": "Tomorrow", "impact": "Margin", "owner": "COO" },
          { "title": "Sign off on compliance remediation", "due": "This Week", "impact": "Compliance", "owner": "CIO" }
        ]
      }
    ],
    "insights": [
      {
        "id": "executive-insight-1",
        "title": "Revenue pacing ahead of target",
        "body": "Net revenue is 4.2% ahead of goal driven by higher outpatient conversions. Maintain add-on service campaigns to stay on trajectory.",
        "severity": "positive",
        "recommendedAction": "Share update with board"
      },
      {
        "id": "executive-insight-2",
        "title": "AR aging requires intervention",
        "body": "Accounts receivable >90 days grew by $6K. Initiate a targeted follow-up cadence with top three commercial payors.",
        "severity": "warning",
        "recommendedAction": "Launch AR recovery sprint"
      }
    ]
  }
  $$::jsonb
WHERE NOT EXISTS (
  SELECT 1 FROM dashboard_snapshots WHERE org_id IS NULL AND role_level = 'executive' AND data_mode = 'demo'
);

WITH upsert_demo_clinical AS (
  SELECT COUNT(*) AS existing
  FROM dashboard_snapshots
  WHERE org_id IS NULL
    AND role_level = 'clinical'
    AND data_mode = 'demo'
)
INSERT INTO dashboard_snapshots (org_id, role_level, data_mode, period_start, period_end, payload)
SELECT
  NULL,
  'clinical',
  'demo',
  (CURRENT_DATE - INTERVAL '14 days')::date,
  CURRENT_DATE,
  $$
  {
    "meta": {
      "title": "Clinical Outcomes",
      "description": "Drive clinical excellence across assigned panels.",
      "defaultActions": [
        { "label": "Start Morning Huddle", "href": "/encounters/worklist" },
        { "label": "Review Quality Measures", "href": "/quality" }
      ],
      "owner": "clinical"
    },
    "summary": [
      { "id": "open_care_gaps", "title": "Open Care Gaps", "value": 32, "displayValue": "32 patients", "change": -12, "changeDisplay": "12 fewer", "changeDirection": "down", "changeLabel": "vs last week", "target": 20, "status": "trending_up" },
      { "id": "avg_wait_time", "title": "Average Wait Time", "value": 14, "displayValue": "14 mins", "change": -3, "changeDisplay": "3 mins faster", "changeDirection": "down", "changeLabel": "vs last month", "target": 12, "status": "on_track" },
      { "id": "follow_up_completion", "title": "Follow-up Completion", "value": 0.86, "displayValue": "86%", "change": 5, "changeDirection": "up", "changeLabel": "vs baseline", "target": 0.9, "status": "needs_attention" }
    ],
    "sections": [
      {
        "id": "clinical-care-gap-table",
        "title": "Care Gap Priorities",
        "type": "table",
        "description": "Target the patients most at risk this week.",
        "table": {
          "columns": [
            { "key": "patient", "label": "Patient" },
            { "key": "gap", "label": "Gap" },
            { "key": "lastSeen", "label": "Last Seen" },
            { "key": "risk", "label": "Risk" },
            { "key": "action", "label": "Action" }
          ],
          "rows": [
            { "patient": "Anita Sharma", "gap": "HbA1c overdue", "lastSeen": "92 days", "risk": "High", "action": "Schedule lab", "status": "warning" },
            { "patient": "Rohan Patel", "gap": "BP follow-up", "lastSeen": "61 days", "risk": "Medium", "action": "Nurse call", "status": "neutral" },
            { "patient": "Lata Iyer", "gap": "Diabetic eye exam", "lastSeen": "181 days", "risk": "High", "action": "Refer ophthalmology", "status": "warning" }
          ]
        },
        "actions": [
          { "label": "Bulk Outreach", "href": "/patients/outreach", "variant": "primary" },
          { "label": "Assign to Care Coordinator", "href": "/staff/tasks" }
        ]
      },
      {
        "id": "clinical-worklist",
        "title": "Today\'s Worklist",
        "type": "worklist",
        "items": [
          { "title": "3 patients with unread lab results", "due": "Today", "impact": "Clinical Quality", "owner": "You" },
          { "title": "Close 4 unsigned encounter notes", "due": "Today", "impact": "Billing", "owner": "You" },
          { "title": "Pre-round with nursing team", "due": "Tomorrow", "impact": "Patient Experience", "owner": "Team" }
        ]
      }
    ],
    "insights": [
      {
        "id": "clinical-insight-1",
        "title": "Hypertension panel improving",
        "body": "86% of hypertensive patients are controlled compared to 78% last quarter.",
        "severity": "positive"
      },
      {
        "id": "clinical-insight-2",
        "title": "Three high-risk discharges without follow-up",
        "body": "Schedule post-discharge visits within 7 days to avoid readmissions.",
        "severity": "warning",
        "recommendedAction": "Review discharge tracker"
      }
    ]
  }
  $$::jsonb
WHERE NOT EXISTS (
  SELECT 1 FROM dashboard_snapshots WHERE org_id IS NULL AND role_level = 'clinical' AND data_mode = 'demo'
);

WITH upsert_demo_operations AS (
  SELECT COUNT(*) AS existing
  FROM dashboard_snapshots
  WHERE org_id IS NULL
    AND role_level = 'operations'
    AND data_mode = 'demo'
)
INSERT INTO dashboard_snapshots (org_id, role_level, data_mode, period_start, period_end, payload)
SELECT
  NULL,
  'operations',
  'demo',
  (CURRENT_DATE - INTERVAL '7 days')::date,
  CURRENT_DATE,
  $$
  {
    "meta": {
      "title": "Operations Pulse",
      "description": "Front office throughput and patient flow signals.",
      "owner": "operations"
    },
    "summary": [
      { "id": "checkins", "title": "Check-ins Completed", "value": 412, "displayValue": "412", "change": 9.5, "changeDirection": "up", "changeLabel": "vs prior week", "status": "on_track" },
      { "id": "no_show_rate", "title": "No-show Rate", "value": 0.065, "displayValue": "6.5%", "change": -1.8, "changeDirection": "down", "changeLabel": "vs prior week", "target": 0.07, "status": "positive" },
      { "id": "avg_checkin_time", "title": "Avg Check-in Time", "value": 4.2, "displayValue": "4.2 mins", "change": -0.8, "changeDisplay": "0.8 mins faster", "changeDirection": "down", "changeLabel": "vs baseline", "target": 5, "status": "positive" }
    ],
    "sections": [
      {
        "id": "operations-throughput",
        "title": "Throughput by Location",
        "type": "table",
        "table": {
          "columns": [
            { "key": "location", "label": "Location" },
            { "key": "visits", "label": "Visits" },
            { "key": "waitTime", "label": "Wait Time" },
            { "key": "noShow", "label": "No-show" },
            { "key": "capacity", "label": "Capacity" }
          ],
          "rows": [
            { "location": "Main Campus", "visits": 210, "waitTime": "12 mins", "noShow": "5.8%", "capacity": "82%", "status": "neutral" },
            { "location": "City Clinic", "visits": 128, "waitTime": "9 mins", "noShow": "7.2%", "capacity": "76%", "status": "warning" },
            { "location": "Telehealth", "visits": 74, "waitTime": "2 mins", "noShow": "3.1%", "capacity": "91%", "status": "positive" }
          ]
        },
        "actions": [
          { "label": "Balance provider schedules", "href": "/appointments/schedule" },
          { "label": "Launch no-show campaign", "href": "/patients/outreach", "variant": "primary" }
        ]
      },
      {
        "id": "operations-worklist",
        "title": "Action Queue",
        "type": "worklist",
        "items": [
          { "title": "Call 8 patients to rebook", "due": "Today", "impact": "Utilization" },
          { "title": "Upload consent forms for outreach", "due": "Tomorrow", "impact": "Compliance" },
          { "title": "Update signage for kiosk", "due": "This Week", "impact": "Patient Experience" }
        ]
      }
    ],
    "insights": [
      { "id": "operations-insight-1", "title": "Kiosk usage climbed 14%", "body": "Self-service adoption reduced average check-in time by 48 seconds.", "severity": "positive" },
      { "id": "operations-insight-2", "title": "Afternoon staffing gap", "body": "City Clinic experiences 18-minute waits after 3pm. Add one floating MA on Tuesdays and Thursdays.", "severity": "warning" }
    ]
  }
  $$::jsonb
WHERE NOT EXISTS (
  SELECT 1 FROM dashboard_snapshots WHERE org_id IS NULL AND role_level = 'operations' AND data_mode = 'demo'
);

WITH upsert_demo_billing AS (
  SELECT COUNT(*) AS existing
  FROM dashboard_snapshots
  WHERE org_id IS NULL
    AND role_level = 'billing'
    AND data_mode = 'demo'
)
INSERT INTO dashboard_snapshots (org_id, role_level, data_mode, period_start, period_end, payload)
SELECT
  NULL,
  'billing',
  'demo',
  (CURRENT_DATE - INTERVAL '30 days')::date,
  CURRENT_DATE,
  $$
  {
    "meta": {
      "title": "Revenue Cycle",
      "description": "Stay ahead of cash flow risks and denials.",
      "owner": "billing"
    },
    "summary": [
      { "id": "claims_submitted", "title": "Claims Submitted", "value": 1280, "displayValue": "1,280", "change": 3.4, "changeDirection": "up", "changeLabel": "vs last month", "status": "on_track" },
      { "id": "days_in_ar", "title": "Days in A/R", "value": 38, "displayValue": "38 days", "change": -2, "changeDisplay": "2 days faster", "changeDirection": "down", "changeLabel": "vs prior period", "target": 35, "status": "needs_attention" },
      { "id": "clean_claim_rate", "title": "Clean Claim Rate", "value": 0.924, "displayValue": "92.4%", "change": 1.6, "changeDirection": "up", "changeLabel": "vs last month", "target": 0.95, "status": "trending_up" }
    ],
    "sections": [
      {
        "id": "billing-denials",
        "title": "Denial Watchlist",
        "type": "table",
        "table": {
          "columns": [
            { "key": "reason", "label": "Reason" },
            { "key": "count", "label": "Count" },
            { "key": "value", "label": "Value" },
            { "key": "trend", "label": "Trend" },
            { "key": "owner", "label": "Owner" }
          ],
          "rows": [
            { "reason": "Coding errors", "count": 18, "value": "$24.6K", "trend": "+3", "owner": "Coding", "status": "warning" },
            { "reason": "Eligibility", "count": 11, "value": "$11.4K", "trend": "-2", "owner": "Front Desk", "status": "neutral" },
            { "reason": "Authorization", "count": 9, "value": "$9.1K", "trend": "+1", "owner": "Care Coordination", "status": "warning" }
          ]
        },
        "actions": [
          { "label": "Launch coding QA", "href": "/rcm/coding", "variant": "primary" },
          { "label": "Eligibility training", "href": "/staff/training" }
        ]
      },
      {
        "id": "billing-worklist",
        "title": "Work Queues",
        "type": "worklist",
        "items": [
          { "title": "Post 42 electronic remits", "due": "Today", "impact": "Cash", "owner": "Payments" },
          { "title": "Appeal 6 high-value denials", "due": "Tomorrow", "impact": "Revenue", "owner": "Denials" },
          { "title": "Close 12 coding audits", "due": "This Week", "impact": "Compliance", "owner": "Coding" }
        ]
      }
    ],
    "insights": [
      { "id": "billing-insight-1", "title": "Authorization denials concentrated", "body": "Three payors account for 74% of auth denials. Create pre-service checklist for MRI orders.", "severity": "warning" },
      { "id": "billing-insight-2", "title": "ERA auto-posting saved 11 hours", "body": "Automation handled 82% of remits this week, freeing analysts for denial follow-up.", "severity": "positive" }
    ]
  }
  $$::jsonb
WHERE NOT EXISTS (
  SELECT 1 FROM dashboard_snapshots WHERE org_id IS NULL AND role_level = 'billing' AND data_mode = 'demo'
);

-- Provide matching "actual" snapshots so toggling to actual has
-- content even before real integrations push metrics.
INSERT INTO dashboard_snapshots (org_id, role_level, data_mode, period_start, period_end, payload)
SELECT
  NULL,
  role_level,
  'actual',
  period_start,
  period_end,
  jsonb_set(payload, '{meta,source}', '"snapshot"'::jsonb, true)
FROM dashboard_snapshots
WHERE org_id IS NULL AND data_mode = 'demo'
  AND NOT EXISTS (
    SELECT 1 FROM dashboard_snapshots ds
    WHERE ds.org_id IS NULL
      AND ds.role_level = dashboard_snapshots.role_level
      AND ds.data_mode = 'actual'
  );
