# Performance Best Practices

**Last Updated**: 2025-12-17  
**Repository**: EHRConnect  
**Audience**: Development Team

## Overview

This document outlines performance best practices for the EHRConnect project, covering database operations, API development, and frontend performance.

---

## Database Performance

### 1. Query Optimization

#### ✅ DO: Use Specific Column Lists
```javascript
// Good
const result = await query(
  'SELECT id, name, email, status FROM users WHERE org_id = $1',
  [orgId]
);

// Avoid
const result = await query('SELECT * FROM users WHERE org_id = $1', [orgId]);
```

**Why**: Reduces data transfer, memory usage, and query execution time.

---

#### ✅ DO: Use Indexes on Foreign Keys
```sql
-- Always create indexes on foreign key columns used in WHERE/JOIN
CREATE INDEX idx_tasks_patient_id ON tasks(patient_id);
CREATE INDEX idx_tasks_org_id ON tasks(org_id);
```

**Why**: Dramatically improves JOIN and filtering performance.

---

#### ✅ DO: Use Composite Indexes for Common Queries
```sql
-- For queries that filter on multiple columns together
CREATE INDEX idx_tasks_org_status_priority 
  ON tasks(org_id, status, priority);
```

**Why**: Single index can satisfy multi-column queries.

---

#### ✅ DO: Use Partial Indexes for Filtered Queries
```sql
-- Index only rows that match common WHERE conditions
CREATE INDEX idx_tasks_active 
  ON tasks(org_id, due_date) 
  WHERE deleted_at IS NULL AND status = 'active';
```

**Why**: Smaller index size, faster queries for specific conditions.

---

#### ✅ DO: Use CTEs for Complex Queries
```javascript
// Efficient pagination with single query
const query = `
  WITH filtered_data AS (
    SELECT *, COUNT(*) OVER() as total_count
    FROM table_name
    WHERE condition
    LIMIT $1 OFFSET $2
  )
  SELECT * FROM filtered_data
`;
```

**Why**: Avoids running the same query twice for count and data.

---

#### ❌ AVOID: N+1 Query Problems
```javascript
// Bad - N queries in loop
for (const task of tasks) {
  const subtasks = await query(
    'SELECT * FROM subtasks WHERE task_id = $1',
    [task.id]
  );
}

// Good - Single query with JOIN or IN clause
const taskIds = tasks.map(t => t.id);
const subtasks = await query(
  'SELECT * FROM subtasks WHERE task_id = ANY($1)',
  [taskIds]
);
```

**Why**: Reduces database round trips from N to 1.

---

#### ✅ DO: Use Batch Operations
```javascript
// Bad - Multiple INSERT statements
for (const item of items) {
  await query('INSERT INTO table (col1, col2) VALUES ($1, $2)', [item.a, item.b]);
}

// Good - Single batch INSERT
const values = items.map((item, i) => 
  `($${i*2+1}, $${i*2+2})`
).join(',');
const params = items.flatMap(item => [item.a, item.b]);
await query(`INSERT INTO table (col1, col2) VALUES ${values}`, params);
```

**Why**: Reduces overhead and transaction time.

---

### 2. Connection Pool Management

#### ✅ DO: Configure Pool Sizes Appropriately
```javascript
const pool = new Pool({
  max: 20, // Maximum connections
  min: 5,  // Minimum connections
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});
```

**Why**: Balances resource usage with concurrency needs.

---

#### ✅ DO: Always Release Connections
```javascript
const client = await pool.connect();
try {
  await client.query('BEGIN');
  // ... operations
  await client.query('COMMIT');
} catch (error) {
  await client.query('ROLLBACK');
  throw error;
} finally {
  client.release(); // Always release
}
```

**Why**: Prevents connection leaks and exhaustion.

---

### 3. Transaction Management

#### ✅ DO: Keep Transactions Short
```javascript
// Good - only necessary operations in transaction
await transaction(async (client) => {
  const result = await client.query('INSERT ... RETURNING *');
  await client.query('UPDATE related_table ...');
  return result.rows[0];
});

// Avoid - long-running operations in transaction
await transaction(async (client) => {
  // ... DB operations
  await sendEmail(); // External call - move outside
  await processLargeFile(); // CPU-intensive - move outside
});
```

**Why**: Long transactions block other queries and increase deadlock risk.

---

## Application Layer Performance

### 1. Caching Strategy

#### ✅ DO: Cache Static/Rarely-Changing Data
```javascript
const queryCache = require('./utils/query-cache');

// Cache roles for 10 minutes
const roles = await queryCache.wrap(
  queryCache.KEYS.ROLES(orgId), 
  600,
  async () => {
    return await db.query('SELECT * FROM roles WHERE org_id = $1', [orgId]);
  }
);
```

**Why**: Avoids repeated database queries for same data.

---

#### ✅ DO: Invalidate Cache on Updates
```javascript
// After updating roles
await updateRole(roleId, updates);
queryCache.invalidate(queryCache.KEYS.ROLES(orgId));
queryCache.invalidatePattern('permissions:*');
```

