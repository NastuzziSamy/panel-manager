const Main = imports.ui.main;
const Me = imports.misc.extensionUtils.getCurrentExtension();

const { LayoutHandler, MenuHandler } = Me.imports.src.boxes.handler;
const { AggregateMenu } = Me.imports.src.boxes.index;


var BoxManager = class {
    constructor() {
        this.setDefaultBoxes();
    }

    setDefaultBoxes() {
        this.layouts = {};
        this.menus = {};

        const boxes = {
            left: Main.panel._leftBox,
            center: Main.panel._centerBox,
            right: Main.panel._rightBox,
            aggregateMenu: Main.panel.statusArea.aggregateMenu,
        };

        for (const name in boxes) {
            this.setBox(name, boxes[name]);
        }
    }

    getLayout(name) {
        return this.layouts[name];
    }

    setLayout(name, layout) {
        this.layouts[name] = new LayoutHandler(name, layout);
    }

    getLayouts() {
        return this.layouts;
    }

    getMenu(name) {
        return this.menus[name];
    }

    setMenu(name, menu) {
        this.menus[name] = new MenuHandler(name, menu);
    }

    getMenus() {
        return this.menus;
    }

    getHandler(name) {
        return this.getHandlers()[name];
    }

    getHandlers() {
        return Object.assign({}, this.layouts, this.menus);
    }

    getBox(name) {
        return this.getBoxes()[name];
    }

    setBox(name, box) {
        if ((box === Main.panel.statusArea.aggregateMenu) || box instanceof AggregateMenu) {
            return this.setMenu(name, box);
        }

        return this.setLayout(name, box);
    }

    getBoxes() {
        const boxes = Object.assign({});

        for (const key in this.layouts) {
            Object.assign(boxes, this.layouts[key].getBoxes());
        }

        for (const key in this.menus) {
            Object.assign(boxes, this.menus[key].getBoxes());
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

    addToBox(box, { name, position, ...prefs }) {
        const handler = this.getHandler(name);
        if (!handler) return;

        handler.applyPrefs(prefs);
        Main.panel._addToPanelBox(name, handler.box, position, box);

        return 1;
    }
}