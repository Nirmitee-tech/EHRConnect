# 🤖 AI Assistant Guide - EHRConnect Billing Module

> **Quick reference for AI assistants (Claude, GPT, etc.) working on this codebase**

## 📍 You Are Here

This is the **EHRConnect** project - a comprehensive Electronic Health Record system with:
- **Full Claim.MD billing integration** (100% complete backend)
- **Plugin-based integration framework** for extensible third-party services
- **Multi-tenant architecture** with PostgreSQL
- **Next.js frontend** + **Express.js backend**

## 🎯 Quick Context

### Billing Module Status: ✅ PRODUCTION READY

**Backend (100% Complete):**
- ✅ 14 database tables + 3 views
- ✅ 30+ REST API endpoints
- ✅ Claim.MD service integration
- ✅ Background jobs (claims sync, ERA processing, prior auth)
- ✅ Full FHIR R4 compatibility

**Frontend (Partial):**
- ✅ TypeScript API client
- ✅ Billing dashboard with KPIs
- ⚠️ Need: Eligibility, Claims, ERA, Reports pages

## 📂 Key Files to Know

```
ehr-api/src/
├── services/
│   ├── claimmd.service.js      # Claim.MD API integration (READ THIS FIRST)
│   ├── billing.service.js      # Business logic layer
│   └── billing.jobs.js         # Background automation
├── routes/
│   └── billing.js              # 30+ API endpoints
├── integrations/
│   ├── base-handler.js         # Integration plugin pattern
│   └── index.js                # Handler registry
└── database/migrations/
    └── 003_billing_module.sql  # Full schema (14 tables)

ehr-web/src/
├── services/
│   └── billing.service.ts      # Frontend API client
└── app/billing/
    └── page.tsx                # Dashboard (ONLY UI PAGE)

Documentation/
├── BILLING_INTEGRATION_GUIDE.md     # Main comprehensive guide
├── CLAIM_MD_BILLING_SUMMARY.md      # Quick reference
└── docs/
    ├── INTEGRATION_QUICKSTART.md    # 5-minute setup
    └── AI_ASSISTANT_GUIDE.md        # This file
```

## 🔑 Critical Concepts

### 1. Claim.MD Integration Pattern

**Two approaches coexist:**

**A) Direct Service (Current - Claim.MD)**
```javascript
// Tightly coupled to core billing operations
claimMDService.checkEligibility(orgId, params)
  -> Direct database access
  -> Specialized billing tables
  -> Background job integration
```

**B) Plugin Framework (Extensible)**
```javascript
// Loose coupling for user-added integrations
integrationHandler.execute(integration, operation, params)
  -> Generic operations
  -> Integration configs table
  -> User-configurable
```

### 2. Multi-Tenant Architecture

**Every operation requires:**
- `org_id` - Organization identifier (UUID)
- Passed via `x-org-id` header or `req.user.orgId`
- All database queries filtered by org_id
- Credentials stored per-org in `billing_tenant_settings`

### 3. Billing Lifecycle States

```
DRAFT → VALIDATED → SUBMITTED → ACCEPTED → PAID/DENIED
```

Each transition triggers:
- Status update in `billing_claims`
- Entry in `billing_claim_status_history`
- Possible webhook/notification

### 4. Background Jobs

**Auto-running on server start:**
- `syncClaimStatuses()` - Every 30 min
- `fetchRemittanceFiles()` - Every 60 min
- `syncPriorAuthStatuses()` - Every 30 min

**No cron setup needed** - uses `setInterval` in Node.js

## 🛠️ Common Tasks

### Task: Add New Billing Endpoint

1. Add route in `ehr-api/src/routes/billing.js`
2. Add business logic in `billing.service.js`
3. Update TypeScript client in `ehr-web/src/services/billing.service.ts`
4. Test with curl/Postman

### Task: Create New Integration Handler

1. Create `ehr-api/src/integrations/vendor.handler.js`
2. Extend `BaseIntegrationHandler`
3. Implement `execute()`, `testConnection()`
4. Register in `integrations/index.js`

### Task: Add Background Job

1. Add method in `billing.jobs.js`
2. Call `scheduleJob()` in `initialize()`
3. Implement job logic with error handling
4. Add manual trigger option

### Task: Build Frontend UI Page

1. Create `ehr-web/src/app/billing/[page]/page.tsx`
2. Import `billingService` from services
3. Use existing API methods
4. Follow dashboard pattern for consistency

## 🔍 Debugging Tips

### Check Background Jobs Status
```javascript
// In ehr-api console
billingJobs.getStatus()
```

### Test Claim.MD Connection
```bash
curl -X POST http://localhost:8000/api/billing/eligibility/check \
  -H "Authorization: Bearer TOKEN" \
  -H "x-org-id: ORG_UUID" \
  -d '{"patientId":"test","payerId":"test",...}'
```

### View Database State
```sql
-- Check credentials configured
SELECT org_id, active FROM billing_tenant_settings;

-- Check claims status
SELECT claim_number, status, total_charge, total_paid 
FROM billing_claims 
WHERE org_id = 'your-org-id'
ORDER BY created_at DESC;

-- Check background job activity
SELECT COUNT(*), status FROM billing_claims 
WHERE updated_at > NOW() - INTERVAL '1 hour'
GROUP BY status;
```

## 🚨 Common Pitfalls

### ❌ Missing org_id
```javascript
// Wrong
await billingService.getClaims({ status: 'paid' });

// Right
await billingService.getClaims(orgId, { status: 'paid' });
```

