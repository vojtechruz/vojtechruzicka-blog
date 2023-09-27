---
title: 'BEM – Writing CSS using Block Element Modifier Methodology'
date: "2017-03-20T22:12:03.284Z"
tags: ['CSS']
path: '/bem-writing-css-using-block-element-modifier-methodology'
featuredImage: './bem.jpg'
excerpt: 'BEM is a lightweight front-end development methodology which makes your code more flexible, modular and reusable.'
---
![bem](./bem.jpg)

BEM is a lightweight front-end development methodology which makes your code more flexible, modular and reusable.

What is BEM?
------------

Block Element Modifier is not a framework, it is a methodology. It was originally introduced by Yandex. The Core of this methodology is a simple naming convention - the structure of the page is divided into three types of building blocks - blocks, elements and modifiers. These days people usually use just the HTML/CSS naming convention, but originally the methodology was much broader. It covers Javascript, project file structure and generation of HTML from BEM tree templates. This article focuses just on the HTML/CSS part.

### Block

A Block represents a standalone reusable entity, which usually contains other blocks and/or elements.

### Element

An Element is not a standalone entity and can be used only inside of a block. It is tied to its parent block and has no meaning on its own.

### Modifier

A Modifier is a flag, which is used on blocks and elements. It represents a state or variation of blocks and elements. With a modifier you can for example mark that element is disabled, smaller or larger than usual, selected, hovered etc.

Example
-------

![BEM](bem-block-element-modifier.png)

In the image above, blocks are marked by green, elements by red and modifiers by blue. You can see that elements are only inside blocks, not standalone. Both main navigation items and follow buttons make sense only within their respective blocks. Blocks, such as links, can be used on their own. You can see, that blocks can be nested - \"post-preview\" block contains several \"link\" blocks. Both of these block types can be used on their own. Modifiers add additional variants such as that some links are bigger (preview post heading), navigation item of current section is highlighted or social follow buttons are blue on mouse over.

Naming
------

All the HTML elements are marked just by class. In CSS, you can reference just class, no HTML tags, no IDs.

Blocks are named as usual by CSS class. For example - \"main-navigation\".

Element\'s class also contains the name of the block. Block name is first, then two underscores (\_\_) and then element\'s name. For example \"main-navigation\_\_navigation item\".

The Modifier is appended to the block\'s or element\'s name with two hyphens (\--). For example \"main-navigation\_\_navigation item\--active\" or \"link\--large\".

Note that there is no nesting. Every item contains all the necessary information - that is - element in its class name contains its parent block\'s name and even the modifier.

Advantages
----------

### Performance

When using BEM, all the CSS selector are flat. There are no descendant selectors (such as \".header .nav .nav-item\"), which are way more expensive to calculate. Because of that, the page should be rendered as fast as possible.

### Readability

When examining an element or a block, you get all the required information directly from the HTML element. You can immediately tell to which block the element belongs and which modifier it has. And you can immediately search for corresponding CSS block related to it. You don\'t need to investigate whether this element behaves differently based on the context in which it is present. No need to check the whole cascade for hidden dependencies.

### Selector Specificity

Because all the CSS selectors are flat and only \".class\" selector is used, everything is kept simple and there is no need to struggle with [selector specificity issues](https://css-tricks.com/specifics-on-css-specificity/).

### Flexibility

Because each block is completely independent, you can move them around without worrying that something would break up - e.g. styles getting screwed because the rule was taking into account moved block\'s parent or a specific position in the DOM.

Furthermore, you can safely duplicate a block, which was originally intended to be \"singleton\". BEM uses only classes, so you don\'t need to worry about any selector pointing to ID or that you will suddenly have multiple occurrences of the same ID on the page.

Because BEM uses only classes and does not allow any selectors tied to specific HTML tags (anchors, tables, \...), you can safely change tags without breaking anything. This gives you much more flexibility and freedom for refactoring. What\'s more, it gives you the confidence to refactor. Without it, large applications with a lot of  CSS tend to rot, because you can\'t be really sure that you will not break something with your changes without even noticing it.

### Unified naming

There is a methodology for the unified naming of blocks, elements and modifiers. It makes the communication among the team members much easier. With unique identifiers, you can point to specific parts of the page in a much simpler manner without ambiguity.

### Simplicity

While there are other approaches to HTML/CSS naming conventions and methodologies, this one is very simple. There are just three types of entities with a few simple rules and simple, unambiguous naming (block, element, modifier), which makes the terminology immediately obvious. It is very easy to learn and adopt this methodology, unlike some others.

BEM + SASS
----------

Using SASS CSS Preprocessor, you can achieve logical nesting of blocks and elements in you SCSS files, while generated output will be still flat. You can use the  \"&\" feature, which represents parent CSS selector when nesting.

```scss
.block {

    //Block specific CSS here

    &__element {

        //Element specific CSS here

        &--modifier {
            // Element with modifier specific CSS here
        }
    }
}
```

While this approach helps you to have better-structured CSS code, it has some disadvantages too. You cannot simply search your project for CSS class of an element or nested block, because it is constructed when compiling and is not present in your source SCSS in the same form as it is in your HTML. This makes navigating to corresponding SASS code harder, not to mention automatic renaming by your IDE when refactoring class names.

Alternatively, you can check [BEM-SASS library](https://github.com/jsng/bem-sass), which provides some mixins to make SASS integration easier.

Alternatives
------------

BEM is not the only CSS methodology out there. Examples of some other very popular ones are [Scalable and Modular Architecture for CSS (SMACSS)](https://smacss.com/) or [Object Oriented CSS](https://github.com/stubbornella/oocss/wiki).

Further Reading
---------------

-   [Official BEM Site](http://getbem.com/)
-   [A New Front-End Methodology: BEM](http://A%20New%20Front-End%20Methodology:%20BEM)
-   [The Evolution Of The BEM Methodology](https://www.smashingmagazine.com/2013/02/the-history-of-the-bem-methodology/)
