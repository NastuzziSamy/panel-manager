const Main = imports.ui.main;


const MENU_PREFS = [
    []
];


class BoxManager {
    constructor() {
        this.layouts = {
            left: Main.panel._leftBox,
            center: Main.panel._centerBox,
            right: Main.panel._rightBox,
        };
        
        this.menus = {
            aggregateMenu: Main.panel.statusArea.aggregateMenu,
        };
    }

    getLayout(name) {
        return this.layouts[name];
    }

    getMenu(name) {
        return this.menus[name];
    }

    getLayouts() {
        return this.layouts;
    }

    getMenus() {
        return this.menus;
    }

    getBoxes() {
        const boxes = Object.assign({}, this.layouts);

        for (const key in this.menus) {
            const menu = this.menus[key];

            boxes[key + '-menu'] = menu.menu.box;
            boxes[key + '-status'] = menu._indicators;
        }

        return boxes;
    }

    cleanBoxes() {
        const boxes = this.getBoxes();

        for (const key in boxes) {
            const box = boxes[key];

            box.remove_all_children();
        }
    }

    addLayoutToBox(box, { name, position, ...prefs}) {
        const layout = this.getLayout(name);
        if (!layout) return;

        // layout.applyPrefs(prefs);
        box.insert_child_at_index(layout, position);
     
        return 1;
    }

    addMenuToBox(box, { name, position, ...prefs}) {
        global.a = box;
        const menu = this.getMenu(name);
        global.b = menu;
        if (!menu) return;

        // menu.applyPrefs(prefs);
        Main.panel._addToPanelBox(name, menu, position, box);
        return 1;
    }
}