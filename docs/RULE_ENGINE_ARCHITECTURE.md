# Universal Rule Engine Architecture

## Overview
A flexible, extensible rule engine that powers:
- Task Assignment (automated workflow)
- Clinical Alerts (patient safety, quality metrics)
- CDS Hooks (clinical decision support)
- Medication Assignment (auto-prescribing protocols)
- Reminders & Notifications
- Workflow Automation

## Core Components

### 1. Database Schema
- **rule_variables** - Computed variables/aggregates
- **rules** - Universal rules supporting multiple types
- **rule_executions** - Execution audit log
- **rule_templates** - Pre-built templates

### 2. Backend Services
- **Variable Evaluator** - Computes aggregates and formulas
- **Rule Engine** - Evaluates conditions and executes actions
- **Action Handlers** - Type-specific action executors

### 3. Frontend Components
- **React Query Builder** - Visual rule builder
- **Code Editor** - JSON/JSONLogic editor
- **Variable Builder** - Aggregate configuration UI
- **Rule Tester** - Test rules with sample data

## Variable System

### Variable Types

#### 1. Aggregate Variables
Compute time-based aggregates from database:
```json
{
  "name": "Average Systolic BP (24h)",
  "variable_key": "avg_bp_systolic_24h",
  "computation_type": "aggregate",
  "data_source": "observations",
  "aggregate_function": "avg",
  "aggregate_field": "value_quantity_value",
  "aggregate_filters": {
    "code_coding_code": "8480-6",
    "status": "final"
  },
  "time_window_hours": 24,
  "result_type": "number",
  "unit": "mmHg"
}
```

**Supported aggregate functions:**
- `sum` - Total
- `avg` - Average
- `count` - Count
- `min` - Minimum
- `max` - Maximum
- `last` - Most recent value
- `first` - Oldest value in window

#### 2. Formula Variables
Compute from other variables:
```json
{
  "name": "MAP (Mean Arterial Pressure)",
  "variable_key": "map",
  "computation_type": "formula",
  "formula": "({{var.bp_systolic}} + 2 * {{var.bp_diastolic}}) / 3",
  "result_type": "number",
  "unit": "mmHg"
}
```

#### 3. Lookup Variables
Database lookups:
```json
{
  "name": "Patient Risk Score",
  "variable_key": "risk_score",
  "computation_type": "lookup",
  "lookup_table": "patient_risk_assessments",
  "lookup_key": "patient_id",
  "lookup_value": "risk_score",
  "result_type": "string"
}
```

## Rule Conditions

### React Query Builder Format
UI-friendly format for visual editing:
```json
{
  "combinator": "and",
  "rules": [
    {
      "field": "var.avg_bp_systolic_24h",
      "operator": ">",
      "value": 140
    },
    {
      "field": "patient.age",
      "operator": ">=",
      "value": 65
    },
    {
      "combinator": "or",
      "rules": [
        {
          "field": "medications",
          "operator": "contains",
          "value": "antihypertensive"
        },
        {
          "field": "diagnoses",
          "operator": "contains",
          "value": "I10"
        }
      ]
    }
  ]
}
```

### JSONLogic Format
Backend evaluation format (automatically converted):
```json
{
  "and": [
    {">": [{"var": "var.avg_bp_systolic_24h"}, 140]},
    {">=": [{"var": "patient.age"}, 65]},
    {
      "or": [
        {"in": ["antihypertensive", {"var": "medications"}]},
        {"in": ["I10", {"var": "diagnoses"}]}
      ]
    }
  ]
}
```

## Rule Types & Actions

### 1. Task Assignment
```json
{
  "rule_type": "task_assignment",
  "actions": {
    "task": {
      "description": "Review elevated BP for {{patient.name}}",
      "priority": "urgent",
      "due_in_hours": 2,
      "category": "clinical_review",
      "labels": ["hypertension", "urgent"],
      "assignment": {
        "strategy": "workload_balanced",
        "pool_id": "cardiology-pool"
      }
    }
  }
}
```

### 2. Clinical Alert
```json
{
  "rule_type": "alert",
  "actions": {
    "alert": {
      "severity": "high",
      "title": "Hypertensive Crisis Alert",
      "message": "Patient BP {{var.avg_bp_systolic_24h}}/{{var.avg_bp_diastolic_24h}} mmHg",
      "display_on": ["patient_chart", "dashboard"],
      "notify_users": ["primary_provider", "care_team"],
      "requires_acknowledgment": true,
      "auto_dismiss_hours": 24
    }
  }
}
```

### 3. CDS Hook
```json
{
  "rule_type": "cds_hook",
  "actions": {
    "cds": {
      "hook_type": "patient-view",
      "cards": [
        {
          "summary": "Consider BP medication adjustment",
          "indicator": "warning",
          "source": {
            "label": "Hypertension Guidelines 2024"
          },
          "suggestions": [
            {
              "label": "Order medication review",
              "action_type": "create_task"
            },
            {
              "label": "Increase current dose",
              "action_type": "suggest_prescription"
            }
          ]
        }
      ]
    }
  }
}
```

