/**
 * Application Logger Utility
 * 
 * Provides structured logging with different levels and proper formatting.
 * Replaces console.log usage for better production debugging and monitoring.
 * 
 * Usage:
 *   const logger = require('./utils/logger');
 *   
 *   logger.info('User logged in', { userId: '123', email: 'user@example.com' });
 *   logger.error('Database connection failed', { error: err.message, stack: err.stack });
 *   logger.warn('High memory usage detected', { usage: '85%' });
 *   logger.debug('Query executed', { query, params, executionTime: 120 });
 */

const LOG_LEVELS = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3,
};

const LOG_LEVEL_NAMES = ['ERROR', 'WARN', 'INFO', 'DEBUG'];

class Logger {
  constructor() {
    // Set log level from environment or default to INFO
    const envLevel = process.env.LOG_LEVEL || 'INFO';
    this.level = LOG_LEVELS[envLevel.toUpperCase()] || LOG_LEVELS.INFO;
    this.isDevelopment = process.env.NODE_ENV !== 'production';
  }

  /**
   * Format log message with timestamp and metadata
   */
  format(level, message, metadata = {}) {
    const timestamp = new Date().toISOString();
    const levelName = LOG_LEVEL_NAMES[level];
    
    const logEntry = {
      timestamp,
      level: levelName,
      message,
      ...(Object.keys(metadata).length > 0 && { metadata }),
    };

    if (this.isDevelopment) {
      // Pretty print in development
      return `[${timestamp}] ${levelName}: ${message}${
        Object.keys(metadata).length > 0 ? '\n' + JSON.stringify(metadata, null, 2) : ''
      }`;
    } else {
      // JSON format in production for log aggregation
      return JSON.stringify(logEntry);
    }
  }

  /**
   * Log at specified level if it meets threshold
   */
  log(level, message, metadata = {}) {
    if (level <= this.level) {
      const formatted = this.format(level, message, metadata);
      
      // Use appropriate console method
      switch (level) {
        case LOG_LEVELS.ERROR:
          console.error(formatted);
          break;
        case LOG_LEVELS.WARN:
          console.warn(formatted);
          break;
        case LOG_LEVELS.DEBUG:
          if (this.isDevelopment) {
            console.debug(formatted);
          }
          break;
        default:
          console.log(formatted);
      }
    }
  }

  /**
   * Log error messages (always logged)
   */
  error(message, metadata = {}) {
    this.log(LOG_LEVELS.ERROR, message, metadata);
  }

  /**
   * Log warning messages
   */
  warn(message, metadata = {}) {
    this.log(LOG_LEVELS.WARN, message, metadata);
  }

  /**
   * Log informational messages
   */
  info(message, metadata = {}) {
    this.log(LOG_LEVELS.INFO, message, metadata);
  }

  /**
   * Log debug messages (only in development or when LOG_LEVEL=DEBUG)
   */
  debug(message, metadata = {}) {
    this.log(LOG_LEVELS.DEBUG, message, metadata);
  }

  /**
   * Create a child logger with additional context
   * Useful for adding request IDs or user context to all logs
   */
  child(context = {}) {
    const childLogger = new Logger();
    childLogger.level = this.level;
    childLogger.isDevelopment = this.isDevelopment;
    
    // Override log method to include context
    const originalLog = childLogger.log.bind(childLogger);
    childLogger.log = (level, message, metadata = {}) => {
      originalLog(level, message, { ...context, ...metadata });
    };
    
    return childLogger;
  }

  /**
   * Measure and log execution time of async function
   */
  async time(label, fn) {
    const start = Date.now();
    try {
      const result = await fn();
      const duration = Date.now() - start;
      this.debug(`${label} completed`, { duration: `${duration}ms` });
      return result;
    } catch (error) {
      const duration = Date.now() - start;
      this.error(`${label} failed`, {
        duration: `${duration}ms`,
        error: error.message,
        stack: error.stack,
      });
      throw error;
    }
  }
}

// Export singleton instance
const logger = new Logger();

module.exports = logger;
