module.exports = function DelegateProxy(operator, delegate) {
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
            if (!o[p]) {
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
                if (!proxy[p]) {
                    proxy[p] = function(...args) {
                        let result = operator[p].apply(this, args);
                        if (!result || !result.length) {
                            result = delegate[p].apply(this, args);
                        }
                        return result;
                    };
                }
                return proxy[p];
            }
            if (operator[p]) {
                return operator[p];
            }
            return delegate[p];
        }
    });
};