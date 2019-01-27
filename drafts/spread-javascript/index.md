---
title: 'Javascript spread operator and rest parameters (...)'
date: "2019-01-26T22:12:03.284Z"
tags: ['Javascript']
path: '/spread-javascript'
featuredImage: './spread-2.jpg'
disqusArticleIdentifier: '99010 http://vojtechruzicka.com/?p=99010'
excerpt: ''
---

![Spread](spread-2.jpg)

## Variable number of parameters
Usually when working with functions in JavaScript, there is a fixed number of parameters your function uses and supports. If you want to calculate square root of a number using `Math.sqrt(x)` you need always just one parameter for input. Some functions may require more parameters. Some functions have more parameters but you can safely omit last few optional parameters. In all these cases, all the parameters are declared as a part of the function signature:

```
function doSomething(first, second, third) { 
    // Do something cool
}
```

But what if the number of parameters is not know beforehand and can be pretty much anything?

For example, let's take `Math.min()` and `Math.max()`. It does work for any number or parameters no matter whether it is 0, 2 or 30.

```
Math.Min(); // Infinity
Math.Min(1); // 1
Math.Min(1,2,3,4,3,1,5,7,9,0,-9,18,37,81); // -9
```

How would you write such a function?

## Arguments - traditional approach
When you need to work with variable number of parameters in a function, traditionally your only option would be `arguments` object.

Inside the body of each function, there is `arguments` object available, which is array-like structure, which contains all the arguments passed in to the function. You can access each passed in argument with a zero-based index and you can check length of the parameters as you would with any array.

```javascript
function doSomething() { 
    arguments[0]; // "A"
    arguments[1]; // "B"
    arguments[2]; // "C"
    arguments.length; // 3
}

doSomething("A","B","C");
```

### Arguments limitations
`arguments` object is array-like, not a full fledged array though. That means that useful methods, which arrays have are not available. You cannot use methods such as `arguments.sort()`, `arguments.map()` or `arguments.filter()`. The only property you have is `length`.

Another limitation is that fat-arrow functions don't have `arguments` object available. In case you would use arguments in arrow function, it would refer to the arguments of the enclosing function.

## Rest Parameters
Fortunately, since ES6, the `arguments` object is no longer the only way how to handle variable parameters count. ES6 introduced a concept called `rest parameters`. 

What it means that you can put `...` before the last parameter in the function. 

```javascript
function doSomething(first, second, ...rest) {
    // do something cool
}
```

Now, in the example above, you can access the first two named parameters as usual. But all the other arguments passed to the function starting with third are automatically collected to an array called as the last parameter ("rest" here).

```javascript
function doSomething(first, second, ...rest) {
    console.log(first); // First argument passed to the function
    console.log(second); // Second argument passed to the function
    console.log(rest[0]); // Third argument passed to the function
    console.log(rest[1]); // Fourth argument passed to the function
    // Etc.
}
```

If you pass less than three parameters, `rest` will be just empty array.

Unlike `arguments` object, rest parameters give you a real array, so you can use all the array-specific methods. And unlike `arguments`, they do work in arrow functions.

```javascript
let doSomething = (...rest) => {
    rest[0]; // Can access the first argument
};

let doSomething = () => {
    arguments[0]; // Arrow functions don't have arguments
};
```

In addition to the advantages above, there is one which makes the rest parameters superior to arguments. Rest parameters are part of the function signature. That means just from the function "header" you can immediately recognize that it uses rest parameters and therefore accepts variable number of arguments. With `arguments` object, there is no such hint. That means you have to read the method body or comments to be able to tell that it accepts variable number of parameters. What's also important is that IDEs can detect rest parameters in the signature and help you better.

### Limitations

Rest parameters take all the remaining arguments of a function and package them in an array. That naturally brings two limitations. You can use them max once in a function, multiple rest parameters are not allowed.

```javascript
// This is not valid, multiple rest parameters
function doSomething(first, ...second, ...third) {
}
``` 

And you can use rest parameters only as a last parameter of a function:

```javascript
// This is not valid, rest parameters not last
function doSomething(first, ...second, third) {
}
``` 

## Spread operator
Whats a little bit confusing that the same three dots `...` used in JavaScript for the rest parameters are used also for an additional purpose. It is called `spread operator`. Its usage is almost the opposite of rest parameters. Instead of collecting multiple values in one array, it lets you expand existing one array (or other iterable) into multiple values. Lets look at various use cases.

### Function calls

<!--

Spread operator
	Function calls
	Array literals
	destructuring
	String creation (iterables)



https://codingwithspike.wordpress.com/2016/06/11/javascript-rest-spread-operators/
https://www.smashingmagazine.com/2016/07/how-to-use-arguments-and-parameters-in-ecmascript-6/

https://javascript.info/rest-parameters-spread-operator

Creating objects with values from a string can be very useful as well:
const string = 'abcde';
const obj = { ...string };
// {0: "a", 1: "b", 2: "c", 3: "d", 4: "e"}

https://davidwalsh.name/spread-operator
https://javascript.info/rest-parameters-spread-operator

Recent changes for generics in typescript:
https://blogs.msdn.microsoft.com/typescript/2018/11/29/announcing-typescript-3-2/

https://scotch.io/bar-talk/javascripts-three-dots-spread-vs-rest-operators543

https://css-tricks.com/new-es2018-features-every-javascript-developer-should-know/
-->