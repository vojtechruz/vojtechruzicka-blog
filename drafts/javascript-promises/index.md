---
title: ''
date: ""
tags: ["Javascript"]
path: '/javascript-promises'
featuredImage: './promise.jpg'
disqusArticleIdentifier: 'TODO http://vojtechruzicka.com/?p=TODO'
excerpt: ''
---

![Promises](./promise.jpg)



## Sycnhronous execution
Traditionally, javascript code is executed synchronously. The code is executed from top to bottom, line by line. The execution flow continues to the next line only when the exectuion of the previous line is fully finished.

```javascript
console.log("First");
console.log("Second");
console.log("Third");
// First, second, third
```

## Callbacks
However, the model above is not suitable in all cases. Imagine you have a page loaded and need to fetch some date from the backend. If you do did this synchronously, all the execution would be suspended until you receive your data. And this could take quite some time. In the meantime the page would be unresponsive.

In this case it would be much more convenient to call the server, but continue the execution and react the the result asynchronously whenever the response from your server arrives.

The common traditional approach would be to provide a function, which should be invoked once the server call is done. Such function is called a "callback function".

In other words, you can say: Ok, call the server, I don't care how long it takes, but when you're done, please let me know by calling back this function I provide you with.

You can do this because in Javascript function are first-class objects. You can sttore functions in variables or pass them as parameters to other functions.

```javascript
// server url to be requested
const targetUrl = "http://www.example.com/persons";
// Callback function to be called when done
const callbackFunction = function() {
  console.log("All Done!")  
};

// Call the backend
httpClient.get(targetUrl, callbackFunction);
// Now continue and don't wait for response
// Instead, callbackFunction will be executed for us
// When the call is finished
```

There are many other cases when callbacks can be useful. You can define a callback function to be invoked once a certain time interval passes:

```javascript
const intervalInMilliseconds = 1000;
setTimeout(function() {
  console.log("One second passed!");
}, intervalInMilliseconds);
```

Other common use cas would be reacting to certain events such as button click, document loaded and so on. You don't know or care when they happen, you just want to be notified by a callback function when the event occurs.

## Callbacks and this
Be careful when using `this` keyword with callbacks. If you are using a function, which is a property of an object,`this` will refer to the parent obect. But when you provide it as a callback, it will no longer point to its object, which can lead to unexpected behavior. To lear in detail about issues with `this`, check the following article:

<div class="linked-post"><h4 class="front-post-title" style="margin-bottom:0.375rem"><a style="box-shadow:none" href="/javascript-this-keyword/">Javascript: Uncovering mysteries of ‘this’ keyword</a></h4><small class="front-post-info"><span class="front-post-info-date">13 February, 2018</span><div class="post-tags"><ul><li><a href="/tags/javascript/">#<!-- -->Javascript</a></li></ul></div></small><div><a class="front-post-image" href="/javascript-this-keyword/"><div class=" gatsby-image-wrapper" style="position:relative;overflow:hidden"><div style="width:100%;padding-bottom:56.22222222222222%"></div><img src="data:image/jpeg;base64,/9j/2wBDABALDA4MChAODQ4SERATGCgaGBYWGDEjJR0oOjM9PDkzODdASFxOQERXRTc4UG1RV19iZ2hnPk1xeXBkeFxlZ2P/2wBDARESEhgVGC8aGi9jQjhCY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2P/wgARCAALABQDASIAAhEBAxEB/8QAGAAAAgMAAAAAAAAAAAAAAAAAAAIBAwX/xAAUAQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIQAxAAAAHJKmIFD//EABkQAAIDAQAAAAAAAAAAAAAAAAECAAMSEP/aAAgBAQABBQKtdMwGoO//xAAUEQEAAAAAAAAAAAAAAAAAAAAQ/9oACAEDAQE/AT//xAAUEQEAAAAAAAAAAAAAAAAAAAAQ/9oACAECAQE/AT//xAAXEAADAQAAAAAAAAAAAAAAAAAAAREg/9oACAEBAAY/AhzP/8QAGhABAAMAAwAAAAAAAAAAAAAAAQARIRBBgf/aAAgBAQABPyExFA7WaVZeRa4XnsZ//9oADAMBAAIAAwAAABBgz//EABQRAQAAAAAAAAAAAAAAAAAAABD/2gAIAQMBAT8QP//EABQRAQAAAAAAAAAAAAAAAAAAABD/2gAIAQIBAT8QP//EABsQAAICAwEAAAAAAAAAAAAAAAERACExQVGh/9oACAEBAAE/EBK2WRSgTraJrUYQxDOHTEZr68hXP//Z" alt="" style="position: absolute; top: 0px; left: 0px; width: 100%; height: 100%; object-fit: cover; object-position: center center; opacity: 0; transition: opacity 0.5s ease 0.5s;"><picture><source srcset="/static/d37337a1d2b6606b7c5ec2b9be46d6dc/680c3/javascript-this.jpg 45w,
/static/d37337a1d2b6606b7c5ec2b9be46d6dc/0b965/javascript-this.jpg 90w,
/static/d37337a1d2b6606b7c5ec2b9be46d6dc/cc2e6/javascript-this.jpg 180w,
/static/d37337a1d2b6606b7c5ec2b9be46d6dc/feef1/javascript-this.jpg 270w,
/static/d37337a1d2b6606b7c5ec2b9be46d6dc/1ee31/javascript-this.jpg 360w,
/static/d37337a1d2b6606b7c5ec2b9be46d6dc/e8e8f/javascript-this.jpg 540w,
/static/d37337a1d2b6606b7c5ec2b9be46d6dc/dcd67/javascript-this.jpg 900w" sizes="(max-width: 180px) 100vw, 180px"><img alt="" src="/static/d37337a1d2b6606b7c5ec2b9be46d6dc/cc2e6/javascript-this.jpg" style="position: absolute; top: 0px; left: 0px; width: 100%; height: 100%; object-fit: cover; object-position: center center; opacity: 1; transition: opacity 0.5s ease 0s;"></picture><noscript><picture><source srcSet="/static/d37337a1d2b6606b7c5ec2b9be46d6dc/680c3/javascript-this.jpg 45w,
/static/d37337a1d2b6606b7c5ec2b9be46d6dc/0b965/javascript-this.jpg 90w,
/static/d37337a1d2b6606b7c5ec2b9be46d6dc/cc2e6/javascript-this.jpg 180w,
/static/d37337a1d2b6606b7c5ec2b9be46d6dc/feef1/javascript-this.jpg 270w,
/static/d37337a1d2b6606b7c5ec2b9be46d6dc/1ee31/javascript-this.jpg 360w,
/static/d37337a1d2b6606b7c5ec2b9be46d6dc/e8e8f/javascript-this.jpg 540w,
/static/d37337a1d2b6606b7c5ec2b9be46d6dc/dcd67/javascript-this.jpg 900w" sizes="(max-width: 180px) 100vw, 180px" /><img src="/static/d37337a1d2b6606b7c5ec2b9be46d6dc/cc2e6/javascript-this.jpg" alt="" style="position:absolute;top:0;left:0;transition:opacity 0.5s;transition-delay:0.5s;opacity:1;width:100%;height:100%;object-fit:cover;object-position:center"/></picture></noscript></div></a><span class="front-post-excerpt">This is a very straightforward concept in other languages. Not so in javascript. It can point to pretty much anything depending on the context.</span></div></div>

