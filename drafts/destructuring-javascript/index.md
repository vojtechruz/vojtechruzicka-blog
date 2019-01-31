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

<div class="linked-post"><h4 class="front-post-title" style="margin-bottom: 0.375rem;"><a href="/spread-javascript/" style="box-shadow: none;">Javascript spread operator and rest parameters (...)</a></h4><small class="front-post-info"><span class="front-post-info-date">30 January, 2019</span><div class="post-tags"><ul><li><a href="/tags/javascript/">#Javascript</a></li></ul></div></small><div><a class="front-post-image" href="/spread-javascript/"><div class=" gatsby-image-wrapper" style="position: relative; overflow: hidden;"><div style="width: 100%; padding-bottom: 66.6667%;"></div><img src="data:image/jpeg;base64,/9j/2wBDABALDA4MChAODQ4SERATGCgaGBYWGDEjJR0oOjM9PDkzODdASFxOQERXRTc4UG1RV19iZ2hnPk1xeXBkeFxlZ2P/2wBDARESEhgVGC8aGi9jQjhCY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2P/wgARCAANABQDASIAAhEBAxEB/8QAFwAAAwEAAAAAAAAAAAAAAAAAAAIDBP/EABYBAQEBAAAAAAAAAAAAAAAAAAQCA//aAAwDAQACEAMQAAABemJSqqTJ0//EABwQAAEDBQAAAAAAAAAAAAAAAAIBERIAExQiMf/aAAgBAQABBQKy4Y+xpAlJWmb9r//EABYRAAMAAAAAAAAAAAAAAAAAAAIQEf/aAAgBAwEBPwGEv//EABYRAAMAAAAAAAAAAAAAAAAAAAEQEv/aAAgBAgEBPwESv//EABoQAAICAwAAAAAAAAAAAAAAAAARARIhMUH/2gAIAQEABj8Cs98FaBCeB2ljk//EABsQAAICAwEAAAAAAAAAAAAAAAERACExQWFx/9oACAEBAAE/IWCl4Qy+jkcmQVuZq4lWkwZdgknc/9oADAMBAAIAAwAAABDbz//EABcRAQEBAQAAAAAAAAAAAAAAAAEhABH/2gAIAQMBAT8QpHA8u//EABcRAQADAAAAAAAAAAAAAAAAAAEAESH/2gAIAQIBAT8QSNI1eT//xAAbEAEBAAMBAQEAAAAAAAAAAAABEQAhQTFRYf/aAAgBAQABPxBEh3Q5fuTCxFcfH53H0BIOmPU93fWczsp4ZXdtleuf/9k=" alt="" style="position: absolute; top: 0px; left: 0px; width: 100%; height: 100%; object-fit: cover; object-position: center center; opacity: 0; transition: opacity 0.5s ease 0.5s;"><picture><source srcset="/static/f6547ab18a756509edfeb8a49cb76826/680c3/spread.jpg 45w,
/static/f6547ab18a756509edfeb8a49cb76826/0b965/spread.jpg 90w,
/static/f6547ab18a756509edfeb8a49cb76826/cc2e6/spread.jpg 180w,
/static/f6547ab18a756509edfeb8a49cb76826/feef1/spread.jpg 270w,
/static/f6547ab18a756509edfeb8a49cb76826/1ee31/spread.jpg 360w,
/static/f6547ab18a756509edfeb8a49cb76826/e8e8f/spread.jpg 540w,
/static/f6547ab18a756509edfeb8a49cb76826/dcd67/spread.jpg 900w" sizes="(max-width: 180px) 100vw, 180px"><img alt="" src="/static/f6547ab18a756509edfeb8a49cb76826/cc2e6/spread.jpg" style="position: absolute; top: 0px; left: 0px; width: 100%; height: 100%; object-fit: cover; object-position: center center; opacity: 1; transition: opacity 0.5s ease 0s;"></picture><noscript><picture><source srcSet="/static/f6547ab18a756509edfeb8a49cb76826/680c3/spread.jpg 45w,
/static/f6547ab18a756509edfeb8a49cb76826/0b965/spread.jpg 90w,
/static/f6547ab18a756509edfeb8a49cb76826/cc2e6/spread.jpg 180w,
/static/f6547ab18a756509edfeb8a49cb76826/feef1/spread.jpg 270w,
/static/f6547ab18a756509edfeb8a49cb76826/1ee31/spread.jpg 360w,
/static/f6547ab18a756509edfeb8a49cb76826/e8e8f/spread.jpg 540w,
/static/f6547ab18a756509edfeb8a49cb76826/dcd67/spread.jpg 900w" sizes="(max-width: 180px) 100vw, 180px" /><img src="/static/f6547ab18a756509edfeb8a49cb76826/cc2e6/spread.jpg" alt="" style="position:absolute;top:0;left:0;transition:opacity 0.5s;transition-delay:0.5s;opacity:1;width:100%;height:100%;object-fit:cover;object-position:center"/></picture></noscript></div></a><span class="front-post-excerpt">What do three dots (...) mean in javascript? They can be used for various different purposes.</span></div></div>


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

