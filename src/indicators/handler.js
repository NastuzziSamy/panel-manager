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
        this.indicator = null;
        this.status = null;
        this.prefs = INDICATOR_PREFS[name] || {};
    }

    setElement(element) {
        if (element instanceof PanelMenu.Button || element instanceof ButtonIndicator) {
            this.indicator = element;
        } else if (element instanceof St.BoxLayout) {
            this.indicator = element;
        } else if (element instanceof ButtonIndicator) {
            this.indicator = element;
        } else if (element instanceof PanelMenu.SystemIndicator || element instanceof IndicatorToStatus) {
            this.status = element;
        }
    }

    hasElement(element) {
        if (!element) return false;

        const toCompare = [
            this.indicator, this.status, 
            (this.indicator || {}).proxied, (this.status || {}).proxied,
        ];

        return toCompare.includes(element) || (element.proxied && toCompare.includes(element.proxied));
    }

    getIndicator() {
        // if (!this.indicator && this.status) {
        //     this.indicator = new StatusToIndicator(this.status);
        // }

        return this.indicator;
    }

    getStatus() {
        if (!this.status && this.indicator) {
            this.status = new IndicatorToStatus(this.indicator, 'Text');
        }

        return this.status;
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
            Main.panel.statusArea.aggregateMenu.menu.addMenuItem(this.getIndicator().menu, position);
        } else if (this.getIndicator() instanceof PanelMenu.Button) {
            Main.panel._addToPanelBox(this.name, this.getIndicator(), position, box)
        } else if (this.getIndicator() instanceof ButtonIndicator) {
            box.insert_child_at_index(this.getIndicator().proxied, position);
        }
    }
};