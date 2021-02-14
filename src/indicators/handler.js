const { St } = imports.gi;
const Main = imports.ui.main;
const PanelMenu = imports.ui.panelMenu;
const Me = imports.misc.extensionUtils.getCurrentExtension();

const { ButtonIndicator, IndicatorToStatus } = Me.imports.src.indicators.index;

const INDICATOR_PREFS = {
    'keyboard': {
        text: 'Langue',
        icon: 'format-text-bold',
    },
    'clipboardIndicator': {
        text: 'Clipboard',
    },
    'drive-menu': {
        text: 'Disques connectés',
    },
    'printers': {
        text: 'Imprimantes',
    },
    'a11y': {
        text: 'Accessibilité',
    },
    'aggregateMenu': {
        menuAlignement: 1,
    },
    'DoNotDisturbRole': {
        menuAlignement: 0,
    },
}


var IndicatorHandler = class {
    constructor(name) {
        this.name = name;
        this.prefs = INDICATOR_PREFS[name] || {};

        this.elements = {
            indicator: null,
            status: null,
            menu: null,
        };
    }

    addElement(element) {
        if (element instanceof PanelMenu.Button || element instanceof ButtonIndicator || element instanceof St.BoxLayout) {
            this.elements.indicator = element;
        } else if (element instanceof PanelMenu.SystemIndicator || element instanceof IndicatorToStatus) {
            this.elements.status = element;
        }
    }

    hasElement(element) {
        if (!element) return false;

        const toCompare = [
            this.elements.indicator, this.elements.status, 
            (this.elements.indicator || {}).proxied, (this.elements.status || {}).proxied,
        ];

        return toCompare.includes(element) || (element.proxied && toCompare.includes(element.proxied));
    }

    getIndicator() {
        // if (!this.elements.indicator && this.elements.status) {
        //     this.elements.indicator = new StatusToIndicator(this.elements.status);
        // }

        return this.elements.indicator;
    }

    getStatus() {
        if (!this.elements.status && this.elements.indicator) {
            this.elements.status = new IndicatorToStatus(this.elements.indicator, this.getPref('text', this.name), this.getPref('icon'));
        }

        return this.elements.status;
    }

    // getMenu() {
    //     return this.getStatus().menu;
    // }
    
    getPref(key, defaultValue) {
        const value = (this.prefs || {})[key];
        if (value === undefined) return defaultValue;

        return value;
    }

    getPrefs() {
        return this.prefs;
    }

    applyPrefs() {
        if (this.prefs.menuAlignement !== undefined) {
            this.getIndicator().menu._arrowAlignment = this.prefs.menuAlignement;
        }
    }

    insertIntoBox(box, position) {
        if (box === Main.panel.statusArea.aggregateMenu._indicators) {
            box.insert_child_at_index(this.getStatus(), position);
        } else if (box === Main.panel.statusArea.aggregateMenu.menu.box) {
            Main.panel.statusArea.aggregateMenu.menu.addMenuItem(this.getStatus().menu, position);
        } else if (this.getIndicator() instanceof PanelMenu.Button) {
            if (this.getIndicator().container.get_children().length === 0) {
                box.add_child(this.getIndicator());
            } else {
                Main.panel._addToPanelBox(this.name, this.getIndicator(), position, box)
            }
        } else if (this.getIndicator() instanceof ButtonIndicator) {
            box.insert_child_at_index(this.getIndicator().proxied, position);
        }
    }
};

var AppIndicatorHandler = class extends IndicatorHandler {
    constructor(name) {
        super(name);

        this.elements = [];
    }

    addElement(element) {
        this.elements.push(element);
    }

    hasElement(element) {
        for (const key in this.elements) {
            const toCompare = this.elements[key];

            if (element === toCompare || toCompare.hasElement(element)) {
                return true;
            }
        }

        return false;
    }

    getIndicator() {
        return this.elements;
    }

    getStatus() {
        return this.elements;
    }

    // getMenu() {
    //     return this.getStatus().menu;
    // }
    
    getPref(key, defaultValue) {
        const value = (this.prefs || {})[key];
        if (value === undefined) return defaultValue;

        return value;
    }

    getPrefs() {
        return this.prefs;
    }

    applyPrefs() {
        for (const key in this.elements) {
            this.elements[key].applyPrefs();
        }
    }

    insertIntoBox(box, position) {
        for (const key in this.elements) {
            this.elements[key].insertIntoBox(box, position);
        }
    }
}