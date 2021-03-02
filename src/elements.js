const { GObject, St } = imports.gi;

var LayoutSpace = GObject.registerClass(
    class LayoutSpace extends St.BoxLayout {
        _init(space) {
            super._init();

            this.width = space;
        }
    }
);