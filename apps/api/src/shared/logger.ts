/**
 * Structured Logger with Tenant Context
 * 
 * Provides consistent logging across the application with:
 * - Timestamp
 * - Log level
 * - Tenant ID (when available)
 * - Request ID (when available)
 * - Structured metadata
 */

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogContext {
  tenantId?: string;
  requestId?: string;
  [key: string]: unknown;
}

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  tenantId?: string;
  requestId?: string;
  meta?: Record<string, unknown>;
}

class Logger {
  private formatJson(entry: LogEntry): string {
    return JSON.stringify(entry);
  }

  private formatReadable(entry: LogEntry): string {
    const { timestamp, level, message, tenantId, requestId, meta } = entry;
    const parts = [`[${timestamp}]`, level.toUpperCase().padEnd(5)];
    
    if (tenantId) parts.push(`[tenant:${tenantId}]`);
    if (requestId) parts.push(`[req:${requestId}]`);
    
    parts.push(message);
    
    if (meta && Object.keys(meta).length > 0) {
      parts.push(JSON.stringify(meta));
    }
    
    return parts.join(' ');
  }

  private log(level: LogLevel, message: string, context?: LogContext): void {
    const { tenantId, requestId, ...meta } = context || {};
    
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
    };
    
    // Only add optional properties if defined (exactOptionalPropertyTypes)
    if (tenantId) entry.tenantId = tenantId;
    if (requestId) entry.requestId = requestId;
    if (Object.keys(meta).length > 0) entry.meta = meta;

    // Use readable format for console (JSON in production)
    const output = process.env.NODE_ENV === 'production' 
      ? this.formatJson(entry)
      : this.formatReadable(entry);

    switch (level) {
      case 'error':
        console.error(output);
        break;
      case 'warn':
        console.warn(output);
        break;
      case 'debug':
        if (process.env.DEBUG) console.debug(output);
        break;
      default:
        console.log(output);
    }
  }

  info(message: string, context?: LogContext): void {
    this.log('info', message, context);
  }

  warn(message: string, context?: LogContext): void {
    this.log('warn', message, context);
  }

  error(message: string, context?: LogContext): void {
    this.log('error', message, context);
  }

  debug(message: string, context?: LogContext): void {
    this.log('debug', message, context);
  }

  /**
   * Log HTTP request (access log style)
   */
  request(method: string, path: string, statusCode: number, durationMs: number, context?: LogContext): void {
    this.info(`${method} ${path} ${statusCode} ${durationMs}ms`, context);
  }
}

export const logger = new Logger();
