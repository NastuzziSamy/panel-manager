const { St } = imports.gi;
const Main = imports.ui.main;
const PanelMenu = imports.ui.panelMenu;
const PopupMenu = imports.ui.popupMenu;
const Me = imports.misc.extensionUtils.getCurrentExtension();

const { ButtonIndicator, IndicatorToStatus } = Me.imports.src.indicators.index;
const { IndicatorManager } = Me.imports.src.indicators.manager;
const { BoxManager } = Me.imports.src.boxes.manager;
const { ProxyMixin } = Me.imports.src.mixins;


const KNOWN_INDICATORS = [

];


const BAR_PREFS = {
    left: [
        {
            type: 'menu',
            name: 'menu-1',
            menuAlignement: 0,
            style: {
                'padding-left': '7px',
                'padding-right': '7px',
                'color': 'black',
                'background': 'rgba(228, 228, 228, 0.7)',
                'border-radius': '25px',
            },
            menuStyle: {
                'width': '350px',
                'color': 'black',
            },
        },
        {
            type: 'indicator',
            name: 'workspaces',
        },
        {
            type: 'space',
            space: 25,
        },
        {
            type: 'menu',
            name: 'menu-0',
            menuAlignement: 0,
            style: {
                'padding-left': '7px',
                'padding-right': '7px',
            },
            menuStyle: {
                'width': '350px',
            }
        },
    ],
    center: [
        {
            type: 'indicator',
            name: 'appMenu',
            style: {
                'max-width': '650px',
            },
        },
    ],
    right: [
        {
            type: 'indicator',
            name: 'app-indicators',
            order: ['Slack1', 'discord1'],
        },
        {
            type: 'space',
            space: 25,
        },
        {
            type: 'indicator',
            name: '/org/gnome/Shell/Extensions/GSConnect/Device/de6fe4af05943228',
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
            name: 'clipboardIndicator',
        },
        {
            type: 'space',
            space: 25,
        },
        {
            type: 'indicator',
            name: 'openweatherMenu',
        },
        {
            type: 'space',
            space: 15,
        },
        {
            type: 'indicator',
            name: 'NotificationCenter',
        },
        {
            type: 'indicator',
            name: 'dateMenu',
            style: {
                'padding-left': '7px',
                'padding-right': '7px',
                'font-size': '14px',
                'background': 'rgba(228, 228, 228, 0.7)',
                'color': 'black',
                'border-radius': '25px',
            },
        },
    ],
    'menu-0': [
        {
            type: 'separator',
            text: 'Connexions',
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
            text: 'Appareils',
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
    ],
    'menu-1': [
        {
            type: 'separator',
            text: 'Energie',
        },
        {
            type: 'indicator',
            name: 'brightness',
        },
        {
            type: 'indicator',
            name: 'power',
        },
        {
            type: 'separator',
        },
        {
            type: 'separator',
            text: 'Volume',
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
            text: 'Outils',
        },
        {
            type: 'indicator',
            name: 'keyboard',
            text: 'Langue',
            icon: 'format-text-bold',
            noStatus: true,
        },
        {
            type: 'indicator',
            name: 'lockkeys',
            text: 'Majuscules',
            icon: 'input-keyboard',
            noStatus: true,
            menuStyle: {
                'color': 'black',
            },
        },
        {
            type: 'indicator',
            name: 'a11y',
            text: 'Accessibilité',
            noStatus: true,
        },
        {
            type: 'separator',
        },
        {
            type: 'separator',
            text: 'Paramètres',
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

for (const key in BAR_PREFS) {
    const prefs = BAR_PREFS[key];

    for (const subKey in prefs) {
        const pref = prefs[subKey];

        if (pref.type === 'indicator') {
            KNOWN_INDICATORS.push(pref.name);
        }
    }
}


var BarManager = class {
    constructor() {
        this.indicatorManager = new IndicatorManager;
        this.boxManager = new BoxManager;
        this.defaultBar = {};

        this.resolveDefaultBar();

        this.applyProxy(Main.panel, 'addToStatusArea', (proxied, role, indicator, position, box) => {
            proxied(role, indicator, position, box);
            this.indicatorManager.setIndicator(role, indicator);

            this.applyPrefs(BAR_PREFS);
        });

        // Main.panel.statusArea.aggregateMenu._indicators.replace_child = (...args) => this.applyPrefs(BAR_PREFS);

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

        const handlers = this.boxManager.getHandlers();
        for (const key in handlers) {
            const handler = handlers[key];
            const handlerPrefs = prefs[key] || {};
            let position = 0;

            for (const subKey in handlerPrefs) {
                const params = handlerPrefs[subKey];

                position += this.handleBox(handler, { ...params, position });
            }
        }
    }

    handleBox(handler, { type, name, ...params }) {
        switch (type) {
            case 'indicator':
                return handler.addIndicator(this.indicatorManager.getIndicator(name), params);

            case 'menu':
                return handler.addMenu(this.boxManager.getMenu(name), params);

            case 'layout':
                return handler.addLayout(this.boxManager.getLayout(name), params);

            case 'space':
                return handler.addSpace(params);

            case 'separator':
                return handler.addSeparator(params);
        }
    }
};

Object.assign(BarManager.prototype, ProxyMixin);