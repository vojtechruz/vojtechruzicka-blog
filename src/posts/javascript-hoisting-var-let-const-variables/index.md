---
title: 'Javascript hoisting, var, let and const variables'
date: "2018-02-09T22:12:03.284Z"
tags: ['Javascript']
path: '/javascript-hoisting-var-let-const-variables'
featuredImage: './hoisting.jpg'
excerpt: One of the Javascript's oddities is that you can use variables and functions before they are declared. It's called hoisting. Fortunately, in ES6 let and const variables offer much better behavior.
---

<PostHeader frontmatter={props.data.mdx.frontmatter} />

## Hoisting
Consider the following code:

```javascript
sayHi();

function sayHi() {
   console.log('Hi there!');
}
```

It works and prints \'Hi there!\'. Even though the function is defined after it is used. Or another example:

```javascript
john = 'John Doe';
console.log(john); //John Doe
var john;
```

Variable john is declared after it is used, yet it still works. How is this possible? When your Javascript code is being processed, in the first iteration, before actually executing it line by line, all the variable and function declarations are detected. Then they are created in memory and space is allocated for them. Only after that, the code is executed line by line. This behaves exactly the same as if the declarations were moved on top of the scope (e.g. function body). That means your code behaves as if the declarations of variables and functions were first and then the rest of the code. There is one caveat though. Consider the following line:

```javascript
var john = 'John Doe';
```

It is actually consisting of two parts:

-   *var john* means that variable john is declared
-   *= \'John Doe\';* means that previously declared variable *john* is assigned a value of string \'John Doe\'

It is basically one-liner for:

```javascript
var john; // declaration
john = 'John Doe'; //initialization
```

The thing is that only declarations are hoisted, not initializations. That means you can access variable *john* before it is actually declared but its value will be undefined.

```javascript
console.log(john); //undefined
var john = 'John Doe';
console.log(john); //'John Doe'
```

Another thing to watch for is that while function declarations and variable declarations using *var* keyword are hoisted, class declarations are not. You cannot use class before it is declared.

```javascript
var john = new Person('John', 'Doe'); //ReferenceError: Person is not defined

class Person {
    constructor(name, surname) {
        this.name = name;
        this.surname = surname;
    }
}

var jane = new Person('Jane', 'Doe'); //No problems here
```

## Best practices
It is a good idea to always declare first before using a variable or function. And to group all the declarations on the top of the scope they apply to. It is much easier to see what variables are being used in a given scope and easier to find a variable declaration when looking for it. It is also much more natural to define a construct before using it than the other way around. Such code is much easier to read, understand and to reason about. And after all, some of the developers, especially when junior or switching from other languages, may not be familiar with the hosting and it would just cause unnecessary confusion.

## Block scope
If you come from a different programming language than Javascript, the following behavior may be surprising to you.

```javascript
for (var i = 0; i < 10; i++) {
    // do something
}

console.log(i); // 10, What? 'i' still exists outside the for block!
```

Unlike in many other languages, variables declared using *var* keyword do not respect block scope. That means you would expect that variable \'i\' from a for loop would be accessible only inside the loop. Wrong. The scope of a variable declared in Javascript depends on where you declare it.

-   If you declare it inside of a function body, its scope is the whole function\'s body. And because of hoisting, it can be accessed anywhere in the body.
-   If you declare your variable on the root level it is in the global scope. It is actually a variable of the global object (e.g. window).

If we take our example with for loop, the variable *i* is actually now declared also as a property of window - that is *window.i*!

```javascript
for (var i = 0; i < 10; i++) {
  // do something
}

console.log(window.i)// 10, Oh the horror! 'i' is now on the global object
```

That is terrifying. Function wide scope is usually a lot wider than you need. Often you have variables which only are needed inside of a loop, if statement or similar block. Minimizing the scope where a variable is available is very important. It makes your functions easier to understand and reason about. Most importantly, the smaller the scope is, the smaller is the risk that some code somewhere else will mess with your variables. The bottom line is - it\'s useful to have smaller encapsulated scopes, rather than a big scope for the whole function. And of course, your functions should be really small anyway, which reduces the scope of the variables within and decreases complexity.

