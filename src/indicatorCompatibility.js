const { St, GObject } = imports.gi;

const LAYOUT_COMPATIBILITY = {
    indicators: [],
    layouts: [],
};
global.b = LAYOUT_COMPATIBILITY;
var IndicatorCompatibility = GObject.registerClass(
    class IndicatorCompatibility extends St.BoxLayout {
        _init(indicator) {
            super._init();

            this.indicator = indicator;
            this.add_child(indicator);
        }
    }
);