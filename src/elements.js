const { GObject, St } = imports.gi;
const Me = imports.misc.extensionUtils.getCurrentExtension();

const Helper = Me.imports.src.helper;


var LayoutSpace = GObject.registerClass(
    class LayoutSpace extends St.BoxLayout {
        _init(space) {
            super._init();

            this.width = space;
        }

        applyPrefs({ style }) {
            if (style !== undefined && this.elements.indicator) {
                Helper.mergeStyle(this.elements.indicator.first_child, style);
            }
        }
    }
);