---
title: 'JShell - New REPL tool in Java 9 for quick prototyping'
date: ""
tags: ['Java']
path: '/jshell-repl'
featuredImage: './jshell.jpg'
disqusArticleIdentifier: ''
excerpt: ''
---

![jshell repl](./jshell.jpg)

REPL
----

REPL stands for Read-Eval-Print-Loop. It may sound a bit cryptic but it is just a fancy name for an interactive shell for a programming language. Many programming languages these days already have REPL available. Even on JVM Groovy, Kotlin, Scala, and Clojure already have it. Java with starting with version 9 finally has its own REPL called JShell ([based on Java Enhancement Proposal 222](http://openjdk.java.net/jeps/222)).

Alright, so Java has its own new shiny REPL. But what is it good for? Well, it basically allows you to write independent snippets of java code to the console (READ), immediately execute them (EVAL) and see results (PRINT) and continue remembering what you already wrote (LOOP). It is a great tool if you want to quickly try a piece of code, draft an algorithm, check how some method behaves for unusual input, create and test a code snippet for your blog post etc. You just quickly try some throwaway code and immediately see results. The best part is - it does not require most of the Java boilerplate.

While prototyping and quick code verification are important, there is another reason why having REPL is useful. Especially in a verbose language full of boilerplate such as Java. Imagine you are teaching a Java language to complete beginners. What do you need to write a simple hello world program that just prints to the console? A lot of boilerplate such as a class with the main method. The problem is you need to expose the student to a lot of concepts they don\'t need to worry about right now such as classes, methods, static, string arrays and so on. Then when you make changes you need to recompile and run the whole thing again.

The interactive console does not require class with main and immediately shows you output. You can try various constructs and you see results immediately. You don\'t need any IDE. You can start programming with minimal setup and minimal knowledge of all the advanced concepts, learning just one construct at the time. This high barrier of entry also resulted in many schools and institutions abandoning Java as their introduction to programming language choice. The educational aspect was actually primary motivation for the feature as stated in the JEP222:

> Immediate feedback is important when learning a programming language and its APIs. The number one reason schools cite for moving away from Java as a teaching language is that other languages have a \"REPL\" and have far lower bars to an initial `"Hello, world!"` program.

Running JShell
--------------

JShell is bundled with JDK 9+ installation. It resides in your JDK\\bin folder. For example on Windows it can be here:

```cmd
C:\Program Files\Java\jdk-9.0.4\bin\jshell.exe
```

To run it directly from the console, make sure JDK\\bin is added to your PATH. Then simply run *jshell* command. Alternatively, you can run the executable directly from the bin directory.

```cmd
C:\Users\vojtech> jshell
| Welcome to JShell -- Version 9.0.4
| For an introduction type: /help intro

jshell>
```

Now you are in interactive mode and anything you write is evaluated by JShell. To exit again just type */exit*.

Support In IntelliJ IDEA
------------------------

![jshell-idea](./jshell-idea.png)

Conclusion
----------
