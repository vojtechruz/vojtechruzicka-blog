---
title: 'Javascript constructor functions and new operator'
date: "2018-02-02T22:12:03.284Z"
tags: ['Javascript']
path: '/javascript-constructor-functions-and-new-operator'
featuredImage: './constructor-functions.jpg'
excerpt: What does Javascript's new operator do? What are constructor functions? Why is new criticised and what are the alternatives?
---

<PostHeader frontmatter={props.data.mdx.frontmatter} />

Creating objects
----------------

In your applications, most of the time you don\'t work with [primitives](https://www.vojtechruzicka.com/javascript-primitives/) but rather with objects. You can directly create objects with object literal like this:

```javascript
var Person = {
    firstName: 'John',
    lastName: 'Doe'
}
```

This is sometimes good enough, but in many cases, you want to work with many objects, which share the same characteristics - that is: they have the same properties and methods. These can be users in your applications, bank accounts, cars or anything else. The point is, you\'ll want to work with \'Jane\' and \'John\' in the same way because they can both be considered a person - they have a name, surname, age and so on.

Alright, so how do you create objects which have the same methods and properties? Using constructor functions and the *new* operator.

The *new* operator
------------------

Let\'s consider the following example:

```javascript
var Person = function (firstName, lastName) {
    this.firstName = firstName;
    this.lastName = lastName;
};

var john = new Person('John', 'Doe');
```

The *Person* is a constructor function. Its whole purpose is to create new objects which represent different persons. We can be sure that each person will have the first name and the last name, which are provided as parameters to this function. Notice that unlike regular functions, constructors begin by convention with a capital letter. This way you can easily tell them apart from ordinary functions.

Then we are creating a specific person instance called *john* with *firstName* \'John\' and *lastName* \'Doe\'. Notice that there is a *new* keyword before the *Person* constructor function call. It is actually an operator and it is responsible for all the magic when creating new persons. It does actually quite a lot:

1.  It creates a new blank object.
2.  It makes *this* to point to this newly created object inside the constructor function
3.  It sets the prototype of the newly created object to the constructor function\'s prototype.
4.  It makes the constructor function return the newly created object **IF** it is not returning anything.

That is the reason why *John* is created even though the function *Person* does not have an explicit return statement. That\'s the reason why using *this.firstName=firstName;* sets the first name provided to the new object. Without the *new* keyword, *this* would point to the global object in our case and not to the newly created instance.

What if I forget to include *new*?
----------------------------------

There are some serious problems when using the *new* operator. In languages such as Java, it is strictly limited how you can use the new keyword. It can be used only to invoke methods, which are explicitly marked as constructors. Constructors are guaranteed to return a new instance of the class, performing all the required initialization. Constructors can be invoked only using the *new* keyword and the *new* keyword can be used only to invoke constructors.

In javascript, the situation is unfortunately not so strict.

-   You can use new operator on **ANY** function
-   You can call function intended as constructor **WITH** **or WITHOUT** the new keyword

So, calling function not designed as constructor will not result in an error. What\'s more, you\'ll get different behavior based on whether you call the constructor with or without the *new* keyword. And it is really easy to forget to include new. After all, there is no compile-time check as in Java. Let\'s look at an example.

```javascript
var Person = function (firstName, lastName) {
    this.firstName = firstName;
    this.lastName = lastName;
};

var john = new Person('John', 'Doe');
var jane = Person('Jane', 'Doe');
```

First, there is a constructor function *Person* and then it is called twice. Once with *new* and once without. Can you guess what each variable contains?

```javascript
console.log(john); // Person {firstName: 'John' , lastName: 'Doe'}
console.log(jane); // undefined
console.log(window) // Oh dear! The global object now has firstName and lastName!
```

What just happened? Looks like John is doing well, but poor Jane is undefined. What\'s worse, it looks like *firstName* and *lastName* got stored on the global object (window in case of running in a browser). So my precious new object is undefined and I am polluting the global object instead. Nasty.

The reason why is that one of the actions *new* operator does is changing *this*, so it points to the newly created object. When *new* is not specified, the constructor is considered an ordinary function call and *this* remains the same as usual. In our case, when I just declared a function on the top level and called it from the top level, *this* is pointing to the global object. Global object differs in each environment (browser vs server side javascript), but in a browser it is *window*. That means I am now storing my properties directly on the *window* object.

Another action that *new* operator does is that makes the newly created object result of the whole new expression if the function does not return object specifically. It is the case here as you can see that the Person constructor does not explicitly call return (and yet, John is successfully created). When called without new, it is just a regular function call. And functions without explicit return statement return undefined.

