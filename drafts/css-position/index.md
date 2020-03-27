---
title: 'TODO'
date: "2020-04-01T22:12:03.284Z"
tags: ["CSS"]
path: '/css-position'
featuredImage: './css-position.jpg'
disqusArticleIdentifier: 'TODO http://vojtechruzicka.com/?p=TODO'
excerpt: 'TODO'
---

![CSS Position](drafts/css-positions-position.jpg)


## Position property
Positioning elements with CSScan be tricky. There are various ways to achiveve the desired placement. One of them is `position` property.

Based on its value, the position of an element can be caluclated in different ways, such as relative to its normal position, relative to its parent or to the whole page.

The position property can have any of these values:

- static
- absolute
- relative
- fixed
- sticky

We'll cover details of these values a bit later.

## Placement properties
Position property on its own is not that useful. It only says how the position should be calculated. For example relative to the normal position of an element.

But we also need to define WHERE exactly the element should be placed, not only how. There are several properties we can use for that.

- top
- left
- right
- bottom

These define how much the element's position should be adjusted and in which direction.

## Position values
Now let's dig deeper into how different `position` values work.

### static
This is the default value, which will be used if you don't specify anything else.

Even though it is a default value, it can be sometimes useful to explicitly set it. For example, to override different position value, which is set elswhere.

Unlike with other `position` values, when using `static`, properties such as `top`, `left`, `bottom`, `right` or `z-index` have no effect.

### absolute

### fixed

### relative

<!-- TODO this can be replaced by simple url once there is support in the gatsby codepen plugin -->
<iframe height="400" scrolling="no" src="//codepen.io/vojtechruz/embed/preview/mdJamVb/?height=400&amp;theme-id=light&amp;default-tab="result" frameborder="no" allowtransparency="true" allowfullscreen="true" style="width: 100%;"></iframe>

### sticky

#### Browser Support 
The `sticky` value is [not universally supported](https://caniuse.com/#feat=css-sticky). 

![Sticky browser support](drafts/css-positionicky-support.png)

For example Internet Explored does not support it at all. With Safari, you can use it, but you need to use vendor specific prefixed variant `position: -webkit-sticky;`. Therefore for maximum compatibility, you should use both:

```css
position: sticky;
position: -webkit-sticky;
```

If you need to support IE as well, you can use a polyfill such as [StickyBits](https://github.com/yowainwright/stickybits) or [stickyfill](https://github.com/wilddeer/stickyfill).

## z-index
When working with `position` other than `static`, can easily be moved to position, where they overlap each other.

In such cases it is very useful to have control over the order of these elements. That is - which elements should be displayed in front and which in back.

Fortunately, this is quite easy with property called `z-index`. It controls position of your elements on the z-axis - that is which ones are in front of other elements and which ones are in the background.

You can use `z-index` like this:

```css
z-index: 1;
```

The elements with higher `z-index` are displayed in front of elements with lower `z-index`.

<!-- TODO this can be replaced by simple url once there is support in the gatsby codepen plugin -->
<iframe height="400" scrolling="no" src="//codepen.io/vojtechruz/embed/preview/abOPmwy/?height=400&amp;theme-id=light&amp;default-tab="result" frameborder="no" allowtransparency="true" allowfullscreen="true" style="width: 100%;"></iframe>

In the example you can see that you can also specify negative numbers, which will place these elements behind those with no `z-index` or index with value 0.


## Summary
TODO




<!-- TODO TODO inherit: the position value doesn’t cascade, so this can be used to specifically force it to, and inherit the positioning value from its parent. -->