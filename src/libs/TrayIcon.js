"use strict";
/**
 * TrayIcon モジュール
 *
 * @module  {TrayIcon}  TrayIcon
 * @class   {TrayIcon}
 */
module.exports = new (function TrayIcon() {
    /**
     * 実行コンテキスト
     *
     * @type    {Function}
     */
    const self = this;

    /**
     * Vagrant
     *
     * @type    {Vagrant}
     */
    const Vagrant = $IF.get('./libs/Vagrant.js');

    /**
     * トレイ
     *
     * @type    {Tray}
     */
    let instance = null;

    /**
     * 更新タイミング(ミリ秒)
     *
     * @type    {Number}
     */
//     const UPDATE_INTERVAL = 300000;
    const UPDATE_INTERVAL = 10000;

    /**
     * インターバルタイマー識別子
     *
     * @type    {Number}
     */
    let idInterval = 0;

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
        instance      = new Electron.Tray(ICONS.VAGRANT);
        _update();
        instance.on('click', _showContextMenu);
        return true;
    };

    /**
     * メニュー更新
     *
     * @type    {Function}
     * @method
     * @return  {Boolean}   true
     * @private
     */
    const _updateMenu = function _updateMenu() {
        let   submenu    = [];
        const menu       = [];
        menu.push({
            icon:               ICONS.VAGRANT,
            label:              __PRODUCT__,
            enabled:            false,
        });
        // Vagrantインスタンス
        menu.push({ type: 'separator' });
        const ids        = Vagrant.list();
        let id           = '';
        let each         = null;
        let data         = {};
        let icon         = '';
        let has          = '';
        if ( ids.length > 0 ) {
            for ( let i=0 ; i<ids.length ; i++ ) {
                id       = ids[i];
                data     = Vagrant.getStatus(id);
                icon     = data.cwd + SEP + 'icon.png';
                has      = exists(icon);
                if ( has !== true ) {
                    icon = ICONS.VAGRANT;
                }
                submenu  = [];
                submenu.push({
                    icon:       ICONS.VAGRANTUP,
                    label:      'vagrant up ' + id,
                    click:      _runVagrant,
                });
                submenu.push({
                    icon:       ICONS.VAGRANTHALT,
                    label:      'vagrant halt ' + id,
                    click:      _runVagrant,
                });
                submenu.push({
                    icon:       ICONS.VAGRANTRELOAD,
                    label:      'vagrant reload ' + id,
                    click:      _runVagrant,
                });
                menu.push({
                    id:         id,
                    icon:       icon,
                    label:      id + ' : ' + data.name + ' is ' + data.state + '.',
                    sublabel:   '[' + data.cwd + '] by ' + data.provider,
                    submenu:    submenu,
                });
            }
        } else {
            menu.push({
                icon:           ICONS.DEV,
                label:          'no instances',
                enabled:        false,
            });
        }
        // 共通メニュー
        menu.push({ type: 'separator' });
        menu.push({
            icon:               ICONS.ABOUT,
            label:              'About ...',
            click:              _showAboutWindow,
        });
        menu.push({ type: 'separator' });
        menu.push({
            icon:               ICONS.RESTART,
            label:              'Restart this application',
            click:              _restartApp,
        });
        menu.push({
            icon:               ICONS.QUIT,
            label:              'Quit this application',
            click:              _quitApp,
            accelerator:        'Shift+CmdOrCtrl+Q',
        });
        instance.setContextMenu(Electron.Menu.buildFromTemplate(menu));
        return true;
    };

    /**
     * ツールチップやメニューを更新する
     *
     * @method
     * @param   {Event}     event
     * @return  {Boolean}   true
     * @private
     */
    const _update = function _update(event){
        _updateMenu();
        _updateToolTip();
        return true;
    };

    /**
     * ツールチップを更新する
     *
     * @method
     * @param   {Error}     error
     * @param   {String}    stdout
     * @param   {String}    stderr
     * @return  {Boolean}   true
     * @private
     */
    const _updateToolTip = function _updateToolTip(){
        const ids                    = Vagrant.list();
        let   statuses               = {};
        let   message                = [
            App.getName() + ' ' + App.getVersion(),
            '',
        ];
        if ( ids.length > 0 ) {
            for ( let i=0 ; i<ids.length ; i++ ) {
                let id               = ids[i];
                let data             = Vagrant.getStatus(id);
                statuses[data.state] = (statuses[data.state]||[]);
                statuses[data.state].push(data.id + ':' + data.name + ' [' + data.cwd + ']');
            }
            for ( let state in statuses ) {
                message.push('[' + state + ']');
                message.push(statuses[state].join('\n'));
            }
        } else {
            message.push('no instance.');
            message.push('');
        }
        instance.setToolTip(message.join('\n'));
        return true;
    };

    /**
     * ツールチップやメニューを更新する
     *
     * @method
     * @return  {Boolean}   true
     * @public
     */
    self.update = function update(){
        _update();
        return true;
    };

    /**
     * メニューを表示する
     *
     * @type    {Function}
     * @method
     * @return  {Boolean}   true
     * @private
     */
    const _showContextMenu = function _showContextMenu() {
        return instance.popUpContextMenu();
    };

    /**
     * アバウトウィンドウを開く
     *
     * @type    {Function}
     * @method
     * @param   {MenuItem}          menuItem
     * @param   {BrowserWindow}     browserWindow
     * @param   {EventEmitter}      event
     * @return  {Boolean}           true
     * @private
     */
    const _showAboutWindow = function _showAboutWindow(menuItem, browserWindow, event) {
        $IF.get('./libs/AboutWindow.js').show();
        return true;
    };

    /**
     * Vagrantを呼び出す
     *
     * @type    {Function}
     * @method
     * @return  {Boolean}   true
     * @private
     */
    const _runVagrant = function _runVagrant(menuItem, browserWindow, event) {
        const parts = menuItem.label.split(' ');
        const cmd   = parts[1];
        const id    = parts[2];
        return Vagrant.run(cmd, id);
    };

    /**
     * 再起動
     *
     * @type    {Function}
     * @method
     * @return  {Boolean}   true
     * @private
     */
    const _restartApp = function _restartApp(menuItem, browserWindow, event) {
        $IF.restart();
        return true;
    };

    /**
     * 終了
     *
     * @type    {Function}
     * @method
     * @return  {Boolean}   true
     * @private
     */
    const _quitApp = function _quitApp(menuItem, browserWindow, event) {
        $IF.quit();
        return true;
    };

    /**
     * 終了処理
     *
     * @method
     * @return  {Boolean}   true
     * @public
     */
    self.quit = function quit() {
        instance && instance.destroy && instance.destroy();
        idInterval > 0 && clearInterval(idInterval);
        instance = null;
        Electron.globalShortcut.unregisterAll();
        return true;
    };

    // -------------------------------------------------------------------------
    _init();
    return self;
})();
