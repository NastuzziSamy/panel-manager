const Me = imports.misc.extensionUtils.getCurrentExtension();

const { BaseHandler } = Me.imports.src.base;


var LayoutHandler = class extends BaseHandler {
    handle() {
        const children = this.element.get_children();
        const { indicatorManager } = global.managers.panel;

        for (const key in children) {
            const child = children[key];

            indicatorManager.addElement(child);
        }

        // TODO: proxy layout add child.
    }

    getLayout() {
        return this.getElement();
    }

    updateConfig(config) {
        super.updateConfig(config);

        const { indicatorManager } = global.managers.panel;
        const { elements } = config;

        for (const key in elements) {
            const name = elements[key];
            const indicatorHandler = indicatorManager.getHandler(name);
            if (! indicatorHandler) continue;

            this.addHandler(indicatorHandler);
        }
    }

    addHandler(handler) {
        this.element.add_child(handler.element);
    }
};


