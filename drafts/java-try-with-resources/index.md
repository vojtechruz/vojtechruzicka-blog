---
title: 'Try with resources in Java'
date: "2019-04-19T22:12:03.284Z"
tags: ["Java]
path: 'java-try-with-resources'
featuredImage: './try-with-resources.jpg'
disqusArticleIdentifier: '99024 http://vojtechruzicka.com/?p=99024'
excerpt: ''
---



## IntelliJ IDEA integration
As usual, IDEA offers a nice support for try with resources feature. When you are using a resource, which implements `AutoCloseable` interface, you can surround it with `try-with-resources`. Just press <kbd>Alt</kbd> + <kbd>Enter</kbd> to open intention actions popup:

![IntelliJ IDEA surround with 'try-with-resources'](./idea-surround-with-try-with-resources.gif)

Usingthe same keyboard shortcut, IDEA allows you to convert traditional `try-catch-finally` to `try-with-resources`.

![IntelliJ IDEA convert to 'try-with-resources'](./idea-replace-with-try-with-resources.gif)

Alternatively, you can do the reverse operation using the same shortcut - convert `try-with-resources` to good old `try-catch-finally`.

- Introduced in Java 7
- Resources must implement AutoCloseable interface
- Can implement also closeable???
- Multiple values
- Still can use catch and finally as normally

Any object that implements java.lang.AutoCloseable, which includes all objects which implement java.io.Closeable, can be used as a resource.

Note: A try-with-resources statement can have catch and finally blocks just like an ordinary try statement. In a try-with-resources statement, any catch or finally block is run after the resources declared have been closed.

Classes That Implement the AutoCloseable or Closeable Interface
See the Javadoc of the AutoCloseable and Closeable interfaces for a list of classes that implement either of these interfaces. The Closeable interface extends the AutoCloseable interface. The close method of the Closeable interface throws exceptions of type IOException while the close method of the AutoCloseable interface throws exceptions of type Exception. Consequently, subclasses of the AutoCloseable interface can override this behavior of the close method to throw specialized exceptions, such as IOException, or no exception at all.


Java 9 improvement:
https://www.tutorialspoint.com/java9/java9_try_with_resources_improvement.htm


 * <p>Note that unlike the {@link java.io.Closeable#close close}
     * method of {@link java.io.Closeable}, this {@code close} method
     * is <em>not</em> required to be idempotent.  In other words,
     * calling this {@code close} method more than once may have some
     * visible side effect, unlike {@code Closeable.close} which is
     * required to have no effect if called more than once.
     *
     * However, implementers of this interface are strongly encouraged
     * to make their {@code close} methods idempotent.
     *
     * @throws Exception if this resource cannot be closed