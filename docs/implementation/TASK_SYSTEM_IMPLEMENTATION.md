# Task Management System - Implementation Guide

## ✅ COMPLETED (Phase 1 & 2)

### Database Schema ✅
**File**: `src/database/migrations/20240101000033-create_tasks_system.js`

- ✅ 12 tables created with full FHIR R4 compliance
- ✅ 40+ optimized indexes for scalability
- ✅ Automatic audit logging via triggers
- ✅ Soft deletes with proper constraints
- ✅ Multi-tenancy support
- ✅ Integration ready (appointments, forms, orders, encounters)

**Tables Created**:
1. `tasks` - Main tasks table (FHIR-compliant)
2. `task_pools` - User groups for task assignment
3. `task_pool_members` - Pool membership
4. `task_subtasks` - Break tasks into smaller pieces
5. `task_comments` - Discussion threads
6. `task_history` - Complete audit trail
7. `task_reminders` - Scheduled reminders
8. `task_templates` - Reusable task templates
9. `task_webhooks` - Webhook configurations
10. `task_webhook_logs` - Webhook delivery tracking
11. `task_notifications` - In-app notifications
12. `task_analytics_cache` - Pre-computed analytics

### Task Service Layer ✅
**File**: `src/services/task.service.js`

Comprehensive service with:
- ✅ Create tasks with automatic pool assignment
- ✅ Search/filter tasks with pagination
- ✅ Update tasks with change tracking
- ✅ Soft delete tasks
- ✅ Claim tasks from pools
- ✅ Add/manage comments with mentions
- ✅ Subtask management
- ✅ Task pool CRUD operations
- ✅ Automatic notification creation
- ✅ History logging
- ✅ Analytics aggregation
- ✅ Webhook trigger points

---

## 📋 REMAINING IMPLEMENTATION

### Backend (3-4 hours)

#### 1. FHIR Task Controller
**File**: `src/controllers/fhir-task.controller.js`

```javascript
// Key features needed:
- Convert database tasks to FHIR R4 Task resources
- FHIR search parameters support (_id, patient, status, etc.)
- Bundle creation for search results
- FHIR validation
- Integration with existing FHIR endpoints
```

**Integration**: Add to `src/routes/fhir.js`

#### 2. REST API Routes
**File**: `src/routes/tasks.js`

```javascript
// Required endpoints:
POST   /api/tasks                      // Create task
GET    /api/tasks                      // List/search tasks
GET    /api/tasks/:id                  // Get task details
PUT    /api/tasks/:id                  // Update task
DELETE /api/tasks/:id                  // Delete task
POST   /api/tasks/:id/claim            // Claim task from pool
POST   /api/tasks/:id/comments         // Add comment
GET    /api/tasks/:id/comments         // Get comments
GET    /api/tasks/:id/history          // Get history
POST   /api/tasks/:id/subtasks         // Add subtask
PUT    /api/tasks/subtasks/:id         // Update subtask

// Pool management
POST   /api/tasks/pools                // Create pool
GET    /api/tasks/pools                // List pools
POST   /api/tasks/pools/:id/members    // Add member
DELETE /api/tasks/pools/:id/members/:userId // Remove member

// Analytics
GET    /api/tasks/analytics            // Get task analytics

// Notifications
GET    /api/tasks/notifications        // Get user notifications
PUT    /api/tasks/notifications/:id/read // Mark as read
```

**Integration**: Register in `src/index.js`

#### 3. Webhook Service
**File**: `src/services/webhook.service.js`

```javascript
// Key features:
- Fetch active webhooks for org
- Filter by event and task filters
- HTTP POST to webhook URL with retry logic
- Log webhook deliveries
- Handle authentication (Basic, Bearer, API Key)
- Exponential backoff for retries
```

**Integration**: Called from task.service.js `triggerWebhooks()`

#### 4. Notification Service
**File**: `src/services/notification.service.js`

```javascript
// Key features:
- Create notifications (in-app, email, SMS)
- Mark notifications as read
- Get user notifications with pagination
- Send email notifications (integrate with email service)
- SSE endpoint for real-time updates (optional)
```

