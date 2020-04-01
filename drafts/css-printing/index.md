---
title: ''
date: ""
tags: ['CSS']
path: '/css-printing'
featuredImage: './css-printing.jpg)'
disqusArticleIdentifier: '99011 http://vojtechruzicka.com/?p=99011'
excerpt: ''
---

![CSS Printing](./css-printing.jpg)

## Chrome Dev Tools Print Preview
It can be time consuming to open print preview dialog in your browser every time when you want to check how your page looks when printing.

Fortunately in Chrome Devtools you can easily [switch to view](https://developers.google.com/web/tools/chrome-devtools/css/print-preview), which shows how your page would look like when printing.

1. Open your Devtools
2. Press  or <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>P</kbd>  (or <kbd>⌘</kbd>+<kbd>⇧</kbd>+<kbd>P</kbd> on Mac)
3. Search for `rendering`
4. Select `Show Rendering` and press <kbd>Enter</kbd>

![Chrome Devtool Show Rendering](chrome-devtools-show-rendering.png)

A new `Rendering` window should appear.

![Emulate Print Rendering in Devtools](rendering-emulate-print.png)

Here you can select `Emulate CSS media type → print`.

Although, not related to printing, you can emulate some more interesting rendering options in this tab, such as whether user prefers light or dark theme or reduced motion, show FPS and more.