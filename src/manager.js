const { St } = imports.gi;
const Main = imports.ui.main;
const PanelMenu = imports.ui.panelMenu;
const PopupMenu = imports.ui.popupMenu;
const Me = imports.misc.extensionUtils.getCurrentExtension();

const { ButtonIndicator, ToStatusIndicator } = Me.imports.src.indicators.index;
const { PanelManager } = Me.imports.src.panels.manager;
const { LayoutManager } = Me.imports.src.layouts.manager;
const { IndicatorManager } = Me.imports.src.indicators.manager;
const { warn, debug } = Me.imports.src.helper;
const { PANEL_SCHEMA_KEY } = Me.imports.src.consts;


var ExtensionManager = class {
    constructor() {
        this.reset();
    }

    manage() {
        this.manageManagers();

        this.trackSettings();
    }

    destroy() {
        // Destroy all managers.
        this.panelManager.destroy();
        this.layoutManager.destroy();
        this.indicatorManager.destroy();

        this.panelManager = undefined;
        this.layoutManager = undefined;
        this.indicatorManager = undefined;
    }

    reset() {
        this.panelConfig = {};
        this.layoutConfig = {};
        this.indicatorConfig = {};

        // List all managers.
        this.panelManager = new PanelManager();
        this.layoutManager = new LayoutManager();
        this.indicatorManager = new IndicatorManager();
    }

    manageManagers() {
        this.panelManager.manage();
        this.layoutManager.manage();
        this.indicatorManager.manage();
    }

    trackSettings() {
        Me.settings.follow(PANEL_SCHEMA_KEY, 'panels-configurations',
            (config) => {
                this.panelConfig = this._parseConfig(config);

                this.update();
            });

        Me.settings.follow(PANEL_SCHEMA_KEY, 'layouts-configurations',
            (config) => {
                this.layoutConfig = this._parseConfig(config);

                this.update();
            });

        Me.settings.follow(PANEL_SCHEMA_KEY, 'indicators-configurations',
            (config) => {
                this.indicatorConfig = this._parseConfig(config);

                this.update();
            });
    }

    _parseConfig(config) {
        try {
            return JSON.parse(config);
        } catch {
            warn('Config is not a JSON, got: ' + config);
        }

        return {};
    }

    update() {
        this.panelManager.prepareForConfig(this.panelConfig);
        this.layoutManager.prepareForConfig(this.layoutConfig);
        this.indicatorManager.prepareForConfig(this.indicatorConfig);

        this.panelManager.updateConfig(this.panelConfig);
        this.layoutManager.updateConfig(this.layoutConfig);
        this.indicatorManager.updateConfig(this.indicatorConfig);
    }

    // resolveDefaultPanel() {
    //     const boxes = this.boxManager.getBoxes();
    //     this.indicatorManager.resolveIndicators(this.boxManager.getMenus(), boxes);

    //     for (const key in boxes) {
    //         const box = boxes[key];
    //         const children = box.get_children();
    //         this.defaultPanel[key] = [];

    //         for (const position in children) {
    //             const child = children[position];

    //             const element = this.indicatorManager.resolveElement(child);
    //             const indicator = this.indicatorManager.findIndicator(element);
    //             if (!indicator) continue;

    //             this.defaultPanel[key][position] = indicator.name;
    //         }
    //     }
    // }
};