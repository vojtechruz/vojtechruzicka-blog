---
title: 'Javascript spread operator and rest parameters (...)'
date: "2019-01-30T22:12:03.284Z"
tags: ['Javascript']
path: '/spread-javascript'
featuredImage: './spread.jpg'
excerpt: 'What do three dots (...) mean in javascript? They can be used for various different purposes.'
---

<PostHeader frontmatter={props.data.mdx.frontmatter} />

## Variable number of parameters
Usually, when working with functions in JavaScript, there is a fixed number of parameters your function uses and supports. If you want to calculate the square root of a number using `Math.sqrt(x)` you always need just one parameter for input. Some functions may require more parameters. Others have more parameters, but you can safely omit last few optional ones. In any of these cases, all the parameters are declared as a part of the function signature:

```javascript
function doSomething(first, second, third) { 
    // Do something cool
}
```

However, what if the number of parameters is not known beforehand and can be pretty much anything?

For example, let's take `Math.min()` and `Math.max()`. It does work for any number of parameters no matter whether it is 0, 2 or 30.

```javascript
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
Note that the `arguments` object is array-like, not a full-fledged array. That means that useful methods, which arrays have are not available. You cannot use methods such as `arguments.sort()`, `arguments.map()` or `arguments.filter()`. The only property you have is `length`.

Another limitation is that fat-arrow functions don't have `arguments` object available. In case you would use arguments in arrow function, it would refer to the arguments of the enclosing function (if there is one).

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

In addition to the advantages above, there is one which makes the rest parameters superior to arguments. Rest parameters are part of the function signature. That means that just from the function "header" you can immediately recognize that it uses rest parameters and therefore accepts variable number of arguments. With `arguments` object, there is no such hint. That means you have to read the method body or comments to be able to tell that it accepts a variable number of parameters. What's also important is that IDEs can detect rest parameters in the signature and help you better.

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
What's a little bit confusing is that the same three dots `...` used in JavaScript for the rest parameters are also used for an additional purpose. It is called `spread operator`. Its usage is almost the opposite of rest parameters. Instead of collecting multiple values in one array, it lets you expand one existing array (or other iterable) into multiple values. Let's look at various use cases.

### Function calls
Let's assume we have an array with three items and a function, which requires three input parameters.

```javascript
let myArray = [1, 2, 3];

function doSomething(first, second, third) {
}
```

How do you pass three values in our array as a three separate arguments to the `doSomething()` function? A naive approach would be something like this:

```javascript
doSomething(myArray[0], myArray[1], myArray[2]);
```

It is obviously not very nice, difficult for a large number of parameters and works only if we know their number before. Let's try something else. Before spread operator, this used to be the way to call a function and pass an array as separate parameters:

```javascript
doSomething.apply(null, myArray);
```

The first parameter of the `apply` function is [what's supposed to be the value of "this"](https://www.vojtechruzicka.com/javascript-this-keyword/). The second one is the array we want to pass into the function as arguments.

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
The spread operator can also be used when creating an array using an array literal. This way you can insert elements from other arrays (or iterables such as strings) at a specific location. 

```javascript
let firstArray = ["A", "B", "C"];
let secondArray = ["X", ...firstArray, "Y", "Z"];
// second array is [ "X", "A", "B", "C", "Y", "Z" ]
```

By using spread operator in an array literal, we say: the second array should have `X` as the first element, then all the elements from the `firstArray`, no matter what is their number. And then the last two elements will be `Y` and `Z`.

#### Merging arrays
Of course, you can use spread operator in an array literal multiple times. This can be useful for example for merging several existing arrays, which would be more difficult using traditional imperative approach:

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
Very similar to array literals is the usage of the spread operator in object creation with object literals. You can take properties of another object and include them in a new object created by an object literal. This feature is available since ES2018.

```javascript
let firstObject = {a: 1, b: 2};

let secondObject = {...firstObject, c: 3, d: 4};

console.log(secondObject); // { a: 1, b: 2, c: 3, d: 4 }
```

Be aware that spread takes only own (not inherited) and enumerable properties of an object, other properties are ignored.

#### Shallow copy
The use cases are pretty much the same as with arrays. You can also merge and clone objects. 

```javascript
let clone = {...original};
```

This can be a nice alternative to cloning objects using `Object.assign()`.  Note that it is a shallow copy. A new object is created, but the cloned properties are still the original and not clones.

#### Prototype lost
When cloning an object using the approach above, be aware that the prototype of the original object is not preserved. It just copies properties of the source object and creates a brand new object using object literal, which has a prototype of `Object.prototype`.

#### Property conflicts 
What happens though when you introduce a property with the spread operator which already exists in the object? This does not result in an error. If there are multiple object properties with the same name and different values, the latest one wins.

```javascript
let firstObject = {a: 1};
let secondObject = {a: 2};

let mergedObject = {...firstObject, ...secondObject};
// a: 2 is after a: 1 so it wins
console.log(mergedObject); // { a: 2 }
```

#### Updating immutable objects
The behavior where the later declared property with the same name wins can be utilized when updating immutable objects. When you're working with immutable objects or don't want to directly mutate objects, you can use spread operator to create a new object as an updated variant of the original.

```javascript
let original = {
      someProperty: "oldValue", 
      someOtherProperty: 42
    };

