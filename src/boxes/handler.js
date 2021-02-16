const { St } = imports.gi;
const Main = imports.ui.main;
const PanelMenu = imports.ui.panelMenu;
const PopupMenu = imports.ui.popupMenu;
const Me = imports.misc.extensionUtils.getCurrentExtension();

const { ButtonIndicator } = Me.imports.src.indicators.index;


var BoxHandler = class {
    constructor(name, box) {
        this.name = name;
        this.box = box;
    }

    getBox() {
        return this.box;
    }

    applyPrefs(prefs) {
        throw 'Not implemented';
    }

    addIndicator(indicator, { position, ...prefs }={}) {
        throw 'Not implemented';
    }
    
    addLayout(layout, { position, ...prefs }={}) {
        throw 'Not implemented';
    }

    addMenu(menu, { position, ...prefs }={}) {
        throw 'Not implemented';
    }

    addSpace(params={}) {
        throw 'Not implemented';
    }

    addSeparator(params={}) {
        throw 'Not implemented';
    }
}


var LayoutHandler = class extends BoxHandler {
    getBoxes() {
        return [this.box];
    }

    addIndicator(indicator, { position, ...prefs }={}) {
        if (!indicator) return 0;
        indicator.applyPrefs(prefs);

        const box = this.getBox();
        const element = indicator.getIndicator();
        if (!element) return 0;

        if (element instanceof PanelMenu.Button) {
            if (element.container.get_children().length === 0) {
                box.add_child(element);
            } else {
                Main.panel._addToPanelBox(indicator.name, element, position, box);
            }
        } else if (element instanceof ButtonIndicator) {
            box.insert_child_at_index(element.proxied, position);
        } else {
            return 0;
        }

        return 1;
    }
    
    addLayout(layout, { position, ...prefs }={}) {
        if (!layout) return 0;
        layout.applyPrefs(prefs);

        const box = this.getBox();
        const element = layout.box;
        if (!element) return 0;

        box.insert_child_at_index(element, position);
     
        return 1;
    }
    
    addMenu(menu, { position, ...prefs }={}) {
        if (!menu) return 0; 
        menu.applyPrefs(prefs);

        const box = this.getBox();
        const element = menu.box;
        if (!element) return 0;

        Main.panel._addToPanelBox(menu.name, element, position, box);
     
        return 1;
    }

    addSpace(params={}) {
        // TODO: In a future add a space.
        return 0;
    }

    addSeparator() {
        // TODO: In a future add a vertical bar.
        return 0;
    }
};


var MenuHandler = class extends BoxHandler {
    getIndicatorBox() {
        return this.box;
    }
    
    getBoxes() {
        return [
            this.box.menu.box,
            this.box._indicators,
        ];
    }

    applyPrefs(prefs) {
        if (prefs.menuAlignement !== undefined) {
            this.box.menu.setSourceAlignment(prefs.menuAlignement);
        }

        if (prefs.width !== undefined) {
            this.box.menu.box.width = prefs.width;
        }
    }

    addIndicator(indicator, { position, ...prefs }={}) {
        if (!indicator) return 0;
        indicator.applyPrefs(prefs);

        const box = this.getBox();
        const element = indicator.getStatus();
        if (!element) return 0;

        box._indicators.insert_child_at_index(element, position);
        box.menu.addMenuItem(element.menu, position);

        return 1;
    }

    addLayout() {
        return 0;
    }
    
    addMenu() {
        return 0;
    }

    addSpace(params={}) {
        // TODO: In a future add a space.
        return 0;
    }

    addSeparator({ text, position }={}) {
        this.getBox().menu.box.insert_child_at_index(new PopupMenu.PopupSeparatorMenuItem(text), position);

        return 1;
    }
};