Protecting against forgetting to include *new*
----------------------------------------------

Alright, forgetting the new operator can have pretty nasty consequences. So what can you do to prevent such cases?

### Capital letter convention

You should always stick to the convention that constructor functions start with a capital letter and regular functions with a lowercase letter. This way you can immediately see that something is fishy when encountering a situation such as:

```javascript
var person = Person('John', 'Doe'); // capital letter, I should use new
```

It is also helpful when constructor names are nouns and regular functions are verbs:

```javascript
var size = new computeSize(); // lowercase letter;  computeSize doesn't sound like noun
```

### Explicit check of *this*

Remember how one of the things new operator does is changing this to the newly created object and setting the prototype? One of the ways how to defend against the accidental omission of the new operator is checking what actually this points to in the constructor function.

```javascript
var Person = function (firstName, lastName) {

    if (!(this instanceof Person)) {
        return new Person(firstName, lastName);
    }

    this.firstName = firstName;
    this.lastName = lastName;
}
```

This way if *this* is not an instance of Person, we can detect it and properly call the constructor again and make sure we add the new keyword to the call. The result is same no matter whether you use the new keyword for your constructor or not.

The disadvantage is that it encourages developers to not worry about using new as it is still safe. Building such habit is not good as not all the code you\'ll work with will always have such safeguards. It is much better to stick to the convention of always using *new* instead of just sometimes and have the usage inconsistent across the codebase. As an alternative, you may consider using the check but to throw an error to fail fast and discover improper usage of your constructors early on.

### Strict mode

You can enable strict mode in your script or just a part of it using \"use strict\";. This basically makes some of the weird constructs result in real errors instead of silently failing or resulting in unexpected and unwanted behavior. An example can be usage of an undeclared variable.

One of the issues it addresses is pointing *this* to the global object (window) when not calling a function as a method of an object. When the strict mode is activated, *this* is undefined instead of pointing to the global object. Forgetting the new operator before a constructor call would then result in an error saying that this is undefined. You would discover your mistake early on when the strict mode is enabled. Sometimes you cannot afford to use global strict mode as it would break all your existing code. In such cases, you can always enable strict mode just for the function.

```javascript
var Person = function (firstName, lastName) {
    "use strict";
    this.firstName = firstName;// TypeError: Cannot set property 'firstName' of undefined
    this.lastName = lastName;
};
```

### Classes

In ECMAScript 6, there is a new concept of classes, which aims to replace constructor functions and addresses its issues. The person from our examples above as a class would look like this.

```javascript
class Person {
    constructor(firstName, lastName) {
        this.firstName = firstName;
        this.lastName = lastName;
    }
}
```

You can create new persons as usual:

```javascript
var john = new Person('John', 'Doe');
```

What\'s really cool is that if you accidentally forget to include the *new* keyword when creating a new instance it results in an error instead of silently altering the global object.

```javascript
var john = new Person('John', 'Doe'); // Person { firstName: 'John', lastName: 'Doe' }
var jane = Person('Jane', 'Doe'); // TypeError: Class constructor Person cannot be invoked without 'new'
```

What is unfortunate is that with classes and their syntax javascript gives a false impression that it uses class-based inheritance. Developers coming from other languages like Java are especially vulnerable to this. Instead, Javascript still uses prototype-based inheritance and classes are just syntactic sugar on top of good old constructor functions.

Object creation alternatives
----------------------------

In Javascript, there are many ways to create a new object. We already covered object literal, constructor functions and a brief mention of classes. There are more ways, which can be used as an alternative to new and constructor functions. For example, Douglas Crockford used to be a zealous advocate of not using new at all and using [*Object.create*](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/create) instead. However, later on, [he changed his mind](https://youtu.be/PSGEjv3Tqo0?t=6m48s) and stopped using even *Object.create*. Another example may be using factories instead, which have [many advantages](https://medium.com/javascript-scene/javascript-factory-functions-vs-constructor-functions-vs-classes-2f22ceddf33e), such as more flexibility or decoupling from a specific object type. And of course, many frameworks offer convenient ways of creating objects. There is no silver bullet so it is good to be aware of different approaches and their tradeoffs.

Conclusion
----------

When using constructor functions, make sure you don\'t forget the *new* operator. Otherwise weird things will happen. Stick to the naming conventions. The strict mode is your friend and should protect you against accidental omission. And of course, if you can use ES6, classes are a foolproof way to replace constructor function. Don't get fooled though. Even though it does sound like class-based inheritance, it is just syntactic sugar and Javascript has still prototype-based inheritance.
