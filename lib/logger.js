// lib/logger.js - Logging utility

const LOG_LEVELS = {
  ERROR: "ERROR",
  WARN: "WARN",
  INFO: "INFO",
  DEBUG: "DEBUG",
};

const logToFile = async (level, message, data) => {
  const timestamp = new Date().toISOString();
  const logEntry = `[${timestamp}] [${level}] ${message}`;

  if (process.env.NODE_ENV === "production") {
    // In production, send to logging service (Sentry, LogRocket, etc)
    console.log(logEntry, data);
  } else {
    console.log(logEntry, data);
  }
};

export const logger = {
  error: (message, data = {}) =>
    logToFile(LOG_LEVELS.ERROR, message, data),
  warn: (message, data = {}) => logToFile(LOG_LEVELS.WARN, message, data),
  info: (message, data = {}) => logToFile(LOG_LEVELS.INFO, message, data),
  debug: (message, data = {}) => logToFile(LOG_LEVELS.DEBUG, message, data),
};