**Integration**:
- Called from task.service.js
- New route `/api/notifications`

#### 5. Integration Middleware
**Files**:
- `src/middleware/task-appointment.integration.js`
- `src/middleware/task-form.integration.js`

```javascript
// Appointment integration:
- Auto-create task when appointment scheduled
- Link task to appointment
- Update task when appointment status changes

// Form integration:
- Auto-create task when form sent to patient
- Complete task when form submitted
- Link multiple forms to task
```

**Integration**: Add to appointment and form controllers

---

### Frontend (8-10 hours)

#### 1. Task Dashboard
**File**: `ehr-web/src/app/tasks/page.tsx`

**Features**:
- List view with table
- Kanban board view (columns: Ready, In Progress, Completed)
- Filters: status, priority, assignee, patient, due date, labels
- Search by description/identifier
- Bulk actions (reassign, complete, delete)
- Create task button
- Pagination

**Components needed**:
- `TaskListView` component
- `TaskKanbanView` component
- `TaskFilters` sidebar
- `TaskCard` component
- `BulkActionsBar` component

#### 2. Task Details Page
**File**: `ehr-web/src/app/tasks/[id]/page.tsx`

**Features**:
- Task information display/edit
- Status change buttons
- Priority indicator
- Subtasks list with checkboxes
- Comments thread
- History timeline
- Attachments
- Related resources (patient, appointment, form links)
- Claim button (if in pool)

**Components needed**:
- `TaskHeader` component
- `TaskDetails` component
- `SubtasksList` component
- `CommentsThread` component
- `TaskHistory` component
- `RelatedResources` component

#### 3. Task Creation/Edit Forms
**Files**:
- `ehr-web/src/components/tasks/create-task-modal.tsx`
- `ehr-web/src/components/tasks/edit-task-sidebar.tsx`

**Features**:
- Form with all task fields
- Patient autocomplete
- User/pool assignment selector
- Due date picker
- Priority/status selectors
- Label multi-select
- Subtask builder
- Template selector
- Link to appointment/form/order

#### 4. Task Pools Management
**File**: `ehr-web/src/app/settings/tasks/pools/page.tsx`

**Features**:
- List all pools
- Create/edit pool
- Manage members
- Set default assignee
- Configure pool settings (claiming, auto-assignment, etc.)

**Components needed**:
- `PoolsList` component
- `CreatePoolModal` component
- `PoolMembersManager` component
- `PoolSettings` component

#### 5. Notifications UI
**Files**:
- `ehr-web/src/components/layout/notifications-bell.tsx`
- `ehr-web/src/components/layout/notifications-panel.tsx`

**Features**:
- Bell icon with unread count
- Dropdown panel with notifications list
- Mark as read on click
- Link to task/resource
- Clear all button
- Real-time updates (polling or SSE)

#### 6. Task Analytics
**File**: `ehr-web/src/app/tasks/analytics/page.tsx`

**Features**:
- Overview metrics (total, completed, overdue, etc.)
- Charts (completion rate over time, by priority, by user)
- Workload distribution
- Average completion time
- Filter by date range, user, pool

**Components needed**:
- `AnalyticsOverview` component
- `TaskCharts` component (use Chart.js or Recharts)
- `WorkloadTable` component

#### 7. Integration Points

**Patient Profile** (`ehr-web/src/app/patients/[id]/page.tsx`):
- Add "Tasks" tab
- Show patient's tasks
- Create task button

**Appointment Details**:
- Show linked tasks
- Create task from appointment button

**Navbar** (`ehr-web/src/components/layout/navbar.tsx`):
- Add Tasks menu item
- Show task count badge (optional)

**Forms Module**:
- Auto-create task when form sent
- Show linked task status

---

## 🔧 Configuration & Setup

### Environment Variables
Add to `.env`:
```env
# Task System
TASK_WEBHOOK_TIMEOUT=30000
TASK_WEBHOOK_RETRY_ATTEMPTS=3
TASK_NOTIFICATION_EMAIL_ENABLED=true
TASK_REALTIME_ENABLED=false

# Webhook security
WEBHOOK_SECRET_KEY=your-secret-key-for-signing
```

