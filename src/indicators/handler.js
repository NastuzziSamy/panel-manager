const PanelMenu = imports.ui.panelMenu;
const Me = imports.misc.extensionUtils.getCurrentExtension();

const { BaseHandler } = Me.imports.src.base;
const { ToStatusIndicator } = Me.imports.src.indicators.index;
const { mergeStyle } = Me.imports.src.helper;


var BaseIndicatorHandler = class extends BaseHandler {
    handle() {
        // TODO: proxy layout add child.
    }

    getIndicator() {
        return this.getElement();
    }

    getMenu() {
        return this.getIndicator().menu;
    }

    prepareForConfig(config) {
        super.prepareForConfig(config);

        // TODO: prepare by saving diff configs.
    }

    updateConfig({ style, menuStyle, menuAlignement, menuWidth }) {
        // TODO: add under for menus etc..

        if (style !== undefined) {
            mergeStyle(this.getElement().first_child || this.getElement(), style);
        }

        if (menuStyle !== undefined) {
            mergeStyle(this.getMenu().box, menuStyle);
        }

        if (menuAlignement !== undefined) {
            this.getMenu().setSourceAlignment(menuAlignement);
        }

        if (menuWidth !== undefined) {
            this.getMenu().box.width = menuWidth;
        }

        // if (this.elements.status instanceof ToStatusIndicator) {
        //     this.elements.status.applyPrefs(prefs);
        // } else if (this.elements.status) {
        //     if (prefs.style !== undefined) {
        //         mergeStyle(this.elements.status, prefs.style);
        //     }

        //     if (prefs.menuStyle !== undefined) {
        //         mergeStyle(this.elements.status.menu, prefs.menuStyle);
        //     }

        //     if (prefs.optionsStyle !== undefined) {
        //         const children = this.elements.status.menu.get_children();

        //         for (const key in children) {
        //             mergeStyle(children[key].menu.box, prefs.optionsStyle);
        //         }
        //     }
        // }

        // const { indicatorManager } = global.managers.panel;
        // const { elements } = config;

        // for (const key in elements) {
        //     const name = elements[key];
        //     const indicatorHandler = indicatorManager.getHandler(name);
        //     if (! indicatorHandler) continue;

        //     indicatorHandler.addToHandler(this, details);
        // }
    }
};


var IndicatorHandler = class extends BaseIndicatorHandler {
    addElement(element) {
        if (element instanceof PanelMenu.SystemIndicator) {
            this.status = element;

            return;
        }

        // TODO: Add to app indicators.

        super.addElement(element);
    }

    getElement() {
        // TODO: Type from config.
        return this.element || this.status;
    }

    getIndicator() {
        if (! this.element && this.status) {
            // this.element = new FromStatusIndicator;
            throw new Error('Not supported yet'); // TODO.
        }

        return this.element;
    }

    getStatus() {
        if (! this.status && this.element) {
            this.status = new ToStatusIndicator(this.name, this.element);
        }

        return this.status;
    }

    getStatusMenu() {
        return this.getStatus().menu;
    }

    prepareForConfig(config) {
        if (this.status) {
            const { box } = this.getStatusMenu();
            const parent = box.get_parent();

            if (parent) {
                parent.remove_actor(box);
            }
        }

        super.prepareForConfig(config);
    }

    updateConfig({ text='', icon='', noStatus, optionsStyle={}, ...config }) {
        // const children = this.getStatus().menu.get_children();

        // for (const key in children) {
        //     mergeStyle(children[key].menu.box, optionsStyle);
        // }

        const status = this.status;

        if (status instanceof ToStatusIndicator) {
            status.setText(text);
            status.setIcon(icon);
            status.hideStatus(noStatus);

            mergeStyle(status.subMenu.menu.box, optionsStyle);
        }

        super.updateConfig(config);
    }
};


var AppIndicatorHandler = class extends IndicatorHandler {
    addElement(element) {
        // TODO: Add to app indicators.

        super.addElement(element);
    }
};


var MenuIndicatorHandler = class extends BaseIndicatorHandler {
    handle() {
        const { indicatorManager } = global.managers.panel;

        const keys = Object.keys(this.element);

        for (const index in keys) {
            const key = keys[index];
            const [, name] = key.match(/^_([a-zA-Z]*)$/) || [];
            if (! name || name == 'delegate' || name == 'indicators') continue;

            const child = this.element[key];
            indicatorManager.addElement(name, child);
        }

        if (this.element._indicators) {
            const children = this.element._indicators.get_children();

            for (const key in children) {
                const child = children[key];

                indicatorManager.addElement(key, child);
            }
        }

        super.handle();
    }

    updateConfig({ elements, ...config }) {
        const { indicatorManager } = global.managers.panel;

        for (const key in elements) {
            const name = elements[key];
            const indicatorHandler = indicatorManager.getHandler(name);
            if (! indicatorHandler) continue;

            this.addHandler(indicatorHandler);
        }

        super.updateConfig(config);
    }

    addHandler(handler) {
        const status = handler.getStatus();
        const menu = handler.getStatusMenu();

        if (status) {
            this.element._indicators.add_child(status);
        }

        if (menu) {
            this.getMenu().addMenuItem(menu);
        }
    }
};


var SpaceIndicatorHandler = class extends BaseIndicatorHandler {
    getStatus() {
        return this.element;
    }

    getStatusMenu() {
        return null;
    }

    updateConfig({ width=25 }) {
        this.element.width = width;
    }
};


var SeparatorIndicatorHandler = class extends BaseIndicatorHandler {
    getStatus() {
        return null;
    }

    getStatusMenu() {
        return this.element;
    }

    updateConfig({ text=' ' }) {
        this.element.setText(text);
    }
};