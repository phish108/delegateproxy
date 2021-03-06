/**
 * This file is part of delegateproxy
 *
 * MIT License
 *
 * Copyright 2017 Christian Glahn (github.com/phish108)
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to
 * deal in the Software without restriction, including without limitation the
 * rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
 * sell copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
 * IN THE SOFTWARE.
 */

/**
 * Janus is a small helper factory for creating Janus functions. These functions
 * behave as literals if they are called in literal context or as functions if
 * called in function context.
 *
 * The Janus functions are used for the cases where neither the delegate nor
 * the operator have a requested property. This allows you to call functions
 * or properties that neither class implements.
 */
function Janus(defaultValue) {
    const retval = function () {
        return defaultValue;
    };

    retval.toString = function () {
        return defaultValue;
    };

    return retval;
}

/**
 * class to pass operation handling to different objects, while
 * encapsulating the operational class(es).
 */
export function DelegateProxy(operator, delegate) {
    // the operator MUST be an instance.
    // if it is a function we just leave it.
    // This allows us to have one instance of an operator running in different
    // contexts.
    //
    const fallbackFunc = Janus("");

    // if we get a function as delegate we want to instanciate it as an object.
    if (typeof operator === "function") {
        operator = new operator();
    }
    if (typeof delegate === "function") {
        delegate = new delegate();
    }

    const proxy = {};

    return new Proxy(operator, {
        // our new proxy is a function, so we want to avoid reinstantiation
        // if we run through our delegation proxy class.
        construct: function(o, args, p) {
            return p;
        },

        set: function(o,p,v) {
            if (!(p in o)) {
                // all operator properties and functions are read only for the
                // proxy
                delegate[p] = v;
                return true;
            }
            return false;
        },

        get: function(o,p) {
            if (p === "delegate") {
                return function chainDelegate(proxyObject) {
                    return DelegateProxy(this, proxyObject);
                };
            }

            // NOTE: You cannot override the operator functions.
            // This is because delegates are called, whenever the operator
            // has no idea what to do.
            // This creates onion shells of functions that developers cannot
            // change but preceed with additional operations.
            // An operator should be clear on the functions it exposes and
            // what it does.

            if (typeof operator[p] === "function" &&
                typeof delegate[p] === "function") {
                if (!(p in proxy)) {
                    // avoid creating dummy functions, repeatetively.
                    proxy[p] = function (...args) {
                        let result = operator[p].apply(this, args);

                        // this allows pipelining result handling in the delegate
                        if (result !== undefined) {
                            args = Array.isArray(result) ? result : [result];
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
}
