---
title: 'JShell - New REPL tool in Java 9 for quick prototyping'
date: ""
tags: ['Java']
path: '/jshell-repl'
featuredImage: './jshell.jpg'
disqusArticleIdentifier: ''
excerpt: 'From version 9, Java now has its own interactive REPL console, which is useful for quick checks, prototyping and educational purposes.'
---

![jshell repl](./jshell.jpg)

REPL
----

REPL stands for Read-Eval-Print-Loop. It may sound a bit cryptic but it is just a fancy name for an interactive shell for a programming language. Many programming languages these days already have REPL available. Even on JVM Groovy, Kotlin, Scala, and Clojure already have it. Java with starting with version 9 finally has its own REPL called JShell ([based on Java Enhancement Proposal 222](http://openjdk.java.net/jeps/222)).

Alright, so Java has its own new shiny REPL. But what is it good for? Well, it basically allows you to write independent snippets of java code to the console (READ), immediately execute them (EVAL) and see results (PRINT) and continue remembering what you already wrote (LOOP). It is a great tool if you want to quickly try a piece of code, draft an algorithm, check how some method behaves for unusual input, create and test a code snippet for your blog post etc. You just quickly try some throwaway code and immediately see the results. The best part is - it does not require most of the Java boilerplate.

While prototyping and quick code verification are important, there is another reason why having REPL is useful. Especially in a verbose language full of boilerplate such as Java. Imagine you are teaching the Java language to complete beginners. What do you need to write a simple hello world program that just prints to the console? A lot of boilerplate such as a class with the main method. The problem is you need to expose the student to a lot of concepts they don\'t need to worry about right now such as classes, methods, static, string arrays and so on. Then when you make changes you need to recompile and run the whole thing again.

The interactive console does not require class with main and immediately shows you output. You can try various constructs and you see results immediately. You don\'t need any IDE. You can start programming with minimal setup and minimal knowledge of all the advanced concepts, learning just one construct at the time. This high barrier of entry also resulted in many schools and institutions abandoning Java as their introduction to programming language choice. The educational aspect was actually primary motivation for the feature as stated in the JEP222:

> Immediate feedback is important when learning a programming language and its APIs. The number one reason schools cite for moving away from Java as a teaching language is that other languages have a \"REPL\" and have far lower bars to an initial `"Hello, world!"` program.

Running JShell
--------------

JShell is bundled with JDK 9+ installation. It resides in your JDK\\bin folder. For example on Windows it can be here:

```cmd
C:\Program Files\Java\jdk-9.0.4\bin\jshell.exe
```

To run it directly from the console, make sure JDK\\bin is added to your PATH. Then simply run `jshell` command. For now, let's use verbose mode with `-v`, which will help us better understand what's going on under the hood. Alternatively, you can run the executable directly from the bin directory. The last option is to use your IDE integration (see below - Support In IntelliJ IDEA).

```cmd
C:\Users\vojtech> jshell -v
| Welcome to JShell -- Version 10.0.1
| For an introduction type: /help intro

jshell>
```

Now you are in interactive mode and anything you write is evaluated by JShell. To exit again just type `/exit`.

Support In IntelliJ IDEA
------------------------

The good news is that if you use IntelliJ IDEA, you don't need to worry about having JShell on classpath, as IDEA offers nice integration with JShell out of the box directly in the IDE. This means you get all the useful features such as code completion, syntax highlighting, error detection and more.

To access JShell from IDEA, simply go to *Tools → JShell Console...*.

Whats also useful is that you can prepare all the code in advance and then just run it on demand rather than in the interactive console mode, which is often much more convenient.

![jshell-idea](./jshell-idea.png)

Unlike when running directly from console, IDEA automatically adds your current project to the classpath, so you can work with your custom classes out of the box with no setup needed.

Conclusion
----------
Finally even Java has its own REPL called JShell. It is a useful tool for quick prototyping, teaching or demonstration purposes. It is easy to use as it removes the need of much of the boilerplate Java normally requires. And if you use an IDE, which integrates JShell, the whole process gets even easier.

Expressions
     -semicolons
Variables
  - no static or final
  - no access modifiers
  -list all variables
Methods 
  - dopredna reference
  - =top level methods without class
  - list all methods
Types
  - list all types
Using external classes
   -imports
   -classpath
   -modules
Exceptions
    -checked exceptions not caught
Commands
    
Saving and loading your work
Using External Editor
   - built-in
   - change
Using JShell programatically
Alternatives