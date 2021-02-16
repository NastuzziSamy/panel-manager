const { St } = imports.gi;
const Main = imports.ui.main;
const PanelMenu = imports.ui.panelMenu;
const Me = imports.misc.extensionUtils.getCurrentExtension();


var BoxHandler = class {
    constructor(name, box) {
        this.name = name;
        this.box = box;
    }

    getBox() {
        return this.box;
    }
}


var LayoutHandler = class extends BoxHandler {
    getBoxes() {
        return {
            [this.name]: this.box,
        };
    }

    applyPrefs(prefs) {

    }
};


var MenuHandler = class extends BoxHandler {
    getBoxes() {
        return {
            [this.name + '-menu']: this.box.menu.box,
            [this.name + '-status']: this.box._indicators,
        };
    }

    applyPrefs(prefs) {
        if (prefs.menuAlignement !== undefined) {
            this.box.menu._arrowAlignment = prefs.menuAlignement;
        }
    }
};