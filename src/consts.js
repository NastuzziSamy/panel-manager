var PANEL_SCHEMA_KEY = 'panel';

var SCHEMAS = {
    [PANEL_SCHEMA_KEY]: 'org.gnome.shell.extensions.managers.panel',
};


var KNOWN_INDICATORS = [
    //
];


var PANEL_PREFS = {
    left: [
        // {
        //     type: 'indicator',
        //     name: 'dwellClick', // marche pas
        // },
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
        // {
            // type: 'indicator',
            // name: 'app-indicators',
            // order: ['Slack1', 'Guake', 'blueman', 'software_update_available'],
        // },
        {
            type: 'indicator',
            name: 'Guake',
        },
        {
            type: 'indicator',
            name: 'Slack1',
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
            name: 'software_update_available',
        },
        {
            type: 'indicator',
            name: 'blueman',
        },
        {
            type: 'space',
            space: 25,
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
                'font-size': '15px',
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
            type: 'indicator',
            name: 'systemdManager',
            text: 'Services',
            noStatus: true,
        },
        {
            type: 'indicator',
            name: 'thunderbolt',
            text: 'Thunderbolt',
            noStatus: true,
        },
        {
            type: 'indicator',
            name: 'color-picker@tuberry',
            text: 'Sélectionner une couleur',
            noStatus: true,
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
                'font-size': '15px',
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