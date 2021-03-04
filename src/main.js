const { Clutter } = imports.gi;
const Me = imports.misc.extensionUtils.getCurrentExtension();

const { PanelManager } = Me.imports.src.manager;


var Extension = class {
    enable() {
        global.managers.panel = new PanelManager();
    }

    disable() {
        if (!global.managers) return;

        if (global.managers.panel) {
            global.managers.panel.destroy();
        }

        global.managers.panel = undefined;
    }
};
