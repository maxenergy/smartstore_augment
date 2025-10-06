/**
 * 结构化日志系统
 * 支持不同级别的日志输出
 */

import { maskSensitiveData } from "./security";

export enum LogLevel {
  DEBUG = "debug",
  INFO = "info",
  WARN = "warn",
  ERROR = "error",
}

export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: Record<string, any>;
  error?: Error;
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === "development";

  /**
   * 格式化日志条目
   */
  private formatLogEntry(entry: LogEntry): string {
    const { level, message, timestamp, context, error } = entry;

    const logObject: any = {
      level,
      message,
      timestamp,
    };

    if (context) {
      logObject.context = maskSensitiveData(context);
    }

    if (error) {
      logObject.error = {
        name: error.name,
        message: error.message,
        stack: this.isDevelopment ? error.stack : undefined,
      };
    }

    return JSON.stringify(logObject);
  }

  /**
   * 输出日志
   */
  private log(level: LogLevel, message: string, context?: Record<string, any>, error?: Error) {
    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      context,
      error,
    };

    const formatted = this.formatLogEntry(entry);

    // 根据级别选择输出方式
    switch (level) {
      case LogLevel.DEBUG:
        if (this.isDevelopment) {
          console.debug(formatted);
        }
        break;
      case LogLevel.INFO:
        console.info(formatted);
        break;
      case LogLevel.WARN:
        console.warn(formatted);
        break;
      case LogLevel.ERROR:
        console.error(formatted);
        break;
    }
  }

  /**
   * Debug 级别日志
   */
  debug(message: string, context?: Record<string, any>) {
    this.log(LogLevel.DEBUG, message, context);
  }

  /**
   * Info 级别日志
   */
  info(message: string, context?: Record<string, any>) {
    this.log(LogLevel.INFO, message, context);
  }

  /**
   * Warning 级别日志
   */
  warn(message: string, context?: Record<string, any>) {
    this.log(LogLevel.WARN, message, context);
  }

  /**
   * Error 级别日志
   */
  error(message: string, error?: Error, context?: Record<string, any>) {
    this.log(LogLevel.ERROR, message, context, error);
  }

  /**
   * API 请求日志
   */
  apiRequest(method: string, path: string, context?: Record<string, any>) {
    this.info(`API Request: ${method} ${path}`, context);
  }

  /**
   * API 响应日志
   */
  apiResponse(method: string, path: string, status: number, duration: number) {
    this.info(`API Response: ${method} ${path}`, {
      status,
      duration: `${duration}ms`,
    });
  }

  /**
   * 数据库查询日志
   */
  dbQuery(query: string, duration: number) {
    if (this.isDevelopment) {
      this.debug("Database Query", {
        query,
        duration: `${duration}ms`,
      });
    }
  }
}

// 导出单例
export const logger = new Logger();
