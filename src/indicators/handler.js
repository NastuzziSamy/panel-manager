const Me = imports.misc.extensionUtils.getCurrentExtension();

const { BaseHandler } = Me.imports.src.base;
const { mergeStyle } = Me.imports.src.helper;


var IndicatorHandler = class extends BaseHandler {
    handle() {
        const parent = this.element.get_parent();

        if (parent) {
            parent.remove_actor(this.element);
        }

        // TODO: proxy layout add child.
    }

    getIndicator() {
        return this.getElement();
    }

    prepareForConfig(config) {
        // TODO: prepare by saving diff configs.
    }

    updateConfig(config) {
        super.updateConfig(config);

        // TODO: add under for menus etc..

        if (config.style !== undefined) {
            mergeStyle(this.element.first_child || this.element, config.style);
        }

        if (config.menuStyle !== undefined) {
            mergeStyle(this.element.menu.box, config.menuStyle);
        }

        // if (this.elements.status instanceof IndicatorToStatus) {
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

    addToHandler(handler) {
        handler.element.add_child(this.element);
    }
};


var AppIndicatorHandler = class extends IndicatorHandler {
    addElement(element) {
        // TODO: Add to app indicators.

        super.addElement(element);
    }
}