const { St } = imports.gi;
const Main = imports.ui.main;
const PanelMenu = imports.ui.panelMenu;
const Me = imports.misc.extensionUtils.getCurrentExtension();

const { LAYOUT_COMPATIBILITY, IndicatorCompatibility } = Me.imports.src.indicators;


const findIndicator = (child) => {
    if (child instanceof PanelMenu.Button) {
        let index = LAYOUT_COMPATIBILITY.indicators.indexOf(child);
        
        if (index === -1) {
            LAYOUT_COMPATIBILITY.indicators.push(child);
            index = LAYOUT_COMPATIBILITY.indicators.indexOf(child);

            LAYOUT_COMPATIBILITY.layouts[index] = new IndicatorCompatibility(child);
        }

        return LAYOUT_COMPATIBILITY.layouts[index];
    }

    while (child) {
        if (child instanceof PanelMenu.Button || child instanceof St.BoxLayout) {
            return child;
        }

        child = child.get_children()[0];
    }
};