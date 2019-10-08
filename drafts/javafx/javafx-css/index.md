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

## CSS in JavaFx

### Selectors

### Properties

### Pseudo classes

### Custom pseudo classes 

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