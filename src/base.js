const { St } = imports.gi;


var BaseHandler = class {
    constructor(name) {
        this.name = name;

        this.element = null;
    }

    handle() {
        throw new Error('handle not defined');
    }

    addElement(element) {
        this.element = element;
    }

    hasElement(element) {
        if (! element) return false;

        return element === this.element;
    }

    getElement() {
        return this.element;
    }

    prepareForConfig(config) {
        const element = this.getElement();
        const parent = element.get_parent();

        if (parent) {
            if (parent instanceof St.Bin && parent.get_parent()) {
                parent.get_parent().remove_child(parent);
            }

            parent.remove_child(element);
        }
        // const children = this.element.get_children();

        // for (const key in children) {
        //     this.element.remove_child(children[key]);
        // }
    }

    updateConfig(config) {
        throw new Error('updateConfig not defined');
    }

    addHandler(handler) {
        throw new Error('addHandler not defined');
    }
};


var BaseManager = class {
    constructor() {
        this.reset();
    }

    manage() {
        throw new Error('manage not defined');
    }

    destroy() {
        this.restoreConfig();
    }

    reset() {
        this.handlers = {}
    }

    hasName(name) {
        return !! this.handlers[name];
    }

    validElement(element) {
        throw new Error('validElement not defined');
    }

    hasElement(element) {
        for (const key in this.handlers) {
            const handler = this.handlers[key];

            if (handler.hasElement(element)) {
                return true;
            }
        }

        return false;
    }

    addElement(name, element=null) {
        if (! element) {
            [element, name] = [name, null];
        }

        element = this.resolveElement(element);
        if (! element || this.hasElement(element) || ! this.validElement(element)) return false;

        name = this.checkName(name || this.resolveName(element));

        const result = this.setElement(name, element);

        if (result === false) return false;
    }

    setElement(name, element) {
        if (! this.validElement(element)) return false;

        const handler = new (this.resolveHandler(name, element))(name);
        handler.addElement(element);

        return this.addHandler(handler);
    }

    checkName(name) {
        if (this.handlers[name]) {
            let counter = 0;

            while (this.handlers[name + '-' + counter]) {
                counter++;
            }

            return name + '-' + counter;
        }

        return name;
    }

    resolveName(element) {
        const [, className] = element.toString().match(/\[\S* ([a-zA-Z0-9-_]*):? ?.*\]/);

        if (! className) {
            warn('Element is not a clutter actor');

            return null;
        }

        return (element.name || this._DEFAULT_NAME) + '-' + className;
    }

    resolveElement(element) {
        throw new Error('resolveElement not defined');
    }

    validHandler(handler) {
        return handler instanceof this._HANDLER_CLASS;
    }

    hasHandler(handler) {
        for (const key in this.handlers) {
            const possibleHandler = this.handlers[key];

            if (possibleHandler === handler) {
                return true;
            }
        }

        return false;
    }

    addHandler(handler) {
        if (this.hasHandler(handler) || this.hasName(handler.name)) return false;

        return this.setHandler(handler);
    }

    setHandler(handler) {
        if (! this.validHandler(handler)) return false;

        this.handlers[handler.name] = handler;
        handler.handle();

        global.managers.panel.update();
    }

    getHandler(name) {
        return this.handlers[name];
    }

    resolveHandler(name, element) {
        return this._HANDLER_CLASS;
    }

    prepareForConfig(config) {
        for (const key in this.handlers) {
            this.getHandler(key).prepareForConfig(config[key] || {});
        }
    }

    updateConfig(config) {
        for (const key in config) {
            const handler = this.getHandler(key);

            if (handler) {
                handler.updateConfig(config[key]);
            }
        }
    }

    restoreConfig() {
        for (const key in this.handlers) {
            this.handlers[key].restoreConfig();
        }
    }
};