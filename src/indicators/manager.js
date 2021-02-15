const { St } = imports.gi;
const Main = imports.ui.main;
const PanelMenu = imports.ui.panelMenu;
const Me = imports.misc.extensionUtils.getCurrentExtension();

const { ButtonIndicator, IndicatorToStatus } = Me.imports.src.indicators.index;
const { IndicatorHandler, AppIndicatorHandler } = Me.imports.src.indicators.handler;

const INDICATOR_DEFAULT_NAME = 'no-name-';


var IndicatorManager = class {
    constructor() {
        this.resetIndicators();

        this.resolveIndicators();
    }

    resetIndicators() {
        this.indicators = {
            'app-indicators': new AppIndicatorHandler(),
        };

        this.compatibilityNumber = 0;
    }

    resolveElement(child) {
        if (child instanceof St.BoxLayout && !(child instanceof PanelMenu.SystemIndicator)) {
            if (this.hasElement(child)) {
                const indicator = this.findIndicator(child);

                if (indicator.elements.indicator) {
                    return indicator.elements.indicator;
                }

                if (indicator.elements.status) {
                    return indicator.elements.status;
                }
            }

            return new ButtonIndicator(child);
        }

        while (child) {
            if (child instanceof PanelMenu.SystemIndicator 
                || child instanceof PanelMenu.Button 
                || child instanceof St.BoxLayout) {
                return child;
            }
    
            child = child.get_child_at_index ? child.get_child_at_index(0) : null;
        }
    }

    resolveIndicators(boxes) {
        const menu = Main.panel.statusArea.aggregateMenu;
        const menuKeys = Object.keys(menu);
        for (const index in menuKeys) {
            const key = menuKeys[index];
            const [, name] = key.match(/^_([a-zA-Z]*)$/) || [];
            if (!name || name === 'delegate' || name === 'indicators') continue;

            const child = menu[key];
            let indicator = this.resolveElement(child);
            if (!indicator) continue;

            this.setIndicator(name, indicator);
        }
        
        for (const key in Main.panel.statusArea) {
            this.setIndicator(key, Main.panel.statusArea[key]);
        }

        for (const key in boxes) {
            if (key === 'menu') continue;

            const box = boxes[key];
            const children = box.get_children();

            for (const subKey in children) {
                const child = children[subKey];

                let indicator = this.resolveElement(child);
                if (!indicator) continue;
                
                this.addIndicator(indicator);
            }
        }
    }

    hasElement(element) {
        for (const key in this.indicators) {
            const indicator = this.indicators[key];

            if (indicator.hasElement(element)) {
                return true;
            }
        }

        return false;
    }

    findIndicator(element) {
        for (const key in this.indicators) {
            const indicator = this.indicators[key];

            if (indicator.hasElement(element)) {
                return indicator;
            }
        }
    }

    hasIndicator(name) {
        return Object.keys(this.indicators).includes(name);
    }

    getIndicator(name) {
        return this.indicators[name];
    }

    setIndicator(name, element) {
        if (this.hasElement(element)) return;

        if (this.hasIndicator(name)) {
            this.getIndicator(name).addElement(element);

            return;
        }

        this.indicators[name] = new IndicatorHandler(name);
        this.indicators[name].addElement(element);

        if (name.match(/^appindicator/)) {
            this.addAppIndicator(this.indicators[name]);
        }
    }

    addIndicator(element) {
        if (this.hasElement(element)) return;

        const name = INDICATOR_DEFAULT_NAME + (this.compatibilityNumber++);
        const indicator = new IndicatorHandler(name);
        indicator.addElement(element);

        this.indicators[name] = indicator;
    }

    addAppIndicator(element) {
        this.getIndicator('app-indicators').addElement(element);
    }
};