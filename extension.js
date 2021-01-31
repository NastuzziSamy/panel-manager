const Me = imports.misc.extensionUtils.getCurrentExtension();
const Main = imports.ui.main;

const { Extension } = Me.imports.src.main;

function init() {
	return new Extension();
}

