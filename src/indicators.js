// -*- mode: js; js-indent-level: 4; indent-tabs-mode: nil -*-
/* exported Indicator */

const { GObject, Shell, St } = imports.gi;

const BoxPointer = imports.ui.boxpointer;
const SystemActions = imports.misc.systemActions;
const Main = imports.ui.main;
const PanelMenu = imports.ui.panelMenu;
const PopupMenu = imports.ui.popupMenu;

const LAYOUT_COMPATIBILITY = {
    indicators: [],
    layouts: [],
};


var IndicatorCompatibility = GObject.registerClass(
    class IndicatorCompatibility extends St.BoxLayout {
        _init(indicator) {
            super._init();

            this.indicator = indicator;
            this.add_child(indicator);
        }
    }
);


var SystemIndicator = GObject.registerClass(
class MenuIndicator extends PanelMenu.SystemIndicator {
    _init(indicator) {
        super._init();
        global.a = this;
        this.indicator = indicator;
        this.subMenu = new PopupMenu.PopupSubMenuMenuItem('Langue', true);
        this.subMenu.icon.icon_name = 'format-text-bold';

        const children = this.indicator.get_children();
        this.indicator.remove_all_children();
        for (const key in children) {
            this.subMenu.insert_child_below(children[key], this.subMenu._triangleBin);
        }

        this.proxyMenu();
        this.cloneMenuBox();

        this.menu.addMenuItem(this.subMenu);
    }

    destroy() {

    }

    cloneMenuBox() {        
        this.subMenu.menu.box.remove_all_children();

        const items = this.indicator.menu.box.get_children();
        this.indicator.menu.box.remove_all_children();

        for (const key in items) {
            const item = items[key];

            this.subMenu.menu.box.add_child(item);
        }
    }

    proxyMenu() {
        this.indicator.menu.box.add = (item, position) => {
            this.subMenu.menu.box.add_child(item, position);
        };

        this.indicator.menu.box.insert_child_below = (item, before) => {
            this.subMenu.menu.box.insert_child_below(item, before);
        }

        this.indicator.menu.addMenuItem = (item, position) => {
            this.subMenu.menu.addMenuItem(item, position);
        }

        // box.add_child = (item) => log('add_child');
        // box.remove = (item) => log('remove');
        // box.remove_child = (item) => log('remove_child');
        // box.remove_all_children = (item) => log('remove_all_children');
        // box.destroy = (item) => log('destroy');
        // box.destroy_all_children = (item) => log('destroy_all_children');
    }
});
