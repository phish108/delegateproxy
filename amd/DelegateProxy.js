define("DelegateProxy", [], function() {
    function Janus(defaultValue) {
        const retval = function() {
            return defaultValue;
        };
        retval.toString = function() {
            return defaultValue;
        };
        return retval;
    }
    return function DelegateProxy(operator, delegate) {
        const fallbackFunc = Janus("");
        if (typeof operator === "function") {
            operator = new operator();
        }
        if (typeof delegate === "function") {
            delegate = new delegate();
        }
        const proxy = {};
        return new Proxy(operator, {
            construct: function(o, args, p) {
                return p;
            },
            set: function(o, p, v) {
                if (!(p in o)) {
                    delegate[p] = v;
                    return true;
                }
                return false;
            },
            get: function(o, p) {
                if (p === "delegate") {
                    return function chainDelegate(proxyObject) {
                        return DelegateProxy(this, proxyObject);
                    };
                }
                if (typeof operator[p] === "function" && typeof delegate[p] === "function") {
                    if (!(p in proxy)) {
                        proxy[p] = function(...args) {
                            let result = operator[p].apply(this, args);
                            if (result !== undefined) {
                                args = Array.isArray(result) ? result : [ result ];
                            }
                            result = delegate[p].apply(this, args);
                            return result;
                        };
                    }
                    return proxy[p];
                }
                if (p in operator) {
                    return operator[p];
                }
                if (p in delegate) {
                    return delegate[p];
                }
                if (!(p in proxy)) {
                    proxy[p] = fallbackFunc;
                }
                return proxy[p];
            }
        });
    };
});