**Why**: Ensures users see latest data.

---

### 2. Logging Best Practices

#### ✅ DO: Use Structured Logging
```javascript
const logger = require('./utils/logger');

// Good
logger.info('User logged in', {
  userId: user.id,
  email: user.email,
  ip: req.ip
});

// Avoid
console.log('User logged in:', user.id, user.email);
```

**Why**: Easier to parse, search, and analyze logs.

---

#### ✅ DO: Use Appropriate Log Levels
```javascript
logger.error('Database connection failed', { error, stack });  // Production errors
logger.warn('High memory usage', { usage: '85%' });            // Warnings
logger.info('Server started', { port, env });                  // Important info
logger.debug('Query executed', { query, params, time: 50 });  // Debug only
```

**Why**: Controls log verbosity in different environments.

---

#### ❌ AVOID: Logging Sensitive Data
```javascript
// Bad
logger.info('User authenticated', { password: user.password });

// Good
logger.info('User authenticated', { userId: user.id });
```

**Why**: Security and compliance requirements.

---

### 3. Error Handling

#### ✅ DO: Handle Errors Gracefully
```javascript
try {
  const result = await someOperation();
  return res.json(result);
} catch (error) {
  logger.error('Operation failed', {
    error: error.message,
    stack: error.stack,
    userId,
    orgId
  });
  
  return res.status(500).json({
    error: 'Operation failed',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
  });
}
```

**Why**: Provides debugging info without exposing internals.

---

## API Performance

### 1. Response Time Optimization

#### ✅ DO: Use Pagination for Lists
```javascript
// Always paginate list endpoints
router.get('/tasks', async (req, res) => {
  const { page = 1, pageSize = 20 } = req.query;
  const result = await taskService.list({ page, pageSize });
  res.json(result);
});
```

**Why**: Prevents overwhelming client and server.

---

#### ✅ DO: Implement Rate Limiting
```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/api/', limiter);
```

**Why**: Prevents abuse and ensures fair resource allocation.

---

#### ✅ DO: Use Query Timeouts
```javascript
const result = await query({
  text: 'SELECT ...',
  values: [param1, param2],
  timeout: 5000 // 5 second timeout
});
```

**Why**: Prevents hanging requests from blocking resources.

---

### 2. Payload Optimization

#### ✅ DO: Use Compression
```javascript
const compression = require('compression');
app.use(compression());
```

**Why**: Reduces response size by 60-80%.

---

#### ✅ DO: Return Only Needed Data
```javascript
// Bad - returns everything
app.get('/users', async (req, res) => {
  const users = await getAllUsers();
  res.json(users);
});

// Good - selective fields
app.get('/users', async (req, res) => {
  const fields = req.query.fields?.split(',') || ['id', 'name', 'email'];
  const users = await getUsers(fields);
  res.json(users);
});
```

**Why**: Reduces bandwidth and improves client-side performance.

---

## Frontend Performance

### 1. React Optimization

#### ✅ DO: Memoize Expensive Components
```typescript
export const TaskList = React.memo(function TaskList({ tasks, onSelect }) {
  return (
    <div>
      {tasks.map(task => (
        <TaskCard key={task.id} task={task} onSelect={onSelect} />
      ))}
    </div>
  );
});
```

**Why**: Prevents unnecessary re-renders.

---

#### ✅ DO: Memoize Expensive Computations
```typescript
const sortedTasks = useMemo(() => {
  return tasks.sort((a, b) => 
    new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
  );
}, [tasks]);
```

**Why**: Avoids recalculating on every render.

---

#### ✅ DO: Memoize Callback Functions
```typescript
const handleTaskClick = useCallback((taskId: string) => {
  onTaskSelect(taskId);
}, [onTaskSelect]);
```

**Why**: Prevents child component re-renders.

---

#### ✅ DO: Use Code Splitting
```typescript
// Lazy load large components
const BillingModule = dynamic(() => import('@/features/billing'), {
  loading: () => <LoadingSpinner />,
  ssr: false
});
```

**Why**: Reduces initial bundle size.

---

#### ❌ AVOID: Expensive Operations in Render
```typescript
// Bad
function TaskList({ tasks }) {
  const sorted = tasks.sort(...); // Re-sorts on every render
  return <div>{sorted.map(...)}</div>;
}

// Good
function TaskList({ tasks }) {
  const sorted = useMemo(() => tasks.sort(...), [tasks]);
  return <div>{sorted.map(...)}</div>;
}
```

**Why**: Sorting/filtering on every render is expensive.

---

### 2. Data Fetching

#### ✅ DO: Use SWR for Caching
```typescript
import useSWR from 'swr';

function UserProfile() {
  const { data, error } = useSWR('/api/user/profile', fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 10000 // 10 seconds
  });
  
  if (error) return <div>Failed to load</div>;
  if (!data) return <div>Loading...</div>;
  return <div>{data.name}</div>;
}
```

