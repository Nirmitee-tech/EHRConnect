# Permission System - Admin UI Guide

## 🎉 What's New

I've created a complete admin interface for managing roles and permissions!

## 📍 Location

Navigate to: **`http://localhost:3000/settings/roles`**

## ✨ Features

### 1. **Roles Management Dashboard** (`/settings/roles`)

**Features:**
- ✅ View all system roles (default roles)
- ✅ View all custom roles (your organization's roles)
- ✅ Filter by: All, System, Custom
- ✅ Search roles by name or description
- ✅ Quick stats and permission counts
- ✅ Create new custom roles
- ✅ Copy & customize system roles

**What You See:**
- **System Roles Section**: Default roles like CLINICIAN, NURSE, DOCTOR, etc.
- **Custom Roles Section**: Your organization-specific roles
- Each role card shows:
  - Role name and description
  - Scope level (ORG/LOCATION/DEPARTMENT)
  - Number of permissions
  - Action buttons

### 2. **Role Editor** (`/settings/roles/[id]`)

**Features:**
- ✅ View role details
- ✅ Edit custom roles
- ✅ Copy system roles to customize
- ✅ **Permission Matrix** - Visual checkbox interface
- ✅ Search permissions
- ✅ Bulk select (all actions for resource, all resources for action)
- ✅ Real-time permission count

**Permission Matrix:**
```
               Read  Create  Edit  Delete  Submit  Approve  Print  Send
Patients        ☑     ☑      ☑     ☐       ☐       ☐        ☑      ☐
Appointments    ☑     ☑      ☑     ☑       ☐       ☐        ☐      ☐
Billing         ☑     ☐      ☐     ☐       ☐       ☐        ☑      ☐
...
```

### 3. **Create New Role** (`/settings/roles/new`)

**Fields:**
- **Role Name** - e.g., "Senior Physician", "ICU Nurse"
- **Scope Level** - Where can this role be assigned?
  - Organization - Entire org
  - Location - Specific facilities
  - Department - Specific departments
- **Description** - What this role does
- **Permissions** - Full permission matrix

## 🚀 How to Use

### Scenario 1: View Existing Roles

1. Go to `/settings/roles`
2. See all system roles and custom roles
3. Click "View Details" on any role to see its permissions

### Scenario 2: Create a Custom Role

1. Go to `/settings/roles`
2. Click **"+ Create Custom Role"**
3. Fill in:
   - Name: "Senior Doctor"
   - Scope: Location
   - Description: "Experienced physicians with full patient access"
4. In the Permission Matrix:
   - Check `patients:*` (all patient actions)
   - Check `appointments:*` (all appointment actions)
   - Check `prescriptions:*` (all prescription actions)
   - Check specific permissions as needed
5. Click **"Create Role"**
6. Done! ✅

### Scenario 3: Customize a System Role

1. Go to `/settings/roles`
2. Find a system role (e.g., "CLINICIAN")
3. Click **"View Details"**
4. Click **"Copy & Customize"**
5. Modify permissions as needed
6. Click **"Save Role"**
7. Your org now has a customized version! ✅

**What Happens:**
- Original system role remains unchanged
- Your org gets a copy with `parent_role_id` set
- Only your org sees this customized version
- Other orgs still use the default system role

### Scenario 4: Modify an Existing Custom Role

1. Go to `/settings/roles`
2. Find your custom role
3. Click **"View Details"**
4. Modify name, description, or permissions
5. Click **"Save Role"**
6. Changes saved! ✅

## 🔧 API Endpoint Used

The UI calls this endpoint:
```
GET  /api/rbac/v2/roles
POST /api/rbac/v2/roles
PATCH /api/rbac/v2/roles/:id
POST /api/rbac/v2/roles/:id/copy
```

**Note:** No authentication required for GET (reading roles), but POST/PATCH require proper headers:
- `x-user-id`
- `x-org-id`
- `Authorization: Bearer <token>`

## 📊 Data You'll See

### System Roles (11 predefined):
1. **PLATFORM_ADMIN** - Super admin
2. **ORG_OWNER** - Organization owner
3. **ORG_ADMIN** - Organization administrator
4. **CLINICIAN** - Doctor/physician
5. **NURSE** - Nursing staff
6. **FRONT_DESK** - Reception
7. **LAB_TECHNICIAN** - Lab staff
8. **PHARMACIST** - Pharmacy staff
9. **BILLING_CLERK** - Billing staff
10. **AUDITOR** - Compliance/audit
11. **VIEWER** - Read-only access

### Permissions Available (30+ resources × 12 actions):

**Resources:**
- Patients, Appointments, Encounters
- Observations, Diagnoses, Procedures
- Medications, Allergies, Immunizations
- Lab Orders/Results, Imaging Orders/Results
- Clinical Notes, Prescriptions, Reports
- Billing, Invoices, Payments, Claims
- Organizations, Locations, Departments, Staff
- Roles, Permissions, Settings, Audit

**Actions:**
- read, create, edit, delete
- write, submit, approve, reject
- print, send, export, import

## 🎯 Quick Actions

### View All Roles
```bash
curl http://localhost:8000/api/rbac/v2/roles
```

### Create a Role via UI
1. Navigate to `/settings/roles/new`
2. Fill form
3. Click "Create Role"

### Test API Directly
```bash
curl -X POST 'http://localhost:8000/api/rbac/v2/roles' \
  -H 'Content-Type: application/json' \
  -H 'x-org-id: your-org-id' \
  -H 'x-user-id: your-user-id' \
  --data '{
    "name": "Test Role",
    "description": "Testing",
    "scope_level": "LOCATION",
    "permissions": ["patients:read", "patients:write"]
  }'
```

## 🐛 Troubleshooting

### Issue: "Missing authentication context"

**For Mutations (POST/PATCH/DELETE):**
Required headers:
- `x-org-id` - Your organization ID
- `x-user-id` - Your user ID
- `Authorization` - Bearer token

**For Reading (GET):**
- No auth required! Just call the endpoint

### Issue: Can't see custom roles

Make sure you're filtering correctly:
- Click "Custom" tab
- Check that `x-org-id` header is set correctly

### Issue: Permission matrix not loading

1. Check browser console for errors
2. Verify API is running on port 8000
3. Check CORS settings

## 📸 Screenshots (Conceptual)

### Roles Dashboard
```
╔══════════════════════════════════════════════════════╗
║  Roles & Permissions                    [+ Create]   ║
╠══════════════════════════════════════════════════════╣
║  [All] [System] [Custom]     [Search.............]   ║
╠══════════════════════════════════════════════════════╣
║  System Roles                                        ║
║  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐   ║
║  │ CLINICIAN   │ │ NURSE       │ │ FRONT_DESK  │   ║
║  │ LOCATION    │ │ LOCATION    │ │ LOCATION    │   ║
║  │ 15 perms    │ │ 8 perms     │ │ 6 perms     │   ║
║  │ [Details]   │ │ [Details]   │ │ [Details]   │   ║
║  └─────────────┘ └─────────────┘ └─────────────┘   ║
║                                                      ║
║  Custom Roles                                        ║
║  ┌─────────────┐                                    ║
║  │ Senior Doc  │                                    ║
║  │ LOCATION    │                                    ║
║  │ 20 perms    │                                    ║
║  │ [Details]   │                                    ║
║  └─────────────┘                                    ║
╚══════════════════════════════════════════════════════╝
```

### Permission Matrix
```
╔══════════════════════════════════════════════════════╗
║  Edit Role: Senior Doctor            [Save]          ║
╠══════════════════════════════════════════════════════╣
║  Permissions                                         ║
║  [Search permissions..........]                      ║
║                                                      ║
║  Resource       All | Read | Create | Edit | Delete ║
║  ─────────────────────────────────────────────────  ║
║  Patients       [✓]   [✓]    [✓]     [✓]     [✓]   ║
║  Appointments   [✓]   [✓]    [✓]     [✓]     [✓]   ║
║  Billing        [ ]   [✓]    [ ]     [ ]     [ ]   ║
║  Reports        [ ]   [✓]    [ ]     [ ]     [ ]   ║
║  ...                                                 ║
║                                                      ║
║  ✓ 42 permissions selected                          ║
╚══════════════════════════════════════════════════════╝
```

## 🎓 Best Practices

1. **Start with System Roles** - Use them as templates
2. **Copy & Customize** - Don't create from scratch
3. **Use Descriptive Names** - "ICU Senior Nurse" not "Role1"
4. **Document Scope** - Explain where the role applies
5. **Review Permissions** - Ensure least privilege principle
6. **Test Before Deploying** - Assign to test user first

## 🔗 Next Steps

1. **Navigate to** `/settings/roles`
2. **Browse** system roles
3. **Create** your first custom role
4. **Test** the permission matrix
5. **Assign** roles to users (coming in user management)

---

**Your complete admin UI is ready!** 🎉

Access it at: `http://localhost:3000/settings/roles`
