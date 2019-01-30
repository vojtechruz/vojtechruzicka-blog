---
title: 'Javascript spread operator and rest parameters (...)'
date: "2019-01-30T22:12:03.284Z"
tags: ['Javascript']
path: '/spread-javascript'
featuredImage: './spread.jpg'
disqusArticleIdentifier: '99018 http://vojtechruzicka.com/?p=99018'
excerpt: 'What do three dots (...) mean in javascript? They can be used for various different purposes.'
---

![Spread](./spread.jpg)

## Variable number of parameters
Usually, when working with functions in JavaScript, there is a fixed number of parameters your function uses and supports. If you want to calculate the square root of a number using `Math.sqrt(x)` you always need just one parameter for input. Some functions may require more parameters. Some functions have more parameters, but you can safely omit last few optional parameters. In all these cases, all the parameters are declared as a part of the function signature:

```
function doSomething(first, second, third) { 
    // Do something cool
}
```

However, what if the number of parameters is not known beforehand and can be pretty much anything?

For example, let's take `Math.min()` and `Math.max()`. It does work for any number of parameters no matter whether it is 0, 2 or 30.

```
Math.Min(); // Infinity
Math.Min(1); // 1
Math.Min(1,2,3,4,3,1,5,7,9,0,-9,18,37,81); // -9
```

How would you write such a function?

## Arguments - traditional approach
When you need to work with a variable number of parameters in a function, traditionally your only option would be `arguments` object.

Inside the body of each function, there is `arguments` object available, which is array-like structure, which contains all the arguments passed into the function. You can access each passed-in argument with a zero-based index and you can check the length of the parameters as you would with any array.

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
`arguments` object is array-like, not a full-fledged array though. That means that useful methods, which arrays have are not available. You cannot use methods such as `arguments.sort()`, `arguments.map()` or `arguments.filter()`. The only property you have is `length`.

Another limitation is that fat-arrow functions don't have `arguments` object available. In case you would use arguments in arrow function, it would refer to the arguments of the enclosing function.

## Rest Parameters
Fortunately, since ES6, the `arguments` object is no longer the only way how to handle variable parameters count. ES6 introduced a concept called `rest parameters`. 

What it means is that you can put `...` before the last parameter in the function. 

```javascript
function doSomething(first, second, ...rest) {
    // do something cool
}
```

Now, in the example above, you can access the first two named parameters as usual. However, all the other arguments passed to the function starting with third are automatically collected to an array called as the last parameter ("rest" here).

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

Unlike `arguments` object, rest parameters give you a real array so that you can use all the array-specific methods. Moreover, unlike `arguments`, they do work in arrow functions.

```javascript
let doSomething = (...rest) => {
    rest[0]; // Can access the first argument
};

let doSomething = () => {
    arguments[0]; // Arrow functions don't have arguments
};
```

In addition to the advantages above, there is one which makes the rest parameters superior to arguments. Rest parameters are part of the function signature. That means just from the function "header" you can immediately recognize that it uses rest parameters and therefore accepts a variable number of arguments. With `arguments` object, there is no such hint. That means you have to read the method body or comments to be able to tell that it accepts a variable number of parameters. What's also important is that IDEs can detect rest parameters in the signature and help you better.

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
What's a little bit confusing that the same three dots `...` used in JavaScript for the rest parameters are also used for an additional purpose. It is called `spread operator`. Its usage is almost the opposite of rest parameters. Instead of collecting multiple values in one array, it lets you expand existing one array (or other iterable) into multiple values. Let's look at various use cases.

### Function calls
Let's assume we have an array with three items and a function, which required three input parameters.

```javascript
let myArray = [1, 2, 3];

function doSomething(first, second, third) {
}
```

How do you pass three values in our array as a three separate arguments to the `doSomething()` function? A naive approach would be something like this:

```javascript
doSomething(myArray[0], myArray[1], myArray[2]);
```

It is obviously not very nice, difficult for a large number of parameters and works only if we know their number before. Let's try something else. Before spread operator, this was the way to call a function and pass an array as separate parameters:

```javascript
doSomething.apply(null, myArray);
```

