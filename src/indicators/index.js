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


var ButtonIndicator = GObject.registerClass(
    class ButtonIndicator extends St.BoxLayout {
        _init(indicator) {
            super._init();

            this.proxied = indicator;
            this.add_child(indicator);
        }
    }
);

var IndicatorToStatus = GObject.registerClass(
class IndicatorToStatus extends PanelMenu.SystemIndicator {
    _init(indicator, text, icon) {
        super._init();

        this.proxied = indicator;
        this.subMenu = new PopupMenu.PopupSubMenuMenuItem(text, true);
        
        if (icon) {
            this.subMenu.icon.icon_name = icon;
        }

        this.setSignals();
        this.insertPanelLayout();
        this.proxyMenu();
        this.cloneMenuBox();

        this.menu.addMenuItem(this.subMenu);
    }

    destroy() {
        this.proxied.disconnect(this.hideSignal);
        this.proxied.disconnect(this.showSignal);
    }

    setSignals() {
        this.hideSignal = this.proxied.connect('hide', () => this.hide());
        this.showSignal = this.proxied.connect('show', () => this.show());
    }

    hide() {
        this.subMenu._setOpenState(false);
        this.subMenu.hide();
    }

    show() {
        this.subMenu.show();
    }

    insertPanelLayout() {
        const children = this.proxied.get_children();
        this.proxied.remove_all_children();

        if (children.length === 1 && children[0] instanceof St.BoxLayout) {
            const subChildren = children[0].get_children().filter(child => child.style_class !== 'popup-menu-arrow');

            if (subChildren[0] instanceof St.Icon) {
                if (!this.subMenu.icon.icon_name) {
                    this.subMenu.icon.icon_name = subChildren[0].icon_name;

                    subChildren[0].bind_property('icon_name', this.subMenu.icon, 'icon_name', 0);
                }

                if (subChildren.length === 1) {
                    return;
                }

                subChildren[0].visible = false;
            }
        }

        for (const key in children) {
            const child = children[key];
            
            if (child instanceof St.BoxLayout) {
                const arrowChild = child.get_last_child();

                if (arrowChild.style_class === 'popup-menu-arrow') {
                    arrowChild.visible = false;
                }
            }

            this.subMenu.insert_child_below(child, this.subMenu._triangleBin);
        }
    }

    cloneMenuBox() {        
        this.subMenu.menu.box.remove_all_children();

        const items = this.proxied.menu.box.get_children();
        this.proxied.menu.box.remove_all_children();

        for (const key in items) {
            const item = items[key];

            this.subMenu.menu.box.add_child(item);
        }
    }

    proxyMenu() {
        this.proxied.menu.box.add = (item, position) => {
            this.subMenu.menu.box.add_child(item, position);
        };

        this.proxied.menu.box.insert_child_below = (item, before) => {
            this.subMenu.menu.box.insert_child_below(item, before);
        };

        // this.proxied.menu.box.remove_all_children = () => {
        //     this.subMenu.menu.box.remove_all_children();
        // };

        this.proxied.menu.addMenuItem = (item, position) => {
            this.subMenu.menu.addMenuItem(item, position);
        };

        // this.proxied.menu.box.add_child = (item, position) => log('add_child');
        // this.proxied.menu.box.remove = (item) => log('remove');
        // this.proxied.menu.box.remove_child = (item) => log('remove_child');
        // this.proxied.menu.box.destroy = (item) => log('destroy');
        // this.proxied.menu.box.destroy_all_children = (item) => log('destroy_all_children');
    }
});
