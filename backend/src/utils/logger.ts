/**
 * Logger Utility
 * Centralized logging service for the application
 */

export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
}

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  data?: unknown;
  error?: Error;
}

/**
 * Logger class for structured logging
 */
class Logger {
  private isDevelopment: boolean = process.env.NODE_ENV === 'development';

  private formatLog(level: LogLevel, message: string, data?: unknown, error?: Error): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      data,
      error: error ? { name: error.name, message: error.message, stack: error.stack } : undefined,
    };
  }

  private outputLog(entry: LogEntry): void {
    const output = JSON.stringify(entry);
    switch (entry.level) {
      case LogLevel.DEBUG:
        console.debug(output);
        break;
      case LogLevel.INFO:
        console.info(output);
        break;
      case LogLevel.WARN:
        console.warn(output);
        break;
      case LogLevel.ERROR:
        console.error(output);
        break;
    }
  }

  /**
   * Log debug message
   */
  public debug(message: string, data?: unknown): void {
    if (this.isDevelopment) {
      const entry = this.formatLog(LogLevel.DEBUG, message, data);
      this.outputLog(entry);
    }
  }

  /**
   * Log info message
   */
  public info(message: string, data?: unknown): void {
    const entry = this.formatLog(LogLevel.INFO, message, data);
    this.outputLog(entry);
  }

  /**
   * Log warning message
   */
  public warn(message: string, data?: unknown): void {
    const entry = this.formatLog(LogLevel.WARN, message, data);
    this.outputLog(entry);
  }

  /**
   * Log error message
   */
  public error(message: string, error?: Error, data?: unknown): void {
    const entry = this.formatLog(LogLevel.ERROR, message, data, error);
    this.outputLog(entry);
  }
}

// Export singleton instance
export const logger = new Logger();
