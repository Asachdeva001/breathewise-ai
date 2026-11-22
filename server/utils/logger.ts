/**
 * @file Structured Logger for BreatheWise AI Platform
 * @description Provides timestamped, leveled structured logging for Google Cloud Run & Local Dev
 */

export const LOG_LEVELS = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
} as const;

export type LogLevel = keyof typeof LOG_LEVELS;

const currentLevel = process.env.NODE_ENV === 'test' ? LOG_LEVELS.WARN : LOG_LEVELS.INFO;

function formatLog(level: LogLevel, message: string, meta: Record<string, unknown> = {}): string {
  const timestamp = new Date().toISOString();
  const metaStr = Object.keys(meta).length > 0 ? ` | ${JSON.stringify(meta)}` : '';
  return `[${timestamp}] [${level}] [BreatheWise AI] ${message}${metaStr}`;
}

export const logger = {
  debug: (msg: string, meta: Record<string, unknown> = {}): void => {
    if (currentLevel <= LOG_LEVELS.DEBUG) {
      console.debug(formatLog('DEBUG', msg, meta));
    }
  },
  info: (msg: string, meta: Record<string, unknown> = {}): void => {
    if (currentLevel <= LOG_LEVELS.INFO) {
      console.log(formatLog('INFO', msg, meta));
    }
  },
  warn: (msg: string, meta: Record<string, unknown> = {}): void => {
    if (currentLevel <= LOG_LEVELS.WARN) {
      console.warn(formatLog('WARN', msg, meta));
    }
  },
  error: (msg: string, meta: Record<string, unknown> = {}): void => {
    if (currentLevel <= LOG_LEVELS.ERROR) {
      console.error(formatLog('ERROR', msg, meta));
    }
  },
};

export default logger;
