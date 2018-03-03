---
title: 'IntelliJ IDEA Tips & Tricks: Multiple Cursors'
date: "2017-06-29T22:12:03.284Z"
tags: ['IDEA']
path: '/intellij-idea-tips-tricks-multiple-cursors'
featuredImage: './IntelliJIDEA_icon.png'
---

Sometimes it is useful to edit multiple places in the file at once, which can save you precious time and increase your productivity. IntelliJ IDEA supports having multiple cursors at once, meaning you can type and edit at multiple locations at the same time.
<!--more-->

Column Selection
----------------

This feature is the oldest one, which was available even before the introduction of the proper multiple cursors support. It allows you to select a block of text and then start typing with multiple cursors starting on each selected line at the beginning of the selected block.

![column-selection](./column-selection.gif)

You can then move the cursor, as usual, usual using the arrow keys and even commands like Home or End. Note that after I used End (go to the end of the line), the cursor was properly placed at the end of each line even if the cursors were no longer vertically aligned.

This feature can be toggled using *Edit → Column* selection mode or (⇧+ ⌘ + 8).

You can exit column selection mode also by using *Esc* key.

Column selection mode can be also used when using keyboard only. When in column selection mode and holding *Shift*, you can extend cursor to the line above/bellow by using ↑ ↓ keys.

Caret Cloning
-------------

The same functionality of creating new cursors as with Shift + arrows can be achieved by *Clone caret above* and *Clone caret bellow* commands.

The commands are issued by pressing *Ctrl* (or ⌥ on Mac), then pressing it again and not releasing. While still holding *Ctrl*, you can press ↑ ↓ arrows to clone cursor to the line above or bellow.

![clone-caret](./clone-caret.gif)

Multiple Cursors
----------------

While the column selection mode is useful, it is limited to cases where places you need to edit are vertically aligned, which may not usually be the case. In other situations, you need to stick to a proper multiple cursor support. This is possible since [IDEA version 13.1](https://blog.jetbrains.com/idea/2014/03/intellij-idea-13-1-rc-introduces-sublime-text-style-multiple-selections/).

When holding Alt + Shift  ( or ⌥ + ⇧ on Mac), clicking on a location creates a new cursor on that location in addition to the already existing cursors. Unlike column selection, these cursors can be anywhere and don\'t need to be vertically aligned. Pressing *Esc* will exit multiple cursors mode and will leave you with your first original single cursor.

![multiple-cursors-mouse](./multiple-cursors-mouse.gif)

Advanced selection
------------------

As of IntelliJ IDEA 14.1, you can not only insert multiple carets, but you can also select multiple parts of the text and then start typing. This has several advantages. You can replace multiple blocks of text of various lengths by new ones. Also, when copying/cutting the selected blocks into the clipboard, you can later paste the results into a new place when still using multiple cursors and each copied block will be pasted to the corresponding cursor.

![multi-selection](./multi-selection.gif)

This selection can be achieved by holding *Alt* + *Shift*  ( or ⌥ + ⇧ on Mac) and selecting the blocks by the mouse as usual. Another way of selecting multiple blocks of text with multiple cursors is *Select All Occurrences* command, which selects all the other occurrences in the current file of the already selected text. In case no text is selected, the closest word to the current cursor is selected.

![select-all-occurences](./select-all-occurences.gif)

This command can be triggered by *Shift* + *Ctrl* + *Alt* or ⌃ + ⌘ + G on Mac.