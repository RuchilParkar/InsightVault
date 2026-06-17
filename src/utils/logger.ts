// src/utils/logger.ts

export type LogLevel = 'INFO' | 'WARN' | 'ERROR';

export interface LogEntry {
  timestamp: number;
  level: LogLevel;
  category: 'DATABASE' | 'AI' | 'METADATA' | 'APP' | 'BACKUP';
  message: string;
  details?: any;
}

class Logger {
  private logs: LogEntry[] = [];
  private readonly MAX_LOGS = 500;

  private sanitizeDetails(details?: any): any {
    if (!details) return details;
    
    // Prevent logging sensitive keys like API keys or full user payloads if they contain secrets
    try {
      const stringified = JSON.stringify(details);
      // Basic sanitization
      const sanitized = stringified.replace(/AIza[0-9A-Za-z-_]{35}/g, '[REDACTED_API_KEY]');
      return JSON.parse(sanitized);
    } catch {
      return '[Unserializable Details]';
    }
  }

  private addLog(level: LogLevel, category: LogEntry['category'], message: string, details?: any) {
    const entry: LogEntry = {
      timestamp: Date.now(),
      level,
      category,
      message,
      details: this.sanitizeDetails(details),
    };

    this.logs.push(entry);
    if (this.logs.length > this.MAX_LOGS) {
      this.logs.shift();
    }

    // Also output to console for development
    if (__DEV__) {
      const consoleMsg = `[${category}] ${level}: ${message}`;
      if (level === 'ERROR') console.error(consoleMsg, entry.details || '');
      else if (level === 'WARN') console.warn(consoleMsg, entry.details || '');
      else console.log(consoleMsg, entry.details || '');
    }
  }

  info(category: LogEntry['category'], message: string, details?: any) {
    this.addLog('INFO', category, message, details);
  }

  warn(category: LogEntry['category'], message: string, details?: any) {
    this.addLog('WARN', category, message, details);
  }

  error(category: LogEntry['category'], message: string, error?: any) {
    this.addLog('ERROR', category, message, error instanceof Error ? { message: error.message, stack: error.stack } : error);
  }

  getLogs() {
    return [...this.logs];
  }

  clearLogs() {
    this.logs = [];
  }
}

export const logger = new Logger();
