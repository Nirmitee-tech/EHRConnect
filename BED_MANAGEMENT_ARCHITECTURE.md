# Bed Management & Hospitalization - Architecture Overview

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                          FRONTEND LAYER                              │
│                         (Next.js / React)                            │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐             │
│  │   Bed Map    │  │  Admission   │  │  Dashboard   │             │
│  │   (UI)       │  │   Form       │  │  (Analytics) │             │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘             │
│         │                  │                  │                      │
│         └──────────────────┼──────────────────┘                      │
│                            │                                         │
│                  ┌─────────▼──────────┐                             │
│                  │  Bed Management    │                             │
│                  │  Service           │                             │
│                  │  (TypeScript)      │                             │
│                  └─────────┬──────────┘                             │
└────────────────────────────┼───────────────────────────────────────┘
                             │
                   ┌─────────▼──────────┐
                   │    REST API        │
                   │  (HTTP/JSON)       │
                   └─────────┬──────────┘
                             │
┌────────────────────────────▼───────────────────────────────────────┐
│                        BACKEND LAYER                                │
│                       (Node.js / Express)                           │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │              Bed Management Routes                            │  │
│  │  /api/bed-management/*                                        │  │
│  └────────┬─────────────────────────────────────────────┬────────┘  │
│           │                                               │           │
│  ┌────────▼──────────┐                         ┌─────────▼────────┐ │
│  │   Auth           │                         │   RBAC           │ │
│  │   Middleware     │                         │   Middleware     │ │
│  └────────┬──────────┘                         └─────────┬────────┘ │
│           │                                               │           │
│           └───────────────────┬───────────────────────────┘           │
│                               │                                       │
│                    ┌──────────▼──────────┐                           │
│                    │  Bed Management     │                           │
│                    │  Service            │                           │
│                    └──────────┬──────────┘                           │
│                               │                                       │
│              ┌────────────────┼────────────────┐                     │
│              │                │                │                     │
│     ┌────────▼───────┐ ┌─────▼──────┐ ┌──────▼────────┐            │
│     │  Ward Mgmt     │ │  Bed Mgmt  │ │ Hospitalization│            │
│     │  Functions     │ │  Functions │ │  Functions     │            │
│     └────────┬───────┘ └─────┬──────┘ └──────┬────────┘            │
│              │                │                │                     │
│              └────────────────┼────────────────┘                     │
│                               │                                       │
│                    ┌──────────▼──────────┐                           │
│                    │   Database Layer    │                           │
│                    │   (pg connection)   │                           │
│                    └──────────┬──────────┘                           │
└───────────────────────────────┼───────────────────────────────────┘
                                │
┌───────────────────────────────▼───────────────────────────────────┐
│                        DATABASE LAYER                              │
│                         (PostgreSQL)                               │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  Core Tables:              Workflow Tables:        Support Tables:   │
│  ┌─────────┐              ┌──────────────┐        ┌─────────────┐  │
│  │ wards   │              │bed_assignments│        │nursing_rounds│  │
│  └────┬────┘              └──────┬───────┘        └─────────────┘  │
│       │                          │                                   │
│  ┌────▼────┐              ┌──────▼────────┐       ┌──────────────┐ │
│  │ rooms   │              │bed_transfers │        │bed_reservations│ │
│  └────┬────┘              └───────────────┘       └──────────────┘ │
│       │                                                              │
│  ┌────▼──────┐            ┌──────────────────┐                     │
│  │ beds      │◄───────────┤hospitalizations │                      │
│  └───────────┘            └──────────────────┘                     │
│                                                                       │
│  Triggers:                                                           │
│  • update_ward_capacity()    - Auto-update capacity on bed changes  │
│  • update_bed_on_assignment() - Auto-update bed status              │
│  • calculate_los()            - Auto-calculate length of stay       │
│  • auto_expire_reservations() - Auto-expire old reservations        │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘
```

## 📊 Data Flow Diagrams

### 1. Patient Admission Flow

```
┌────────────┐
│  Frontend  │
│  (Nurse)   │
└─────┬──────┘
      │
      │ 1. POST /admissions
      │    {patientId, bedId, ...}
      ▼
┌───────────────────┐
│   API Routes      │
│   • Auth Check    │
│   • Permission    │
└─────┬─────────────┘
      │
      │ 2. admitPatient()
      ▼
┌───────────────────────────┐
│  Bed Management Service   │
│  BEGIN TRANSACTION        │
│  ├─ Create hospitalization│
│  ├─ Assign bed            │
│  ├─ Update bed status     │
│  └─ Create audit log      │
│  COMMIT                   │
└─────┬─────────────────────┘
      │
      │ 3. SQL Operations
      ▼
┌───────────────────────────┐
│  Database                 │
│  ┌────────────────────┐   │
│  │ INSERT INTO        │   │
│  │ hospitalizations   │   │
│  └────────┬───────────┘   │
│           │               │
│  ┌────────▼───────────┐   │
│  │ INSERT INTO        │   │
│  │ bed_assignments    │   │
│  └────────┬───────────┘   │
│           │               │
│  ┌────────▼───────────┐   │
│  │ TRIGGER:           │   │
│  │ update_bed_status  │   │
│  │ beds.status =      │   │
│  │   'occupied'       │   │
│  └────────────────────┘   │
└───────────────────────────┘
      │
      │ 4. Return response
      ▼
┌────────────┐
│  Frontend  │
│  • Show    │
│    success │
│  • Refresh │
│    bed map │
└────────────┘
```

### 2. Bed Status Update Flow

```
┌──────────────┐
│  Frontend    │
│  (Ward Map)  │
└──────┬───────┘
       │
       │ 1. Click bed → Change status
       │    PATCH /beds/:id/status
       │    {status: 'cleaning'}
       ▼
┌──────────────────┐
│   API Routes     │
│   • Auth         │
│   • Permission   │
└──────┬───────────┘
       │
       │ 2. updateBedStatus()
       ▼
┌──────────────────────┐
│  Service Layer       │
│  Update bed record   │
└──────┬───────────────┘
       │
       │ 3. SQL UPDATE
       ▼
┌────────────────────────┐
│  Database              │
│  UPDATE beds           │
│  SET status = $1,      │
│      status_updated_at │
│        = CURRENT_TS    │
│  WHERE id = $2         │
└────────┬───────────────┘
       │
       │ 4. WebSocket broadcast
       │    (future enhancement)
       ▼
┌──────────────────────┐
│  All Connected Clients│
│  • Update bed color  │
│  • Show notification │
└──────────────────────┘
```

### 3. Discharge Flow

```
┌────────────┐
│  Doctor    │
│  (UI)      │
└─────┬──────┘
      │
      │ 1. POST /hospitalizations/:id/discharge
      │    {dischargeDate, dischargeSummary, ...}
      ▼
┌───────────────────┐
│   API Routes      │
└─────┬─────────────┘
      │
      │ 2. dischargePatient()
      ▼
┌─────────────────────────────┐
│  Service Layer              │
│  BEGIN TRANSACTION          │
│  ├─ Update hospitalization  │
│  │   status = 'discharged'  │
│  │   discharge_date = now   │
│  │   Calculate LOS          │
│  ├─ Release bed assignment  │
│  │   is_current = false     │
│  └─ Update bed status       │
│      status = 'cleaning'    │
│  COMMIT                     │
└─────┬───────────────────────┘
      │
      │ 3. Database updates
      ▼
┌─────────────────────────────┐
│  Database                   │
│  ┌──────────────────────┐   │
│  │ UPDATE               │   │
│  │ hospitalizations     │   │
│  │ TRIGGER: calc_los()  │   │
│  └──────────┬───────────┘   │
│             │               │
│  ┌──────────▼───────────┐   │
│  │ UPDATE               │   │
│  │ bed_assignments      │   │
│  └──────────┬───────────┘   │
│             │               │
│  ┌──────────▼───────────┐   │
│  │ TRIGGER:             │   │
│  │ update_bed_status    │   │
│  │ beds.status =        │   │
│  │   'cleaning'         │   │
│  └──────────────────────┘   │
└─────────────────────────────┘
      │
      │ 4. Post-discharge actions
      ▼
┌─────────────────────────────┐
│  Integration Points         │
│  ├─ Billing: Generate bill  │
│  ├─ Housekeeping: Notify    │
│  └─ Records: Archive notes  │
└─────────────────────────────┘
```

## 🔄 State Machine: Bed Status

```
┌──────────────┐
│  available   │◄─────┐
└──────┬───────┘      │
       │              │
       │ assign       │ cleaning
       │ patient      │ complete
       ▼              │
┌──────────────┐      │
│  occupied    │──────┘
└──────┬───────┘
       │
       │ discharge
       │ patient
       ▼
┌──────────────┐
│  cleaning    │
└──────┬───────┘
       │
       │ mark clean
       │
       ▼
┌──────────────┐      ┌──────────────┐
│  available   │      │  reserved    │
└──────────────┘      └──────────────┘
       │                     │
       │ mark for            │
       │ maintenance         │
       ▼                     │
┌──────────────┐            │
│ maintenance  │            │
└──────┬───────┘            │
       │                    │
       │ repair             │
       │ complete           │
       ▼                    ▼
┌──────────────┐      ┌──────────────┐
│  available   │      │ out_of_service│
└──────────────┘      └──────────────┘
```

## 🔄 State Machine: Hospitalization Status

```
┌──────────────┐
│  pre_admit   │ ← Scheduled admission
└──────┬───────┘
       │
       │ admit
       │ patient
       ▼
┌──────────────┐
│   admitted   │ ← Currently in hospital
└──────┬───────┘
       │
       ├─────────────┬─────────────┬──────────────┐
       │             │             │              │
       │ discharge   │ transfer    │ absconded   │ deceased
       │             │             │              │
       ▼             ▼             ▼              ▼
┌─────────┐   ┌─────────┐   ┌─────────┐    ┌─────────┐
│discharged│   │transferred  │absconded│    │deceased │
└──────────┘   └─────────┘   └─────────┘    └─────────┘
```

## 📦 Module Dependencies

```
┌──────────────────────────────────────────────────────┐
│         Bed Management Module                        │
├──────────────────────────────────────────────────────┤
│                                                       │
│  Depends On:                                         │
│  ┌─────────────────────────────────────────────┐    │
│  │ • Authentication (JWT tokens)                │    │
│  │ • RBAC (Permission checks)                   │    │
│  │ • Audit Service (Activity logging)           │    │
│  │ • Database Connection Pool                   │    │
│  └─────────────────────────────────────────────┘    │
│                                                       │
│  Integrates With (Future):                           │
│  ┌─────────────────────────────────────────────┐    │
│  │ • Encounters (Create inpatient encounter)    │    │
│  │ • Billing (Room charges, services)           │    │
│  │ • Orders (Lab, radiology, medications)       │    │
│  │ • Notifications (Status changes, alerts)     │    │
│  │ • Scheduling (Elective admissions)           │    │
│  └─────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────┘
```

## 🎯 API Endpoint Hierarchy

```
/api/bed-management
│
├── /wards
│   ├── GET    /               (List all wards)
│   ├── GET    /:id            (Get ward details)
│   ├── POST   /               (Create ward)
│   └── PUT    /:id            (Update ward)
│
├── /beds
│   ├── GET    /               (List all beds)
│   ├── GET    /:id            (Get bed details)
│   ├── POST   /               (Create bed)
│   └── PATCH  /:id/status     (Update bed status)
│
├── /hospitalizations
│   ├── GET    /               (List hospitalizations)
│   ├── GET    /:id            (Get hospitalization)
│   ├── POST   /:id/assign-bed (Assign bed)
│   └── POST   /:id/discharge  (Discharge patient)
│
├── /admissions
│   └── POST   /               (Admit patient)
│
└── /analytics
    ├── GET    /occupancy      (Bed occupancy stats)
    ├── GET    /ward-occupancy (Ward-wise occupancy)
    └── GET    /summary        (Hospitalization summary)
```

## 🔐 Security Architecture

```
┌────────────────────────────────────────────────┐
│              Request Flow                      │
└────────────────────────────────────────────────┘

    HTTP Request
         │
         ▼
┌─────────────────┐
│  Express.js     │
│  Middleware     │
└────────┬────────┘
         │
         ▼
┌─────────────────────────┐
│  requireAuth()          │
│  • Verify JWT token     │
│  • Extract user info    │
│  • Set req.user         │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│  requirePermission()    │
│  • Check user role      │
│  • Verify permission    │
│  • Allow/Deny access    │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│  Route Handler          │
│  • Validate input       │
│  • Call service layer   │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│  Service Layer          │
│  • Business logic       │
│  • Database operations  │
│  • Create audit log     │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│  Database               │
│  • Apply RLS policies   │
│  • Execute triggers     │
│  • Return data          │
└─────────────────────────┘
```

## 💾 Database Relationships

```
┌────────────────┐
│ organizations  │
└────────┬───────┘
         │
         │ 1:N
         ▼
┌────────────────┐
│   locations    │
└────────┬───────┘
         │
         │ 1:N
         ▼
┌────────────────┐      ┌─────────────────┐
│     wards      │──N:1─│  departments    │
└────────┬───────┘      └─────────────────┘
         │
         │ 1:N
         ▼
┌────────────────┐
│     rooms      │
└────────┬───────┘
         │
         │ 1:N
         ▼
┌────────────────────┐
│       beds         │
└────────┬───────────┘
         │
         │ 1:N
         ▼
┌───────────────────────┐      ┌──────────────────┐
│  bed_assignments      │──N:1─│ hospitalizations │
└───────────────────────┘      └──────────────────┘
         │                              │
         │                              │ 1:N
         │                              ▼
         │                     ┌──────────────────┐
         │                     │ nursing_rounds   │
         │                     └──────────────────┘
         │
         │ 1:N
         ▼
┌──────────────────┐
│  bed_transfers   │
└──────────────────┘

┌──────────────────┐
│ bed_reservations │──N:1─► beds
└──────────────────┘
```

## 🔔 Future Enhancements

### Real-time Updates (WebSocket)

```
┌─────────────────┐
│  Backend Events │
└────────┬────────┘
         │
         │ Bed status changed
         │ Patient admitted
         │ Transfer completed
         ▼
┌─────────────────────┐
│  Socket.IO Server   │
│  Emit events to     │
│  subscribed clients │
└────────┬────────────┘
         │
         │ socket.emit('bed:status', data)
         ▼
┌─────────────────────────┐
│  Connected Clients      │
│  • Ward Map UI          │
│  • Dashboard            │
│  • Mobile Nurse App     │
└─────────────────────────┘
```

### IoT Integration

```
┌──────────────────┐
│  Bed Sensors     │
│  • Occupancy     │
│  • Weight sensor │
│  • Call button   │
└────────┬─────────┘
         │
         │ MQTT/HTTP
         ▼
┌──────────────────┐
│  IoT Gateway     │
│  Process events  │
└────────┬─────────┘
         │
         │ API Call
         ▼
┌──────────────────────────┐
│  Bed Management API      │
│  • Auto-update status    │
│  • Trigger alerts        │
└──────────────────────────┘
```

## 📊 Performance Considerations

### Caching Strategy

```
┌───────────────────┐
│  Redis Cache      │
├───────────────────┤
│ • Ward list       │ TTL: 1 hour
│ • Bed metadata    │ TTL: 30 mins
│ • Occupancy stats │ TTL: 5 mins
└───────────────────┘
        │
        │ Cache miss
        ▼
┌───────────────────┐
│  PostgreSQL       │
│  Fetch from DB    │
└───────────────────┘
```

### Database Optimization

- **Indexes**: All foreign keys indexed
- **Denormalization**: Current bed status stored in `beds` table
- **Partitioning**: Archive old hospitalizations yearly
- **Materialized Views**: Pre-calculate occupancy stats

## 🏆 Benefits of This Architecture

1. **Scalability** - Can handle multiple locations/organizations
2. **Flexibility** - Easy to add new ward types, bed types
3. **Audit Trail** - Complete history of all changes
4. **Real-time Ready** - Architecture supports WebSocket integration
5. **FHIR Compliant** - Follows healthcare standards
6. **Type Safe** - Full TypeScript support
7. **Transaction Safe** - Critical operations use DB transactions
8. **Permission Protected** - Fine-grained access control
9. **Extensible** - Easy to add new features (reservations, transfers, etc.)
10. **Maintainable** - Clear separation of concerns

---

This architecture provides a solid foundation for a production-grade bed management system in a healthcare environment!
