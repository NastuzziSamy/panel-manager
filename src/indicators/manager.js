const { St } = imports.gi;
const Main = imports.ui.main;
const { AggregateMenu } = imports.ui.panel;
const PanelMenu = imports.ui.panelMenu;
const Me = imports.misc.extensionUtils.getCurrentExtension();

const { BaseIndicatorHandler, AppIndicatorHandler, IndicatorHandler, SpaceIndicatorHandler, SeparatorIndicatorHandler, MenuIndicatorHandler } = Me.imports.src.indicators.handler;
const { MenuIndicator, SeparatorIndicator, SpaceIndicator, ButtonIndicator, ToStatusIndicator } = Me.imports.src.indicators.index;
const { BaseManager } = Me.imports.src.base;
const { INDICATOR_NAME, APP_INDICATOR_NAME, MENU_INDICATOR_NAME, SPACE_INDICATOR_NAME, SEPARATOR_INDICATOR_NAME } = Me.imports.src.consts;
const { debug, warn } = Me.imports.src.helper;


var IndicatorManager = class extends BaseManager {
    _DEFAULT_NAME = INDICATOR_NAME
    _HANDLER_CLASS = BaseIndicatorHandler

    manage() {
        const children = Main.panel.get_children();

        for (const key in children) {
            const child = children[key];

            this.addElement(child);
        }

        // TODO: proxy add child on ui group.
    }

    validElement(element) {
        return (element instanceof PanelMenu.Button)
            || (element instanceof PanelMenu.SystemIndicator)
            || (element instanceof St.Bin)
            || (element instanceof ButtonIndicator)
            || (element instanceof SpaceIndicator)
            || (element instanceof SeparatorIndicator)
            || (element instanceof MenuIndicator)
            || (element instanceof ToStatusIndicator);
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

        if (element instanceof SpaceIndicator) {
            return SpaceIndicatorHandler;
        }

        if (element instanceof SeparatorIndicator) {
            return SeparatorIndicatorHandler;
        }

        if (element instanceof MenuIndicator || (element instanceof AggregateMenu)) {
            return MenuIndicatorHandler;
        }

        return IndicatorHandler;
    }

    prepareForConfig(config) {
        for (const key in config) {
            const handler = this.getHandler(key);

            if (! handler && config[key].type) {
                switch (config[key].type) {
                    case MENU_INDICATOR_NAME:
                        this.setElement(key, new MenuIndicator(key));
                        break;

                    case SPACE_INDICATOR_NAME:
                        this.setElement(key, new SpaceIndicator());
                        break;

                    case SEPARATOR_INDICATOR_NAME:
                        this.setElement(key, new SeparatorIndicator(key));
                        break;

                    default:
                        warn(`Type ${config[key].type} not recognized`);
                }
            }
        }

        super.prepareForConfig(config);
    }
};