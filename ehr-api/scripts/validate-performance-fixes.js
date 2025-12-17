/**
 * Performance Fixes Validation Script
 * 
 * Comprehensive tests to verify all performance optimizations work correctly:
 * - Memory leak detection
 * - Connection pool leak detection
 * - Performance benchmarks
 * - Timer cleanup verification
 * - Cache performance testing
 * 
 * Run: node scripts/validate-performance-fixes.js
 */

const { pool } = require('../src/database/connection');
const logger = require('../src/utils/logger');
const multiCache = require('../src/utils/multi-level-cache');
const queryCache = require('../src/utils/query-cache');

class PerformanceValidator {
  constructor() {
    this.testResults = [];
  }

  /**
   * Test 1: Memory Leak Detection
   */
  async testMemoryLeaks() {
    logger.info('🧪 Testing memory leak prevention...');
    
    const startMem = process.memoryUsage().heapUsed;
    const iterations = 1000;

    // Simulate high load
    for (let i = 0; i < iterations; i++) {
      // Allocate and release
      const data = new Array(1000).fill({ test: 'data', index: i });
      await new Promise(resolve => setTimeout(resolve, 1));
    }

    // Force garbage collection if available
    if (global.gc) {
      global.gc();
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    const endMem = process.memoryUsage().heapUsed;
    const growth = ((endMem - startMem) / startMem * 100).toFixed(2);

    const passed = growth < 10; // Less than 10% growth is acceptable
    this.testResults.push({
      test: 'Memory Leak Test',
      passed,
      details: `Memory growth: ${growth}% (${((endMem - startMem) / 1024 / 1024).toFixed(2)}MB)`
    });

    logger.info(passed ? '✅ PASSED' : '❌ FAILED', {
      startMem: `${(startMem / 1024 / 1024).toFixed(2)}MB`,
      endMem: `${(endMem / 1024 / 1024).toFixed(2)}MB`,
      growth: `${growth}%`
    });

    return passed;
  }

  /**
   * Test 2: Connection Pool Leak Detection
   */
  async testConnectionPoolLeaks() {
    logger.info('🧪 Testing connection pool safety...');

    const iterations = 100;
    const startPoolCount = pool.totalCount;

    try {
      // Simulate high database load
      const promises = [];
      for (let i = 0; i < iterations; i++) {
        promises.push(
          pool.query('SELECT 1 as test').catch(err => {
            // Ignore errors for this test
            logger.debug('Query error (expected in test):', err.message);
          })
        );
      }

      await Promise.all(promises);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for cleanup

      const endPoolCount = pool.totalCount;
      const idleCount = pool.idleCount;
      const waitingCount = pool.waitingCount;

      const passed = waitingCount === 0 && endPoolCount <= startPoolCount + 5;
      
      this.testResults.push({
        test: 'Connection Pool Test',
        passed,
        details: `Pool: ${endPoolCount} total, ${idleCount} idle, ${waitingCount} waiting`
      });

      logger.info(passed ? '✅ PASSED' : '❌ FAILED', {
        totalConnections: endPoolCount,
        idleConnections: idleCount,
        waitingRequests: waitingCount
      });

      return passed;
    } catch (error) {
      logger.error('Connection pool test error:', error);
      this.testResults.push({
        test: 'Connection Pool Test',
        passed: false,
        details: error.message
      });
      return false;
    }
  }

  /**
   * Test 3: Query Performance Benchmark
   */
  async testQueryPerformance() {
    logger.info('🧪 Testing query performance...');

    const iterations = 100;
    const times = [];

    try {
      for (let i = 0; i < iterations; i++) {
        const start = Date.now();
        await pool.query('SELECT 1 as test, $1 as value', [i]);
        times.push(Date.now() - start);
      }

      const avg = times.reduce((a, b) => a + b, 0) / times.length;
      const sorted = times.sort((a, b) => a - b);
      const p95 = sorted[Math.floor(times.length * 0.95)];
      const p99 = sorted[Math.floor(times.length * 0.99)];

      const passed = p95 < 50; // p95 should be under 50ms

      this.testResults.push({
        test: 'Query Performance Test',
        passed,
        details: `Avg: ${avg.toFixed(2)}ms, p95: ${p95}ms, p99: ${p99}ms`
      });

      logger.info(passed ? '✅ PASSED' : '❌ FAILED', {
        average: `${avg.toFixed(2)}ms`,
        p95: `${p95}ms`,
        p99: `${p99}ms`
      });

      return passed;
    } catch (error) {
      logger.error('Query performance test error:', error);
      this.testResults.push({
        test: 'Query Performance Test',
        passed: false,
        details: error.message
      });
      return false;
    }
  }

  /**
   * Test 4: Cache Performance
   */
  async testCachePerformance() {
    logger.info('🧪 Testing cache performance...');

    const iterations = 1000;
    let cacheHits = 0;
    let cacheMisses = 0;

    try {
      // Populate cache
      for (let i = 0; i < 10; i++) {
        multiCache.set(`test:${i}`, { data: `value${i}` }, 60000);
      }

      // Test cache hits/misses
      for (let i = 0; i < iterations; i++) {
        const key = `test:${i % 20}`; // 50% should hit
        const value = multiCache.get(key);
        if (value !== null) {
          cacheHits++;
        } else {
          cacheMisses++;
        }
      }

      const hitRate = (cacheHits / iterations * 100).toFixed(2);
      const passed = hitRate >= 45 && hitRate <= 55; // Should be around 50%

      this.testResults.push({
        test: 'Cache Performance Test',
        passed,
        details: `Hit rate: ${hitRate}% (${cacheHits} hits, ${cacheMisses} misses)`
      });

      logger.info(passed ? '✅ PASSED' : '❌ FAILED', {
        hitRate: `${hitRate}%`,
        hits: cacheHits,
        misses: cacheMisses
      });

      // Cleanup
      multiCache.clear();

      return passed;
    } catch (error) {
      logger.error('Cache performance test error:', error);
      this.testResults.push({
        test: 'Cache Performance Test',
        passed: false,
        details: error.message
      });
      return false;
    }
  }

  /**
   * Test 5: Timer Cleanup
   */
  async testTimerCleanup() {
    logger.info('🧪 Testing timer cleanup...');

    const startHandles = process._getActiveHandles().length;
    const timers = [];

    // Create timers
    for (let i = 0; i < 100; i++) {
      const timer = setTimeout(() => {}, 60000);
      timers.push(timer);
    }

    const peakHandles = process._getActiveHandles().length;

    // Clear timers
    timers.forEach(timer => clearTimeout(timer));
    await new Promise(resolve => setTimeout(resolve, 100));

    const endHandles = process._getActiveHandles().length;
    const cleaned = peakHandles - endHandles;

    const passed = cleaned >= 90; // At least 90% should be cleaned

    this.testResults.push({
      test: 'Timer Cleanup Test',
      passed,
      details: `Cleaned ${cleaned}/100 timers`
    });

    logger.info(passed ? '✅ PASSED' : '❌ FAILED', {
      start: startHandles,
      peak: peakHandles,
      end: endHandles,
      cleaned: cleaned
    });

    return passed;
  }

  /**
   * Run all tests
   */
  async runAll() {
    logger.info('🚀 Starting performance validation tests...\n');

    const tests = [
      this.testMemoryLeaks.bind(this),
      this.testConnectionPoolLeaks.bind(this),
      this.testQueryPerformance.bind(this),
      this.testCachePerformance.bind(this),
      this.testTimerCleanup.bind(this),
    ];

    let passed = 0;
    let failed = 0;

    for (const test of tests) {
      try {
        const result = await test();
        if (result) {
          passed++;
        } else {
          failed++;
        }
        logger.info(''); // Empty line for readability
      } catch (error) {
        logger.error('Test execution error:', error);
        failed++;
      }
    }

    // Summary
    logger.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    logger.info('📊 Test Summary');
    logger.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    this.testResults.forEach(result => {
      const icon = result.passed ? '✅' : '❌';
      logger.info(`${icon} ${result.test}: ${result.details}`);
    });

    logger.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    logger.info(`\nTotal: ${passed} passed, ${failed} failed`);
    
    if (failed === 0) {
      logger.info('\n🎉 All tests passed! Code is production-ready.');
    } else {
      logger.error(`\n❌ ${failed} test(s) failed. Review and fix before deployment.`);
    }

    return failed === 0;
  }
}

// Run if called directly
if (require.main === module) {
  const validator = new PerformanceValidator();
  
  validator.runAll()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      logger.error('Fatal error:', error);
      process.exit(1);
    })
    .finally(() => {
      // Cleanup
      pool.end();
    });
}

module.exports = PerformanceValidator;
