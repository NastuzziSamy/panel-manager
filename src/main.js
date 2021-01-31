const { Clutter } = imports.gi;
const Me = imports.misc.extensionUtils.getCurrentExtension();

const { BarManager } = Me.imports.src.manager;


var Extension = class {
    enable() {
        this.barManager = new BarManager();
    }

    disable() {
        this.barManager.destroy();
    }
};
