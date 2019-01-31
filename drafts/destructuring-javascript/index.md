---
title: 'TODO'
date: "2019-02-05T22:12:03.284Z"
tags: ['Javascript']
path: '/destructuring-javascript'
featuredImage: './destructuring.jpg'
disqusArticleIdentifier: '99019 http://vojtechruzicka.com/?p=99019'
excerpt: 'Destructuring allows you to to assign items from arrays or properties of objects into single variables easily.'
---

![Destructuring](destructuring.jpg)

## Destructuring assignment
Destructuring assignment allows you to assign items of arrays or properties of objects to separate variables. Let's look into more detail how this works.

## Array destructuring
Let's assume we have an array and we want to assign its contents into separate variables. Without destructuring, you would need to do something like this:

```javascript
let myArray = [1, 2, 3]; 
let a = myArray[0];
let b = myArray[1];
let c = myArray[2];
````

With array destructuring assignment, it is much easier:

```javascript
let myArray = [1, 2, 3];
let [a, b, c] = myArray; // a=1, b=2, c=3
````

Much better, right? First item from array gets assigned to the first variable, second item in the array to the second variable and so on.

In the example above, we declared a new variables and assigned to them, but you can use existing ones.

Of course you don't need to use all the items from the source array:

```javascript
let myArray = [1, 2, 3];
let [a, b] = myArray; // a=1, b=2
````

### Default values
On the other hand, if there are not enough items in the array, only some of the variables get assigned. There rest remains undefined as if you would declare a variable and not assign it.

```javascript
let myArray = [1];
let [a, b, c] = myArray; // a=1, b=undefined, c=undefined
````

you can provide default values to the variables in case there is not enough item, so they have some value as a fallback:

```javascript
let myArray = [1];
let [a=2, b=4, c=6] = myArray; // a=1, b=4, c=6
````

Because it is called destructuring, you might think that items are actually removed from the source array. This is, however, not the case, the source array remains unchanged. This applies also to destructuring objects.

### Ignoring items
If you want to skip certain items, you can do it like this:

```javascript
let myArray = [1, 2, 3];
let [a, , b] = myArray; // a=1, b=3
````

### Swapping variables
Traditionally, if you would want to swap values of two variables, you would need one temporary variable:

```javascript
temp = a;
a = b;
b = temp;
```

With destructuring, variable value swap is as easy as this:

```javascript
[x, y] = [y, x];
````

### Assigning the rest of the items
You can assign just a first few items as usual, but still keep all the unassigned items in a new array:

```javascript
let myArray = [1, 2, 3, 4, 5, 6];
let [a, b, ...others] = myArray; // a=1, b=2, others = [3, 4, 5, 6]
```

// TODO link to rest parameters article link


## Object destructuring
Object destructuring works in a similar way to array destructuring with a few distinctions.

```javascript
// Simple assignment
let john = {name: "John Doe", age: 42, gender: "Male"};
let {name, age} = john;

// Default values
let {name, age, favoriteColor = "Black" } = john; 

// Other unused properties assigned to a new object
let {name, age, ...others} = john;
```

### Changing variable names
Unlike arrays, where assignment is determined by order, here it is by variable name matching object's property name.

However, if you want, you can make the name different if you want:

```javascript
let john = {name: "John Doe", age: 42};
let {name: newName, age: newAge} = john;
// newName ="John Doe", newAge = 42
```


<!--
https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment

https://codeburst.io/es6-destructuring-the-complete-guide-7f842d08b98f

- destructuring assignment
    - array
    - object
- destricturing function params
- custom property names when object assignment
    - Invalid JavaScript identifier as a property name (https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment)
- link to spread article
-usage in loop
    https://javascript.info/destructuring-assignment  
- Computed object property names and destructuring
   - https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment
- object literal gotcha
    https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment
    Notes: The parentheses ( ... ) around the assignment statement are required when using object literal destructuring assignment without a declaration. 
>