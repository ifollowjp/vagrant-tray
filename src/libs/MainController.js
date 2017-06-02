"use strict";
/**
 * MainController モジュール
 *
 * @module  {MainController}    MainController
 * @class   {MainController}
 */
module.exports = new (function MainController() {
    /**
     * 実行コンテキスト
     *
     * @type    {Function}
     */
    const self = this;

    // -------------------------------------------------------------------------
    /**
     * 初期化
     *
     * @type    {Function}
     * @method
     * @return  {Boolean}   true
     * @private
     */
    const _init = function _init() {
        return true;
    };

    /**
     * 実行可能になったら実行する処理
     *
     * @type    {Function}
     * @method
     * @return  {Boolean}   true
     * @private
     */
    const _onReady = function _onReady() {
        try {
            _execute();
        } catch (error) {
            _handleError(error);
        }
        return true;
    };

    // -------------------------------------------------------------------------
    /**
     * 処理
     *
     * @method
     * @return  {Boolean}   true
     * @private
     */
    const _execute = function _execute() {
        Log.info('Start ' + __PRODUCT__);

        // クラッシュレポート
        // Electron.crashReporter.start();

        // トレイアイコンを取得
        $IF.get('./libs/TrayIcon.js');
        return true;
    };

    // -------------------------------------------------------------------------
    /**
     * 再起動処理
     *
     * @method
     * @return  {Boolean}   true
     * @private
     */
    self.restart = function restart() {
        // トレイアイコンがあれば閉じる
        $IF.get('./libs/TrayIcon.js').quit();
        let args = process.argv.slice(1);
        Log.info('End ' + __PRODUCT__ + ' and Restart with ["' + args.join('","') + '"]');
        App.relaunch({args: args});
        App.exit(0);
        return true;
    };

    /**
     * 終了処理
     *
     * @method
     * @return  {Boolean}   true
     * @private
     */
    self.quit = function quit() {
        // トレイアイコンがあれば閉じる
        $IF.get('./libs/TrayIcon.js').quit();
        Log.info('End ' + __PRODUCT__);
        App.quit();
        return true;
    };

    /**
     * エラーハンドラ
     *
     * @method
     * @param   {Error}     error
     * @return  {Boolean}   true
     * @private
     */
    const _handleError = function _handleError(error) {
        const title   = 'error - ' + __PRODUCT__;
        const message = [
            'Error has occurred in controller execution.',
            '',
            error.stack,
        ].join('\n');
        Log.error(message);
        Dialog.showErrorBox(title, message);
        $IF.quit();
        return false;
    };

    // -------------------------------------------------------------------------
    /**
     * 処理
     *
     * @type    {Function}
     * @method
     * @return  {Boolean}   true
     * @private
     */
    self.execute = function execute() {
        App.on('ready', _onReady);
        return true;
    };

    // -------------------------------------------------------------------------
    _init();
    return self;
})();
