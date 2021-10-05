const { St } = imports.gi;
const Main = imports.ui.main;
const PanelMenu = imports.ui.panelMenu;
const PopupMenu = imports.ui.popupMenu;
const Me = imports.misc.extensionUtils.getCurrentExtension();

const { ButtonIndicator, IndicatorToStatus } = Me.imports.src.indicators.index;
const { IndicatorManager } = Me.imports.src.indicators.manager;
const { BoxManager } = Me.imports.src.boxes.manager;
const { ProxyMixin } = Me.imports.src.mixins;
const { debug } = Me.imports.src.helper;
const { PANEL_SCHEMA_KEY } = Me.imports.src.consts;


var PanelManager = class {
    manage() {
        this.indicatorManager = new IndicatorManager();
        this.boxManager = new BoxManager();
        this.defaultPanel = {};

        this.resolveDefaultPanel();

        this.addProxies();

        this.applyPrefs(Me.prefs);
    }

    destroy() {
        this.applyPrefs(this.defaultPanel);

        this.restoreProxies();
    }

    addProxies() {
        this.applyProxy(Main.panel, 'addToStatusArea', (proxied, role, indicator, position, box) => {
            proxied(role, indicator, position, box);
            this.indicatorManager.setIndicator(role, indicator);

            debug(role);

            this.applyPrefs(Me.prefs);
        });

        this.applyProxy(Main.panel.statusArea.aggregateMenu._indicators, 'replace_child', (proxied, old_child, new_child) => {
            proxied(old_child, new_child);
            debug('Replace child');

            const indicator = this.indicatorManager.findIndicator(old_child);
            if (!indicator) return;

            debug('With name: ' + indicator.name);

            indicator.addElement(new_child);
            Main.panel.statusArea.aggregateMenu[`_${indicator.name}`] = new_child;

            this.applyPrefs(Me.prefs);
        });
    }

    resolveDefaultPanel() {
        const boxes = this.boxManager.getBoxes();
        this.indicatorManager.resolveIndicators(this.boxManager.getMenus(), boxes);

        for (const key in boxes) {
            const box = boxes[key];
            const children = box.get_children();
            this.defaultPanel[key] = [];

            for (const position in children) {
                const child = children[position];

                const element = this.indicatorManager.resolveElement(child);
                const indicator = this.indicatorManager.findIndicator(element);
                if (!indicator) continue;

                this.defaultPanel[key][position] = indicator.name;
            }
        }
    }

    cleanBoxes() {
        this.indicatorManager.resolveIndicators(this.boxManager.getMenus(), this.boxManager.getBoxes());
        this.boxManager.cleanBoxes();
    }

    applyPrefs(prefs) {
        this.cleanBoxes();

        const handlers = this.boxManager.getHandlers();
        for (const key in handlers) {
            const handler = handlers[key];
            const handlerPrefs = prefs[key] || {};
            let position = 0;

            for (const subKey in handlerPrefs) {
                const params = handlerPrefs[subKey];

                position += this.handleBox(handler, { ...params, position });
            }
        }
    }

    handleBox(handler, { type, name, ...params }) {
        switch (type) {
            case 'indicator':
                return handler.addIndicator(this.indicatorManager.getIndicator(name), params);

            case 'menu':
                return handler.addMenu(this.boxManager.getMenu(name), params);

            case 'layout':
                return handler.addLayout(this.boxManager.getLayout(name), params);

            case 'space':
                return handler.addSpace(params);

            case 'separator':
                return handler.addSeparator(params);
        }
    }
};

Object.assign(PanelManager.prototype, ProxyMixin);