# Performance Testing Guidelines

**Last Updated**: 2025-12-17  
**Repository**: EHRConnect  
**Purpose**: Comprehensive guide for testing and validating performance improvements

---

## Overview

This document provides step-by-step instructions for performance testing the EHRConnect application, including load testing, database profiling, and frontend performance measurement.

---

## 1. Database Performance Testing

### 1.1 Query Performance Analysis

#### Using EXPLAIN ANALYZE

```sql
-- Test query performance before and after optimizations
EXPLAIN (ANALYZE, BUFFERS, TIMING) 
SELECT t.*, u.name as assigned_to_name
FROM tasks t
LEFT JOIN users u ON t.assigned_to_user_id = u.id
WHERE t.org_id = 'test-org-id'
  AND t.status = 'active'
  AND t.deleted_at IS NULL
ORDER BY t.due_date
LIMIT 20;
```

**What to look for:**
- Execution Time: Should be < 100ms for list queries
- Planning Time: Should be < 10ms
- Index Usage: Should show "Index Scan" not "Seq Scan"
- Buffers: Lower is better (indicates less I/O)

#### Verify Index Usage

```sql
-- Check if indexes are being used
SELECT 
  schemaname,
  tablename,
  indexname,
  idx_scan as scans,
  idx_tup_read as tuples_read,
  idx_tup_fetch as tuples_fetched
FROM pg_stat_user_indexes
WHERE tablename IN ('tasks', 'form_templates', 'form_responses', 'users')
ORDER BY idx_scan DESC;
```

**Expected Results:**
- New indexes should show increasing `idx_scan` values
- `idx_scan` = 0 indicates unused index (may need adjustment)

### 1.2 Slow Query Monitoring

#### Enable pg_stat_statements

```sql
-- Load extension (requires superuser)
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;

-- View slowest queries
SELECT 
  substring(query, 1, 100) as query_preview,
  calls,
  round(total_exec_time::numeric, 2) as total_time_ms,
  round(mean_exec_time::numeric, 2) as avg_time_ms,
  round(max_exec_time::numeric, 2) as max_time_ms,
  round((100 * total_exec_time / sum(total_exec_time) OVER ())::numeric, 2) as pct_total_time
FROM pg_stat_statements
WHERE query NOT LIKE '%pg_stat_statements%'
ORDER BY total_exec_time DESC
LIMIT 20;
```

#### Reset Statistics

```sql
-- Reset pg_stat_statements after changes
SELECT pg_stat_statements_reset();
```

### 1.3 Connection Pool Monitoring

Monitor pool health via API endpoint:

```bash
# Get pool statistics
curl -X GET http://localhost:8000/api/performance/metrics \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Healthy Pool Indicators:**
- `idle` connections > 0
- `waiting` connections = 0 (or very low)
- Pool utilization < 80%

---

## 2. API Load Testing

### 2.1 Using k6 (Recommended)

#### Install k6

```bash
# macOS
brew install k6

# Linux
sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
echo "deb https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
sudo apt-get update
sudo apt-get install k6

# Windows
choco install k6
```

#### Create Load Test Script

```javascript
// k6-load-test.js
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '2m', target: 50 },  // Ramp up to 50 users
    { duration: '5m', target: 50 },  // Stay at 50 users
    { duration: '2m', target: 100 }, // Ramp up to 100 users
    { duration: '5m', target: 100 }, // Stay at 100 users
    { duration: '2m', target: 0 },   // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests should be below 500ms
    http_req_failed: ['rate<0.01'],   // Error rate should be below 1%
  },
};

const BASE_URL = 'http://localhost:8000/api';
const TOKEN = __ENV.API_TOKEN;