## Promises
Promises offer an alternative approach to callbacks when working with asynchronous calls.

A function can retrun promise object, which wraps the async call an can be used to define what should be done when the promise is finally successfully resolved. The promise object contains `then` method, whcih can be used to define a function, which should be called once the promise succesfully finishes. Lets look at the previous example using promises:

```javascript
// server url to be requested
const targetUrl = "http://www.example.com/persons";
// Callback function to be called when successfuly finished
const callbackFunction = function() {
  console.log("All Done!")  
};

// Call the backend. httpClient.get returns a promise
httpClient.get(targetUrl).then(callbackFunction);
```

So far it is quite similar to callbacks. Of course, something can go terribly wrong when calling the server. If your url is not valid, you can get 404 not found, or there can be 500 internal server error. Fortunately, in addition to what happens when everything goes well, you can define another function which should be called in case the promise is not succesfull. You can use `catch()` and chain it after then:

```javascript
// server url to be requested
const targetUrl = "http://www.example.com/persons";
// Callback function to be called successfuly finished
const successFunction = function() {
  console.log("All Done!")  
};

// Function to be called when there is a failure
const failureFunction = function() {
  console.log("Oh dear! Something went terribly wrong!")  
};

httpClient.get(targetUrl).then(successFunction).catch(failureFunction);
```

In case the promise resolved succesfully as expected, the function in `then()` will be called, otherwise, when there is an error, function in `catch()` will be called.

## Promise state
Each promise can be in one of the following states:

- **settled**: Promise is finished, either fulfilled or rejected
- **rejected**: The action was not succesfull, promise failed `catch` function is was called if present. The promise is finished.
- **fulfilled**: Promise action was succesfull, `then` function was called. The promise is finished.
- **pending**: The promise is not finished, still in progress.

## Creating promises
You can easily create a promise object by calling `new Promise()` and supplying a single function as an input parameter. That function should have two parameters - resolve and reject.

```javascript
new Promise(function(resolve, reject) {
  ...
});
```

You should call `resolve()` and supply a return value when the promise is fulfilled. In case something goes wrong, you call `reject()` instead and you can supply an error describing what happened.

```javascript
new Promise(function(resolve, reject) {
  if(everithingOk) {
      resolve("It works!");
  } else {
      reject(new Error("Something went horribly wrong!"))
  }
});
```

A promise constructed in this way should be returned from your function:

```javascript
function myFunctionUsingPromises(input) {
    return new Promise(function(resolve, reject) {
             if(input === 42) {
                 resolve("It works!");
             } else {
                 reject(new Error("Something went horribly wrong!"))
             }
           });
}
```

Chaining promises
Error handling