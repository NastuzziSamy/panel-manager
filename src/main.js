const { Clutter } = imports.gi;
const Me = imports.misc.extensionUtils.getCurrentExtension();

const { BarManager } = Me.imports.src.manager;


var Extension = class {
    enable() {
        global.managers.bar = new BarManager();
    }

    disable() {
        if (global.managers.bar) {
            global.managers.bar.destroy();
        }

        global.managers.bar = undefined;
    }
};
