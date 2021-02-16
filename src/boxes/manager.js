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
}