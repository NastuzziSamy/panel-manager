const Me = imports.misc.extensionUtils.getCurrentExtension();
const Main = imports.ui.main;

const { Extension } = Me.imports.src.main;

function init() {
	if (global.managers === undefined) {
		global.managers = {};
	}
	
	return new Extension();
}

