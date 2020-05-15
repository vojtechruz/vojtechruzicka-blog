---
title: 'Angular Tutorial 2: Building Blocks'
date: "2018-12-21T22:12:03.284Z"
tags: ['Angular']
path: '/angular-tutorial-building-blocks'
featuredImage: './building-blocks.jpg'
disqusArticleIdentifier: 'TODO http://vojtechruzicka.com/?p=TODO'
excerpt: ''
---

![Angular Tutorial: Building Blocks](building-blocks.jpg)

This is the second article in the Angular Tutorial series. You can check the first one - [Angular Tutorial 1: Getting Started
](https://www.vojtechruzicka.com/angular-tutorial-getting-started)

## Building blocks
Before we dig deeper into individual features of Angular, let's take a step back and look at a bigger picture. Let's learn which are the basic building blocks of Angular application.

### Components
- image of nesting components

### Services

### Directives

### Pipes

### Modules

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

- mapping from index to component name and module bootstrap
-image with component files arro to from index selector
- can i add multiple components to the index?