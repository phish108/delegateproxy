# DelegateProxy - ES6 Proxy Class for Functional Delegation

DelegateProxy uses the ES6 Proxies for linking two objects.

DelegateProxy is a utility factory for implementing class delegation. It allows
to implement class inheritance and code encapsulation without bothering with
class syntax.

DelegateProxy binds two objects functionally, so both objects can access the
same functions and data as if they were a single instance. DelegateProxy allows
programmers to capsulate functions and data without creating complex class
hierarchies.

DelegateProxy started from an attempt for applying the ES6 Meta-programming
features in the real world. It turned out to be a useful tool for avoiding
class inheritance and implementing plugable features.

## Basic syntax

```javascript
const proxy = DelegateProxy(OperatorObject, DelegateObject);
```

## How to use

The most basic use for DelegateProxy is to link to classes.

```javascript
class A {
    a() {
        return "hello from A";
    }
}

class B {
    b() {
        return "hello from B";
    }
}

const dp = DelegateProxy(A, B);

// now we can use functions from A and B
console.log(dp.a()); // "hello from A"
console.log(dp.b()); // "hello from B"
```

DelegateProxy will instanciate both classes and then tie them together.

Within a delegate proxy, the operator object is write only. Data can be stored
only in the delegate object.

```javascript
class A {
    constructor() {
        this.aData = "immutable";
    }

    a() {
        return this.aData;
    }
}

class B {
    constructor() {
        this.bData = "mutable";
    }

    mutate() {
        this.aData = "mutate"; // will fail in proxy
    }

    b() {
        return `${this.aData} ${this.bData}`;
    }
}

const dp = DelegateProxy(A, B);

dp.mutate(); // will fail by throwing an error
console.log(dp.b()); // "immutable mutable"
```

All properties of the operator object have preference over those in
the delegate. This means that properties of the delegate cannot override the
properties of the operator object.

```javascript
class A {
    constructor() {
        this.aData = "Hello World";
    }
}

class B {
    constructor() {
        this.aData = "My Data";
    }

    b() {
        return this.aData;
    }
}

const dp = DelegateProxy(A, B);

console.log(dp.b()); // "Hello World"
```

If both classes define the same function, they are called in the order of the
delegation.

```javascript
class A {
    a() {
        this.data = "Hello ";
    }
}

class B {
    a() {
        this.data += "World";
    }
    b() {
        return this.data;
    }
}

const dp = DelegateProxy(A, B);

dp.a();
console.log(dp.b()); // "Hello World"
```

It is possible to pass objects directly into the delegation, both as operators
and as delegates.

Of course, delegations can be chained. Therefore, the delegate method is
reserved to DelegateProxy.

```javascript
const writeOnly = {
    fixed: "immutable"
};

class A {
    a() {
        this.changed = "Hello ";
    }
}

class B {
    a() {
        this.changed += "World";
    }
}

const dp1 = DelegateProxy(writeOnly, A).delegate(B);
// same as
// const dp2 = DelegateProxy(DelegateProxy(writeOnly, A), B)

dp1.a();
console.log(dp1.fixed);   // "immutable"
console.log(dp1.changed); // "Hello World"
```

Because DelegateProxy does not alter the objects that are passed into it,
this allows to implement class inheritance based on singletons.

```javascript
class A {
    a() {
        this.changed = "Hello ";
    }
}

class B {
    a() {
        this.changed += "World";
    }
}

class C {
    a() {
        this.changed += "Mars";
    }
}

const base = new A();
const dp1 = DelegateProxy(base, B);
const dp2 = DelegateProxy(base, C);

dp1.a();
dp2.a();

console.log(base.changed); // undefined
console.log(dp1.changed);  // "Hello World"
console.log(dp2.changed);  // "Hello Mars"
```

In this case it is possible to change the base object and immediately pass this
change to all delegated objects. However, the base object is not aware of its
delegates, so it cannot be used to message between delegates. 

## AUTHOR

Christian Glahn (https://github.com/phish108)

## License

MIT
