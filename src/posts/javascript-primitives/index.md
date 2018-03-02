---
title: 'Javascript Primitives Guide'
date: "2018-01-31T22:12:03.284Z"
tags: ['Javascript']
path: '/javascript-primitives'
---

What are primitives in Javascript? What pitfalls to watch for? What are their object wrappers and when should you use them?
<!--more-->
![primitives](./primitives.jpg)

Primitives versus Objects
-------------------------

Javascript offers six primitive types: number, string, boolean, undefined, null and symbol. Everything else is not a primitive. It is an object. Dates, arrays, functions, regular expressions -- everything.

A simple example of an object can be a plain object created by object literal like this:

```javascript
{
   firstName: 'John',
   lastName: 'Doe'
}
```

Examples of primitives are 61, \'Kitty\' or false.

### Mutability

In the example above, you can see that object is basically a collection of name-value pairs. You can change their values (\'mutate\' them, we say that objects are mutable) or you can even add your own new properties or remove existing ones.

```javascript
var john = {
    firstName: 'John',
    lastName: 'Doe'
}

john.lastName = 'Smith';
john.age = 40;
delete john.firstName;
```

In contrast, the primitives are immutable, their value cannot be changed. You can, of course, reassign a variable with a new primitive, but the old one cannot be changed.

### Comparison

Primitives are compared by value, objects are compared by reference. What does it mean though? If you compare two primitives having the same value, they are considered equal.

```javascript
42 === 42 //true
'John' === 'John' //true
```

However, when comparing two objects you need to be more careful. They are compared by their identity. That means it does not matter if the two objects have same properties with the same values. They are equal only if they are the same instance. That is -- if comparing two variables, they are equal only if they point to the very same object.

```javascript
var john = {name: 'John', name: 'Doe'};
var stillJohn = john;
var evilTwin = {name: 'John', name: 'Doe'};

john === john //true
john === stillJohn //true
john === evilTwin //false
```

You can see that two variables can point to the same object. That is because variable containing object holds only a reference to that object. When you assign the reference to a new variable, now you have two variables holding the reference to the same object. That means changing properties of the object stored in either of the variables will affect them both. This does not apply to primitives as they are not using references, their value is copied instead every time. The bottom line is -- be careful when passing your objects around -- somebody else can change them and you will be affected. For more info check [this tutorial](http://www.javascripttutorial.net/javascript-primitive-vs-reference-values).

Primitive Types
---------------

### String

Strings are basically Unicode text, 16-bits per character. You may be surprised that string is actually primitive value as it is not that common. For example, Java has primitives as well, but String is not a primitive there. Another surprise may be that there is no type representing a single character like in many other languages. You just have to simply use a string with one char instead.

### Number

Unlike many other languages, JavaScript has just one type for representing numbers. That means no distinction between integer and decimal values, no distinction between signed and unsigned or single and double precision floating numbers. Javascript uses 64-bit floating point numbers.

Except for regular numeric values, there are also some special values. There is NaN (Not a Number), which is a result of operations such as 0/0. Then there is Infinity, which can be both positive and negative. You can check for minimum and maximum values fo prevent overflow/underflow - *Number.MIN\_VALUE* and *Number.MAX\_VALUE*. And then, of course, there is +0 and -0 in Javascript (0 is just an alias for +0).

Be careful when working with NaN as this value behaves in an unexpected way -- it is the only value in javascript that is not equal to itself, that means you cannot test that something is NaN by

```javascript
something === NaN //Does not work, always false
NaN === NaN //false
```
You can use [isNaN or Number.IsNaN](http://adripofjavascript.com/blog/drips/the-problem-with-testing-for-nan-in-javascript.html) (ES6+) instead of direct comparison.

### Boolean

Boolean type contains just two values -- *true* and *false*.

### Symbol

This is a new primitive type introduced in ES6. There is no symbol literal, so all the symbols need to be created using *Symbol()* function. Each symbol is unique, which makes them ideal for use as object properties to avoid clashes. Or in other cases where you need to have unique values. For more info see [this post](http://exploringjs.com/es6/ch_symbols.html).

### Null & Undefined

Both *null* and *undefined* are primitive types representing the absence of value. Null is usually explicitly returned and assigned and because of this it generally represents that the value is intentionally missing. The undefined, on the other hand, means that the value does not exist in cases, such as:

1.  A variable was declared but not initialized
2.  Return value of methods that do not return anything
3.  Value of function parameters when called did not provide value
4.  Accessing a property of an object which does not exist

One caveat to watch for and which is confusing is that even though null is a primitive, calling *typeof null *[returns *object*](https://stackoverflow.com/q/18808226/4560142). In contrast typeof undefined returns undefined.

Object Wrappers
---------------

Alright, we know that objects have properties, which you can access using a dot. Like *person.name = \'john\'*. Primitives don't have anything like that, they are just a single value. And strings are primitives. How come that the following will work then?

```javascript
var name = 'John';
console.log(name.length); //prints 4
console.log(name.toUpperCase()); //prints JOHN
```

String are not objects, you can try it by using:

```javascript
typeof 'John' //string
```

Turns out that for certain primitives (number, boolean, string) JavaScript offers Wrapper objects, which can be used when an object is needed and provide some extra convenience methods. So what happens in the example above:

1.  Javascript detects that you are trying to access a property of a string primitive.
2.  It creates a wrapper object String to wrap the original string primitive.
3.  It accesses the length and toUpperCase on the wrapper object instead of the original primitive.
4.  It discards the wrapper object, frees the memory and continues.

This way you can use all the helpful methods on strings to make a substring, convert it to lowercase, split it and so on. Note that primitives are immutable so all these methods just return a new instance of the string and don\'t modify the original.

### Manually creating wrappers

In the example above, JavaScript creates wrapper objects automatically under the hood. There is also a way to create such objects explicitly.

```javascript
new Number(4)
new String('Hi')
new Boolean(true)
```

These are not primitives anymore, but objects, which contain the primitive value and add some extra goodies.

```javascript
typeof 4 //number
typeof 'Hi' //string
typeof true //boolean

typeof new Number(4) //object
typeof new String('Hi') //object
typeof new Boolean(true) //object
```

This has some serious implications. You cannot really compare wrapper objects and primitives:

```javascript
'Hi' === new String('Hi') //false
```

Also, be aware that objects are considered truthy, that means that you need to watch for this:

```javascript
if (false) {
    //This does not execute
}

if (new Boolean(false)) {
    //This executes
}
```

Because of this, explicitly creating wrappers using the *new* operator is considered a bad practice. On the other hand, calling the function without the *new* operator is perfectly valid as it just tries to convert the input into the corresponding primitive type and returns a primitive value.

```javascript
typeof new Number('42') //object, not recommended
typeof Number('42') //number, safe
```

valueOf and toString
--------------------

When you are working with objects, there are some cases when you would rather need a primitive representation of the object. Actually, javascript offers two methods for it which each object inherits:

-   valueOf() returns primitive representation of the object
-   toString() returns string representation of the object

A good example can be Date. *toString()* returns a human-readable description of the date, while *valueOf()* returns a number representing the date as the number of passed milliseconds since 1 January 1970 00:00:00 UTC and the date.

```javascript
var date = new Date();
console.log(date.toString()); //Wed Jan 24 2018 14:12:07 GMT+0100 (Central Europe Standard Time)
console.log(date.valueOf()); //1516817671281
```

You rarely need to call *valueOf()* yourself, but javascript does it under the hood when a primitive is expected, for example when using + operator. You can even define your own implementation of *valueOf()* and *toString()*:

```javascript
var john = {
    firstName: 'John',
    lastName: 'Doe',
    age: 45,
    valueOf: function () {
        return this.age;
    },
    toString: function () {
        return `${this.firstName} ${this.lastName}, ${this.age}`
    }
};

console.log(john.toString()); //John Doe, 45
console.log(john + 1); //46
```

Summary
-------

Javascript provides six primitive types -- number, boolean, string, null, undefined and symbol. Primitives are immutable and are compared by value. When needed, Javascript wraps a primitive by an object wrapper. It is not recommended to create these wrappers explicitly. If the conversion needs to be done the other way around -- from an object to a prototype, the *valueOf* method is called to obtain a primitive value. You can use your own implementation of *valueOf*.