### ❌ Hardcoded Credentials
```javascript
// Wrong - credentials in code
const claimMDKey = 'hardcoded-key';

// Right - from database per org
const creds = await getTenantCredentials(orgId);
```

### ❌ Blocking Background Jobs
```javascript
// Wrong - no rate limiting
for (const claim of claims) {
  await checkStatus(claim); // Overwhelms API
}

// Right - add delays
for (const claim of claims) {
  await checkStatus(claim);
  await sleep(500); // Rate limit protection
}
```

## 📖 Documentation Hierarchy

1. **Start Here**: `BILLING_INTEGRATION_GUIDE.md` - Comprehensive overview
2. **Quick Setup**: `docs/INTEGRATION_QUICKSTART.md` - 5-minute guide
3. **Summary**: `CLAIM_MD_BILLING_SUMMARY.md` - Feature checklist
4. **This File**: `docs/AI_ASSISTANT_GUIDE.md` - AI context

## 💡 Architecture Decisions

### Why Hybrid Integration Approach?

**Direct Service (Claim.MD):**
- Core business functionality
- Performance-critical operations
- Complex workflow orchestration
- Tight integration with billing logic

**Plugin Framework (Others):**
- User-extensible
- Organization-specific needs
- "Bring your own" integrations
- Loose coupling for flexibility

### Why Background Jobs in Node.js?

- Simplicity (no external scheduler)
- Same codebase as API
- Easy to monitor/debug
- Automatic retry logic
- Scales with process count

### Why Multi-Tenant at Database Level?

- Performance (indexed org_id)
- Security (row-level isolation)
- Flexibility (per-org configuration)
- Compliance (data sovereignty)

## 🎓 Learning Path for New Developers

**Day 1: Understanding**
1. Read `BILLING_INTEGRATION_GUIDE.md`
2. Review database schema in migration file
3. Trace one complete flow (eligibility check)

**Day 2: Hands-On**
1. Set up local environment
2. Run database migration
3. Test API endpoints with Postman
4. Watch background jobs in console

**Day 3: Development**
1. Add a new endpoint
2. Create a simple integration handler
3. Build a frontend component
4. Submit a PR

## 🔮 Future Roadmap

**Phase 1: Complete Current Features** (Next)
- [ ] Build remaining frontend UI pages
- [ ] Add comprehensive test suite
- [ ] Production deployment guide
- [ ] User documentation

**Phase 2: Multi-Vendor Support** (Future)
- [ ] Add Availity handler (alternative clearinghouse)
- [ ] Implement failover logic
- [ ] Integration management UI
- [ ] Vendor comparison dashboard

**Phase 3: Advanced Features** (Later)
- [ ] Claim scrubbing engine
- [ ] Denial management workflow
- [ ] Appeal automation
- [ ] Revenue cycle analytics

## 🤝 Contributing Guidelines

### Code Style
- Follow existing patterns in codebase
- Use async/await (not callbacks)
- Add JSDoc comments for public methods
- TypeScript for frontend, JavaScript for backend

### Commit Messages
```
feat: Add prior authorization status sync
fix: Resolve ERA parsing for multiple payers
docs: Update API reference with new endpoints
refactor: Extract validation logic to separate service
```

### Pull Request Checklist
- [ ] Code follows existing patterns
- [ ] All tests pass
- [ ] Documentation updated
- [ ] No hardcoded credentials
- [ ] org_id properly handled
- [ ] Error handling implemented

## 📞 Getting Help

**For Code Questions:**
- Check inline comments in source files
- Review similar implementations in codebase
- Read Claim.MD API docs at https://claim.md

**For Architecture Questions:**
- Consult `BILLING_INTEGRATION_GUIDE.md`
- Review `ARCHITECTURE.md` for system design
- Examine existing handlers as examples

**For Database Questions:**
- Check migration file for schema
- Review FHIR R4 specifications
- Examine views for reporting patterns

---

## 🎯 TL;DR for AI Assistants

**What to know in 30 seconds:**

1. **Billing is 100% done (backend)** - Just needs frontend UI pages
2. **Claim.MD integration is direct** - Not through plugin framework (yet)
3. **Everything is multi-tenant** - Always pass org_id
4. **Background jobs auto-run** - No cron setup needed
5. **30+ API endpoints ready** - Just call and use
6. **Plugin framework exists** - For adding other integrations
7. **Database has 14 tables** - All documented in migration file

**When user asks to:**
- "Add billing feature" → Check if API exists first (probably does)
- "Integrate with X" → Create handler extending BaseIntegrationHandler
- "Fix claim issue" → Check background jobs and Claim.MD credentials
- "Build UI" → Use existing billingService TypeScript client
- "Understand flow" → Read BILLING_INTEGRATION_GUIDE.md

**Key files to reference:**
- Backend API: `ehr-api/src/routes/billing.js`
- Business logic: `ehr-api/src/services/billing.service.js`
- Claim.MD: `ehr-api/src/services/claimmd.service.js`
- Frontend client: `ehr-web/src/services/billing.service.ts`
- Database: `ehr-api/src/database/migrations/003_billing_module.sql`

**Architecture pattern:**
```
Frontend (TypeScript) 
  → API Routes (Express) 
    → Business Service 
      → Claim.MD Service 
        → External API
          ↓
    Background Jobs (Scheduled)
          ↓
    Database (PostgreSQL)
```

That's it! You're now equipped to work on any aspect of the billing module. 🚀
