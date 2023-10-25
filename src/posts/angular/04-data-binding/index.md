---
title: 'Angular Tutorial 4: Data binding'
date: "2020-07-23T22:12:03.284Z"
tags: ['Angular']
path: '/angular/04-data-binding'
featuredImage: './data-binding.jpg'
excerpt: 'Data binding allows you to sync data automatically in and out of components and fire events to external listeners.'
hidden: 'true'
---

<PostHeader frontmatter={props.data.mdx.frontmatter} />

<!--TODO remove this after they fix gatsby-remark-series -->
<div class="series-table-of-content">
  <div>All posts in the Angular Tutorial series</div>
  <ol>
    <li><a href="/angular/01-getting-started">Getting Started</a></li>
    <li><a href="/angular/02-building-blocks">Building Blocks</a></li>
    <li><a href="/angular/03-components">Components</a></li>
    <li class="series-current">Data Binding</li>
    <li><a href="/angular/05-component-input-output">Component input and output</a></li>
  </ol>
</div>

## Data binding
Each component has its own HTML template and the corresponding Typescript file. The template is the view of the component. It defines what are the HTML contents of the component to be rendered. The typescript adds some state and behavior. In most cases, your HTML component is not static, you want to reflect what state and data you have in your typescript class. Data binding allows you to dynamically display your data in the template, react to the user events, and even set up two-way data synchronization between the template and the typescript component class.

## Interpolation
This is the simplest flavor of data binding. It allows you to display some data from your TS class in your HTML template. It is a one-way binding.

It is very easy to use. In your template, you can wrap any expression in a pair of double curly braces `{{}}`. Then the expression is resolved to string based on fields and methods in your typescript class. Let's look at an example.

```javascript{3,6}
@Component({
  selector: 'app-main',
  template: '<h1>{{title}}</h1>'
})
export class MainComponent {
  title = 'Hello world!'
}
```

In the template `{{title}}` is resolved to the `title` field of our `MainComponent` class, so the resulting HTML is `<h1>Hello world!</h1>`. Of course, this works in the same way if your template is in a separate file.

Properties are often good enough, but sometimes you need something more dynamic. You can bind to methods as well.

```typescript{3,7}
@Component({
  selector: 'app-main',
  template: '<h1>{{getTitle()}}</h1>'
})
export class MainComponent {
  
  getTitle() {
    ...
  }
}
```

But you don't necessarily need to use just fields or methods, you can use expressions such as:
- `{{ 5*7 }}`
- `{{ 'The result is: ' + getResult() }}`
- `{{someObject.someProperty}`
- `{{isReady ? 'Ready to go!' : 'Not ready yet'}}`

As you can see, it is even possible to use the ternary operator, although it may be cleaner and more readable to extract this expression to a separate method.

### Limitations
Although expressions you can use in this way are quite powerful, there are some limitations.

- You cannot use assignment (=, +=, ++, ...)
- Just a single expression allowed
- Bitwise operators are not supported
- No operators such as `new`, `instanceof`, `typeof`

In general, **the expression should not have any side effects**. You should not change any state. It is easier to follow this with simple expressions, because the direct assignment is not allowed anyway. But be careful not to have any side effects in methods you bind to.

This is important for Angular change detection. Also, because the change detection is executed very often, **expressions should be very simple and fast to execute**. Otherwise, it may negatively impact application performance and user experience. 

## Property binding
In HTML, you can modify certain elements by adding additional attributes.

```
<button disabled>Submit!</button>
```

Here we added the `disabled` attribute to a button, so it cannot be clicked. There are many more attributes like that, depending on the type of the HTML tag. The example above is not very useful as the button is permanently disabled. It would be much better if it was disabled based on some boolean condition. When such condition would change, the button's disabled property would change as well.

You can achieve this behavior with Angular property binding. If you wrap an attribute with a pair of square brackets `[]`, then you can bind its value to an expression.

```
<button [disabled]='isSubmitButtonDisabled'>Submit!</button>
```

Now the disabled state is bound to field `isSubmitButtonDisabled` in our component's class. Whether the button is disabled now depends on this value. It is updated whenever the value changes. You can bind to methods or more complicated expressions as with interpolation.

This is one-way binding, from the class to the template, Again, be aware of the limitations and keep your expressions simple and fast.

Note that property binding can also be used to bind to input parameters of components. We'll cover this in a separate article.

### Binding to DOM nodes
When a browser parses HTML, it creates a corresponding DOM node for each HTML tag, such as `<button>`. This property binding does not alter HTML, but rather binds directly to properties of DOM nodes.