### 4. Medication Assignment
```json
{
  "rule_type": "medication_assignment",
  "actions": {
    "medication": {
      "suggestion_type": "protocol",
      "medications": [
        {
          "code": "197361",
          "display": "Lisinopril 10mg",
          "dosage": "10 mg once daily",
          "route": "oral",
          "reason": "Hypertension management per protocol"
        }
      ],
      "requires_approval": true,
      "notify_provider": true
    }
  }
}
```

## Available Fields for Conditions

### Patient Fields
- `patient.id`
- `patient.age`
- `patient.gender`
- `patient.active_problems[]`
- `patient.active_medications[]`
- `patient.allergies[]`

### Event Fields
- `event.type`
- `event.timestamp`
- `event.data.*`

### Computed Variables
- `var.{variable_key}` - Any defined variable

### Context Fields
- `context.user_role`
- `context.location`
- `context.time_of_day`
- `context.day_of_week`

## Operators Supported

### Comparison
- `=`, `!=` - Equals, Not equals
- `<`, `<=`, `>`, `>=` - Numeric comparison
- `between` - Range check

### String
- `contains` - Substring match
- `startsWith`, `endsWith` - String prefix/suffix
- `matches` - Regex match

### Array
- `in` - Value in array
- `notIn` - Value not in array
- `contains` - Array contains value
- `isEmpty` - Array is empty

### Logical
- `and`, `or`, `not` - Boolean logic

## Execution Flow

```
1. Event Triggered
   ↓
2. Load Active Rules for Event Type
   ↓
3. For Each Rule:
   a. Compute Required Variables
   b. Evaluate Conditions
   c. If Conditions Met:
      - Execute Actions
      - Log Execution
      - Update Statistics
```

## Performance Optimization

### Variable Caching
- Variables cached for `cache_duration_minutes`
- Per-patient cache invalidation
- Cache warming for frequently used variables

### Rule Optimization
- Rules sorted by priority
- Early exit on first non-matching condition
- Batch execution for multiple patients
- Async action execution

## Security & Audit

### Rule Execution Log
Every execution logged with:
- Trigger event & data
- Computed variables
- Condition evaluation result
- Actions performed
- Execution time
- Errors

### Permissions
- Role-based rule management
- Org-scoped rules
- Audit trail for changes

## Example Use Cases

### Use Case 1: Lab Result Review Task
**Trigger:** Lab result received
**Variables:**
- `abnormal_results_count` - Count of abnormal results in last 7 days
- `high_priority_tests` - List of urgent test types

**Condition:** Result is abnormal AND test type is high-priority
**Action:** Create task for provider to review

### Use Case 2: Sepsis Alert
**Trigger:** Vital signs recorded
**Variables:**
- `temp_last` - Last temperature
- `hr_avg_1h` - Average heart rate (1 hour)
- `wbc_last` - Most recent WBC count

**Condition:** SIRS criteria met (temp, HR, WBC abnormal)
**Action:** Display critical alert, page on-call physician

### Use Case 3: Medication Adherence
**Trigger:** Daily scheduled check
**Variables:**
- `missed_doses_7d` - Missed doses in last 7 days
- `prescription_refill_due` - Days until refill due

**Condition:** Missed doses > 2 OR refill due in < 3 days
**Action:** Send reminder to patient, notify care coordinator

## Installation & Setup

### Backend
```bash
npm install jsonlogic-js date-fns
```

### Frontend
```bash
npm install react-querybuilder @monaco-editor/react
npm install classnames
```

### Configuration
See `/docs/RULE_ENGINE_SETUP.md` for detailed setup instructions.

## API Endpoints

### Variables
- `GET /api/rule-variables` - List variables
- `POST /api/rule-variables` - Create variable
- `PUT /api/rule-variables/:id` - Update variable
- `DELETE /api/rule-variables/:id` - Delete variable
- `POST /api/rule-variables/:id/compute` - Test computation

### Rules
- `GET /api/rules` - List rules (filterable by type)
- `POST /api/rules` - Create rule
- `PUT /api/rules/:id` - Update rule
- `DELETE /api/rules/:id` - Delete rule
- `POST /api/rules/:id/test` - Test rule
- `GET /api/rules/:id/executions` - Execution history

### Templates
- `GET /api/rule-templates` - List templates
- `POST /api/rules/from-template/:templateId` - Create from template

## Future Enhancements

1. **Machine Learning Integration**
   - Learn optimal rule parameters from outcomes
   - Predict rule effectiveness

2. **Rule Versioning**
   - Track rule changes
   - A/B testing of rules

3. **Natural Language Rule Creation**
   - "Alert me when patient BP is high"
   - Auto-generate rule from text

4. **Visual Rule Flow Designer**
   - Drag-and-drop rule builder
   - Multi-step workflows

5. **External System Integration**
   - Trigger rules from external events
   - Execute actions in external systems