That can be particularly useful when working with object property names, which are not valid variable names. For example, this is a valid object:

```javascript
{"my-property": 42}
```

But `my-property` is not a valid variable name. Fortunately, we can assign different variable name, which is valid using the approach above:

```javascript
// Not valid syntax: my-property is not valid variable name
// But it is valid object property name
let {my-property} = {"my-property": 42};

// But we can change my-property to valid variable name
let {"my-property": myProperty} = {"my-property": 42};
// Now MyProperty = 42
```

### Dynamic property names
When working with plain objects, you can access their properties by property name like `person.name` or `person["name"]. But you can also use variable in place of property name instead:

```javascript
let person = {name: "John", age: 42, hobby: "Javascript"};

let propertyKey;
if(something) {
    propertyKey = "age";
} else {
    propertyKey = "name";
}

let foo = person[propertyKey]; // foo = 42 or "John"
```

You can use similar approach when destructuring:

```javascript
let person = {name: "John", age: 42, hobby: "Javascript"};

let propertyKey;
if(something) {
    propertyKey = "age";
} else {
    propertyKey = "name";
}

let {[propertyKey]: foo} = person; // foo = 42 or "John"
```

### Usage in iteration
Destructuring can be useful when iterating over multiple objects. You can easily extract just the properties you are interested in:

```javascript
let persons = [{name: "John", age: 42, hobby: "Javascript"}, {name: "Jane", age: 24}];

for(let {name, age, hobby = "Unknown"} of persons) {
    console.log(name);
    console.log(age);
    console.log(hobby);
}
```

It is not only concise when accessing the current object's properties, but it allows you to easily define default values of missing properties.

### Assignment to existing variables
When destructuring arrays, it is not different whether you declare your variables and immediately assign to them or whether you assign to previously declared variables:

```javascript
// Declaration and assignment
let [foo, bar] = [1, 2];

// Declaration and assignment separately
let foo, bar;
[foo, bar] = [1, 2];
```

With objects it is different:

```javascript
// Declaration and assignment: perfectly fine
let {foo, bar} = {foo: 1, bar: 2};

//SyntaxError: Unexpected token =
let foo, bar;
{foo, bar} = {foo: 1, bar: 2};
```

What happened here? Curly braces in `{a, b}` get interpreted as declaration of block rather than object destructuring assignment. Fortunately you can wrap the assignment in regular braces to make it work:

```javascript
({foo, bar} = {foo: 1, bar: 2});
```

## Destructuring function parameters


<!--
https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment

https://codeburst.io/es6-destructuring-the-complete-guide-7f842d08b98f



-usage in loop
    https://javascript.info/destructuring-assignment  
- Computed object property names and destructuring
   - https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment
- object literal gotcha
    https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment
    Notes: The parentheses ( ... ) around the assignment statement are required when using object literal destructuring assignment without a declaration. 
>