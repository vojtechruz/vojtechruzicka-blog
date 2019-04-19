---
title: 'Try with resources in Java'
date: "2019-04-19T22:12:03.284Z"
tags: ["Java"]
path: 'java-try-with-resources'
featuredImage: './try-with-resources.jpg'
disqusArticleIdentifier: '99024 http://vojtechruzicka.com/?p=99024'
excerpt: 'Try with resources offers an easy and foolproof way to make sure all your resources are properly closed. It manages closing automatically instead of explicitly using "try-finally".'
---

![Java try with resources](./try-with-resources.jpg)

Try with resources offers an easy and foolproof way to make sure all your resources are properly closed. It manages closing automatically instead of explicitly using `try-finally`.

## Traditional try-catch-finally
TODO

## Try with resources
TODO
TODO list of all the classes implementing both interfaces

## Multiple resources
Inside the head of `try-with-resources`, you can declare more than one resource. 

```java
try (FileReader fileReader = new FileReader("C:\\foo.txt");
     BufferedReader bufferedReader = new BufferedReader(fileReader)) {
            // Read some data!
}
```

All the resources in the `()` parentheses are automatically closed for you. What's good to know is what is the order of closing. The resources are closed in the reverse order of their declaration to avoid any dependency issues.

That is, if we have three resources like this:

```java
try (resource1; resource2; resource3) {
}
```

They are created in order of:

1. resource1
2. resource2
3. resource3

But they are closed in the reverse order:

1. resource3
2. resource2
3. resource1

## Java 9 improvements
Try with resources was introduced in Java 7. Until Java 9 you were forced to declare the resources and assign them a value in the parentheses right after `try`. This is a lot of text and noise, which makes `try-with-resources` hard to read, especially when using multiple resources.

```java
try (FileReader fileReader = new FileReader("C:\\foo.txt"); 
     BufferedReader bufferedReader = new BufferedReader(fileReader)) {
    // Read some data!
}
```  

Fortunately, since Java 9, you can just reference the name of the existing resource instead of its declaration and assignment. This is much more readable.

```java
FileReader fileReader = new FileReader("C:\\foo.txt");
BufferedReader bufferedReader = new BufferedReader(fileReader);
        
try (fileReader; bufferedReader) {
    // Read some data!
}
```

It is not shorter, but when you check `try-with-resources`, you can immediately see which resources it uses without all the noise.

The limitation is, though that all the resources used need to be final of effectively final.

## Implementing your own resources
The good news is that you can create your own resources, which can be used in `try-with-resources`. All you need to do is to implement either `java.io.Closeable` or `java.lang.AutoCloseAble`.

How are they different? `Closeable` is older, available since Java 5, `AutoCloseable` was introduced in Java 7 along with `try-with-resources`. Since Java 7, `Closeable` actually extends `AutoCloseable`.

```java
public interface AutoCloseable {
    void close() throws Exception;
}

public interface Closeable extends AutoCloseable {
    void close() throws IOException;
}
```

As you can see, they are very similar. The signature of the `close()` method is different only in the exception thrown. `AutoCloseable` can throw any `Exception` while `Closeable` throws `IOException`.

Note that when implementing interface you can change the method signature in a way that it throws more specific exception (that is subclass of the exception specified by the interface). Or no exception at all. According to the JavaDoc, it is highly recommended to do so. Declare more specific exception to your implementation of `close()` method or no exception at all if it cannot fail. [TODO verify it actually works]

There is one more difference, which you cannot see from the method's signature but from JavaDoc only. `Closeable` is required to be idempotent [TODO link], `AutoCloseable` not (although it is highly reccommended).

That means you should make sure calling close multiple times would not cause any trouble. 

## IntelliJ IDEA integration
As usual, IDEA offers a nice support for try with resources feature. When you are using a resource, which implements `AutoCloseable` interface, you can surround it with `try-with-resources`. Just press <kbd>Alt</kbd> + <kbd>Enter</kbd> to open intention actions popup:

![IntelliJ IDEA surround with 'try-with-resources'](./idea-surround-with-try-with-resources.gif)

Usingthe same keyboard shortcut, IDEA allows you to convert traditional `try-catch-finally` to `try-with-resources`.

![IntelliJ IDEA convert to 'try-with-resources'](./idea-replace-with-try-with-resources.gif)

Alternatively, you can do the reverse operation using the same shortcut - convert `try-with-resources` to good old `try-catch-finally`.


Any object that implements java.lang.AutoCloseable, which includes all objects which implement java.io.Closeable, can be used as a resource.

Note: A try-with-resources statement can have catch and finally blocks just like an ordinary try statement. In a try-with-resources statement, any catch or finally block is run after the resources declared have been closed.

     
TODO this is just syntactic sugar? Show decompiled output     