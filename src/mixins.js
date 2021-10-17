const { Meta, Shell } = imports.gi;
const Main = imports.ui.main;
const Me = imports.misc.extensionUtils.getCurrentExtension();

const { warn } = Me.imports.src.helper;


var SignalMixin = {
    _signals: [],

    connectSignal(element, signal, callback) {
        const id = element.connect(signal, callback);

        this._signals.push([element, id]);

        return id;
    },

    _disconnectSignal(element, id) {
        try {
            element.disconnect(id);
        } catch (_) {
            warn(`Cannot disconnect signal ${id}`);
        }
    },

    disconnectSignal(signalId) {
        for (const key in this._signals) {
            const [element, id] = this._signals[key];

            if (id === signalId) {
                this._signals.splice(key, 1);

                return this._disconnectSignal(element, id);
            }
        }

        warn(`Cannot find and disconnect signal ${signalId}`);
    },

    disconnectSignals() {
        for (const key in this._signals) {
            const [element, id] = this._signals[key];

            this._disconnectSignal(element, id);
        }

        this._signals = [];
    },
};


var ProxyMixin = {
    _proxies: [],

    setProxy(element, method, proxy) {
        if (element._proxied === undefined) {
            element._proxied = {};
        }

        const proxied = element[method].bind(element);
        element._proxied[method] = proxied;

        if (typeof proxy == 'function') {
            const callback = proxy;

            proxy = (...args) => {
                return callback(proxied, ...args);
            };
        }

        this._proxies.push([element, method, element[method], proxy]);

        element[method] = proxy;
    },

    applyProxy(element, method, proxy) {
        if (element._proxied && element._proxied[method]) {
            warn('Element is already proxied for method ' + method);

            return;
        }

        this.setProxy(element, method, proxy);
    },

    _restoreProxy(element, method, callback, proxy) {
        if (element[method] === proxy) {
            element[method] = callback;
        }

        element._proxied[method] = undefined;

        if (Object.keys(element._proxied).length == 0) {
            element._proxied = undefined;
        }
    },

    restoreProxy(proxiedElement, proxiedMethod) {
        for (const key in this._proxies) {
            const [element, method, callback, proxy] = this._proxies[key];

            if (element === proxiedElement && method === proxiedMethod) {
                return this._restoreProxy(element, method, callback, proxy);
            }
        }

        warn(`Cannot find proxied element for method ${proxiedMethod}`);
    },

    restoreProxies() {
        for (const key in this._proxies) {
            const [element, method, callback, proxy] = this._proxies[key];

            this._restoreProxy(element, method, callback, proxy);
        }

        this._proxies = [];
    }
};