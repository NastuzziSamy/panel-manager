const { St } = imports.gi;
const Main = imports.ui.main;
const PanelMenu = imports.ui.panelMenu;
const PopupMenu = imports.ui.popupMenu;
const Me = imports.misc.extensionUtils.getCurrentExtension();

const { ButtonIndicator, IndicatorToStatus } = Me.imports.src.indicators.index;
const { IndicatorManager } = Me.imports.src.indicators.manager;
const { BoxManager } = Me.imports.src.boxes.manager;


const BAR_PREFS = {
    left: [
        'aggregateMenu',
        'wm-bar',
    ],
    center: [
        'appMenu',
        'indicator-0',
    ],
    right: [
        'app-indicators',
        'lockkeys',
        'a11y',
        'de.ttll.GnomeScreenshot',
        'openweatherMenu',
        'dateMenu',
        'menu',
    ],
    'aggregateMenu-menu': [
        '_separator:Luminosité',
        'brightness',
        '_separator',
        '_separator:Volume',
        'volume',
        '_separator',
        '_separator:Connexions',
        'network',
        'bluetooth',
        'location',
        'rfkill',
        '_separator',
        '_separator:Appareils',
        'drive-menu',
        'gsconnect',
        'remoteAccess',
        'printers',
        '_separator',
        '_separator:Outils',
        'clipboardIndicator',
        'keyboard',
        'a11y',
        '_separator',
        '_separator:Paramètres',
        'power',
        'nightLight',
        'system',
    ],
    'aggregateMenu-status': [
        // 'power',
        'gsconnect',
        'remoteAccess',
        'thunderbolt',
        'location',
        'nightLight',
        'network',
        'bluetooth',
        'rfkill',
        'volume',
    ],
    'menu-menu': [
        'power',
    ],
    'menu-stauts': [
        'power',
    ],
};


var BarManager = class {
    constructor() {
        this.indicatorManager = new IndicatorManager;
        this.boxManager = new BoxManager;
        this.defaultBar = {};

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
        const boxes = this.boxManager.getBoxes();
        this.indicatorManager.resolveIndicators(boxes);
        
        for (const key in boxes) {
            const box = boxes[key];
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
        this.indicatorManager.resolveIndicators(this.boxManager.menus, this.boxManager.getBoxes());
        this.boxManager.cleanBoxes();
    }

    setPanel(prefs) {        
        this.cleanBoxes();

        const boxes = this.boxManager.getBoxes();
        for (const key in boxes) {
            const box = boxes[key];
            const boxPrefs = prefs[key] || {};
            let position = 0;

            for (const subKey in boxPrefs) {
                const name = boxPrefs[subKey];

                if (name.startsWith('_')) {
                    const [_, type, args_list] = name.match(/^_([a-zA-Z_-]*):?(.*)$/)
                    const args = args_list.split(',')

                    if (type === 'separator') {
                        box.insert_child_at_index(new PopupMenu.PopupSeparatorMenuItem(args[0]), position++)
                    }

                    continue;
                }

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