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
        {
            type: 'box',
            name: 'aggregateMenu',
            menuAlignement: 1,
        },
        {
            type: 'indicator',
            name: 'wm-bar',
        },
    ],
    center: [
        {
            type: 'indicator',
            name: 'appMenu',
        },
        {
            type: 'indicator',
            name: 'indicator-0',
        },
    ],
    right: [
        {
            type: 'indicator',
            name: 'app-indicators',
            order: ['Slack1', 'discord1'],
        },
        {
            type: 'indicator',
            name: 'lockkeys',
        },
        {
            type: 'indicator',
            name: 'a11y',
        },
        {
            type: 'indicator',
            name: 'de.ttll.GnomeScreenshot',
        },
        {
            type: 'indicator',
            name: 'openweatherMenu',
        },
        {
            type: 'indicator',
            name: 'dateMenu',
        },
    ],
    'aggregateMenu-menu': [
        {
            type: 'separator',
            'text': 'Luminosité',
        },
        {
            type: 'indicator',
            name: 'brightness',
        },
        {
            type: 'separator',
        },
        {
            type: 'separator',
            'text': 'Volume',
        },
        {
            type: 'indicator',
            name: 'volume',
        },
        {
            type: 'separator',
        },
        {
            type: 'separator',
            'text': 'Connexions',
        },
        {
            type: 'indicator',
            name: 'network',
        },
        {
            type: 'indicator',
            name: 'bluetooth',
        },
        {
            type: 'indicator',
            name: 'location',
        },
        {
            type: 'indicator',
            name: 'rfkill',
        },
        {
            type: 'separator',
        },
        {
            type: 'separator',
            'text': 'Appareils',
        },
        {
            type: 'indicator',
            name: 'drive-menu',
            text: 'Disques connectés',
        },
        {
            type: 'indicator',
            name: 'gsconnect',
        },
        {
            type: 'indicator',
            name: 'remoteAccess',
        },
        {
            type: 'indicator',
            name: 'printers',
            text: 'Imprimantes',
        },
        {
            type: 'separator',
        },
        {
            type: 'separator',
            'text': 'Outils',
        },
        {
            type: 'indicator',
            name: 'clipboardIndicator',
        },
        {
            type: 'indicator',
            name: 'keyboard',
            text: 'Langue',
            icon: 'format-text-bold',
        },
        {
            type: 'indicator',
            name: 'a11y',
            text: 'Accessibilité',
        },
        {
            type: 'separator',
        },
        {
            type: 'separator',
            'text': 'Paramètres',
        },
        {
            type: 'indicator',
            name: 'power',
        },
        {
            type: 'indicator',
            name: 'nightLight',
        },
        {
            type: 'indicator',
            name: 'system',
        },
    ],
    'aggregateMenu-status': [
        {
            type: 'indicator',
            name: 'brightness',
        },
        {
            type: 'indicator',
            name: 'volume',
        },
        {
            type: 'indicator',
            name: 'network',
        },
        {
            type: 'indicator',
            name: 'bluetooth',
        },
        {
            type: 'indicator',
            name: 'location',
        },
        {
            type: 'indicator',
            name: 'rfkill',
        },
        {
            type: 'indicator',
            name: 'drive-menu',
        },
        {
            type: 'indicator',
            name: 'gsconnect',
        },
        {
            type: 'indicator',
            name: 'remoteAccess',
        },
        {
            type: 'indicator',
            name: 'printers',
        },
        {
            type: 'indicator',
            name: 'clipboardIndicator',
            text: 'Clipboard',
        },
        {
            type: 'indicator',
            name: 'keyboard',
        },
        {
            type: 'indicator',
            name: 'a11y',
        },
        {
            type: 'indicator',
            name: 'power',
        },
        {
            type: 'indicator',
            name: 'nightLight',
        },
        {
            type: 'indicator',
            name: 'system',
        },
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

            this.applyPrefs(BAR_PREFS);
        };
     
        this.applyPrefs(BAR_PREFS);
    }

    destroy() {
        Main.panel.addToStatusArea = this.defaultAddToStatusArea;

        this.applyPrefs(this.defaultBar);
    }

    resolveDefaultBar() {
        const boxes = this.boxManager.getBoxes();
        this.indicatorManager.resolveIndicators(this.boxManager.getMenus(), boxes);
        
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
        this.indicatorManager.resolveIndicators(this.boxManager.getMenus(), this.boxManager.getBoxes());
        this.boxManager.cleanBoxes();
    }

    applyPrefs(prefs) {
        this.cleanBoxes();

        const boxes = this.boxManager.getBoxes();
        for (const key in boxes) {
            const box = boxes[key];
            const boxPrefs = prefs[key] || {};
            let position = 0;

            for (const subKey in boxPrefs) {
                const params = boxPrefs[subKey];

                position += this.handleBox(box, { ...params, position });                
            }
        }
    }

    handleBox(box, { type, ...params }) {
        switch (type) {
            case 'indicator':
                return this.indicatorManager.addToBox(box, params);

            case 'box':
                return this.boxManager.addToBox(box, params);

            case 'separator':
                box.insert_child_at_index(new PopupMenu.PopupSeparatorMenuItem(params.text), params.position);

                return 1;
        }
    }
};