let updated = {...original, someProperty: "newValue"};
// updated is now { someProperty: "newValue", someOtherProperty: 42 }
```

Because the original object contains `someProperty` and it is then used once more, the last usage wins and the new value is used. Original object is not changed in any way and a new object is created.


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

But how is this connected to the three dots syntax? Remember rest parameters? In the same way as all the remaining arguments are packed into an array, we can assign all the remaining items in the array destructuring assignment into a new array variable:

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

## Destructuring deep dive
For detailed explanation of destructuring please check the following article:

<div class="linked-article"><h4 class="front-post-title" style="margin-bottom: 0.375rem;"><a href="/destructuring-javascript/" style="box-shadow: none;">Destructuring objects and arrays in JavaScript</a></h4><small class="front-post-info"><span class="front-post-info-date">03 February, 2019</span><div class="post-tags"><ul><li><a href="/tags/javascript/">#Javascript</a></li></ul></div></small><div><a class="front-post-image" href="/destructuring-javascript/"><div class=" gatsby-image-wrapper" style="position: relative; overflow: hidden;"><div style="width: 100%; padding-bottom: 66.7778%;"></div><img src="data:image/jpeg;base64,/9j/2wBDABALDA4MChAODQ4SERATGCgaGBYWGDEjJR0oOjM9PDkzODdASFxOQERXRTc4UG1RV19iZ2hnPk1xeXBkeFxlZ2P/2wBDARESEhgVGC8aGi9jQjhCY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2P/wgARCAANABQDASIAAhEBAxEB/8QAGQAAAgMBAAAAAAAAAAAAAAAAAAIBAwQF/8QAFgEBAQEAAAAAAAAAAAAAAAAAAgAB/9oADAMBAAIQAxAAAAHmXZ5LUcs//8QAGRABAQEAAwAAAAAAAAAAAAAAAQIAEyEx/9oACAEBAAEFAvGYHUyM9blcG//EABQRAQAAAAAAAAAAAAAAAAAAABD/2gAIAQMBAT8BP//EABQRAQAAAAAAAAAAAAAAAAAAABD/2gAIAQIBAT8BP//EABoQAAIDAQEAAAAAAAAAAAAAAAABERIhEFH/2gAIAQEABj8Cr4Q0ZpZELOf/xAAaEAEBAQEBAQEAAAAAAAAAAAABEQAhQWEx/9oACAEBAAE/IbXgpnfzEcB6zugL+rkhgfJlyJfuEN//2gAMAwEAAgADAAAAELMv/8QAFxEBAQEBAAAAAAAAAAAAAAAAAQARIf/aAAgBAwEBPxAQO2X/xAAXEQEBAQEAAAAAAAAAAAAAAAABABEx/9oACAECAQE/EEXlt//EABsQAQADAQEBAQAAAAAAAAAAAAEAESExYUFR/9oACAEBAAE/EFjlCpar0H7DhCcOfZhPDchfPIJm1dioo4Yi1/MvkKiX7P/Z" alt="" style="position: absolute; top: 0px; left: 0px; width: 100%; height: 100%; object-fit: cover; object-position: center center; opacity: 0;"><picture><img sizes="(max-width: 180px) 100vw, 180px" srcset="/linked/destructuring-javascript/5e4a3/destructuring.jpg 45w,
/linked/destructuring-javascript/e451c/destructuring.jpg 90w,
/linked/destructuring-javascript/29fd0/destructuring.jpg 180w,
/linked/destructuring-javascript/b3ebb/destructuring.jpg 270w,
/linked/destructuring-javascript/8841e/destructuring.jpg 360w,
/linked/destructuring-javascript/95b54/destructuring.jpg 540w,
/linked/destructuring-javascript/2b1a3/destructuring.jpg 900w" src="/linked/destructuring-javascript/29fd0/destructuring.jpg" alt="" style="position: absolute; top: 0px; left: 0px; width: 100%; height: 100%; object-fit: cover; object-position: center center; opacity: 1; transition: none 0s ease 0s;"></picture><noscript><picture><img sizes="(max-width: 180px) 100vw, 180px" srcset="/linked/destructuring-javascript/5e4a3/destructuring.jpg 45w,
/linked/destructuring-javascript/e451c/destructuring.jpg 90w,
/linked/destructuring-javascript/29fd0/destructuring.jpg 180w,
/linked/destructuring-javascript/b3ebb/destructuring.jpg 270w,
/linked/destructuring-javascript/8841e/destructuring.jpg 360w,
/linked/destructuring-javascript/95b54/destructuring.jpg 540w,
/linked/destructuring-javascript/2b1a3/destructuring.jpg 900w" src="/linked/destructuring-javascript/29fd0/destructuring.jpg" alt="" style="position:absolute;top:0;left:0;opacity:1;width:100%;height:100%;object-fit:cover;object-position:center"/></picture></noscript></div></a><span class="front-post-excerpt">Destructuring allows you to assign items from arrays or properties of objects into single variables easily.</span></div></div>

## Conclusion
Three dots in JS can mean multiple things based on context. 

You can use it as rest parameters in a function, so you are able to work easily with variable number of arguments. You can use a similar approach with array or object destructuring assignment, where the rest of the items, are nicely packed into an array. 

The spread operator can be used to unpack an iterable into individual items, which can be used when creating objects, arrays or calling functions.