### Permissions
Add to role permissions:
```javascript
{
  "tasks.create": "Create tasks",
  "tasks.read": "View tasks",
  "tasks.update": "Update tasks",
  "tasks.delete": "Delete tasks",
  "tasks.assign": "Assign tasks to others",
  "tasks.claim": "Claim tasks from pools",
  "tasks.manage_pools": "Manage task pools",
  "tasks.view_all": "View all org tasks",
  "tasks.analytics": "View task analytics"
}
```

### Database Indexes (Already Created ✅)
All 40+ indexes are created via migration.

---

## 📊 Testing Checklist

### Backend Testing
- [ ] Create task via API
- [ ] Assign to user/patient/pool
- [ ] Search/filter tasks
- [ ] Update task status
- [ ] Claim task from pool
- [ ] Add comment with mentions
- [ ] Create/manage subtasks
- [ ] Task history tracking
- [ ] Webhook triggers
- [ ] Notifications created
- [ ] Analytics calculations
- [ ] FHIR Task resource conversion
- [ ] Soft delete functionality

### Frontend Testing
- [ ] Task dashboard loads
- [ ] Kanban view works
- [ ] Filters apply correctly
- [ ] Create task form
- [ ] Edit task
- [ ] Complete task
- [ ] Add comments
- [ ] Check/uncheck subtasks
- [ ] Claim task
- [ ] View history
- [ ] Notifications appear
- [ ] Analytics charts render
- [ ] Pool management
- [ ] Patient profile tasks tab
- [ ] Appointment integration

### Integration Testing
- [ ] Task created from appointment
- [ ] Task created when form sent
- [ ] Task completed when form submitted
- [ ] Webhook delivered successfully
- [ ] Email notifications sent
- [ ] Real-time updates (if enabled)

---

## 🚀 Next Steps

### Immediate (Continue this session):
1. Create FHIR Task controller
2. Create REST API routes
3. Register routes in main app

### Phase 3 (Next session):
1. Build webhook service
2. Build notification service
3. Add integrations (appointments, forms)

### Phase 4 (After backend complete):
1. Build task dashboard frontend
2. Build task details page
3. Build creation/edit forms
4. Add notifications UI
5. Build analytics page
6. Integrate into existing pages

### Phase 5 (Polish):
1. Add real-time updates (SSE)
2. Email notifications
3. SMS notifications (optional)
4. Advanced analytics
5. Task templates UI
6. Bulk operations
7. Export/reporting

---

## 📝 API Examples

### Create Task
```bash
POST /api/tasks
{
  "orgId": "uuid",
  "description": "Call patient about lab results",
  "assignedToUserId": "uuid",
  "patientId": "uuid",
  "dueDate": "2025-12-01T10:00:00Z",
  "priority": "urgent",
  "category": "follow_up",
  "labels": ["lab", "urgent"]
}
```

### Search Tasks
```bash
GET /api/tasks?status=ready,in-progress&priority=urgent&assignedToUserId=uuid&limit=20
```

### Claim Task
```bash
POST /api/tasks/:id/claim
```

### Add Comment
```bash
POST /api/tasks/:id/comments
{
  "commentText": "Called patient, they will come in tomorrow",
  "mentionedUserIds": ["uuid1", "uuid2"]
}
```

---

## 🎯 Success Metrics

- [ ] All database tables created
- [ ] Backend service layer functional
- [ ] REST API endpoints working
- [ ] FHIR endpoints compliant
- [ ] Frontend UI matches design
- [ ] Webhooks delivering
- [ ] Notifications working
- [ ] Analytics accurate
- [ ] Performance acceptable (<200ms for list queries)
- [ ] No SQL injection vulnerabilities
- [ ] Proper error handling
- [ ] Audit logs complete

---

## 📚 Resources

- FHIR Task: https://www.hl7.org/fhir/task.html
- Database migration: `src/database/migrations/20240101000033-create_tasks_system.js`
- Task service: `src/services/task.service.js`

---

**Status**: Phase 1 & 2 Complete (Database + Service Layer)
**Next**: Phase 3 - REST API & Controllers
**Estimated remaining time**: 12-15 hours total
