---
title: 'IntelliJ IDEA Tips & Tricks: Presentations'
date: "2017-07-12T22:12:03.284Z"
tags: ['IDEA']
path: '/intellij-idea-tips-tricks-presentations'
featuredImage: './intellij-idea-presentation.jpg'
disqusArticleIdentifier: '935 http://vojtechruzicka.com/?p=935'
excerpt: How to make the most of the IntelliJ IDEA's view modes to make best presentations possible including visualization of the keyboard input?
---
![idea presentations](./intellij-idea-presentation.jpg)

How to make the most of the IntelliJ IDEA's view modes to make best presentations possible including visualization of the keyboard input?

Presentation Mode
-----------------

Since IntelliJ IDEA 13, you can switch to Presentation Mode by clicking *View → Enter Presentation Mode*. The IDE switches to full screen and everything is hidden except for the main editor window. The font size is increased so it is better readable from a distance.

![intellij-idea-presentation-mode](./IntelliJ-IDEA-Presentation-Mode.png)
 
 The font size in Presentation Mode can be configured in Settings under *Appearance & Behavior* *→ Appearance → Presentation Mode.* 
 
 ![intellij-idea-presentation-mode-font-size](./IntelliJ-IDEA-Presentation-Mode-Font-Size.png)

Distraction Free Mode
---------------------

Distraction Free mode is another view mode you can use. It is similar to Presentation Mode at first glance but has several important distinctions.

It hides everything except the Editor window and centers it. All the toolbars and panels are gone. Unlike Presentation Mode, it does not increase the font size, but it rather keeps it unchanged. Unlike Presentation mode, it does not enter full screen, so you can use it even in a small window. That may be useful when having code editor on half of the screen and something else (like a browser window or terminal) in the other half.

![intellij-idea-distraction-free-mode](./IntelliJ-IDEA-Distractio-Free-Mode-1.png)

As the name suggests, it is intended as a convenient way to hide all the visual clutter, when you need to focus just on some particular piece of code. After the Presentation mode was introduced, many were using it not only for presenting but also as a Distraction Free mode, which was later released as a separate feature in IDEA 14.1.

While the Distraction Free Mode was not originally intended for presentation purposes, there are situations, where it can be more appropriate that original Presentation Mode. Because the size of the font is not changed, you can see a much bigger portion of the code at the same time. This gives you the much better context that seeing just a small snippet of code at once without the surrounding code. This may not be suitable for regular presentations with one big screen and listeners, who may be too far away to read the code. However, it is much better for scenarios where each listener has their own screen and can read even the smaller font. Such situations would be for example video conferences with screen sharing or webinars. For this purpose, you should consider Distraction Free mode as a viable alternative to the regular Presentation Mode.

Note that Presentation and Distraction Free Mode are not mutually exclusive and can be active at the same time.

Presentation Assistant Plugin
-----------------------------

After you achieve a basic level of proficiency with your IDE and already know which features it offers, your next goal is to increase your productivity. That is, you want to use the tool you are already familiar with more effectively. A major part of that is using the keyboard as much as you can instead of the mouse. Using keyboard shortcuts where possible. Great way to learn IntelliJ IDEA shortcuts is to use [Key Promoter plugin](https://www.vojtechruzicka.com/learning-intellij-idea-keyboard-shortucts/). Once you use mainly keyboard, you are much more productive. The problem is, using a lot of keyboard shortcuts is not exactly presentation friendly. Your audience can get quickly confused and lose track of the core topic you are presenting about while trying to figure out what the hell just happened.

Fortunately, there is a nice tool, which helps you exactly with this issue. It is [Presentation Assistant Plugin](https://plugins.jetbrains.com/plugin/7345-presentation-assistant)  ([Github](https://github.com/chashnikov/IntelliJ-presentation-assistant)). Every time you trigger an action (no matter whether with the keyboard or mouse), it shows the action name and a keyboard shortcut associated with the action. What\'s more, it shows the shortcut both for Mac and Linux/Windows. 

![intellij-idea-presentation-assistant](./Presentation-Assistant.png)

This is obviously very handy when having a presentation as the audience exactly knows which actions are you triggering using the keyboard and what shortcut is associated with them. Usually, this way they can learn not only about your main topic but also a handful of new and useful IDE features/keyboard shortcuts. And your talk is not constantly being interrupted by questions about actions and shortcuts you just used.

This is not only useful while presenting, but also when pair programming. This way your partner can keep track of your actions and maybe even learn a thing or two. Last but not least, using this plugin can help you to learn new shortcuts because it shows the shortcut info even for actions triggered by the mouse. That means that eventually, you will learn shortcuts for actions that you currently use only by mouse. However, you may consider using Key Promoter plugin for this scenario.

Keyboard shortcuts
------------------

Both the Presentation and Distraction free modes have no keyboard shortcuts associated by default. By default, they are only accessible from *View→ Enter Presentation Mode* and *View→ Enter Distraction Mode*. You can, however, assign custom shortcuts to these actions as usual.

Alternatively, you can use Quick Switch Theme action (Ctrl + \` or ⌃ + \` on Mac) and Then press 4 (View Mode). From the subsequent popup menu, you can pick either Presentation or Distraction Free mode. This shortcut is also useful for quickly switching keyboard layouts, code styles, look and feel or color schemes.

![intellij-idea-quick-switch-theme](./Quick-Switch-Theme.gif)

Conclusion
----------

The regular Presentation mode offers a good tool for presentations with one big screen. For webinars and other situations, where each viewer has their own screen, it may be better to use Distraction Free Mode, where the font size is not changed, therefore the viewers can see more code at once, so it offers more context. This way you are always ready for these two possibilities without the need to manually alter font size in the settings before each presentation. In either case, it is really handy to use Presentation Assistant plugin, which lets your viewers clearly see all the actions and keyboard shortcuts performed.
