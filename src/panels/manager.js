const Main = imports.ui.main;
const { Panel } = imports.ui.panel;
const Me = imports.misc.extensionUtils.getCurrentExtension();

const { PanelHandler, MainPanelHandler } = Me.imports.src.panels.handler;
const { BaseManager } = Me.imports.src.base;
const { PANEL_NAME } = Me.imports.src.consts;


var PanelManager = class extends BaseManager {
    _DEFAULT_NAME = PANEL_NAME
    _HANDLER_CLASS = PanelHandler

    manage() {
        this.addElement(Main.panel);

        const children = Main.uiGroup.get_children();

        for (const key in children) {
            const child = children[key];

            this.addElement(child);
        }

        // TODO: proxy add child on ui group.
    }

    validElement(element) {
        return element.name && element.name.startsWith('panel');
    }

    resolveElement(element) {
        if (element.name === 'panelBox') {
            const child = element.get_child_at_index(0);

            if (child && (child instanceof Panel)) {
                return child;
            }
        }

        return element;
    }

    resolveHandler(name, element) {
        if (element instanceof Panel) {
            return MainPanelHandler;
        }

        return super.resolveHandler(element);
    }

    updateConfig(config) {
        for (const key in config) {
            const handler = this.getHandler(key);
            if (! handler) continue;

            // Main.layoutManager.addChrome(handler.getElement(), {
            //     affectsStruts: true,
            //     trackFullscreen: true,
            // });

            // Main.uiGroup.add_child(handler.getElement());
            // Main.ctrlAltTabManager.addGroup(this, _('Window List'), 'start-here-symbolic');
        }

        super.updateConfig(config);
    }
};