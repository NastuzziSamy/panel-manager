const Me = imports.misc.extensionUtils.getCurrentExtension();

const { PanelManager } = Me.imports.src.manager;
const { Settings } = Me.imports.src.settings;
const { PANEL_SCHEMA_KEY, PANEL_PREFS, SCHEMAS } = Me.imports.src.consts;
const { settings, setSettings } = Me.imports.src.helper;


var Extension = class {
    constructor() {
        this.loadSettings();

        if (!global.managers) {
            global.managers = {};
        }

        if (settings.debug) {
            global.managers._panel = Me;
        }
    }

    loadSettings() {
        Me.settings = new Settings(SCHEMAS);

        for (const key in settings) {
            Me.settings.follow(PANEL_SCHEMA_KEY, key, (value) => setSettings(key, value));
        }

        Me.settings.follow(PANEL_SCHEMA_KEY, 'panel-prefs', (prefs) => {
            Me.prefs = JSON.parse(prefs);

            if (global.managers.panel) {
                global.managers.panel.applyPrefs(Me.prefs);
            }
        });
    }

    enable() {
        global.managers.panel = new PanelManager();

        global.managers.panel.manage();
    }

    disable() {
        Me.settings.disconnectSignals();

        if (!global.managers) return;

        if (global.managers.panel) {
            global.managers.panel.destroy();
        }

        global.managers.panel = undefined;
    }
};
