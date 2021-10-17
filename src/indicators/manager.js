const { St } = imports.gi;
const Main = imports.ui.main;
const PanelMenu = imports.ui.panelMenu;
const Me = imports.misc.extensionUtils.getCurrentExtension();

const { AppIndicatorHandler, IndicatorHandler } = Me.imports.src.indicators.handler;
const { BaseManager } = Me.imports.src.base;
const { INDICATOR_NAME, APP_INDICATOR_NAME } = Me.imports.src.consts;


var IndicatorManager = class extends BaseManager {
    _DEFAULT_NAME = INDICATOR_NAME
    _HANDLER_CLASS = IndicatorHandler

    manage() {
        const children = Main.panel.get_children();

        for (const key in children) {
            const child = children[key];

            this.addElement(child);
        }

        // TODO: proxy add child on ui group.
    }

    validElement(element) {
        return (element instanceof PanelMenu.Button) || (element instanceof St.Bin);
    }

    resolveElement(element) {
        if (element instanceof St.Bin) {
            return element.get_child_at_index(0);
        }

        if (element._delegate) {
            return element._delegate;
        }
        // if (element instanceof St.BoxLayout && !(element instanceof PanelMenu.SystemIndicator)) {
        //     if (this.hasElement(element)) {
        //         const indicator = this.findIndicator(element);

        //         if (indicator.elements.indicator) {
        //             return indicator.elements.indicator;
        //         }

        //         if (indicator.elements.status) {
        //             return indicator.elements.status;
        //         }
        //     }

        //     return new ButtonIndicator(element);
        // }

        // while (element) {
        //     if (element instanceof PanelMenu.SystemIndicator
        //         || element instanceof PanelMenu.Button
        //         || element instanceof St.BoxLayout) {
        //         return element;
        //     }

        //     element = element.get_child_at_index ? element.get_child_at_index(0) : null;
        // }

        return element;
    }

    checkName(name) {
        const matchedApp = name.match(/^appindicator-/);

        if (matchedApp) {
            const match = name.match(/^appindicator-:[0-9.]+\/org\/ayatana\/NotificationItem\/([^:]+).*?$/);

            if (!match) {
                [, name] = name.match(/^appindicator[^:]*:([^:]+).*?$/)
            } else {
                name = match[1];
            }

            name = APP_INDICATOR_NAME + '-' + name
        }

        return super.checkName(name);
    }

    resolveName(element) {
        for (const key in Main.panel.statusArea) {
            if (Main.panel.statusArea[key] === element) {
                return key;
            }
        }

        return super.resolveName(element);
    }

    resolveHandler(name, element) {
        if (name.startsWith(APP_INDICATOR_NAME)) {
            return AppIndicatorHandler;
        }

        return super.resolveHandler(element);
    }
};