# Permission System - Quick Start Guide

## ✅ Setup Complete Checklist

- [x] Database migration applied
- [x] Environment variables configured
- [x] Socket.IO installed and configured
- [x] Keycloak setup scripts created
- [ ] **→ Run Keycloak mapper setup**
- [ ] **→ Sync user permissions**
- [ ] **→ Start servers and test**

---

## 🚀 Complete Setup in 3 Commands

### 1. Setup Keycloak Mappers
```bash
cd keycloak
./setup-permission-mappers.sh
```

### 2. Sync User Permissions
```bash
cd ehr-api
node src/scripts/sync-permissions-to-keycloak.js
```

### 3. Start Everything
```bash
# Terminal 1 - Backend
cd ehr-api && npm start

# Terminal 2 - Frontend
cd ehr-web && npm run dev
```

---

## 📖 Quick Usage Reference

### Component Permission
```tsx
import { PermissionGate } from '@/components/permissions/PermissionGate'

<PermissionGate permission="patients:read">
  <PatientList />
</PermissionGate>
```

### Page Protection
```tsx
import { ProtectedRoute } from '@/components/permissions/ProtectedRoute'

export default function PatientsPage() {
  return (
    <ProtectedRoute permission="patients:read">
      <PatientList />
    </ProtectedRoute>
  )
}
```

### Hook Usage
```tsx
import { usePermissions } from '@/hooks/usePermissions'

const { hasPermission, permissions, isConnected } = usePermissions()

if (hasPermission('patients:create')) {
  // Show create button
}
```

### Wildcard Permissions
```tsx
// All actions on patients
<PermissionGate permission="patients:*">

// Read on all resources
<PermissionGate permission="*:read">

// Full admin access
<PermissionGate permission="*:*">
```

---

## 🔧 Permission Actions

| Action | Description |
|--------|-------------|
| `read` | View/read data |
| `create` | Create new records |
| `edit` | Modify existing records |
| `delete` | Delete records |
| `write` | Generic write (create + edit) |
| `submit` | Submit for review/approval |
| `approve` | Approve submitted items |
| `print` | Print documents |
| `send` | Send/share documents |

---

## 📊 Common Permission Patterns

```tsx
// Basic CRUD
patients:read
patients:create
patients:edit
patients:delete

// Workflows
prescriptions:submit
prescriptions:approve
lab_results:submit
lab_results:approve

// Documents
reports:print
reports:send
reports:export

// Full access to module
billing:*
appointments:*
```

---

## 🔌 Real-time Updates

Permissions update automatically via Socket.IO:
- Role changes → instant UI update
- Permission grants → instant access
- Permission revocations → instant restriction

Check connection status:
```tsx
const { isConnected } = usePermissions()
// isConnected === true ✓
```

---

## 📚 Full Documentation

- **Complete Guide**: `PERMISSION_SYSTEM_GUIDE.md`
- **Setup Details**: `SETUP_COMPLETE.md`
- **Code Examples**: `ehr-web/src/components/permissions/PermissionExamples.tsx`

---

## 🐛 Quick Troubleshooting

| Issue | Solution |
|-------|----------|
| Socket.IO not connecting | Check `ALLOWED_ORIGINS` in `ehr-api/.env` |
| Permissions not in JWT | Run Keycloak mapper script + sync script |
| Component not showing | Check browser console for permission errors |
| Real-time not working | Verify Socket.IO connection: check `isConnected` |

---

## 🎯 Next Steps

1. Run the 3 setup commands above
2. Login to test the system
3. Check browser console for Socket.IO connection
4. Try the example components
5. Create custom roles and permissions!

**Your complete permission system is ready! 🎉**