The first parameter of the `apply` function is [what's supposed to be the value of this](https://www.vojtechruzicka.com/javascript-this-keyword/), the second one is the array we want to pass into the function as arguments.

With spread operator, you can achieve the same using:

```javascript
doSomething(...myArray);
// Is equivalent to 
doSomething(myArray[0], myArray[1], myArray[2]);
```

Note that it works with any iterable, not just arrays. For example, using the spread operator with string will disassemble it to the individual characters.

You can combine this with passing individual parameters. Unlike rest parameters, you can use multiple spread operators in the same function call and it does not need to be the last item.

```javascript
// All of this is possible
doSomething(1, ...myArray);
doSomething(1, ...myArray, 2);
doSomething(...myArray, ...otherArray);
doSomething(2, ...myArray, ...otherArray, 3, 7);
```

### Array literals
The spread operator can also be used when creating an array using the array literal. This way you can insert elements from other arrays (or iterables such as strings) at a specific location. 

```javascript
let firstArray = ["A", "B", "C"];
let secondArray = ["X", ...firstArray, "Y", "Z"];
// second array is [ "X", "A", "B", "C", "Y", "Z" ]
```

By using spread operator in an array literal, we did say: the second array will have `X` as the first element, then all the elements from the first array, no matter what is their number. And then the last two elements will be `Y` and `Z`.

#### Merging arrays
Of course, you can use spread operator in an array literal multiple times. This can be useful for example for merging multiple existing arrays, which would be more difficult using traditional imperative approach:

```javascript
let mergedArray = [...firstArray, ...secondArray, ...thirdArray];
```

#### Copying arrays
Sometimes it is also useful to create a copy of the existing array with the same items as the original. It is easy with the spread operator.

```javascript
var original = [1, 2, 3];
var copy = [...original];
```

### Object literals
Very similar to array literals is the usage of the spread operator in object creation with object literals. You can take properties of another object and include them in a new object created by object literal. This feature is available since ES2018.

```javascript
let firstObject = {a: 1, b: 2};

let secondObject = {...firstObject, c: 3, d: 4};

console.log(secondObject); // { a: 1, b: 2, c: 3, d: 4 }
```

Be aware that spread takes only own (not inherited) and enumerable properties of an object, other properties are ignored.

#### Shallow copy
The use cases are pretty much same as with arrays. You can also merge and clone objects. 

```javascript
let clone = {...original};
```

This can be a nice alternative to cloning objects using `Object.assign()`.  Note that it is a shallow copy. A new object is created, but the cloned properties are still the original.

#### Prototype lost
When cloning an object using the approach above, be aware that the prototype of the original object is not preserved. It just copies properties of the object and creates a brand new object using object literal, which has a prototype of `Object.prototype`.

#### Property conflicts 
What happens though when you introduce property with the spread operator which already exists in the object? This does not result in an error. If there are multiple object properties with the same name and different values, the latest one wins.

```javascript
let firstObject = {a: 1};
let secondObject = {a: 2};

let mergedObject = {...firstObject, ...secondObject};
// a: 2 is after a: 1 so it wins
console.log(mergedObject); // { a: 2 }
```

#### Updating immutable objects
The behavior where the later declared property with the same name wins can be utilized when updating immutable objects. When you're working with immutable objects or don't want to directly mutate objects, you can use spread operator to create a new object as an updated variant of the original object.

```javascipt
let original = {
      someProperty: "oldValue", 
      someOtherProperty: 42
    };

let updated = {...original, someProperty: "newValue"};
// updated is now { someProperty: "newValue", someOtherProperty: 42 }
```

Because the original object contains `someProperty` and it is then used once more, the last usage wins and the new value will be used. Original object will not be changed in any way and a new object will be created.


## Destructuring assignment
In short, the destructuring assignment is a way to assign properties of objects or values from arrays to distinct variables.

### Array destructuring
Let's assume we have an array with three items and we want to assign these items into three separate variables.

```javascript
let myArray = [1, 2, 3];
let a,b,c; // We want to assign a=1, b=2, c=3
```

Ths can be done easily by array destructuring assignment like this:

```javascript
let myArray = [1,2,3];
let [a, b, c] = myArray;

console.log(a); // 1
console.log(b); // 2
console.log(c); // 3
```

But how is this connected to the three dots syntax? Remember rest parameters? In the same way, all the remaining arguments are packed into an array. We can assign all the remaining items in the array into a new array variable:

```javascript
let myArray = [1, 2, 3, 4, 5];
let [a, b, c, ...d] = myArray;

console.log(a); // 1
console.log(b); // 2
console.log(c); // 3
console.log(d); // [4, 5]
```

### Object destructuring
Object destructuring is very similar to array destructuring. The name of each variable matches the name of a property from the destructured object.

```javascript
let myObject = { a: 1, b: 2, c: 3, d: 4};
let {b, d} = myObject;

console.log(b); // 2
console.log(d); // 4
```

And similar to arrays, you can also use `...` to collect all the remaining properties, which were not assigned to a variable to a brand new object:

```javascript
let myObject = { a: 1, b: 2, c: 3, d: 4};
let {b, d, ...remaining} = myObject;

console.log(b); // 2
console.log(d); // 4
console.log(remaining); // { a: 1, c: 3 }
```