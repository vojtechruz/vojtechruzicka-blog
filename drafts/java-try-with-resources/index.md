---
title: 'Try with resources in Java'
date: "2019-04-23T22:12:03.284Z"
tags: ["Java"]
path: 'java-try-with-resources'
featuredImage: './try-with-resources.jpg'
disqusArticleIdentifier: '99024 http://vojtechruzicka.com/?p=99024'
excerpt: 'Try with resources offers an easy and foolproof way to make sure all your resources are properly closed. It manages closing automatically instead of explicitly using "try-finally".'
---

![Java try with resources](./try-with-resources.jpg)

Try with resources offers an easy and foolproof way to make sure all your resources are properly closed. It manages closing automatically instead of explicitly using `try-finally`.

## Traditional try-catch-finally
With traditional `try-catch`, you can execute a block of code and handle any exceptions hich may occur:

```java

try {
    // Do something
} catch (Exception e) {
    // React to exceptions if they occurr
    // in the try block
}
```

Often it is useful to have also a `finally` block. It executed after `try/catch`, no matter whether there was an exception or not. It is very useful especially when working with resources, which need proper cleanup after being used. When you use some resources, which are locked by your program (such as files or sockets and more), you need to make sure you release them after you're done.

You need to do the cleanup no matter whether all ends well or whether there is an exception.


try {
    // Try to use a resource
} catch (Exception e) {
    // React to exceptions if they occur
    // in the try block
} finally {
    // Open a resource
    // Close the resource when we're done
}
``

Finally is a nice way to clean everything after we are done, but has its own limitations. There can be multiple places where an exception may occur. That is when opening the resouce, using it and even closing. That can result in a lot of boilerplate code, which is hard to read and error prone. We are talking about nested `try-catch` statements combined with null checks and more.

Most importantly, you need to remember to actually close all the resources and in the right order. That is, resources can have dependencies on each other, which you need to respect.

Fortunately, since Java 7, there is an easier way to manage resources automatically with `try-with-resources`, which will close all the resources properly for you in the right order.

## Try with resources
Using `try-with-resources` is easy. Instead of just plain:

```java


try {
    // Do something
} finally {
    // Close my resource
}
```

You create the resource directly after `try` keyword in parentheses, like this:

```java
try (MyResource resource = new MyResource()){
    // Do something
} // Resource is automatically closed after this block ends
```

You basically create a resource, which exists only inside the `try` block and cannot be accessed afterwards. When the `try` block ends, the resource is automatically closed for you.

Now you ask what kind of resources you can use in `try-with-resources` and how does JVM know how to close them?

It is actually pretty simple. You can use all the resources, which implement [Closeable](https://cr.openjdk.java.net/~iris/se/12/latestSpec/api/java.base/java/io/Closeable.html) or [AutoCloseable](https://cr.openjdk.java.net/~iris/se/12/latestSpec/api/java.base/java/lang/AutoCloseable.html) interface. It has only one method called `close()` which is automatically called for you once the `try` block finishes. That means it is easy to provide your own custom resources. You can check all the classes implementing [Closeable](https://cr.openjdk.java.net/~iris/se/12/latestSpec/api/java.base/java/io/Closeable.html) or [AutoCloseable](https://cr.openjdk.java.net/~iris/se/12/latestSpec/api/java.base/java/lang/AutoCloseable.html) in their JavaDoc.

Note that in the example above, we used a simple case of `try-with-resources` using just `try` block. Of course, you can include both `catch` and `finally` blocks as well. In such case, the `catch` and `finally` blocks are executed **after** all the resource have been closed.

## Decompiled example
Let's look at a simple example using `try-with-resources`, which uses two resources and has just one operation:

```java
try (FileReader fileReader = new FileReader("C:\\foo.txt");
             BufferedReader bufferedReader = new BufferedReader(fileReader)) {

            bufferedReader.readLine();
        }
```

If we decompile this using Fernflower, we get something similar to this:

```java
FileReader fileReader = new FileReader("C:\\foo.txt");
        Throwable var2 = null;

        try {
            BufferedReader bufferedReader = new BufferedReader(fileReader);
            Throwable var4 = null;

            try {
                bufferedReader.readLine();
            } catch (Throwable var16) {
                var4 = var16;
                throw var16;
            } finally {
                $closeResource(var4, bufferedReader);
            }
        } catch (Throwable var18) {
            var2 = var18;
            throw var18;
        } finally {
            $closeResource(var2, fileReader);
        }
```

It is an interesting example how `try-with-resources` works under the hood. You can check the [official specs](https://docs.oracle.com/javase/specs/jls/se7/html/jls-14.html#jls-14.20.3) for more detail.

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

Note that when implementing interface you can change the method signature in a way that it throws a different exception. Or no exception at all. According to the JavaDoc, it is highly recommended to do so in this case. Declare more specific exception to your implementation of `close()` method or no exception at all if it cannot fail.

There is one more difference, which you cannot see from the method's signature but from JavaDoc only. `Closeable` is required to be [idempotent](https://en.wikipedia.org/wiki/Idempotence), `AutoCloseable` not (although it is highly reccommended).

That means you should make sure calling `close()` multiple times would not cause any trouble. 

## IntelliJ IDEA integration
As usual, IDEA offers a nice support for try with resources feature. When you are using a resource, which implements `AutoCloseable` interface, you can surround it with `try-with-resources`. Just press <kbd>Alt</kbd> + <kbd>Enter</kbd> to open intention actions popup:

![IntelliJ IDEA surround with 'try-with-resources'](./idea-surround-with-try-with-resources.gif)

Usingthe same keyboard shortcut, IDEA allows you to convert traditional `try-catch-finally` to `try-with-resources`.

![IntelliJ IDEA convert to 'try-with-resources'](./idea-replace-with-try-with-resources.gif)

Alternatively, you can do the reverse operation using the same shortcut - convert `try-with-resources` to good old `try-catch-finally`.

## Conclusion
Try with resources is a useful alternative to traditional `try-catch-finally` when working with resources, which need to be properly closed. The resource management is automatically handled for you. You can still use `catch` and `finally` blocks as usual, they get executed after the resources are closed.

If you are on Java 9 and later, you don't need to declare your resources directl in the try header, but you can use previously declared resources, which are final or effectvely final.

If you want to use your own resources, you can just implement `Closeable` or `Autocloseable` interface and implement the `close()` method. 