## IIFE
Because it is a good practice to minimize the scope a variable is accessible in and *var* can be accessed in the whole function scope, there were historically some workarounds to address this. One of them is IFFE, which represents [Immediately Invoked Function Expression](http://adripofjavascript.com/blog/drips/an-introduction-to-iffes-immediately-invoked-function-expressions.html). It is an artificial way to create a new local encapsulated scope. What you basically do is surround a block of code by a function expression and immediately call that function. Variables inside are not accessible from the surrounding code.

```javascript
(function () {
    var foo = 42;
})();

console.log(foo); // ReferenceError: foo is not defined
```

## let
In ES6 in addition to *var*, there were two new variable types introduced - *let* and *const*. What are they good for if there already is *var*? One of the differences is that their scope is not the entire function but rather only the enclosing block. That is, some section of code wrapped in curly braces {}. Like the body of an *if* statement or *for* loop. Finally, you can minimize the scope of your variables to the bare minimum without ugly workarounds such as IIFE.

Another difference (and advantage) of *let* over *var* is how hoisting works. Variables declared using *var* can be accessed in the whole scope (and we already know that *var* has a bigger scope). You can access them before they are declared. In such case, their value would be undefined though, as only declarations and not initializations are hoisted. This is generally considered a bad practice. *Let* behaves differently.  You can access it only after it was declared. Until then, the variable is considered to be in the \'Temporal Dead Zone\'.

To better understand the difference between *var* and *let*, we need to compare their life cycle. When a scope is entered, the first thing which happens is that the whole scope (function body, block) is searched for variable declarations. Then there is a memory space allocated for each of the variables. After this, the body of the function or block is executed line by line. That\'s basically how hoisting works and why you can access your variables before declaring them.

There is one key difference how this behaves between *var* and *let/const* though.

-   In case of *var*, after creating variable definitions, before executing line by line each of the variables is initialized with the undefined value.
-   In case of *let/const*, the initialization to undefined does not happen until the line where the declaration actually happens. And only if there is no assignment immediately. On the lines above the variable is in the *Temporal Dead Zone* and accessing it results in Reference Error.

One of the advantages of *let* over *var* is also pollution of global scope. When you declare a variable using *var* on the root level, it is automatically declared on the global object:

```javascript
var foo = 42;
console.log(window.foo) //42
```

When using *let* (and *const*), this does not happen:

```javascript
let foo = 42;
console.log(window.foo) //undefined
```

## const
Const behaves in a very similar way to let. It is also block scoped and cannot be used until declared. There is, however, one key difference. Once variable declared using *const* keyword is assigned a value, you cannot reassign it. You also need to initialize the variable immediately when declaring it.  It is useful as this prevents accidental reassignment of the variable. It also promotes good coding practices as it prohibits using a single variable for multiple purposes during its lifecycle, which is confusing and error-prone. And how can you even have a nice descriptive name of a variable which does multiple different things?

While this is a useful concept, you need to be aware of some limitations. The only restriction const provides is about reassignment. That does not mean object assigned to a const variable is not immutable! You can still change its properties, delete them or add new ones. You just cannot assign a completely different object. Note that applies only to objects. In case of [primitives](https://www.vojtechruzicka.com/javascript-primitives/) such as numbers, strings or booleans, you are safe as they are immutable.

## let vs const
Because of the advantages of *const* described above, it is a good practice to prefer *const* over *let*. Actually, in most of the cases, you can safely use *const*. There are only a few cases where you really need *let*. One of the examples can be loops. Because the iterating variable gets changed with every step through the loop you cannot use *const*. However, you can avoid using loops in many cases in favor of more functional way such as - map, filter or reduce. When using a linter (and you should use it), it [can check](https://eslint.org/docs/rules/prefer-const) for you cases where you can safely replace *let* with *const* as the variable is never reassigned.

## Conclusion
Hoisting is one of the weird Javascript\'s concepts, yet it is very important to be familiar with it. It is good to stick to the convention where you declare first and use later. And all your declarations should be grouped together.

To minimize hoisting problems and confusion, there are fortunately modern alternatives in ES6 - const and let. Their scope is block instead of the whole function and they cannot be used before they are declared. Because of this, you should prefer them over the good old var. Moreover, when possible the const is a safer choice over let because it cannot be reassigned.