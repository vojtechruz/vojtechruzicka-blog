---
title: 'JavaFX Tutorial: CSS Styling'
date: "2019-10-10T22:12:03.284Z"
tags: ["Java", "JavaFX"]
path: '/javafx-css'
featuredImage: './css.jpg'
disqusArticleIdentifier: '99039 http://vojtechruzicka.com/?p=99039'
excerpt: 'How to style JavaFX components using good old CSS.'
---

![CSS In JavaFX](./css.jpg)

How to style JavaFX components using good old CSS.

<!--TODO remove this after they fix gatsby-remark-series -->
<div class="series-table-of-content">
  <div>All posts in the JavaFX series</div>
  <ol>
    <li><a href="/javafx-getting-started">JavaFX Tutorial: Getting started</a></li>
    <li><a href="/javafx-hello-world">JavaFX Tutorial: Hello world</a></li>
    <li><a href="/javafx-fxml-scene-builder">JavaFX Tutorial: FXML and SceneBuilder</a></li>
    <li><a href="/javafx-layouts-basic">JavaFX Tutorial: Basic layouts</a></li>
    <li><a href="/javafx-layouts-advanced">JavaFX Tutorial: Advanced layouts</a></li>
    <li class="series-current">JavaFX Tutorial: CSS Styling</li>
  </ol>
</div>

## Separating visuals
In the previous [article about FXML](/javafx-fxml-scene-builder), we learned how JavaFX achieves clean separation of concerns by dividing the user interface code into two parts. Components and their properties are declared in a FXML file, while the interaction logic is neatly separated in a controller.

Now there is a third part on top of this. FXML manages only what components are in your app, their properties and how they are nested. It does not define visuals of the component though. That is - fonts, colors, backgrounds, paddings. To be honest, you can achieve it in FXML but you shouldn't. Instead, visuals should be clearly separated in CSS stylesheets.

This way your styling is independent and can be easily replaced or changed without affecting the rest of the application. You can easily even have multiple themes, which you can switch on demand.

## CSS
You probably know CSS (Cascading Style Sheets) from the web, where it is used to style HTML pages.

In JavaFX, this is very similar, although JavaFX uses a set of its own custom properties.

Let's see an example:

```css
.button {
    -fx-font-size: 15px;
}
```

There are two essential concepts here. The first one is selector. That's `.button`. This determines to each componets the styling should be applied. There it is for ALL the buttons.

The second part are actual styling properties, which will be applied to all the components, which match our selector. Properties are everything inside the curly braces.

Each property has a specific value. In our example we have property `-fx-font-size`, which means how big the text will be. The value is 15px here but could be anything else we would desire.

To sum it up - we created a rule which says - all the buttons everywhere should have text of size 15px.

## Selectors
Now let's take a closer look on how selectors work in JavaFX. It pretty much the same as in regular CSS.

### Class
Class in CSS represents multiple similar elements. For example buttons or checkboxes. A selector, which should apply to all of the elements of the same class starts with dot `.` followed directly by the class name. The convention is to separate individual words with comma `-`. The following selector applies to all the elements with class `label`.

```css
.label {
    // Some properties
}
```

#### Built-in classes
The good news is that all the built-in JavaFX components (such as Label or Button) have already a class assigned out of the box. Fo if you want to target all the labels in your app, you don't have to add any custom classes to each of your labels. Each label has by default `label` class.

It is easy to determine the class name from the component.
- Take name of the Java class of the component - eg. Label
- Make the name lower-case
- If it consists of multiple words, separate them by `-`

Some examples:
- Label → label
- CheckBox → check-box

When using such classes as selectors, don' forget to add `.`. That means selector for `label` class is `.label`.

#### Custom classes
If build-in classes are not enough, you can add your own custom classes to your components. You can have multiple classes separated by comma:

```xml
<Label styleClass="my-label,other-class">I am a simple label</Label>
```

Or in Java:

```java
Label label = new Label("I am a simple label");
label.getStyleClass().addAll("my-label", "other-class");
```

Adding classes this way does not remove the default class of the component (label in this case).

