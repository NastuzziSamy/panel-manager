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