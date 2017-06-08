"use strict";

const { expect } = require("chai");
const DelegateProxy = require("../nodejs/DelegateProxy");

describe("DelegateProxy", function() {
    it("load", function () {
        expect(DelegateProxy).to.be.a("function");
    });

    it("simple proxy", function () {
        const a = {
            foo: "hello"
        };
        const b = {
            bar: "world"
        };
        const result = DelegateProxy(a, b);

        expect(result).is.not.equal(a);
        expect(result.foo).to.be.equal("hello");
        expect(result.bar).to.be.equal("world");
    });

    it("write only base proxy", function() {
        const a = {
            foo: "hello"
        };
        const b = {
            bar: "world"
        };
        const result = DelegateProxy(a, b);

        expect(result).is.not.equal(a);
        try {
            result.foo = "Hello";
        }
        catch (err) {
            // skip
        }
        try {
            result.bar = "World";
        }
        catch (err) {
            // skip again
        }
        expect(result.foo).to.be.equal("hello");
        expect(result.bar).to.be.equal("World");
    });

    it("auto instantiate left", function() {
        class A {
            constructor() {
                this.foo = "Hello ";
            }
        }
        const b = {
            bar: "World"
        };

        const result = DelegateProxy(A, b);

        expect(result.foo).to.be.equal("Hello ");
        expect(result.bar).to.be.equal("World");
    });

    it("auto instantiate right", function() {
        class A {
            constructor() {
                this.foo = "Hello ";
            }
        }
        const b = {
            bar: "World"
        };

        const result = DelegateProxy(b, A);

        expect(result.foo).to.be.equal("Hello ");
        expect(result.bar).to.be.equal("World");
    });

    it("function cascade", function() {
        class A {
            a() {
                this.data = "Hello ";
            }
        }

        class B {
            a() {
                this.data += "World";
            }
        }

        const result = DelegateProxy(A, B);

        result.a();
        expect(result.data).to.be.equal("Hello World");
    });

    it("delegation cascade", function() {
        class A {
            a() {
                this.data = "Hello ";
            }
        }

        class B {
            a() {
                this.data += "World ";
            }
        }

        class C {
            a() {
                this.data += "Class ";
            }
        }

        const result = DelegateProxy(A, B).delegate(C);

        result.a();
        expect(result.data).to.be.equal("Hello World Class ");
    });

    it("delegation cascade reserved", function() {
        class A {
            delegate(cls) {
                this.data = "not called";
            }
        }

        class B {
            a() {
                this.foo = "hello ";
            }
        }

        class C {
            a() {
                this.foo += "world ";
            }
        }

        const result = DelegateProxy(A, B).delegate(C);

        expect(result.data).to.be.undefined;
    });

    it("singleton delegation base", function() {
        class Single {
            a(value) {
                this.data = `hello ${value}`;
            }
        }

        const base = new Single();
        const d1   = DelegateProxy(base, {});
        const d2   = DelegateProxy(base, {});

        d1.a("world");
        d2.a("mars");

        expect(d1.data).to.be.equal("hello world");
        expect(d2.data).to.be.equal("hello mars");
    });

    it("singleton delegation both", function() {
        class Single {
            a(value) {
                this.data = `hello ${value}`;
            }
        }

        const base = new Single();
        const data = {};
        const d1   = DelegateProxy(base, data);

        d1.a("world");

        expect(d1.data).to.be.equal("hello world");
        expect(data.data).to.be.equal("hello world");
    });

    it("singleton delegation change base", function() {
        class Single {
            a(value) {
                this.data = `hello ${value}`;
            }
        }

        const base = new Single();
        const data = {};
        const d1   = DelegateProxy(base, data);

        base.hello = "foo";
        d1.a("world");

        expect(d1.data).to.be.equal("hello world");
        expect(data.data).to.be.equal("hello world");
        expect(d1.hello).to.be.equal("foo");
    });

    it("pipelinging cascade", function () {
        class A {
            a() {
                return "Hello ";
            }
        }

        class B {
            a(foo) {
                return foo + "World";
            }
        }

        const proxy = DelegateProxy(A, B);
        const result = proxy.a();

        expect(result).to.be.equal("Hello World");
    });

    it("avoid pipelinging cascade on undef", function () {
        class A {
            a(foo) {
                this.alpha = foo;
            }
        }

        class B {
            a(foo) {
                this.beta = foo;
            }
        }

        const result = DelegateProxy(A, B);

        result.a("hello");

        expect(result.alpha).to.be.equal("hello");
        expect(result.beta).to.be.equal(result.alpha);
    });
});
