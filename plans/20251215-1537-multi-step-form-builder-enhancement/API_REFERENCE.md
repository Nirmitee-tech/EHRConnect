# Multi-Step Forms API Reference

**Version**: 1.0.0
**Base URL**: `http://localhost:8000/api/forms`
**Authentication**: Bearer token required for all endpoints

---

## Table of Contents

1. [Multi-Step Form Management](#multi-step-form-management)
2. [Progress Tracking](#progress-tracking)
3. [Visit Templates (eCRF)](#visit-templates-ecrf)

---

## Multi-Step Form Management

### Create Form Step

Create a new step in a multi-step form.

**Endpoint**: `POST /templates/:id/steps`

**Permission**: `forms:write`

**Path Parameters**:
- `id` (UUID) - Form template ID

**Request Body**:
```json
{
  "step_order": 1,
  "title": "Demographics",
  "description": "Patient basic information",
  "navigation_config": {
    "allowBack": true,
    "allowSkip": false,
    "showProgress": true
  },
  "validation_config": {
    "validateOnNext": true,
    "validateOnBlur": false,
    "required": false
  },
  "fields": [
    {
      "linkId": "first_name",
      "text": "First Name",
      "type": "string",
      "required": true
    }
  ],
  "conditional_logic": {
    "showWhen": {
      "field": "patient_type",
      "operator": "equals",
      "value": "new"
    }
  }
}
```

**Response**: `201 Created`
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "form_template_id": "550e8400-e29b-41d4-a716-446655440001",
  "org_id": "550e8400-e29b-41d4-a716-446655440002",
  "step_order": 1,
  "title": "Demographics",
  "description": "Patient basic information",
  "navigation_config": {...},
  "validation_config": {...},
  "fields": [...],
  "conditional_logic": {...},
  "created_at": "2025-12-15T10:00:00Z",
  "updated_at": "2025-12-15T10:00:00Z",
  "created_by": "user-uuid",
  "updated_by": "user-uuid"
}
```

**Errors**:
- `404 Not Found` - Form template not found
- `400 Bad Request` - Invalid request body
- `401 Unauthorized` - Missing or invalid token
- `403 Forbidden` - Insufficient permissions

---

### Get Form Steps

Retrieve all steps for a form template, ordered by step_order.

**Endpoint**: `GET /templates/:id/steps`

**Path Parameters**:
- `id` (UUID) - Form template ID

**Response**: `200 OK`
```json
[
  {
    "id": "step-uuid-1",
    "step_order": 1,
    "title": "Demographics",
    "fields": [...]
  },
  {
    "id": "step-uuid-2",
    "step_order": 2,
    "title": "Medical History",
    "fields": [...]
  }
]
```

---

### Get Single Step

Retrieve a specific step by ID.

**Endpoint**: `GET /steps/:stepId`

**Path Parameters**:
- `stepId` (UUID) - Step ID

**Response**: `200 OK`
```json
{
  "id": "step-uuid",
  "form_template_id": "form-uuid",
  "step_order": 1,
  "title": "Demographics",
  "description": "Patient basic information",
  "navigation_config": {...},
  "validation_config": {...},
  "fields": [...],
  "created_at": "2025-12-15T10:00:00Z"
}
```

**Errors**:
- `404 Not Found` - Step not found

---

### Update Form Step

Update an existing step. Only provided fields will be updated.

**Endpoint**: `PUT /steps/:stepId`

**Permission**: `forms:write`

**Path Parameters**:
- `stepId` (UUID) - Step ID

**Request Body** (all fields optional):
```json
{
  "title": "Updated Demographics",
  "description": "Updated description",
  "step_order": 2,
  "navigation_config": {
    "allowBack": false
  },
  "fields": [...]
}
```

**Response**: `200 OK`
```json
{
  "id": "step-uuid",
  "title": "Updated Demographics",
  "step_order": 2,
  "updated_at": "2025-12-15T11:00:00Z"
}
```

**Errors**:
- `404 Not Found` - Step not found
- `400 Bad Request` - Invalid update data

---

### Delete Form Step

Delete a form step.

**Endpoint**: `DELETE /steps/:stepId`

**Permission**: `forms:write`

**Path Parameters**:
- `stepId` (UUID) - Step ID

**Response**: `204 No Content`

**Errors**:
- `404 Not Found` - Step not found

---

### Reorder Form Steps

Reorder multiple steps in a single operation.

**Endpoint**: `POST /templates/:id/steps/reorder`

**Permission**: `forms:write`

**Path Parameters**:
- `id` (UUID) - Form template ID

**Request Body**:
```json
{
  "stepOrder": [
    { "id": "step-uuid-1", "order": 2 },
    { "id": "step-uuid-2", "order": 1 },
    { "id": "step-uuid-3", "order": 3 }
  ]
}
```

**Response**: `200 OK`
```json
{
  "message": "Steps reordered successfully"
}
```

**Errors**:
- `400 Bad Request` - stepOrder must be array

---

## Progress Tracking

### Save Form Progress

Save user progress with auto-save support. Uses upsert logic based on (form_template_id, user_id, session_id).

**Endpoint**: `POST /templates/:id/progress`

**Path Parameters**:
- `id` (UUID) - Form template ID

**Request Body**:
```json
{
  "sessionId": "session-abc123",
  "current_step": 2,
  "step_data": {
    "step_1": {
      "first_name": "John",
      "last_name": "Doe",
      "date_of_birth": "1990-01-15"
    },
    "step_2": {
      "address": "123 Main St",
      "city": "Springfield"
    }
  },
  "completed_steps": [1, 2],
  "patient_id": "patient-uuid",
  "encounter_id": "encounter-uuid",
  "episode_id": "episode-uuid"
}
```

**Response**: `200 OK`
```json
{
  "id": "progress-uuid",
  "form_template_id": "form-uuid",
  "user_id": "user-uuid",
  "org_id": "org-uuid",
  "current_step": 2,
  "step_data": {...},
  "completed_steps": [1, 2],
  "session_id": "session-abc123",
  "last_saved_at": "2025-12-15T10:30:00Z",
  "is_completed": false,
  "created_at": "2025-12-15T10:00:00Z",
  "updated_at": "2025-12-15T10:30:00Z"
}
```

**Errors**:
- `400 Bad Request` - sessionId is required

---

### Get Form Progress

Retrieve user's progress for a form session.

**Endpoint**: `GET /templates/:id/progress?sessionId={sessionId}`

**Path Parameters**:
- `id` (UUID) - Form template ID

**Query Parameters**:
- `sessionId` (string, required) - Session identifier

**Response**: `200 OK`
```json
{
  "id": "progress-uuid",
  "current_step": 2,
  "step_data": {...},
  "completed_steps": [1, 2],
  "is_completed": false,
  "last_saved_at": "2025-12-15T10:30:00Z"
}
```

**Errors**:
- `400 Bad Request` - sessionId query parameter required
- `404 Not Found` - No progress found for session

---

### Complete Form Progress

Mark form progress as completed.

**Endpoint**: `PUT /progress/:progressId/complete`

**Path Parameters**:
- `progressId` (UUID) - Progress record ID

**Response**: `200 OK`
```json
{
  "id": "progress-uuid",
  "is_completed": true,
  "completed_at": "2025-12-15T11:00:00Z",
  "updated_at": "2025-12-15T11:00:00Z"
}
```

**Errors**:
- `404 Not Found` - Progress record not found

---

### List Form Progress (Admin)

List all progress records for a form with optional filters.

**Endpoint**: `GET /templates/:id/progress/list`

**Permission**: `forms:read`

**Path Parameters**:
- `id` (UUID) - Form template ID

**Query Parameters** (optional):
- `userId` (UUID) - Filter by user
- `isCompleted` (boolean) - Filter by completion status

**Response**: `200 OK`
```json
[
  {
    "id": "progress-uuid-1",
    "user_id": "user-uuid-1",
    "user_email": "user1@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "current_step": 3,
    "is_completed": false,
    "last_saved_at": "2025-12-15T10:30:00Z"
  },
  {
    "id": "progress-uuid-2",
    "user_id": "user-uuid-2",
    "user_email": "user2@example.com",
    "first_name": "Jane",
    "last_name": "Smith",
    "current_step": 5,
    "is_completed": true,
    "completed_at": "2025-12-15T09:00:00Z"
  }
]
```

---

## Visit Templates (eCRF)

### Create Visit Template

Create a visit template for clinical trials.

**Endpoint**: `POST /visit-templates`

**Permission**: `forms:write`

**Request Body**:
```json
{
  "trialId": "TRIAL-001",
  "visit_name": "Baseline Visit",
  "visit_code": "BL",
  "visit_type": "baseline",
  "frequency_config": {
    "type": "weekly",
    "interval": 4,
    "window": {
      "before": 2,
      "after": 3,
      "unit": "days"
    }
  },
  "form_template_ids": [
    "form-uuid-1",
    "form-uuid-2"
  ],
  "cdash_annotations": {
    "domain": "VS",
    "variables": ["VSDTC", "VSTEST", "VSORRES"],
    "mapping": {
      "VSDTC": "visit_date",
      "VSTEST": "test_name"
    }
  },
  "display_order": 1,
  "description": "Initial baseline visit for trial participants",
  "instructions": "Complete all forms during patient's first visit"
}
```

**Response**: `201 Created`
```json
{
  "id": "visit-uuid",
  "org_id": "org-uuid",
  "trial_id": "TRIAL-001",
  "visit_name": "Baseline Visit",
  "visit_code": "BL",
  "visit_type": "baseline",
  "frequency_config": {...},
  "form_template_ids": [...],
  "cdash_annotations": {...},
  "display_order": 1,
  "is_active": true,
  "created_at": "2025-12-15T10:00:00Z",
  "created_by": "user-uuid"
}
```

**Errors**:
- `400 Bad Request` - trialId is required

---

### Get Visit Templates by Trial

Retrieve all active visit templates for a trial.

**Endpoint**: `GET /visit-templates/trial/:trialId`

**Path Parameters**:
- `trialId` (string) - Trial identifier

**Response**: `200 OK`
```json
[
  {
    "id": "visit-uuid-1",
    "visit_name": "Baseline Visit",
    "visit_type": "baseline",
    "display_order": 1
  },
  {
    "id": "visit-uuid-2",
    "visit_name": "Week 4 Visit",
    "visit_type": "interim",
    "display_order": 2
  }
]
```

---

### Get Single Visit Template

Retrieve a specific visit template.

**Endpoint**: `GET /visit-templates/:id`

**Path Parameters**:
- `id` (UUID) - Visit template ID

**Response**: `200 OK`
```json
{
  "id": "visit-uuid",
  "trial_id": "TRIAL-001",
  "visit_name": "Baseline Visit",
  "visit_type": "baseline",
  "frequency_config": {...},
  "form_template_ids": [...],
  "cdash_annotations": {...}
}
```

**Errors**:
- `404 Not Found` - Visit template not found

---

### Update Visit Template

Update an existing visit template.

**Endpoint**: `PUT /visit-templates/:id`

**Permission**: `forms:write`

**Path Parameters**:
- `id` (UUID) - Visit template ID

**Request Body** (all fields optional):
```json
{
  "visit_name": "Updated Baseline Visit",
  "description": "Updated description",
  "form_template_ids": ["form-uuid-1", "form-uuid-2", "form-uuid-3"]
}
```

**Response**: `200 OK`
```json
{
  "id": "visit-uuid",
  "visit_name": "Updated Baseline Visit",
  "updated_at": "2025-12-15T11:00:00Z"
}
```

**Errors**:
- `404 Not Found` - Visit template not found

---

### Delete Visit Template

Soft delete a visit template (sets is_active = false).

**Endpoint**: `DELETE /visit-templates/:id`

**Permission**: `forms:write`

**Path Parameters**:
- `id` (UUID) - Visit template ID

**Response**: `204 No Content`

**Errors**:
- `404 Not Found` - Visit template not found

---

## Common Response Codes

- `200 OK` - Request succeeded
- `201 Created` - Resource created successfully
- `204 No Content` - Request succeeded, no content to return
- `400 Bad Request` - Invalid request body or parameters
- `401 Unauthorized` - Missing or invalid authentication token
- `403 Forbidden` - User lacks required permissions
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error

---

## Authentication

All endpoints require a Bearer token in the Authorization header:

```http
Authorization: Bearer {your-jwt-token}
```

Obtain token via `/api/auth/login` endpoint.

---

## Rate Limiting

**Recommended** (not yet implemented):
- Auto-save endpoint: 10 requests/minute per user
- Other endpoints: Standard rate limits apply

---

## Data Size Limits

**Recommended** (not yet enforced):
- `step_data` JSONB: Max 100KB per save
- `fields` array: Max 50 fields per step
- `form_template_ids` array: Max 20 forms per visit

---

## Examples

### Complete Multi-Step Form Flow

```bash
# 1. Create form template
curl -X POST http://localhost:8000/api/forms/templates \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title": "Patient Intake", "status": "draft"}'

# 2. Add steps
curl -X POST http://localhost:8000/api/forms/templates/{id}/steps \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"step_order": 1, "title": "Demographics", "fields": [...]}'

# 3. Save progress (auto-save)
curl -X POST http://localhost:8000/api/forms/templates/{id}/progress \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"sessionId": "session-123", "current_step": 1, "step_data": {...}}'

# 4. Resume progress
curl -X GET "http://localhost:8000/api/forms/templates/{id}/progress?sessionId=session-123" \
  -H "Authorization: Bearer $TOKEN"

# 5. Complete form
curl -X PUT http://localhost:8000/api/forms/progress/{progressId}/complete \
  -H "Authorization: Bearer $TOKEN"
```

---

**Last Updated**: 2025-12-15
**Version**: 1.0.0
