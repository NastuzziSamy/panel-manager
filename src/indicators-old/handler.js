const { St, Meta } = imports.gi;
const Main = imports.ui.main;
const PanelMenu = imports.ui.panelMenu;
const Me = imports.misc.extensionUtils.getCurrentExtension();

const { ButtonIndicator, IndicatorToStatus } = Me.imports.src.indicators.index;
const Helper = Me.imports.src.helper;


var IndicatorHandler = class {
    constructor(name) {
        this.name = name;

        this.elements = {
            indicator: null,
            status: null,
            menu: null,
        };
    }

    addElement(element) {
        if (element instanceof PanelMenu.SystemIndicator || element instanceof IndicatorToStatus) {
            this.elements.status = element;
        } else if (element instanceof PanelMenu.Button || element instanceof ButtonIndicator || element instanceof St.BoxLayout) {
            this.elements.indicator = element;
        }
    }

    hasElement(element) {
        if (!element) return false;

        if (this.elements.status && this.elements.status instanceof PanelMenu.SystemIndicator && this.elements.status.menu.box === element) {
            return true;
        }

        const toCompare = [
            this.elements.indicator, this.elements.status,
            (this.elements.indicator || {}).proxied, (this.elements.status || {}).proxied,
        ];

        return toCompare.includes(element) || (element.proxied && toCompare.includes(element.proxied));
    }

    getStatus() {
        if (!this.elements.status && this.elements.indicator) {
            this.elements.status = new IndicatorToStatus(this.name, this.elements.indicator);
        }

        return this.elements.status;
    }

    getIndicator() {
        // if (!this.elements.indicator && this.elements.status) {
        //     this.elements.indicator = new StatusToIndicator(this.elements.status);
        // }

        return this.elements.indicator;
    }

    applyPrefs(prefs) {
        if (this.elements.indicator) {
            if (prefs.style !== undefined) {
                Helper.mergeStyle(this.elements.indicator.first_child || this.elements.indicator, prefs.style);
            }

            if (prefs.menuStyle !== undefined) {
                Helper.mergeStyle(this.elements.indicator.menu.box, prefs.menuStyle);
            }
        }

        if (this.elements.status instanceof IndicatorToStatus) {
            this.elements.status.applyPrefs(prefs);
        } else if (this.elements.status) {
            if (prefs.style !== undefined) {
                Helper.mergeStyle(this.elements.status, prefs.style);
            }

            if (prefs.menuStyle !== undefined) {
                Helper.mergeStyle(this.elements.status.menu, prefs.menuStyle);
            }

            if (prefs.optionsStyle !== undefined) {
                const children = this.elements.status.menu.get_children();

                for (const key in children) {
                    Helper.mergeStyle(children[key].menu.box, prefs.optionsStyle);
                }
            }
        }
    }
};

var AppIndicatorHandler = class extends IndicatorHandler {
    constructor(name) {
        super(name);

        this.elements = {};
    }

    addElement(element) {
        if (this.hasIndicator(element.name)) return;

        this.elements[element.name] = element;
    }

    hasElement(element) {
        return Object.values(this.elements).includes(element);
    }

    hasIndicator(name) {
        return Object.keys(this.elements).includes(name);
    }

    getIndicator(name) {
        if (!name) return null;

        return this.elements[name].getIndicator();
    }

    getStatus(name) {
        if (!name) return null;

        return this.elements[name].getStatus();
    }

    applyPrefs(prefs) {
        for (const key in this.elements) {
            this.elements[key].applyPrefs(prefs);
        }
    }

    insertIntoBox(box, position, prefs) {
        this.applyPrefs(prefs);

        const keys = prefs.order || Object.keys(this.elements);
        let added = 0;

        for (const key in keys) {
            const element = this.elements[keys[key]];

            if (element) {
                added += element.insertIntoBox(box, position + added, prefs);
            }
        }

        return added;
    }
}