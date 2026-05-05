/**
 * Logging utility - only error logs are output.
 * log, warn, info, debug are no-ops.
 */

export const logger = {
  log: () => {},
  error: (...args) => {
    console.error(...args);
  },
  warn: () => {},
  info: () => {},
  debug: () => {},
};

export default logger;

