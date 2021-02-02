const { St } = imports.gi;
const Main = imports.ui.main;
const PanelMenu = imports.ui.panelMenu;
const Me = imports.misc.extensionUtils.getCurrentExtension();

const helper = Me.imports.src.helper;
const { IndicatorCompatibility, MenuIndicator } = Me.imports.src.indicators;

const LAYOUT_COMPATIBILITY = 'no-name-';
let indicatorNumber = 0;

const PANEL_PREFS = {
    left: [
        'aggregateMenu',
        'wm-bar',
        'appindicator-:1.1554/org/ayatana/NotificationItem/Slack1',
        'appindicator-:1.1618/org/ayatana/NotificationItem/discord1',
        'appindicator-:1.123/org/ayatana/NotificationItem/software_update_available',
    ],
    center: [
        'appMenu',
        'no-name-0',
    ],
    right: [
        'lockkeys',
        'a11y',
        'clipboardIndicator',
        'de.ttll.GnomeScreenshot',
        'openweatherMenu',
        'dateMenu',
    ],
    menu: [
        {
            type: 'indicator',
            indicator: 'keyboard',
            text: 'Langue',
            icon: 'format-text-bold',
            position: 11,
        },
        {
            type: 'indicator',
            indicator: 'drive-menu',
            text: 'Disques connectés',
            position: 12,
        },
        {
            type: 'indicator',
            indicator: 'printers',
            text: 'Imprimantes',
            position: 12,
        },
        {
            type: 'indicator',
            indicator: 'a11y',
            text: 'Accessibilité',
            position: 10,
        },
    ],
};

const INDICATOR_PREFS = {
    'aggregateMenu': {
        menuAlignement: 1,
    },
    'DoNotDisturbRole': {
        menuAlignement: 0,
    },
}


var BarManager = class {
    constructor() {
        this.defaultAddToStatusArea = Main.panel.addToStatusArea;
        this.indicators = {};
        this.menuIndicators = {};
        this.defaultPanel = {};

        Main.panel.addToStatusArea = (...args) => {
            this.defaultAddToStatusArea.bind(Main.panel)(...args);

            this.applyPrefs();
        };

        this.boxes = {
            left: Main.panel._leftBox,
            center: Main.panel._centerBox,
            right: Main.panel._rightBox,
        }

        this.resolveDefaultPanel();
        this.applyPrefs();
    }

    destroy() {
        Main.panel.addToStatusArea = this.defaultAddToStatusArea;

        this.setPanel(this.defaultPanel);
    }

    resolveIndicators() {
        for (const key in Main.panel.statusArea) {
            if (!this.indicators[key]) {
                this.indicators[key] = Main.panel.statusArea[key];
            }
        }

        for (const key in this.boxes) {
            const box = this.boxes[key];
            const children = box.get_children();

            for (const subKey in children) {
                const child = children[subKey];
                let indicator = helper.findIndicator(child);
                if (!indicator) continue;

                this.setIndicator(indicator);
            }
        }
    }

    resolveDefaultPanel() {
        this.resolveIndicators();

        const indicatorsKeys = Object.keys(this.indicators);
        const indicatorsValues = Object.values(this.indicators);

        for (const key in this.boxes) {
            const box = this.boxes[key];
            const children = box.get_children();
            this.defaultPanel[key] = [];

            for (const position in children) {
                const child = children[position];

                box.remove_child(child);

                const indicator = helper.findIndicator(child);
                const index = indicatorsValues.indexOf(indicator);
                if (index === -1) continue;

                this.defaultPanel[key][position] = indicatorsKeys[index];
            }
        } 
    }

    getMenuIndicator(name) {
        return this.menuIndicators[name];
    }

    setMenuIndicator(name, indicator) {
        if (Object.values(this.menuIndicators).includes(indicator)) {
            return;
        }

        this.menuIndicators[name] = indicator;
    }

    getIndicator(name) {
        return this.indicators[name];
    }

    setIndicator(indicator) {
        if (Object.values(this.indicators).includes(indicator)) {
            return;
        }

        if (indicator instanceof IndicatorCompatibility) {
            const child = indicator.proxied;

            for (const key in this.indicators) {
                if (this.indicators[key] === child) {
                    this.indicators[key] = indicator;

                    return;
                }
            }
        }

        this.indicators[LAYOUT_COMPATIBILITY + (indicatorNumber++)] = indicator;
    }

    getIndicatorPrefs(name) {
        return INDICATOR_PREFS[name] || {};
    }

    cleanBoxes() {
        this.resolveIndicators();

        for (const key in this.boxes) {
            const box = this.boxes[key];

            box.remove_all_children();
        }
    }

    setIndicators(prefs) {
        for (const name in prefs) {
            const indicatorPrefs = prefs[name];
            const indicator = this.getIndicator(name);
            if (!indicator) continue;

            if (indicatorPrefs.menuAlignement !== undefined) {
                indicator.menu._arrowAlignment = indicatorPrefs.menuAlignement;
            }
        }
    }

    setPanel(prefs) {
        this.cleanBoxes();

        for (const key in this.boxes) {
            const box = this.boxes[key];

            for (const position in (prefs[key] || [])) {
                const name = prefs[key][position];
                const indicator = this.getIndicator(name);
                if (!indicator) continue;
    
                if (indicator instanceof PanelMenu.Button) {
                    Main.panel._addToPanelBox(name, indicator, position, box)
                } else if (indicator instanceof IndicatorCompatibility) {
                    box.insert_child_at_index(indicator.proxied, position);
                } else {
                    box.insert_child_at_index(indicator, position);
                }
            }
        }

        const aggregateMenu = this.getIndicator('aggregateMenu');

        for (const key in (prefs.menu || [])) {
            const data = prefs.menu[key];

            if (data.type === 'indicator') {
                const { text, icon, position, indicator: name } = data;
                if (this.getMenuIndicator(name)) continue;

                const indicator = this.getIndicator(name);
                if (!indicator) continue;
                
                const menuIndicator = new MenuIndicator(indicator, text, icon);
                this.setMenuIndicator(name, menuIndicator);

                aggregateMenu._indicators.add_child(menuIndicator);
                aggregateMenu.menu.addMenuItem(
                    menuIndicator.menu, position
                );
            }
        }
    }

    applyPrefs() {
        this.setIndicators(INDICATOR_PREFS);
        this.setPanel(PANEL_PREFS);
    }
};