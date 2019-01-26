---
title: 'Javascript rest parameters and spread operator (...)'
date: "2019-01-26T22:12:03.284Z"
tags: ['Javascript']
path: '/spread-javascript'
featuredImage: './spread-2.jpg'
disqusArticleIdentifier: '99010 http://vojtechruzicka.com/?p=99010'
excerpt: ''
---

![Spread](./spread-2.jpg)

## Variable number of parameters
Usually when working with functions in JavaScript, there is a fixed number of parameters your function uses and supports. If you want to calculate square root of a number using `Math.sqrt(x)` you need always just one parameter for input. Some functions may require more parameters. Some functions have more parameters but you can safely omit last few optional parameters. In all these cases, all the parameters are declared as a part of the function signature:

```
function doSomething(first, second, third) { 
    
}
```

But what if the number of parameters is not know beforehand and can be pretty much anything?

For example, let's take `Math.min()` and `Math.max()`. It does work for any number or arguments no matter whether it is 0, 2 or 30.

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
`arguments` object is array-like, not a full fledged array though. That means that useful methods, which arrays have are not available. You cannot use methods such as `arguments.map()`, `arguments.filter()`. The only property you have is `length`.

Another limitation is that fat-arrow functions don't have `arguments` object available. In case you would use arguments in arrow function, it would refer to the arguments of the enclosing function.

## Rest Parameters


<!--

Variable number of parameters
	Arguments
	Rest parameters

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

Pasted from <https://davidwalsh.name/spread-operator> 


Arrow functions do not have "arguments"
If we access the arguments object from an arrow function, it takes them from the outer “normal” function.
Here’s an example:

Pasted from <https://javascript.info/rest-parameters-spread-operator>

Recent changes for generics in typescript:
https://blogs.msdn.microsoft.com/typescript/2018/11/29/announcing-typescript-3-2/

https://scotch.io/bar-talk/javascripts-three-dots-spread-vs-rest-operators543

https://css-tricks.com/new-es2018-features-every-javascript-developer-should-know/
-->