This is important to keep in mind. Many HMTL tag attributes have corresponding DOM properties with the same name. However, it is not always the case. Some tag attributes don't have corresponding DOM node properties (such as aria attributes for accessibility) and vice versa.


## Event Binding
Interpolation covers data flow from the class to the template. What about the other direction, though? In your template, various events can be triggered. Such as button clicks or other user interaction. You need a way to be able to react to these events.

Fortunately, you can bind events of HTML elements (and components) from your template to some methods in your class. 

Let's try to react to a button click event. For event binding, you need to wrap the event name in parentheses, for example, `(click)`. Then you can specify an expression to be executed:

```
<button (click)='buttonClicked()'>Click me!</button>
```

In this case, whenever the `click` event occurs, the method `buttonClicked` will be called on our class. Here is the full example.

```javascript{3,7}
@Component({
  selector: 'app-main',
  template: "<button (click)='buttonClicked()'>Click me!</button>"
})
export class MainComponent {

  buttonClicked() {
    console.log("The button was clicked!")
  }
}
```

In theory, instead of calling method, you can directly have some expression such as `(click)='value = 12'`. However, it is a better practice not to have such logic in your template to keep it just a simple view. Your class should be instead responsible for business logic.

### Limitations
Unlike interpolation, event binding does allow side effects. That's the whole point of reacting to events. You can use assignments (although not `++`, `--`, or compound assignment such as `+=` or `-=`). You cannot still use bitwise operators. This applies to expressions directly in your HTML template. Of course, when calling a method of your TS class instead, you can use any valid Typescript in such method.

## Two-way binding
So far, we discussed one-way data binding. Either your class to its template or vice versa.

Such binding is less complex and faster, but sometimes you need full-fledged two-way binding. For example, you can have a form with some fields. Whenever the user changes some of these fields, your data in the TS class should be updated. But also, when you change that data in your class, the user should see the new data in their form.

Two-way data binding uses a combination of event binding `()` and property binding `[]` together `[()]`. It can be difficult to remember the order of brackets here, so you can instead remember that the brackets  `[()] `look like *banana in a box*. The logic behind this bracket combination is that `()` defines one-way binding from template to the class. Square brackets `[]` define one-way binding the other way around. Two-way binding is just a combination of these two concepts.

Now let's look at a specific example.

```typescript{5,8}
@Component({
  selector: 'app-main',
  template: `
    Enter your name:
    <input [(ngModel)]='name'>
})
export class MainComponent {
  name = ''
}
```

We have a field called `name` in our component and an input (a textbox for user to enter some string in). We bind the value of this input to our `name` field using `[(ngModel)]='name'`. Whenever a user enters some value, our `name` gets updated.

But this is not really two-way binding yet, right? Let's add a way to change the value from our class. We need a button, which clears the `name` whenever clicked. Because it is two-way binding, it does not only clear the `name` field, but also the value of our input.

```typescript{5,6,10,12,13,14}
@Component({
  selector: 'app-main',
  template: `
    Enter your name:
    <input [(ngModel)]='name'>
    <button (click)="clearName()">Clear name</button>`
})
export class MainComponent {

  name = ''

  clearName() {
    this.name = ''
  }
}
```

Nothing special here, we utilized event binding, which we already know how to use. Whenever the button is clicked, we call our new `clearName()` method.

<div class="msg-info">
When using two-way data binding with ngModel, you need to import FormsModule to your module (in the imports section).
</div>

## What we've learned
Angular data binding is an important concept, which makes your application dynamic. It allows real-time synchronization of data and events between your component's class and template.

We have four kinds of data binding:

Name | Syntax | Direction | Description
-----|--------|-----------|-------------
Interpolation | `{{}}` | Class → Template | Resolves expression to string. |
Property binding | `[]` | Class → Template | Binds an expression result to a property of DOM node or component input. |
Event binding | `()` | Template → Class | Executes expression when an event on a DOM node or component is triggered.
Two-way binding | `[()]` | Class ↔ Template | Synchronizes value between the class and the template. Requires `FormsModule`.


Be aware of certain limitations when using expressions in data binding. You cannot use certain features such as bitwise operators or assignment with interpolation. Your expressions should be simple and fast to resolve. With interpolation and property binding, there should be no side effects.

<!--TODO remove this after they fix gatsby-remark-series -->
<div class="series-table-of-content">
  <div>All posts in the Angular Tutorial series</div>
  <ol>
    <li><a href="/angular/01-getting-started">Getting Started</a></li>
    <li><a href="/angular/02-building-blocks">Building Blocks</a></li>
    <li><a href="/angular/03-components">Components</a></li>
    <li class="series-current">Data Binding</li>
    <li><a href="/angular/05-component-input-output">Component input and output</a></li>
  </ol>
</div>
