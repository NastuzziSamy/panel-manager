const { GObject, Shell, St } = imports.gi;

const BoxPointer = imports.ui.boxpointer;
const SystemActions = imports.misc.systemActions;
const Main = imports.ui.main;
const PanelMenu = imports.ui.panelMenu;
const Panel = imports.ui.panel;
const PopupMenu = imports.ui.popupMenu;
const Me = imports.misc.extensionUtils.getCurrentExtension();

const { SignalMixin, ProxyMixin } = Me.imports.src.mixins;
const Helper = Me.imports.src.helper;


var ButtonIndicator = GObject.registerClass(
    class ButtonIndicator extends St.BoxLayout {
        _init(indicator) {
            super._init();

            this.proxied = indicator;
            this.add_child(indicator);
        }
    }
);


var SpaceIndicator = GObject.registerClass(
    class SpaceIndicator extends St.BoxLayout {
    }
);


var SeparatorIndicator = GObject.registerClass(
    class SeparatorIndicator extends PopupMenu.PopupSeparatorMenuItem {
        constructor(name) {
            super(name);

            this.setText(' ');
        }

        setText(text) {
            this.label.text = text;
        }
    }
);


var MenuIndicator = GObject.registerClass(
    class MenuIndicator extends PanelMenu.Button {
        _init(name) {
            super._init(0.0, name, false);
            this.menu.actor.add_style_class_name('aggregate-menu');
            this.menu.actor.add_style_class_name(name);

            let menuLayout = new Panel.AggregateLayout();
            this.menu.box.set_layout_manager(menuLayout);

            this._indicators = new St.BoxLayout({ style_class: 'panel-status-indicators-box' });
            this.add_child(this._indicators);
        }
    }
);


var ToStatusIndicator = GObject.registerClass(
class ToStatusIndicator extends PanelMenu.SystemIndicator {
    _init(name, indicator) {
        super._init();

        this.proxied = indicator;
        this.subMenu = new PopupMenu.PopupSubMenuMenuItem(name, true);

        this.iconIndicator = this._addIndicator();
        this.iconIndicator.add_style_class_name('system-status-icon');
        this.iconIndicator.hide();

        this.isShown = true;
        this.noStatus = false;

        this.connectSignals();
        this.prepareForLayout();
        this.cloneMenuBox();
        this.proxyMenu();

        this.menu.addMenuItem(this.subMenu);
    }

    destroy() {
        this.disconnectSignals();
        this.restoreProxies();

        super.destroy();
    }

    connectSignals() {
        this.signals = [];

        this.connectSignal(this.proxied, 'hide', () => this.hide());
        this.connectSignal(this.proxied, 'show', () => this.show());
    }

    hide() {
        this.isShown = false;
        this.subMenu._setOpenState(false);
        this.iconIndicator.hide();
        this.subMenu.hide();
    }

    show() {
        this.isShown = true;

        if (!this.noStatus) {
            this.iconIndicator.show();
        }

        this.subMenu.show();
    }

    setText(text) {
        this.subMenu.label.text = text;
    }

    setIcon(icon) {
        if (! icon && this._defaultIconChild) {
            icon = this._defaultIconChild.icon_name;
        }

        if (! icon) return;

        this.subMenu.icon.icon_name = icon;
        this.iconIndicator.icon_name = icon;
    }

    hideStatus(hide) {
        this.noStatus = hide;

        if (this.noStatus) {
            this.iconIndicator.hide();
        } else if (this.isShown) {
            this.iconIndicator.show();
        }
    }

    prepareForLayout() {
        const children = this.proxied.get_children();
        this.proxied.remove_all_children();

        const connectIcons = (icon) => {
            this._defaultIconChild;

            if (!this.subMenu.icon.icon_name) {
                this.setIcon(icon.icon_name);

                icon.bind_property('icon_name', this.subMenu.icon, 'icon_name', 0);
                icon.bind_property('icon_name', this.iconIndicator, 'icon_name', 0);
            }

            icon.visible = false;
        };

        if (children.length === 1) {
            if (children[0] instanceof St.BoxLayout) {
                const subChildren = children[0].get_children().filter(elem => elem.style_class !== 'popup-menu-arrow');
                let child = subChildren[0];
                let onlyOneChild = subChildren.length === 1;

                if (children[0].first_child === children[0].last_child) {
                    child = children[0].first_child;
                    onlyOneChild = true;
                }

                if (child instanceof St.Icon) {
                    connectIcons(child);

                    if (onlyOneChild) {
                        child.visible = true;

                        return;
                    }
                }
            }

            else if (children[0] instanceof St.Icon) {
                return connectIcons(children[0]);
            }
        }

        for (const key in children) {
            const child = children[key];

            if (child instanceof St.BoxLayout) {
                const subChildren = child.get_children();

                for (const subKey in subChildren) {
                    const subChild = subChildren[subKey];

                    if (subChild instanceof St.Icon) {
                        if (subChild.style_class === 'popup-menu-arrow') {
                            subChild.visible = false;
                        } else {

                            // subChild.icon_size = this.subMenu.icon.width;
                            subChild.icon_size = 16;

                            this.subMenu.icon.bind_property('width', subChild, 'icon_size', 0);
                        }
                    }
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
        this.applyProxy(this.proxied.menu, 'addMenuItem', (_, item, position) => {
            this.subMenu.menu.addMenuItem(item, position);
        });
        this.applyProxy(this.proxied.menu, 'removeAll', (callback) => {
            this.subMenu.menu.box.remove_all_children();

            callback();
        });

        this.applyProxy(this.proxied.menu.box, 'add', (_, item, position) => {
            this.subMenu.menu.box.add_child(item, position);
        });
        this.applyProxy(this.proxied.menu.box, 'add_child', (_, item, position) => {
            this.subMenu.menu.box.add_child(item, position);
        });
        this.applyProxy(this.proxied.menu.box, 'insert_child_below', (_, item, before) => {
            this.subMenu.menu.box.insert_child_below(item, before);
        });

        this.applyProxy(this.proxied.menu.box, 'remove_child', (_, item) => {
            this.subMenu.menu.box.remove(item);
        });
        this.applyProxy(this.proxied.menu.box, 'remove_all_children', () => {
            this.subMenu.menu.box.remove_all_children();
        });

        this.applyProxy(this.proxied.menu.box, 'destroy_all_children', (callback) => {
            this.subMenu.menu.box.destroy_all_children();

            callback();
        });
    }
});

Object.assign(ToStatusIndicator.prototype, SignalMixin, ProxyMixin);