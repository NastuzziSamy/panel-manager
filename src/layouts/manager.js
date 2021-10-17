const { St } = imports.gi;
const Main = imports.ui.main;
const Me = imports.misc.extensionUtils.getCurrentExtension();

const { LayoutHandler } = Me.imports.src.layouts.handler;
const { BaseManager } = Me.imports.src.base;
const { LAYOUT_NAME } = Me.imports.src.consts;


var LayoutManager = class extends BaseManager {
    _DEFAULT_NAME = LAYOUT_NAME
    _HANDLER_CLASS = LayoutHandler

    manage() {
        const children = Main.panel.get_children();

        for (const key in children) {
            const child = children[key];

            this.addElement(child);
        }

        // TODO: proxy add child on ui group.
    }

    validElement(element) {
        return element instanceof St.BoxLayout;
    }

    resolveElement(element) {
        return element;
    }
};