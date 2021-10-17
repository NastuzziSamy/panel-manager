const { St, Meta } = imports.gi;
const Main = imports.ui.main;
const Me = imports.misc.extensionUtils.getCurrentExtension();

const { BaseHandler } = Me.imports.src.base;
const { ProxyMixin } = Me.imports.src.mixins;
const { warn, debug } = Me.imports.src.helper;


var PanelHandler = class extends BaseHandler {
    handle() {
        const children = this.element.get_children();
        const { layoutManager } = global.managers.panel;

        for (const key in children) {
            const child = children[key];

            layoutManager.addElement(child);
        }

        // TODO: proxy panel add child.
    }

    getPanel() {
        return this.getElement();
    }

    updateConfig(config) {
        super.updateConfig(config);

        const { layoutManager } = global.managers.panel;
        const { elements } = config;

        for (const key in elements) {
            const name = elements[key];
            const layoutHandler = layoutManager.getHandler(name);
            if (! layoutHandler) continue;

            this.addHandler(layoutHandler);
        }
    }

    addHandler(handler) {
        this.element.add_child(handler.element);
    }
};


var MainPanelHandler = class extends PanelHandler {
    handle() {
        this.setProxies();
        this.resolveIndicators();

        super.handle();
    }

    addElement(element) {
        if (this.element) {
            debug('Cannot replace main panel');

            return false;
        }

        super.addElement(element);
    }

    setProxies() {
        this.applyProxy(this.getPanel(), 'addToStatusArea', (proxied, role, indicator, position, box) => {
            proxied(role, indicator, position, box);

            global.managers.panel.indicatorManager.addElement(role, indicator);
        });

        this.applyProxy(this.getPanel().statusArea.aggregateMenu._indicators, 'replace_child', (proxied, old_child, new_child) => {
            proxied(old_child, new_child);

            // TODO: Find and replace.

            // const indicator = global.managers.panel.indicatorManager.findElement(old_child);
            // if (!indicator) return;

            // indicator.addElement(new_child);
            // this.getPanel().statusArea.aggregateMenu[`_${indicator.name}`] = new_child;

            // this.applyPrefs(Me.prefs);
        });
    }

    resolveIndicators() {
        for (const key in Main.panel.statusArea) {
            global.managers.panel.indicatorManager.addElement(key, Main.panel.statusArea[key]);
        }
    }
}

Object.assign(MainPanelHandler.prototype, ProxyMixin);