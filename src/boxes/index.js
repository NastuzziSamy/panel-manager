const { St, GObject } = imports.gi;
const { AggregateLayout } = imports.ui.panel;
const PanelMenu = imports.ui.panelMenu;


var AggregateMenu = GObject.registerClass(
    class AggregateMenu extends PanelMenu.Button {
        _init(name) {
            super._init(0.5, name, false);
            this.menu.actor.add_style_class_name('aggregate-menu');
            this.menu.actor.add_style_class_name(name);
    
            let menuLayout = new AggregateLayout();
            this.menu.box.set_layout_manager(menuLayout);
    
            this._indicators = new St.BoxLayout({ style_class: 'panel-status-indicators-box' });
            this.add_child(this._indicators);
        }
    }
);