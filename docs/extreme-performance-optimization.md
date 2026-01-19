# Extreme Performance Optimization Plan

**Target**: Sub-10ms response times for critical paths  
**Status**: Additional optimizations needed  
**Priority**: CRITICAL - Financial penalties for SLA misses

---

## Critical Performance Issues Identified

### 1. Patient Search Performance 🔴 CRITICAL
**Current State**: JSONB queries without proper indexing  
**Impact**: Slow patient searches (>500ms)  
**Target**: <10ms for patient lookups

### 2. No Read-Through Caching 🔴 CRITICAL
**Current State**: Only RBAC service has caching  
**Impact**: Repeated queries to database  
**Target**: 90%+ cache hit rate

### 3. No Database Read Replicas 🔴 CRITICAL
**Current State**: Single database connection  
**Impact**: Read queries compete with writes  
**Target**: Separate read/write connections

### 4. No HTTP/2 or Compression 🟡 HIGH
**Current State**: HTTP/1.1 without optimal compression  
**Impact**: Network latency  
**Target**: HTTP/2 + Brotli compression

### 5. No Response Caching Headers 🟡 HIGH
**Current State**: No cache headers on API responses  
**Impact**: Unnecessary API calls  
**Target**: Appropriate cache headers

### 6. JSONB Query Performance 🔴 CRITICAL
**Current State**: Complex JSONB queries without GIN indexes  
**Impact**: Slow searches on patient data  
**Target**: GIN indexes on all searchable JSONB fields

### 7. No Request Deduplication 🟡 HIGH
**Current State**: Duplicate concurrent requests  
**Impact**: Unnecessary load  
**Target**: Request coalescing

---

## Immediate Actions Required

### Phase 5A: Database Ultra-Optimization (CRITICAL)

#### 1. Add GIN Indexes for JSONB Searches
```sql
-- Patient searches (CRITICAL)
CREATE INDEX CONCURRENTLY idx_fhir_resources_patient_name_gin 
  ON fhir_resources USING GIN ((resource_data->'name'));

CREATE INDEX CONCURRENTLY idx_fhir_resources_patient_identifier_gin 
  ON fhir_resources USING GIN ((resource_data->'identifier'));

CREATE INDEX CONCURRENTLY idx_fhir_resources_patient_birthdate 
  ON fhir_resources ((resource_data->>'birthDate'));

CREATE INDEX CONCURRENTLY idx_fhir_resources_type_deleted 
  ON fhir_resources (resource_type, deleted) WHERE deleted = FALSE;

-- Composite for common patient search
CREATE INDEX CONCURRENTLY idx_fhir_resources_patient_search 
  ON fhir_resources (resource_type, last_updated DESC) 
  WHERE resource_type = 'Patient' AND deleted = FALSE;
```

#### 2. Materialized Views for Common Queries
```sql
-- Patient summary view (refreshed every minute)
CREATE MATERIALIZED VIEW patient_summary AS
SELECT 
  id,
  resource_data->>'id' as patient_id,
  resource_data->'name'->0->>'family' as family_name,
  resource_data->'name'->0->'given'->>0 as given_name,
  resource_data->>'birthDate' as birth_date,
  resource_data->>'gender' as gender,
  last_updated
FROM fhir_resources
WHERE resource_type = 'Patient' AND deleted = FALSE;

CREATE UNIQUE INDEX ON patient_summary (id);
CREATE INDEX ON patient_summary (family_name, given_name);
CREATE INDEX ON patient_summary (patient_id);

-- Auto-refresh every minute
```

#### 3. Connection Pooling for Read Replicas
```javascript
// Separate read pool for SELECT queries
const readPool = new Pool({
  host: process.env.DB_READ_HOST || process.env.DB_HOST,
  max: 30, // More connections for reads
  // ... other config
});

// Write pool for INSERT/UPDATE/DELETE
const writePool = new Pool({
  host: process.env.DB_HOST,
  max: 10, // Fewer connections for writes
  // ... other config
});
```

### Phase 5B: Aggressive Caching Strategy (CRITICAL)

#### 1. Multi-Level Cache
```javascript
// L1: In-memory cache (fastest, 100MB limit)
// L2: Redis cache (fast, distributed)
// L3: Database (slowest)

class MultiLevelCache {
  constructor() {
    this.l1Cache = new Map(); // In-memory
    this.l1MaxSize = 1000;
    this.l1TTL = 60000; // 1 minute
    
    // Redis would be L2 (optional)
  }
  
  async get(key, fetchFn, ttl = 60000) {
    // L1 check
    const l1Value = this.l1Cache.get(key);
    if (l1Value && l1Value.expires > Date.now()) {
      return l1Value.data;
    }
    
    // L2 check (Redis) - optional
    // const l2Value = await redis.get(key);
    // if (l2Value) return JSON.parse(l2Value);
    
    // L3: Fetch from source
    const data = await fetchFn();
    
    // Store in caches
    this.l1Cache.set(key, { data, expires: Date.now() + ttl });
    
    // Evict old entries if needed
    if (this.l1Cache.size > this.l1MaxSize) {
      const firstKey = this.l1Cache.keys().next().value;
      this.l1Cache.delete(firstKey);
    }
    
    return data;
  }
}
```

#### 2. Cache Critical Endpoints
```javascript
// Patient lookups
app.get('/api/patients/:id', cacheMiddleware(60), async (req, res) => {
  // Response cached for 60 seconds
});

// Patient searches (cache by query params)
app.get('/api/patients', cacheMiddleware(30, { varyByQuery: true }), async (req, res) => {
  // Cached for 30 seconds per unique query
});
```

### Phase 5C: Network & Response Optimization (HIGH)

