---
title: 'Angular Tutorial 2: Building Blocks'
date: "2020-07-21T22:12:03.284Z"
tags: ['Angular']
path: '/angular/02-building-blocks'
featuredImage: './building-blocks.jpg'
disqusArticleIdentifier: 'TODO http://vojtechruzicka.com/?p=TODO'
excerpt: Let's learn about the basic building blocks of Angular - Components, Directives, Pipes, Services and Modules.
hidden: 'true'
---

![Angular Tutorial: Building Blocks](building-blocks.jpg)

This is the second article in the Angular Tutorial series. You can check the first one - [Angular Tutorial 1: Getting Started
](https://www.vojtechruzicka.com/angular-tutorial-getting-started)

<!--TODO remove this after they fix gatsby-remark-series -->
<div class="series-table-of-content">
  <div>All posts in the Angular Tutorial series</div>
  <ol>
    <li><a href="/angular/01-getting-started">Getting Started</a></li>
    <li class="series-current">Building Blocks</li>
  <li><a href="/angular/03-components">Components</a></li>
  <li><a href="/angular/04-data-binding">Data Binding</a></li>
  </ol>
</div>

## Building blocks
Before we dig deeper into individual features of Angular, let's take a step back and look at a bigger picture. Let's learn which are the basic building blocks of Angular application.

### Components
Components are the main building blocks of your application. A component is a piece of User Interface, which can be reused and nested in other components. Each component is self-sufficient. It encapsulates its internals and only exposes inputs, which it accepts and output events which can occur inside.

Each component consists of:
- HTML template (`app.component.html`) - this is HTML structure of each component. Can contain other components or regular HTML tags.
- Logic written in typescript (`app.component.ts`) - This is the logic of the copmponent, inputs, output events and its state.
- Styling (`app.component.scss`) - These are styles which define how the component looks. By default, these apply only to the given component, so you don't have to worry about CSS conflicts.
- Test file (`app.component.spec.ts`) - A set of unit tests to test the component in isolation.

For additional functionality, components can use other building blocks inside (which are described below), such as directives, services or pipes.

Breaking down your application to components allows you to reduce complexity and reuse code. Such application is also easier to maintain as your code is broken down into small independent pieces. Components are also easy to test in isolation and each component usually has its own unit test file.

### Services
Services contain your business logic and API calls. But wait, components also have their own logic in their Typescript files (such as `app.component.ts`). So how do you decide if your logic should be in a component or in a service? Components should usually contain only their UI logic, which is specific to that component. Gneral business logic should be in services. Services can be used in multiple components.

Another important aspect of services is Dependency Injection. You don't instantiate services yourself, but rather ask Angular for a service to be injected from the outside. This is much more flexible and allows you to modify the injected service based on the curent situation of inject differen service (which has the same interface) if needed.

### Directives
Directives don't have UI of their own, instead they add some additional logic to components or HTML tags. They are used inside components HTML templates and are used as HTML tag attributes. The following `*ngIf` directive says that the `div` tag should be present only if `isLoading` is true.

```html
<div *ngIf="isLoading">Loading...</div>
```

There is couple more built-in directives and you can create your own. Directives are useful for component and tag logic, which is often reused across multiple components, so it is better to have it separately rather than in each component.

### Pipes
Unlike component's the pipes don't have any visible user interface. Instead, they are used in your components to transform and manipulate data. Each pipe accepts some input, optionally some other parameters and produce some tranasformed output based on that. There are some built-in pipes such as:

- currency formatting
- date formatting
- decimal number formatting
- upper/lower case string transformation
- object to json string conversion

Of course you can write your own.

### Modules
Different building blocks such as components and services allow you to organize your app by breaking it down in smaller pieces. Modules are higher level of organization, which can contain other parts such as compoentns, services, directives or pipes. Modules are usually focues on grouping building blocks, which are focues on similar functionality or domain.

Modules can have dependencies on each other. A module can use some parts exposed by other module. Similar to components, modules offer good encapsulation as you can decide what should be publicly exposed and what is only for internal used of that particualr module.

Breaking down your application into multiple modules is a great way of ogranizing more complex applications.

## Putting it together

### index.html
Now when we know all the building blocks, we can look at how they all fit together. Let's use our application from the last post or you can simply generate a new application using `ng new`.

So what exactly happens when in between running `ng serve` and our app being displayed in the browser?

In the previous post, we already covered that `index.html` file is the file served to the browser initially.

```html
<!doctype html>
<html lang="en">
    <head>
      <meta charset="utf-8">
      <title>HelloAngular</title>
      <base href="/">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <link rel="icon" type="image/x-icon" href="favicon.ico">
    </head>
    <body>
      <app-root></app-root>
    </body>
</html>
```

Notice that `<app-root></app-root>` is not a standard tag. Instead, it identifies an Angular component, which should be displayed in its place. But how do you identify which component it should be?

Let's look at the `app.component.ts`:

```javascript {2}
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'My first Angular App';
}
```

The important part here is `selector: 'app-root'`, which matches the tag name we used:

```
index.html                app.component.ts
<app-root></app-root>  →  `selector: 'app-root'`
```

That's how Angular know which component to display instead of the tag `<app-root>`.

Of course, each component has three parts, which are used when rendering that particular component:
- app.component.html
- app.component.ts
- app.component.scss

### Bootstrapping
If you check again the `index.html` file, you'll notice that it contains our component's tag, however, it does not contain any scripts. How is then angular loaded and started when the browser downloads our HTML file?

Turns out that Angular CLI as a part of the build compiles all your typescript files and bundles them together with your libraries. Then it includes the resulting scripts in your `index.html` file. You can easily chac that by inspecting the source code of your app in the browser using `Right click → View page source`. 

<div class="msg-info">Be careful that just inspecting the page contents in dev tools won't work as it does not show the original source code but rather the actual contents of the DOM, which is manipulated by Angular at runtime</div>

```html {12-16}
<!doctype html>
<html lang="en">
    <head>
      <meta charset="utf-8">
      <title>HelloAngular</title>
      <base href="/">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <link rel="icon" type="image/x-icon" href="favicon.ico">
    </head>
    <body>
        <app-root></app-root>
        <script src="runtime.js" type="module"></script>
        <script src="polyfills.js" type="module"></script>
        <script src="styles.js" type="module"></script>
        <script src="vendor.js" type="module"></script>
        <script src="main.js" type="module"></script>
    </body>
</html>
```

So no we know we how our applicationjavascript code is included. But what is exactly executed at the startup?

The main entrypoint of the application is file called `main.ts`.

```javascript {6}
if (environment.production) {
  enableProdMode();
}

platformBrowserDynamic()
  .bootstrapModule(AppModule)
  .catch(err => console.error(err));
```

Notice the highlighten line. It specifies, which module should be started. In our case it is `AppModule`, which is described in `app.module.ts`.

```javascript {3,9}
@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
```

Note the following section, which is important when starting the application `bootstrap: [AppComponent]`. It defines which components should be visible to Angular when processing the `index.html` file. You can provide multiple components here, but usually the practice is to have one root components and the the other components nested in it. Such nested components don't have to be present in the `bootstrap` section.

## Summary
We covered basic building blocks of Angular applications:

- Components: reusable fragments of User Interface
- Services: provide business logic, which can be used by your components. Are injected using Dependency injection framework.
- Pipes: allow you to transform data
- Directives: add custom logic to your components or HTML tags
- Modules: organize your app by encapsulating related functionality into modules

We also leared how Angular applications are started:

- `index.html` is the main HTML file downloaded by the browser. Here you use your root component. All the scripts are included here.
- `main.ts` is the main entrypoint for Angular, which defines the starting module
- The starting module (here `app.module.ts`) defines or root component in the `bootstrap` section, so it is recognized by Angular in the `index.html`

## What's Next
In the next article in the series, we'll lear more about [Angular Components](/angular/03-components).

<!--TODO remove this after they fix gatsby-remark-series -->
<div class="series-table-of-content">
  <div>All posts in the Angular Tutorial series</div>
  <ol>
    <li><a href="/angular/01-getting-started">Getting Started</a></li>
    <li class="series-current">Building Blocks</li>
  <li><a href="/angular/03-components">Components</a></li>
  <li><a href="/angular/04-data-binding">Data Binding</a></li>
  </ol>
</div>