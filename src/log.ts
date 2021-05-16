/**
 * ログ用モジュールからのデバッグログ出力有無を切り替えるログ。
 * true: 出力する | false: 出力しない
 */
const isDebug = true;

/**
 * ログ用モジュール
 * console.logは使わずにコチラを使ってください。
 */
const Log = {
  /**
   * デバッグレベルのログを出力する
   */
  d: isDebug ? console.log : function() {},
  /**
   * 警告レベルのログを出力する
   */
  w: console.warn.bind(console)
};

export default Log;
