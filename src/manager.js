const { St } = imports.gi;
const Main = imports.ui.main;
const PanelMenu = imports.ui.panelMenu;
const Me = imports.misc.extensionUtils.getCurrentExtension();

const { ButtonIndicator, IndicatorToStatus } = Me.imports.src.indicators.index;
const { IndicatorManager } = Me.imports.src.indicators.manager;

const LAYOUT_COMPATIBILITY = 'no-name-';
let compatibilityNumber = 0;

const BAR_PREFS = {
    left: [
        'aggregateMenu',
        'wm-bar',
    ],
    center: [
        'appMenu',
        'no-name-0',
    ],
    right: [
        'app-indicators',
        'lockkeys',
        'a11y',
        'de.ttll.GnomeScreenshot',
        'openweatherMenu',
        'dateMenu',
    ],
    menu: [
        'keyboard',
        'clipboardIndicator',
        'drive-menu',
        'printers',
        'a11y',
    ],
};


var BarManager = class {
    constructor() {
        this.indicatorManager = new IndicatorManager;
        this.defaultBar = {};

        this.boxes = {
            left: Main.panel._leftBox,
            center: Main.panel._centerBox,
            right: Main.panel._rightBox,
            menu: Main.panel.statusArea.aggregateMenu.menu.box,
            status: Main.panel.statusArea.aggregateMenu._indicators,
        }

        this.resolveDefaultBar();

        this.defaultAddToStatusArea = Main.panel.addToStatusArea;
        Main.panel.addToStatusArea = (role, indicator, position, box) => {
            this.defaultAddToStatusArea.bind(Main.panel)(role, indicator, position, box);
            this.indicatorManager.setIndicator(role, indicator);

            this.applyPrefs();
        };
     
        this.applyPrefs();
    }

    destroy() {
        Main.panel.addToStatusArea = this.defaultAddToStatusArea;

        this.setPanel(this.defaultBar);
    }

    resolveDefaultBar() {
        this.indicatorManager.resolveIndicators(this.boxes);

        for (const key in this.boxes) {
            const box = this.boxes[key];
            const children = box.get_children();
            this.defaultBar[key] = [];

            for (const position in children) {
                const child = children[position];

                const element = this.indicatorManager.resolveElement(child);
                const indicator = this.indicatorManager.findIndicator(element);
                if (!indicator) continue;

                this.defaultBar[key][position] = indicator.name;
            }
        } 
    }

    cleanBoxes() {
        this.indicatorManager.resolveIndicators(this.boxes);

        for (const key in this.boxes) {
            if (key === 'menu' || key === 'status') continue; // TODO: To handle.
            const box = this.boxes[key];

            box.remove_all_children();
        }
    }

    setPanel(prefs) {
        this.cleanBoxes();

        for (const key in this.boxes) {
            const box = this.boxes[key];
            const boxPrefs = prefs[key] || {};
            let position = 0;

            for (const subKey in boxPrefs) {
                const name = boxPrefs[subKey];
                const indicator = this.indicatorManager.getIndicator(name);
                if (!indicator) continue;
    
                indicator.applyPrefs();
                
                position += indicator.insertIntoBox(box, position);
            }
        }
    }

    applyPrefs() {
        this.setPanel(BAR_PREFS);
    }
};