export default function () {
  const params = {
    headers: {
      'Authorization': `Bearer ${TOKEN}`,
      'Content-Type': 'application/json',
    },
  };

  // Test 1: List tasks (optimized pagination)
  const tasksRes = http.get(`${BASE_URL}/tasks?page=1&pageSize=20`, params);
  check(tasksRes, {
    'tasks list status 200': (r) => r.status === 200,
    'tasks list duration < 500ms': (r) => r.timings.duration < 500,
  });

  sleep(1);

  // Test 2: Get form templates (CTE pagination)
  const formsRes = http.get(`${BASE_URL}/forms/templates?page=1&pageSize=20`, params);
  check(formsRes, {
    'forms list status 200': (r) => r.status === 200,
    'forms list duration < 500ms': (r) => r.timings.duration < 500,
  });

  sleep(1);

  // Test 3: Get roles (cached)
  const rolesRes = http.get(`${BASE_URL}/rbac/roles`, params);
  check(rolesRes, {
    'roles list status 200': (r) => r.status === 200,
    'roles list duration < 200ms': (r) => r.timings.duration < 200, // Should be fast (cached)
  });

  sleep(2);
}
```

#### Run Load Test

```bash
# Set API token
export API_TOKEN="your-test-token"

# Run test
k6 run k6-load-test.js

# Run with custom duration
k6 run --duration 10m --vus 50 k6-load-test.js

# Save results to file
k6 run k6-load-test.js --out json=results.json
```

#### Analyze Results

```bash
# View summary
k6 run k6-load-test.js | grep -A 20 "checks"

# Key metrics to check:
# - http_req_duration (p95): < 500ms
# - http_req_failed: < 1%
# - checks: > 99%
```

### 2.2 Using Apache JMeter

#### Create Test Plan

1. Add Thread Group (Users)
   - Number of Threads: 50
   - Ramp-up Period: 120 seconds
   - Loop Count: 100

2. Add HTTP Request Sampler
   - Server: localhost
   - Port: 8000
   - Path: /api/tasks

3. Add Listeners
   - View Results Tree
   - Summary Report
   - Response Time Graph

#### Run Test

```bash
jmeter -n -t test-plan.jmx -l results.jtl -e -o report/
```

---

## 3. Frontend Performance Testing

### 3.1 Lighthouse CI

#### Install Lighthouse

```bash
npm install -g @lhci/cli
```

#### Create Configuration

```javascript
// lighthouserc.js
module.exports = {
  ci: {
    collect: {
      url: [
        'http://localhost:3000/',
        'http://localhost:3000/dashboard',
        'http://localhost:3000/tasks',
        'http://localhost:3000/forms',
      ],
      numberOfRuns: 3,
      settings: {
        preset: 'desktop',
      },
    },
    assert: {
      assertions: {
        'categories:performance': ['warn', { minScore: 0.8 }],
        'categories:accessibility': ['error', { minScore: 0.9 }],
        'first-contentful-paint': ['warn', { maxNumericValue: 2000 }],
        'largest-contentful-paint': ['warn', { maxNumericValue: 2500 }],
        'cumulative-layout-shift': ['warn', { maxNumericValue: 0.1 }],
        'total-blocking-time': ['warn', { maxNumericValue: 300 }],
      },
    },
    upload: {
      target: 'temporary-public-storage',
    },
  },
};
```

#### Run Lighthouse

```bash
# Collect metrics
lhci collect --config=lighthouserc.js

# Upload results
lhci upload --config=lighthouserc.js

# Assert thresholds
lhci assert --config=lighthouserc.js
```

### 3.2 React DevTools Profiler

#### Enable Profiler in Development

```bash
# Start with profiler enabled
NODE_ENV=development npm run dev
```

#### Profile Component Renders

1. Open React DevTools
2. Go to Profiler tab
3. Click "Start profiling"
4. Interact with application
5. Click "Stop profiling"

**Analyze:**
- Flame graph: Identify slow renders
- Ranked chart: Find most time-consuming components
- Component chart: See render frequency

**Optimization targets:**
- Components rendering > 16ms (60fps)
- Components with frequent unnecessary renders
- Large component trees

### 3.3 Web Vitals Monitoring

#### Add to Application

```typescript
// app/layout.tsx
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
```

#### Monitor Core Web Vitals

Track these metrics:
- **LCP** (Largest Contentful Paint): < 2.5s
- **FID** (First Input Delay): < 100ms
- **CLS** (Cumulative Layout Shift): < 0.1

---

## 4. Baseline and Comparison Testing

### 4.1 Create Performance Baseline

```bash
# Before optimizations
git checkout main

