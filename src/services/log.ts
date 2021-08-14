const environment = process.env.NODE_ENV || 'development';

/**
 * Setting value to switch the debug log output from this module.
 *
 * true: enables all log. | false: disables debug log.
 */
const isDebug = environment === "development";

/**
 * Log module.
 */
const Log = {
  /**
   * Output debug level log.
   */
  d: isDebug ? console.log : function() {},
  /**
   * Output warning level log.
   */
  w: console.warn.bind(console)
};

export default Log;
