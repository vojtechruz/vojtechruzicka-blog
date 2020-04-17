---
title: ''
tags: ["CSS"]
path: '/css-flexbox'
featuredImage: 'css-flexbox.png'
disqusArticleIdentifier: 'TODO http://vojtechruzicka.com/?p=TODO'
excerpt: ''
---

![CSS Flexbox](drafts/css-flexboxs-flexbox.png)

## Flexbox
Flexbox, short for Flexible Box, is defined in the [CSS Flexible Box Layout Module specifiation](https://www.w3.org/TR/css-flexbox-1/).

It allows to control layout in a parent container. It offers some useful settings, which allow you to control alignment of the items and distributing the extra space. Flexbox is one-dimensional. That means it lays out its items in one dimension - either horizontally or vertically. An example of two-dimensional layout can be CSS Grid.

Flexbox is a poweful tool, which allow you to control layout in a way that was previously very diffiult or possible only using hacky solutions.

## Flex container
With flexbox, we have to consider both the element itself and also its children. Because Flexbox is mainly focused on how its children (flex items) are positioned within the main element (flexbox container).

```html
<div class="flexbox-container">
    <div class="flexbox-item">1</div>
    <div class="flexbox-item">2</div>
    <div class="flexbox-item">3</div>
</div>
```

It is important to grasp the concept of `flexbox-container` and `flexbox-items`. That's because some properties for flexbox are applied to the container level and some for the individual items.

Without any CSS styles, the code above will display all the `flexbox-items` under each other. Each item will span the whole width available. That's because `div` is a block element and it is how block elements behave.

Let's try to turn the `flexbox-container` to Flexbox. All we have to do is to add the following style:

```css
.flexbox-container {
    display: flex;
}
```

Now the layout will be different. All the items are now displayed horizontally, from left to right. I've added also some background colors and borders, so you can better see the layout.

TODO codepen

The `display: flex;` property is always applied on the container level, not the item level. It defines theat the container should layout its children using Flexbox.

### Block vs inline flexbox
Flexbox is slightly different from positioning normal elements using `display` property. If we use `display: block;` or `display: inline;` we define how the element should be displayed in the document flow.

When we defined `display: flex;` we saw that it had effect on how the children are displayed in the `flex-container`. But what about the container itself how is it displayed? Is it `inline` element or is it `block`?

<div class="msg-info">
<strong>Block elements:</strong>
<ul>
  <li>Block elements span the whole width available</li>
  <li>Block elements are positioned one under another</li>
  <li>Block elements can have properties such as width and height</li>
  <li>Examples: div, h1, ul</li>
</ul>
<strong>Inline elements:</strong>
<ul>
  <li>Inline elements are positioned on a line next to each other, from left to right</li>
  <li>Inline elements take only as much space as required by their contents</li>
  <li>Inline elements ignore properties such as width and height</li>
  <li>Inline-block elements behave as inline elements, but you can also specify properties such as width and height</li>
  <li>Inline elements example: span, b, i, label </li>
</ul>
</div>

Actually, we have two options when using Flexbox. We can make the container either inline or block element using:

- `display: flex;`
- `display: inline-flex;`

If we want to our container to be displayed inline, we use `display: inline-flex;`. If we want it to be displayed as a block, we use `display: flex;`.

Note that `display: inline-flex;` behaves actually as `inline-block` rather than `inline`. That means it is still displayed on a line, but you can define properties such as `width` and `height`.

Bw aware that this defines only how the container should be displayed in the document flow, not its child items.

### Flex direction
In our example, the child items were displayed horizontally, from left to right. That's the default behavior, if you don't specify otherwise.

You can control the flow direction of flex items by defining `flex-direction`. This is done on the container level, not the item level.

- `row` (default,  horizontal, from left to right) 
- `row-reverse` (horizontal, from right to left)
- `column` (vertical, from top to bottom)
- `column-reverse` (vertical, from bottom to up)

When we did not specify `flex-direction`, it used the default value, which is `row`. For horizontal placement, but from the other direction, you can use `row-reverse`. For vertical, you can use either `column` or `column-reverse`.

```css
.flex-conteiner {
    display:flex;
    flex-direction: column-reverse;
}
```

TODO codepen


<div class="msg-warn">
If you use <i>row-reverse</i> or <i>column-reverse</i>, be aware that this has some usability and accessibility implications. This only changes the visual order of the elements not hteir logical order. Screen readers will still process the items in the order they are declared in HTML. The same applies for navigation using <i>Tab</i> key.
</div>

We said that `row` means horizontally, left to right. It is not entirely true, though. It applies in languages, which have [writing order](https://www.w3.org/TR/css-writing-modes-4/#writing-mode) from left to right. In languages, which use the opposite order (right to left), the Flexbox `row` setting would follow the same direction. This means that in languages, such as Arabic, `flex-direction:row;` would actually order items from right to left instead of left to right.

### Wrapping
So far, our flex container was big enough to fit all of its content properly. But what happens if there are too many items, which does not fit the size of its parent container?

<!-- TODO this can be replaced by simple url once there is support in the gatsby codepen plugin -->
<iframe height="400" scrolling="no" src="//codepen.io/vojtechruz/embed/preview/ZEbQdev/?height=400&amp;&amp;default-tab="result" frameborder="no" allowtransparency="true" allowfullscreen="true" style="width: 100%;"></iframe>

By default, the container tries to shring the items if possible, but eventually, the items may overflow out of the container. Note that the container tries to shrink items when not enough space is available even though we explicitly set `width: 50px;`. This width is preserved only if there is enough space. 

This may be ok in some cases, but usually you want more control over how this case is handled.

You can use `flex-wrap` property on the container level to specify how wrapping of items should be handled. There are three possible values:

- `nowrap` -  (default) one line, may overflow the container
- `wrap` - wrap to multiple lines from to to bottom
- `wrap-reverse` - wrap to multiple in the opposite order from bottom to top

The difference between `wrap` and `wrap-reverse` may be confusing, let's better look at an example.

<!-- TODO this can be replaced by simple url once there is support in the gatsby codepen plugin -->
<iframe height="400" scrolling="no" src="//codepen.io/vojtechruz/embed/preview/BaojgPQ/?height=400&amp;&amp;default-tab="result" frameborder="no" allowtransparency="true" allowfullscreen="true" style="width: 100%;"></iframe>

### Aligning wrapped content
- align content

### Justify content
- justify-content
- default flex-start
- flex-end

### Distributing extra space
- center, space-between, space-around


## Item level properties

### Aligning individual items

### Ordering items
Items in the flexbox container are not necessary displayed in the order, in which they are declared in HTML. That is, you can reorder items by assigning them specific `order` property. This is an integer value and defaults to 0 if not specified otherwise. This property is set not on the flex container level, but at the item level, as you want to order individual items.

If you want to put items before those, which don't have order specified, you can use negative values.

<!-- TODO this can be replaced by simple url once there is support in the gatsby codepen plugin -->
<iframe height="400" scrolling="no" src="//codepen.io/vojtechruz/embed/preview/ZEbGeRO/?height=400&amp;&amp;default-tab="result" frameborder="no" allowtransparency="true" allowfullscreen="true" style="width: 100%;"></iframe>

Multiple items can have the same `order` value. Such items belong to the same *ordinal group*. Items within the same group are then ordered in the same order in which they are declared in HTML.

For example, if you have three items with order 1, they will be placed after all the items with lower order. All these three items with the same order value will then be placed in the same order as in HTML.

<!-- TODO this can be replaced by simple url once there is support in the gatsby codepen plugin -->
<iframe height="400" scrolling="no" src="//codepen.io/vojtechruz/embed/preview/BaoNWGg/?height=400&amp;&amp;default-tab="result" frameborder="no" allowtransparency="true" allowfullscreen="true" style="width: 100%;"></iframe>

### Visual, not logical order
You have to be careful when changing order in a flexbox container this way. This only changes visual order of the items, not logical order. In other words, in DOM, the items are still placed in the same order as in HTML. 

This has several implications. Most notably, any assistive technologies as screen readers will process the items in their original order. This also applies to keyboard navigation using <kbd>Tab</kbd> key, unless you also explicitly change `tab-order` of your components.

## Firefox DevTools
TODO

## Browser Support
Fortunately, flexbox currently has [great support](https://caniuse.com/#feat=flexbox) across all the major browsers. That is 98.72% of all the users. It is even supported by IE 11, even though [it has many issues](https://github.com/philipwalton/flexbugs) and some non-standard behavior.

![Flexbox browser support](drafts/css-flexboxexbox-support.png)

If you are targeting some old browsers, you can check [Advanced Cross-Browser Flexbox](https://dev.opera.com/articles/advanced-cross-browser-flexbox/).

## Learning flexbox with zombies

Learning flexbox is way more fun if there are zombies involved. Instead of reading boring tutorials, you can shoot zombies with your crossbox, while learning flexbox. Try [Flexbox Zombies](https://mastery.games/flexboxzombies/) browser game. It is for free.

![Flexbox Zombies](drafts/css-flexboxexbox-zombies.png)

Want some more practice? You can check other games helping you to master Flexbox, such as [Flexbox Defense](http://www.flexboxdefense.com/) - a tower defense game where you position your towers using CSS and flexbox. Another one is [Flexbox Froggy](https://flexboxfroggy.com/) - help Froggy and his friends to reach lilypads and cross a pond by writing CSS code.

## Additional resources
- [Flexbox specification](https://www.w3.org/TR/css-flexbox-1/)
- [Solved by Flexbox](https://philipwalton.github.io/solved-by-flexbox/) - showcase of common layout problems solved by Flexbox
- [Interactive Flexbox playground for testing various flex properties](https://flexbox.help/)

TODO cheatsheet
TODO table showing which are on parent level vs on item level
TODO https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Flexible_Box_Layout/Relationship_of_Flexbox_to_Other_Layout_Methods