# Run tests and save results
k6 run k6-load-test.js --out json=baseline-results.json
lhci collect --config=lighthouserc.js --output-dir=baseline-lighthouse

# After optimizations
git checkout feature/performance-optimization

# Run tests again
k6 run k6-load-test.js --out json=optimized-results.json
lhci collect --config=lighthouserc.js --output-dir=optimized-lighthouse
```

### 4.2 Compare Results

```javascript
// compare-results.js
const baselineK6 = require('./baseline-results.json');
const optimizedK6 = require('./optimized-results.json');

function compareMetrics(baseline, optimized) {
  const baselineP95 = baseline.metrics.http_req_duration.values.p95;
  const optimizedP95 = optimized.metrics.http_req_duration.values.p95;
  
  const improvement = ((baselineP95 - optimizedP95) / baselineP95 * 100).toFixed(2);
  
  console.log('Performance Comparison:');
  console.log(`Baseline p95: ${baselineP95}ms`);
  console.log(`Optimized p95: ${optimizedP95}ms`);
  console.log(`Improvement: ${improvement}%`);
}
```

---

## 5. Continuous Performance Monitoring

### 5.1 Add Performance Metrics Endpoint

Already implemented in `/api/performance/metrics`

### 5.2 Set Up Monitoring Dashboard

**Option 1: Grafana + Prometheus**
- Export metrics in Prometheus format
- Visualize in Grafana dashboard

**Option 2: Application Performance Monitoring (APM)**
- New Relic
- Datadog
- Sentry Performance

### 5.3 Performance Alerts

Set up alerts for:
- p95 response time > 500ms
- Error rate > 1%
- Database connection pool > 80% utilized
- Memory usage > 80%

---

## 6. Testing Checklist

### Before Optimization
- [ ] Record baseline metrics (API response times, page load times)
- [ ] Document slow queries with EXPLAIN ANALYZE
- [ ] Measure bundle sizes
- [ ] Run Lighthouse audit
- [ ] Check database index usage

### After Optimization
- [ ] Run all tests from baseline
- [ ] Compare metrics (should show improvement)
- [ ] Verify no regressions in functionality
- [ ] Check error rates (should not increase)
- [ ] Validate cache hit rates

### Production Deployment
- [ ] Run tests in staging environment
- [ ] Perform load testing with production-like data volumes
- [ ] Monitor real user metrics for 1 week
- [ ] Have rollback plan ready
- [ ] Document performance improvements

---

## 7. Performance Budget

### API Response Times
- List endpoints: < 300ms (p95)
- Detail endpoints: < 200ms (p95)
- Create/Update: < 500ms (p95)
- Cached endpoints: < 100ms (p95)

### Frontend Metrics
- First Contentful Paint: < 1.5s
- Largest Contentful Paint: < 2.5s
- Time to Interactive: < 3.5s
- Bundle size (initial): < 300KB (gzipped)

### Database
- Query execution: < 100ms (p95)
- Connection acquisition: < 50ms
- Index usage: > 90% of queries

---

## 8. Tools and Resources

### Load Testing
- **k6**: https://k6.io/docs/
- **Apache JMeter**: https://jmeter.apache.org/
- **Artillery**: https://artillery.io/

### Database Profiling
- **pg_stat_statements**: https://www.postgresql.org/docs/current/pgstatstatements.html
- **pgBadger**: https://pgbadger.darold.net/
- **EXPLAIN Visualizer**: https://explain.dalibo.com/

### Frontend Performance
- **Lighthouse**: https://developers.google.com/web/tools/lighthouse
- **WebPageTest**: https://www.webpagetest.org/
- **React DevTools Profiler**: https://react.dev/learn/react-developer-tools

### Monitoring
- **Grafana**: https://grafana.com/
- **Prometheus**: https://prometheus.io/
- **Sentry**: https://sentry.io/

---

## Conclusion

Regular performance testing ensures the application maintains optimal speed and scalability. Follow this guide to establish a baseline, implement optimizations, and continuously monitor performance metrics.

**Remember:**
- Test with realistic data volumes
- Use production-like environment for load testing
- Monitor real user metrics in production
- Iterate based on findings

---

**Last Updated**: 2025-12-17  
**Maintained By**: EHRConnect Development Team