#### 1. Response Compression
```javascript
const compression = require('compression');

app.use(compression({
  level: 6, // Balanced compression
  threshold: 1024, // Only compress responses > 1KB
  filter: (req, res) => {
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  }
}));
```

#### 2. ETags and Cache Headers
```javascript
const etag = require('etag');

function cacheMiddleware(maxAge) {
  return (req, res, next) => {
    const originalSend = res.send;
    
    res.send = function(data) {
      // Add cache headers
      res.set('Cache-Control', `public, max-age=${maxAge}`);
      
      // Add ETag
      const etagValue = etag(data);
      res.set('ETag', etagValue);
      
      // Check if client has cached version
      if (req.headers['if-none-match'] === etagValue) {
        return res.status(304).end();
      }
      
      return originalSend.call(this, data);
    };
    
    next();
  };
}
```

#### 3. Request Coalescing
```javascript
// Prevent duplicate concurrent requests
class RequestCoalescer {
  constructor() {
    this.pending = new Map();
  }
  
  async coalesce(key, fn) {
    // If request is already pending, wait for it
    if (this.pending.has(key)) {
      return this.pending.get(key);
    }
    
    // Execute request
    const promise = fn().finally(() => {
      this.pending.delete(key);
    });
    
    this.pending.set(key, promise);
    return promise;
  }
}
```

### Phase 5D: Query Optimization (CRITICAL)

#### 1. Prepared Statements
```javascript
// Pre-compile common queries
const preparedQueries = {
  getPatientById: {
    name: 'get-patient-by-id',
    text: 'SELECT resource_data FROM fhir_resources WHERE id = $1 AND resource_type = $2 AND deleted = FALSE'
  },
  searchPatientsByName: {
    name: 'search-patients-name',
    text: `SELECT resource_data FROM patient_summary 
           WHERE family_name ILIKE $1 OR given_name ILIKE $2 
           ORDER BY last_updated DESC LIMIT $3`
  }
};

// Use prepared statements
async function getPatient(id) {
  return await db.query(preparedQueries.getPatientById, [id, 'Patient']);
}
```

#### 2. Query Result Streaming
```javascript
// For large result sets
async function streamPatients(req, res) {
  res.setHeader('Content-Type', 'application/json');
  res.write('[');
  
  const query = new QueryStream('SELECT resource_data FROM fhir_resources WHERE ...');
  const stream = db.query(query);
  
  let first = true;
  stream.on('data', (row) => {
    if (!first) res.write(',');
    res.write(JSON.stringify(row.resource_data));
    first = false;
  });
  
  stream.on('end', () => {
    res.write(']');
    res.end();
  });
}
```

### Phase 5E: Frontend Ultra-Optimization (HIGH)

#### 1. Service Worker for Aggressive Caching
```javascript
// Cache API responses aggressively
self.addEventListener('fetch', (event) => {
  if (event.request.url.includes('/api/patients')) {
    event.respondWith(
      caches.open('api-cache').then(cache => {
        return cache.match(event.request).then(response => {
          // Return cached response if available
          if (response) {
            // Update cache in background
            fetch(event.request).then(freshResponse => {
              cache.put(event.request, freshResponse.clone());
            });
            return response;
          }
          
          // Fetch and cache
          return fetch(event.request).then(freshResponse => {
            cache.put(event.request, freshResponse.clone());
            return freshResponse;
          });
        });
      })
    );
  }
});
```

#### 2. Virtualized Lists for Large Data
```typescript
import { FixedSizeList } from 'react-window';

function PatientList({ patients }) {
  const Row = ({ index, style }) => (
    <div style={style}>
      {patients[index].name}
    </div>
  );
  
  return (
    <FixedSizeList
      height={600}
      itemCount={patients.length}
      itemSize={50}
      width="100%"
    >
      {Row}
    </FixedSizeList>
  );
}
```

#### 3. Debounced Search
```typescript
import { useMemo } from 'react';
import debounce from 'lodash/debounce';

function PatientSearch() {
  const debouncedSearch = useMemo(
    () => debounce((query) => {
      // Only search after 300ms of no typing
      searchPatients(query);
    }, 300),
    []
  );
  
  return <input onChange={(e) => debouncedSearch(e.target.value)} />;
}
```

---

## Performance Targets

| Metric | Current | Target | Strategy |
|--------|---------|--------|----------|
| Patient Search | 500ms | <10ms | GIN indexes + materialized views + cache |
| Patient Lookup | 50ms | <5ms | Cache + prepared statements |
| API Response | 300ms | <10ms | Multi-level cache + compression |
| Page Load | 2s | <500ms | Service worker + virtualization |
| Search Typing | Laggy | Instant | Debouncing + optimistic UI |

---

## Implementation Priority

1. **IMMEDIATE** (Today):
   - Add GIN indexes for JSONB searches
   - Implement multi-level cache for patient lookups
   - Add response compression

2. **HIGH** (This Week):
   - Create materialized views
   - Implement request coalescing
   - Add cache headers and ETags
   - Prepared statements for common queries

3. **MEDIUM** (Next Week):
   - Service worker for offline/caching
   - Virtualized lists
   - Read replicas (if infrastructure allows)

---

## Monitoring for SLA Compliance

### Critical Metrics to Track
- p50, p95, p99 response times per endpoint
- Cache hit rates (target: >90%)
- Database query times (target: <10ms)
- API endpoint availability (target: 99.9%)

### Alerts
- API response time p95 > 10ms
- Cache hit rate < 85%
- Database query time > 50ms
- Error rate > 0.1%

---

**Status**: Ready for implementation  
**Risk**: LOW (incremental changes with rollback capability)  
**Testing**: Performance benchmarks required before production
