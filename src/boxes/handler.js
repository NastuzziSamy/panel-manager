const { St } = imports.gi;
const Main = imports.ui.main;
const PanelMenu = imports.ui.panelMenu;
const Me = imports.misc.extensionUtils.getCurrentExtension();


const BOX_PREFS = {
    'aggregateMenu': {
        menuAlignement: 1,
    },
    'menu-0': {
        menuAlignement: 0,
    },
}


var BoxHandler = class {
    constructor(name) {
        this.name = name;
        this.prefs = INDICATOR_PREFS[name] || {};
    }

    getPref(key, defaultValue) {
        const value = (this.prefs || {})[key];
        if (value === undefined) return defaultValue;

        return value;
    }

    getPrefs() {
        return this.prefs;
    }

    applyPrefs() {

    }

    getBoxes() {

    }
}


var LayoutHandler = class extends BoxHandler {
    constructor(name, layout) {
        super(name);

        this.layout = layout;
    }

    getBoxes() {
        return [this.layout];
    }
};


var MenuHandler = class extends BoxHandler {
    constructor(name, menu) {
        super(name);

        this.menu = menu;
    }

    getBoxes() {
        return [this.menu.menu.box, this.menu._indicators];
    }
};