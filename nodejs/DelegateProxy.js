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

/* eslint-env es6, node */

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

        set: function(o,p,v) {
            if (!operator[p]) {
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

            if (typeof operator[p] === "function" &&
                typeof delegate[p] === "function") {
                if (!proxy[p]) {
                    proxy[p] = function (...args) {
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