### ID
Another way of selecting components in CSS is to use component's ID. It is a unique identifier of a component. Unlike classes, which can be assigned to multiple components, ID should be unique in a scene.

While classes are using `.` before the name in their selctors, IDs are marked with `#`.

```css
#my-component {
  ...
}
```

In FXML, you can use `fx:id` to set the component's CSS id.

```xml
<Label fx:id="foo">I am a simple label</Label>
```

There is one caveat though. [This same ID is used to link to a component object declared in your controller with the same name](/javafx-fxml-scene-builder/#injecting-components-to-controller). Since the id and the name of the field in controller need to match, `fx:id` needs to respect Java's naming restriction for field names. Even though CSS naming convention dictates individual words sparated by `-`, it is an invalid character for JAva field names. For `fx:id` with multiple words, you need therefore to use a different naming convention such as CamelCase or use underscores.

```xml
<!--  This is not valid  -->
<Label fx:id="my-label">I am a simple label</Label>
<!--  This is valid  -->
<Label fx:id="my_label">I am a simple label</Label>
<Label fx:id="MyLabel">I am a simple label</Label>
```

In Java, you can just call `setId()` method on your component.

```java
Label label = new Label("I am a simple label");
label.setId("foo");
```

## Properties

## Pseudo classes

## Custom pseudo classes 

## Default stylesheet
Even if you don't provide any styles yourself, JavaFX application already has some visual styling. There is a default stylesheet, which is applied to every application. Is is called modena (since JavaFX 8, previously it used to be caspian).

This stylesheet can be found in:

```
jfxrt.jar\com\sun\javafx\scene\control\skin\modena\modena.css
```

Or you can check the file [directly here](modena.css). In the same directory there is a whole bunch of images used by the stylesheet.

This stylesheet provides the default styling but takes the lowest priority compared to other types of stylesheets, so you can easily override it.

## Scene stylesheet
In addition to the default stylesheet mentioned above, you can, of course, provide your own. The highest level on which you can apply styling is the whole scene. You can either provide that in your [FXML](/javafx-fxml-scene-builder):

```xml

```

Or in your Java code:

```java

```

## Parent stylesheet
In addition to having a stylesheet for a whole scene, sometimes it may be useful to have styling on layout level. That is - for an individual container such as VBox, HBox or GridPane. Common parent of all layouts is `Parent` class, which defines methods for handling stylesheets on layout level. These styles apply only for the components in the given layout, not for the whole scene. Layout level styling takes precedence over scene level styling.

```xml

```

```java

```

## Inline styles
So far we've covered only cases of assigning an external stylesheet to a whole scene or layout. But it is possible to set individual style properties on component level.

Here you don't have to bother with selector as all the properties are set to a specific component.

```xml

```

```java

```

Styling on component level takes precedence over both scene and parent (layout) styling.

### Why to avoid them
Styling on component level may be convenient but it is a quick and dirty solution. You give up the main advantage of CSS, which is separating styling from the styled components. You hardcode your visuals directly to the components now. You can no longer easily switch your stylesheets when needed, you cannot change themes. Moreover, you no longer have central single place where your styling is defined. When you need to change something across set of similar components, you need to modify each of the components individually instead of editing just one place in your external stylesheet. Inline styling components should be therefore avoided.

## Stylesheet priorities




<!--TODO remove this after they fix gatsby-remark-series -->
<div class="series-table-of-content">
  <div>All posts in the JavaFX series</div>
  <ol>
    <li><a href="/javafx-getting-started">JavaFX Tutorial: Getting started</a></li>
    <li><a href="/javafx-hello-world">JavaFX Tutorial: Hello world</a></li>
    <li><a href="/javafx-fxml-scene-builder">JavaFX Tutorial: FXML and SceneBuilder</a></li>
    <li><a href="/javafx-layouts-basic">JavaFX Tutorial: Basic layouts</a></li>
    <li><a href="/javafx-layouts-advanced">JavaFX Tutorial: Advanced layouts</a></li>
    <li class="series-current">JavaFX Tutorial: CSS Styling</li>
  </ol>
</div>