**Why**: Automatic caching and revalidation.

---

#### ✅ DO: Implement Virtual Scrolling for Long Lists
```typescript
import { useVirtualizer } from '@tanstack/react-virtual';

function LongList({ items }) {
  const parentRef = useRef(null);
  
  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 50,
  });
  
  return (
    <div ref={parentRef} style={{ height: '400px', overflow: 'auto' }}>
      <div style={{ height: `${virtualizer.getTotalSize()}px` }}>
        {virtualizer.getVirtualItems().map((virtualItem) => (
          <div key={virtualItem.index}>
            {items[virtualItem.index].name}
          </div>
        ))}
      </div>
    </div>
  );
}
```

**Why**: Only renders visible items, handles thousands of items efficiently.

---

## Monitoring & Debugging

### 1. Performance Monitoring

#### ✅ DO: Log Slow Queries
```javascript
const logger = require('./utils/logger');

async function executeQuery(sql, params) {
  const start = Date.now();
  const result = await pool.query(sql, params);
  const duration = Date.now() - start;
  
  if (duration > 1000) {
    logger.warn('Slow query detected', {
      sql: sql.substring(0, 100),
      duration: `${duration}ms`,
      rowCount: result.rowCount
    });
  }
  
  return result;
}
```

**Why**: Identifies queries that need optimization.

---

#### ✅ DO: Track API Endpoint Performance
```javascript
app.use((req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info('Request completed', {
      method: req.method,
      path: req.path,
      status: res.statusCode,
      duration: `${duration}ms`
    });
  });
  
  next();
});
```

**Why**: Helps identify slow endpoints.

---

### 2. Database Query Analysis

#### ✅ DO: Use EXPLAIN ANALYZE for Query Optimization
```sql
EXPLAIN ANALYZE
SELECT t.*, u.name as assigned_to_name
FROM tasks t
LEFT JOIN users u ON t.assigned_to_user_id = u.id
WHERE t.org_id = 'abc123'
  AND t.status = 'active'
  AND t.deleted_at IS NULL
ORDER BY t.due_date
LIMIT 20;
```

**Why**: Shows actual execution plan and identifies bottlenecks.

---

#### ✅ DO: Monitor Database Statistics
```sql
-- Enable pg_stat_statements
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;

-- Find slow queries
SELECT 
  query,
  calls,
  total_exec_time,
  mean_exec_time,
  max_exec_time
FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 10;
```

**Why**: Identifies queries consuming most resources.

---

## Testing Performance

### 1. Load Testing

#### ✅ DO: Test with Realistic Data Volumes
```javascript
// Seed test database with realistic amounts of data
// - 10,000+ patients
// - 50,000+ tasks
// - 100,000+ form responses
```

**Why**: Performance issues often only appear at scale.

---

#### ✅ DO: Measure Before and After Optimization
```javascript
// Benchmark query performance
const { performance } = require('perf_hooks');

const start = performance.now();
await query(sql, params);
const end = performance.now();
console.log(`Query took ${end - start}ms`);
```

**Why**: Validates that optimizations actually improve performance.

---

### 2. Automated Performance Testing

#### ✅ DO: Set Performance Budgets
```javascript
// In tests
describe('Task List API', () => {
  it('should respond within 500ms', async () => {
    const start = Date.now();
    await request(app).get('/api/tasks');
    const duration = Date.now() - start;
    expect(duration).toBeLessThan(500);
  });
});
```

**Why**: Catches performance regressions early.

---

## Summary Checklist

### Database
- [ ] All foreign keys have indexes
- [ ] Common multi-column queries have composite indexes
- [ ] Queries specify exact columns (no SELECT *)
- [ ] Pagination uses CTEs to avoid double queries
- [ ] Batch operations instead of loops
- [ ] Connection pool properly configured

### Application
- [ ] Static data is cached with TTL
- [ ] Structured logging instead of console.log
- [ ] Appropriate log levels used
- [ ] Sensitive data not logged
- [ ] Errors handled gracefully

### API
- [ ] All list endpoints paginated
- [ ] Rate limiting implemented
- [ ] Response compression enabled
- [ ] Query timeouts set
- [ ] Only necessary data returned

### Frontend
- [ ] Expensive components memoized
- [ ] Code splitting for large modules
- [ ] Virtual scrolling for long lists
- [ ] SWR for data fetching with cache
- [ ] No expensive operations in render

### Monitoring
- [ ] Slow query logging enabled
- [ ] API endpoint performance tracked
- [ ] Database query statistics monitored
- [ ] Performance budgets defined
- [ ] Load testing in place

---

## Additional Resources

- [PostgreSQL Performance Tips](https://wiki.postgresql.org/wiki/Performance_Optimization)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)
- [React Performance Optimization](https://react.dev/learn/render-and-commit#optimizing-performance)
- [Web Performance Best Practices](https://web.dev/fast/)

---

**Last Updated**: 2025-12-17  
**Maintained By**: EHRConnect Development Team
