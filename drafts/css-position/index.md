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


### relative
Relative position means that the element will be placed **relative to its original position in the page**. When you set just `position: relative;`, nothing will change. you also need to define how should the placement of the element change relative to its origina position. This can be achieved using `top`, `bottom`, `left` and `right` properties.

For example, `top: 20px;` means that the element will be moved **down** 20 pixels from its original position.

In the example below, gray squares mark the original position of each element before it was moved using `position: relative;`.

<!-- TODO this can be replaced by simple url once there is support in the gatsby codepen plugin -->
<iframe height="400" scrolling="no" src="//codepen.io/vojtechruz/embed/preview/mdJamVb/?height=400&amp;theme-id=light&amp;default-tab="result" frameborder="no" allowtransparency="true" allowfullscreen="true" style="width: 100%;"></iframe>

As you can see, the **space required for the original location of the element is still allocated**.

As a result of element being moved from its original position, there can be a situation, where multiple elements overlap each other. Fortunately, with `z-index` property, you can control which elements should be in the front and which in the back. We'll discuss this in more detail later.

### absolute
Absolute positioning is trickier. Unlike with `relative` position, lements are removed from the normal document flow and **their original space is not reserved**.

Using `top`, `bottom`, `left` and `right` properties, you determine where should the lement be placed relative to the first parent in the element hierarchy, which has `position` either `relative` or `absolute`.

**If there is no such parent, it will be set relative to the whole page.**

### fixed
Fixed positioning is similar to `absolute` in a way that the element is also removed from the normal document flow and its original space is not reserved.

The position is determined relative to the viewport. This means that even if you scroll, the element will preserve its original location on the page. This can be useful, for example, if you want to have a navigation bar, which is always visible on the top, no matter where you are on the page. Or a cookie info bar on the bottom.

<!-- TODO this can be replaced by simple url once there is support in the gatsby codepen plugin -->
<iframe height="400" scrolling="no" src="//codepen.io/vojtechruz/embed/preview/xxGMweV/?height=400&amp;theme-id=light&amp;default-tab="result" frameborder="no" allowtransparency="true" allowfullscreen="true" style="width: 100%;"></iframe>

Although this can be tempting, be careful with its usage. On a mobile device with a small screen, it can be a big deal if a large portion of your screen is always covered with a navigation bar or something similar as it greatly reduces space for the actual content of your page and can greatly limit usability.

### sticky
Sticky position is the latest addition to the list of `position` properties. It is a hybrid between `relative` and `fixed` positions.

The element is normally positioned in the page, but when you reach its position when scrolling, its position becomes fixed. It sticks to its location and stays there when you scroll further.

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