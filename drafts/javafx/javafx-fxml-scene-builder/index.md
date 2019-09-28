---
title: 'JavaFX Tutorial: Getting started'
date: "2019-09-20T22:12:03.284Z"
tags: ["Java", "JavaFX"]
path: '/javafx-fxml-scene-builder'
featuredImage: './scene-builder.jpg'
disqusArticleIdentifier: 'TODO http://vojtechruzicka.com/?p=TODO'
excerpt: ''
---

![FXML and Scene Builder](scene-builder.jpg)

## The traditional way
In the previous article, we created a simple Hello World application. TODO LINK. Just a quick refresher - the code looked like this.

```java
@Override
public void start(Stage primaryStage) throws Exception {
    primaryStage.setTitle("Hello world Application");
    primaryStage.setWidth(300);
    primaryStage.setHeight(200);

    InputStream iconStream = getClass().getResourceAsStream("/icon.png");
    Image image = new Image(iconStream);
    primaryStage.getIcons().add(image);

    Label helloWorldLabel = new Label("Hello world!");
    helloWorldLabel.setAlignment(Pos.CENTER);
    Scene primaryScene = new Scene(helloWorldLabel);
    primaryStage.setScene(primaryScene);

    primaryStage.show();
}
```

You can see that the whole application is assembled in java code. Now, this is a very simple example, but as your appl get complex and you introduce multiple levels of nested layouts and many components, the resulting code can be very hard to read. But that's not all - the same class has code, which is responsible both for structure, visuals and behavior.

Seems like the class does not clearly have a single responsibility. Compare this, for example with web front-end, where each page has neatly spearated concerns:
- HTML is structure
- CSS is visuals
- JavaScript is behavior

## Introducing FMXL
Alright, having all code in one place is not a good idea. You need to structure it somehow so it is easier to understand and more manageable.

There's acctually a lot of design patterns for that. Usually you would end up with a variatiton of Model-View-Whatever - that is something like Mode View Controller, Model View Presenter or Model View ViewModel.

You can spend hours discussing pros and cons of different variants - let's ot do this here. What's more important is that with Java Fx, you can use any of them.

It's because in addition to the procedural construction of your UI, you can use declarative XML markup instead.

Turns out XML's hierarchical structure is a great way to describe hierarchy of components in the user interface. HTML works pretty well, right?

This XML format specific to JavaFX is called FXML. Here you can define all your components and their properties and link it with a Controller, which is responsible for managing interactions.

## Loading the FXML file
So how can we change our startup method to work with XML instead?

```java

```

## Creating the FXML file

### Namespace

### Imports

### Controller



```

```

## Scene Builder

### Standalone

### IntelliJ IDEA integration