const Me = imports.misc.extensionUtils.getCurrentExtension();


var settings = {
    debug: false,
};

var setSettings = (key, value) => {
    if (key === 'debug') {
        log('DEBUG ' + (value ? 'activated' : 'desactivated'));
    }

    settings[key] = value;
};


var formatLog = (text) => '[' + Me.metadata.uuid + '] ' + text;

var log = (text, ...args) => console.log(formatLog(text), ...args);

var warn = (text, ...args) => console.warn(formatLog(text), ...args);

var debug = (text, ...args) => {
    if (settings.debug) {
        log('DEBUG: ' + text, ...args);
    }
}


var getStyle = (element) => {
    if (!element.style) return {};

    const style = {};
    const styles = element.style.split(';').map((oneStyle) => oneStyle.trim().split(':'));

    for (const key in styles) {
        const [name, value] = styles[key];

        style[name.trim()] = value.trim();
    }

    return style;
};

var parseStyle = (style) => {
    const keys = Object.keys(style);

    return keys.map((key) => `${key}: ${style[key]}`).join('; ')
};

var addStyle = (element, key, value) => {
    const style = getStyle(element);

    style[key] = value;

    element.style = parseStyle(style);
};

var mergeStyle = (element, style) => {
    const mergedStyle = Object.assign(getStyle(element), style);

    element.style = parseStyle(mergedStyle);
}