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


const PANEL_PREFS = {
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
            style: {
                'font-size': '16px',
            },
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
            optionsStyle: {
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

for (const key in PANEL_PREFS) {
    const prefs = PANEL_PREFS[key];

    for (const subKey in prefs) {
        const pref = prefs[subKey];

        if (pref.type === 'indicator') {
            KNOWN_INDICATORS.push(pref.name);
        }
    }
}


var PanelManager = class {
    constructor() {
        this.indicatorManager = new IndicatorManager;
        this.boxManager = new BoxManager;
        this.defaultPanel = {};

        this.resolveDefaultPanel();

        this.applyProxy(Main.panel, 'addToStatusArea', (proxied, role, indicator, position, box) => {
            proxied(role, indicator, position, box);
            this.indicatorManager.setIndicator(role, indicator);

            this.applyPrefs(PANEL_PREFS);
        });

        this.applyProxy(Main.panel.statusArea.aggregateMenu._indicators, 'replace_child', (proxied, old_child, new_child) => {
            proxied(old_child, new_child);

            const indicator = this.indicatorManager.findIndicator(old_child);
            if (!indicator) return;

            indicator.addElement(new_child);
            Main.panel.statusArea.aggregateMenu[`_${indicator.name}`] = new_child;

            this.applyPrefs(PANEL_PREFS);
        });

        // Executing it twice resolve some bugs ??.
        this.applyPrefs(PANEL_PREFS);
        this.applyPrefs(PANEL_PREFS);
    }

    destroy() {
        this.applyPrefs(this.defaultPanel);

        this.restoreProxies();
    }

    resolveDefaultPanel() {
        const boxes = this.boxManager.getBoxes();
        this.indicatorManager.resolveIndicators(this.boxManager.getMenus(), boxes);

        for (const key in boxes) {
            const box = boxes[key];
            const children = box.get_children();
            this.defaultPanel[key] = [];

            for (const position in children) {
                const child = children[position];

                const element = this.indicatorManager.resolveElement(child);
                const indicator = this.indicatorManager.findIndicator(element);
                if (!indicator) continue;

                this.defaultPanel[key][position] = indicator.name;
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

Object.assign(PanelManager.prototype, ProxyMixin);