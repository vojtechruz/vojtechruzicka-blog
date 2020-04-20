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

<iframe height="400" scrolling="no" src="//codepen.io/vojtechruz/embed/preview/ExVPBzM/?height=400&amp;&amp;default-tab="result" frameborder="no" allowtransparency="true" allowfullscreen="true" style="width: 100%;"></iframe>

The `display: flex;` property is always applied on the container level, not the item level. It defines theat the container should layout its children using Flexbox.

### Main vs cross axis
- TODO 

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


<iframe height="400" scrolling="no" src="//codepen.io/vojtechruz/embed/preview/BaoKONW/?height=400&amp;&amp;default-tab="result" frameborder="no" allowtransparency="true" allowfullscreen="true" style="width: 100%;"></iframe>

<div class="msg-warn">
If you use <i>row-reverse</i> or <i>column-reverse</i>, be aware that this has some usability and accessibility implications. This only changes the visual order of the elements not hteir logical order. Screen readers will still process the items in the order they are declared in HTML. The same applies for navigation using <i>Tab</i> key.
</div>

We said that `row` means horizontally, left to right. It is not entirely true, though. It applies in languages, which have [writing order](https://www.w3.org/TR/css-writing-modes-4/#writing-mode) from left to right. In languages, which use the opposite order (right to left), the Flexbox `row` setting would follow the same direction. This means that in languages, such as Arabic, `flex-direction:row;` would actually order items from right to left instead of left to right.


### Justify content
- justify-content
- default flex-start
- flex-end

In our previous examples, all the items were aligned to the `flex-start` - that is to the left when displaying as a row and to the top when displaying as a column. This is the default behavior, but you can change it with `justify-content` property. For alignment, you can use he following values:

- `flex-start` (default)
- `flex-end`
- `center`

It allows you to align items on the main flex axis, that is:
- horizontally when the `flex-direction` is `row`
- vertically when the `flex-direction` is `column`


<iframe height="400" scrolling="no" src="//codepen.io/vojtechruz/embed/preview/YzyqOdZ/?height=400&amp;&amp;default-tab="result" frameborder="no" allowtransparency="true" allowfullscreen="true" style="width: 100%;"></iframe>

Because you can have either normal or reversed flex order, you can't specify alignment as left, right, top or bottom. Instead, you work with `flex-start` and `flex-end`, which depends on whether you are in normal or reverse mode.

### Distributing extra space
The `justify-content` property can be used not only for aligning items, but also for spreading items evenly across all the available space on the main axis.

You can use these valus:
- `justify-content: space-between;` 
- `justify-content: space-around;`
- `justify-content: space-evenly;` 


<iframe height="400" scrolling="no" src="//codepen.io/vojtechruz/embed/preview/wvKGYvx/?height=400&amp;&amp;default-tab="result" frameborder="no" allowtransparency="true" allowfullscreen="true" style="width: 100%;"></iframe>

In all cases the items are distributed so the space between neighboring items is always the same. **The three values differ only in a way how spacing between first and last item and the edge of the conteiner is calculated**.

- `space-between;`: first and last items have no space relative to the edge of container  
- `space-around;`: half of the space compared to the gaps between items
- `space-evenly;`: same space as between items 

## Align items
We learned how to align items on the main axis using `justify-content`. What about the other axis, the `cross axis`?

The cross axis is the axis perpendicular to the main axis, that means:

- in `row` mode, the cross axis is vertical
- in `column` mode, the cross axis is horizontal

You can use `align-items` property on the container level to define cross axis alignment. There are several properties you can choose from:

- `flex-start`: align to the start of the cross axis
  - top in row mode
  - left in column mode
- `flex-end`: align to the end of the cross axis
  - bottom in row mode
  - right in column mode
- `center`: align to the middle
- `stretch`: stretch the component to fill the available space on the cross axis (respects `max-width` and `max-height` of items)
- `baseline`: items are aligned by their baselines


<iframe height="400" scrolling="no" src="//codepen.io/vojtechruz/embed/preview/PoPzgEb/?height=400&amp;&amp;default-tab="result" frameborder="no" allowtransparency="true" allowfullscreen="true" style="width: 100%;"></iframe>

This works as expected and is self explanatory, considering what we've already learned. The `baseline` setting is a bit trickier though. It aligns items by their [baselines](https://en.wikipedia.org/wiki/Baseline_(typography))

![Baseline in typography - from Wikipedia](https://en.wikipedia.org/wiki/Baseline_(typography)#/media/File:Typography_Line_Terms.svg)


<iframe height="400" scrolling="no" src="//codepen.io/vojtechruz/embed/preview/GRpqLeW/?height=400&amp;&amp;default-tab="result" frameborder="no" allowtransparency="true" allowfullscreen="true" style="width: 100%;"></iframe>

As you can see, baseline in this case is usually the bottom of the first line of text in each item. Bottom in this case means where most of the regular letters end, there are some letters such as `p` or `j` that go under the baseline. 

Note how multiline item and item with no content are handled.

You can check more details about the [baseline calculation in flexbox](https://drafts.csswg.org/css-flexbox-1/#flex-baselines).


### Wrapping
So far, our flex container was big enough to fit all of its content properly. But what happens if there are too many items, which does not fit the size of its parent container?


<iframe height="400" scrolling="no" src="//codepen.io/vojtechruz/embed/preview/ZEbQdev/?height=400&amp;&amp;default-tab="result" frameborder="no" allowtransparency="true" allowfullscreen="true" style="width: 100%;"></iframe>

By default, the container tries to shring the items if possible, but eventually, the items may overflow out of the container. Note that the container tries to shrink items when not enough space is available even though we explicitly set `width: 50px;`. This width is preserved only if there is enough space. 

This may be ok in some cases, but usually you want more control over how this case is handled.

You can use `flex-wrap` property on the container level to specify how wrapping of items should be handled. There are three possible values:

- `nowrap` -  (default) one line, may overflow the container
- `wrap` - wrap to multiple lines from to to bottom
- `wrap-reverse` - wrap to multiple in the opposite order from bottom to top

The difference between `wrap` and `wrap-reverse` may be confusing, let's better look at an example.


<iframe height="400" scrolling="no" src="//codepen.io/vojtechruz/embed/preview/BaojgPQ/?height=400&amp;&amp;default-tab="result" frameborder="no" allowtransparency="true" allowfullscreen="true" style="width: 100%;"></iframe>

### Aligning wrapped content
When items are wrapped in a Flexbox and you have therefore multiple lines, you can control how these lines are aligned on the **cross axis**. You can use property `align-content`.

Do not confuse this with `justify-content`.
- `justify-content`: aligns across the **main** axis
  - main axis is horizontal when in row mode
  - main axis is vertical when in column mode
- `align-content`: aligns across the **cross** axis
  - cross axis is perpendicular to the main axis

<div class="msg-info">This property has no effect unless you have either *flex-wrap: wrap;* or *flex-wrap: wrap-reverse;*</div> 

The good news is that the possible values of `align-content` arevery similar as with `justify-content`:

- `stretch` (default)
- `flex-start`
- `flex-end`
- `center`
- `space-between`
- `space-around`
- `space-evenly`
  
The alignment just work on the other axis, but the behavior is the same.


<iframe height="400" scrolling="no" src="//codepen.io/vojtechruz/embed/preview/OJyNKXW/?height=400&amp;&amp;default-tab="result" frameborder="no" allowtransparency="true" allowfullscreen="true" style="width: 100%;"></iframe>



## Item level properties
So far we've covered properties, which are defined on the flex container level. Now let's look into properties, which are defined on the level of individual flex items.

### Aligning individual items
So far we covered several option of handling alignment:
- `justfy-content`: align items on main axis
- `align-items`: align items on fross axis
- `align-content`: align multiple rows when wrapping on cross axis

All these settings apply for the whole container. It is possible to also handle alignment of individual items on **cross** axis. This is defined not on the item level, not container level. It uses property `align-self`. Tou can use the following values:

- `flex-start`
- `flex-end`
- `center`
- `stretch`
- `baseline`



<iframe height="400" scrolling="no" src="//codepen.io/vojtechruz/embed/preview/vYNKqMw/?height=400&amp;&amp;default-tab="result" frameborder="no" allowtransparency="true" allowfullscreen="true" style="width: 100%;"></iframe>

Of course, this can be combined with defining alignment on the container level using `align-items`. You can define general alignment for the items on the container level, and then override it for individual items. For example, you can define items to be aligned for the whole container using `align-items: flex-end` and then change the alignment for individual items using `align-self`.


<iframe height="400" scrolling="no" src="//codepen.io/vojtechruz/embed/preview/yLYJmeP/?height=400&amp;&amp;default-tab="result" frameborder="no" allowtransparency="true" allowfullscreen="true" style="width: 100%;"></iframe>

### Ordering items
Items in the flexbox container are not necessary displayed in the order, in which they are declared in HTML. That is, you can reorder items by assigning them specific `order` property. This is an integer value and defaults to 0 if not specified otherwise. This property is set not on the flex container level, but at the item level, as you want to order individual items.

If you want to put items before those, which don't have order specified, you can use negative values.

<iframe height="400" scrolling="no" src="//codepen.io/vojtechruz/embed/preview/ZEbGeRO/?height=400&amp;&amp;default-tab="result" frameborder="no" allowtransparency="true" allowfullscreen="true" style="width: 100%;"></iframe>

Multiple items can have the same `order` value. Such items belong to the same *ordinal group*. Items within the same group are then ordered in the same order in which they are declared in HTML.

For example, if you have three items with order 1, they will be placed after all the items with lower order. All these three items with the same order value will then be placed in the same order as in HTML.


<iframe height="400" scrolling="no" src="//codepen.io/vojtechruz/embed/preview/BaoNWGg/?height=400&amp;&amp;default-tab="result" frameborder="no" allowtransparency="true" allowfullscreen="true" style="width: 100%;"></iframe>

#### Visual, not logical order
You have to be careful when changing order in a flexbox container this way. This only changes visual order of the items, not logical order. In other words, in DOM, the items are still placed in the same order as in HTML. 

This has several implications. Most notably, any assistive technologies as screen readers will process the items in their original order. This also applies to keyboard navigation using <kbd>Tab</kbd> key, unless you also explicitly change `tab-order` of your components.

### Flexibility
One of the most powerful features of flexbox is the ability to adjust the size of the items inside based on the size of the container. This means:
- You can enlarge the items to fill all the available space
- You can shrink the items to fit when there is not enough space

This is very powerful as all the items are automatically resized when the size of the flex container changes. Moreover, you can define resizing behavior per each items inside the container. For example - some items can grow more, some items less and some not at all.


#### Flex-grow
Using this property you can control how items should grow when ther is extra space available. The default value, if not specified otherwise, is `flex-grow: 0`. That means that **items will not grow to fill the extra space on the main axis by default**.

However, this can be changed by assigning any numeric value greater than 0. **Negative values are not allowed**.

Let's say we assign `flex-grow: 1;` to all items. This means that the extra space will be assigned proportionally to each item in a way that each item gets the same amount of extra space. This is because their `flex-grow` values are the same.

TODO codepen

So what does the value actually do?

**Extra space available is distributed among the component proportionally to their flex-grow values.**

This means if there are two items and both have `flex-grow: 1` they both get 50% of the available space. Thats because ration of their values is `1:1`.

If one item has `flex-grow: 3` and the other one `flex-grow: 1`, the ratio of their values is 3:1, which means he first one will get 3x as much as space (75%) as the second one (25%). If there are 100px of extra space, the first component will get grow by 75px and the second one will grow by 25px.

The common misconception is that ratio, let's say 2:1, means that the firs component will end up being twice as big as the second one. But remember, it is about how the extra space is distributed, not the final size. **The ratio of `flex-grow` values determines percentage of the extra space each item will get, not their final sizes**.

##### Values between 0 and 1
values greater than 0 but less than 1 have special behavior. **If the sum of all the `flex-growht` values in a container is less than 1, items will still grow, but will not fill the entire container.**

For example, if we have three items, each with `flex-growht: 0.25;` their sum is `0.75`. This means that the items will grow, but only occupy 75% of the available space, the rest will be empty. 

TODO codepen

#### Flex-shrink
This property determines how items should reduced in size if there is not enough space available in the container.

Again, it is a **non-negative** numeric value, where 0 means no shrinking at all. Ratio of these values determines how much each item will shrink compared to others. The difference is that the defaul value is `1`. This means that the items will shrink by default (but they don't grow by default).

TODO codepen

There is one more notable difference. In addition to ratios (same as with growing), the base size of each item is considered when determining how much each item will shrink. This means even if the `flex-shrink` value is the same, bigger items will shrink more than smaller items.

In other words, larger items  (which are able to shrink more) will shrink faster than smaller items (which have limited space left for shrinking).

TODO codepen

#### Flex-basis
When calculating shringking and growing in a flexbox, it is important to know size of each item on the main axis. For example, to calculate the space availeble for growht, you need to take the size of the flex container minus sizes af all the items. How are sizes of individual items calculated though?

- You can specify `width` or `height` of items
- If not specified, the items are sized based on their content

You can also specify `flex-basis` property, which is used for sizing. It can use the same values as `width` or `height` You can see, that `widht` and `height` are two properties for horizontal and vertical sizing. But there is only one `flex-basis`. That's because it controls sizing on the **main axis**. This means if you are in a row mode, it controls width, in column mode it controls height. So even if you switch between rows and columns dnamically, you can still use the same `flex-basis` property.

Behavior of `flex-basis` is the following:
- it defaults to `auto`
- `auto` uses either specified `width` or `height`. If these are not specified, it uses sizing based on contents of the item
- it overrides any `width` or `height`
- it respects min/max width and height
- you can also use `content` value, which uses automatic size based on content. It was not present in the initial spec and older browsers do not support it

TODO codepen

## Shorthand properties
Although you can specify flex properties such as `flex-grow` or `flex-shrink` individually, these is are some shorthand properties, which allow you to combine multiple individual properties together. Using shorthand properties is usually preferred way instead of defining the properties individually.

### Flex-flow
This property allows you to combine `flex-direction` and `flex-wrap`.

```css
flex-flow: flex-direction flex-wrap;
```

Of course, you need to provide specific values instead of `flex-direction` and `flex-wrap`:

```css
flex-flow: column wrap-reverse;

/* Equivaluent css without using shorthand flex property: */

flex-direction: column;
flex-wrap: wrap-reverse;
```

### Flex
This property allows you to combine the following individual properties together:
- `flex-grow`
- `flex-shrink`
- `flex-basis`

It is defines as follows:

```css
flex: flex-grow flex-shrink flex-basis;
```

You need to substitute `flex-grow`, `flex-shrink` and `flex-basis` with specific values here:

```css
flex: 1 2 100px;

/* Equivaluent css without using shorthand flex property: */

flex-grow: 1;
flex-shrink: 2;
flex-basis: 100px;
```

This shorthand is preferred over defining the properties automatically, as [stated in the spec](https://drafts.csswg.org/css-flexbox/#flex-grow-property).

> Authors are encouraged to control flexibility using the flex shorthand rather than with flex-grow directly, as the shorthand correctly resets any unspecified components to accommodate common uses.

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