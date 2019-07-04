---
title: ''
date: ""
tags: ["Java"]
path: '/spring-caching'
featuredImage: './java-interface-history.jpg'
disqusArticleIdentifier: 'TODO http://vojtechruzicka.com/?p=TODO'
excerpt: ''
---

![Java Interface History](./java-interface-history.jpg)

## Original interfaces
Interfaces in Java 1.0 were pretty simple compared to what they are now. They could include only two types of items - constants and public abstract methods.

### Constant fields
Interfaces can contain fields as regular classes with a few distinctions:
- Fields must be assigned a value
- Fields are considered public static final
- Public static and final modifiers don't need to be explicitly stated

```java
public interface MyInterface {
    int MY_CONSTANT = 9;
}
```

Event though it is not explicitly stated, `MY_CONSTANT` field is considered a constant which is `public`, `static` and `final`.

## Abstract methods
The most important members of an interface are its methods. Interface methods have its differences from ordirary class methods as well:
- Methods don't have bodies
- Implementation is provided by classes implementing the interface
- Methods are considered public abstract even if not explicitly stated
- Cannot be final as abstract and final is invalid combination

```java
public interface MyInterface {
    int doSomething();
    String doSomethingCompletelyDifferent();
}
```

## Nesting
Java 1.1 introduced the concept of classes within classes. It comes in two flavors: static and non-static. Interfaces can contain other interfaces and classes.

Even if not explicitly stated, such interfaces and classes are considered public and static.

```java
public interface MyInterface {
    class MyClass {
        //...
    }

    interface MyOtherInterface {
        //...
    }
}
```

### Enums and Annotations
In Java 5, two more types were introduced - Enums and Annotations. They can also be placed inside interfaces.

```java
public interface MyInterface {
    enum MyEnum {
        FOO, BAR;
    }

    @interface MyAnnotation {
        //...
    }
}
```

## Generics
Java 5 introduced the concept of [Generics](https://docs.oracle.com/javase/tutorial/java/generics/index.html). In a nutshell, generics allow you to used type parameters instead of explicit types. This way, you can write code, which will work with various number of types without sacrificing type safety or providing implementation for each individual type.

In interfaces, from Java 5, you can define type parameters and then use them instead of return type of a method or a method parameter type.

The following interface `Box<T>` will work no matter whether you will use it to store Strings, Integers, Lists, Shoes or any other type.

```
interface Box<T> {
    void insert(T item);
}

class ShoeBox implements Box<Shoe> {
    public void insert(Shoe item) {
        //...
    }
}
```

## Static methods
Since java 8, there you can include static methods in your interfaces. It works in a very different way than interfaces pre-Java 8. Originally methods in interfaces are all abstract, meaning you provide only the signature but not implementation. The implementation is responsibility of classes implementing your interface.

With static method in interfaces, you need to provide also implementation the method's body. To include such method, simply use `static` keyword as usual. Static methods are considered public by default.

```java
public interface MyInterface {
    
    // This works
    static int foo() {
        return 0;
    }

    // This does not work, 
    // static methods in interfaces need body
    static int bar();
}
```

### Static method inheritance
Unlike regular static methods, static methods in interfaces are not intherited. This means if you want to call such method, you meed to do it directly on the interface instead of an implementing class.

```java
MyInterface.staticMethod();
```

This behavior is very useful for preventing multiple inheritance issues. Imagine you have a class implementing two interfaces. Each of the interfaces have a static method with the same name and signature. Which one should take priority?

## Default methods
Default methods are similar to static methods in a way that that you need to provide method body. To declare default method simply use `default` keyword.

```java

```

Unlike static methods, default methods are inherited by classes implementing the interface. What's important, the implementing class can choose to override the default behavior provided by the interface.

### Why is it useful

## Private methods

## Chronological order

**Java 1.1**
- Nested classes 
- Nested interfaces 

**Java 5**
- Generics
- Nested enums
- Nested annotations

**Java 8**
- Default methods
- Static methods

**Java 9**
- Private methods

<!--
https://howtodoinjava.com/java9/java9-private-interface-methods/
https://dzone.com/articles/evolution-of-interface-in-history-of-java 

Private methods in interfaces:
http://openjdk.java.net/jeps/213

Thanks,

regarding the diamond problem, yes from Java 8 onwards, In the scenario where a class implements two interfaces having same default method signatures. It becomes compulsory for the class to override such a method. Within the class, it can use both the methods prefixing the method invocation with interfacename.super, eg. Interface1.super.method()

or Interface2.super.method().


The correct answer is in fact found in the Java Documentation, which states:

[d]efault methods enable you to add new functionality to the interfaces of your libraries and ensure binary compatibility with code written for older versions of those interfaces.

This has been a long-standing source of pain in Java, because interfaces tended to be impossible to evolve once they were made public. (The content in the documentation is related to the paper that you linked to in a comment: Interface evolution via virtual extension methods.) Furthermore, rapid adoption of new features (e.g. lambdas and the new stream APIs) can only be done by extending the existing collections interfaces and providing default implementations. Breaking binary compatibility or introducing new APIs would mean that several years would pass before Java 8's most important features would be in common use.

The reason for allowing static methods in interfaces is again revealed by the documentation: [t]his makes it easier for you to organize helper methods in your libraries; you can keep static methods specific to an interface in the same interface rather than in a separate class. In other words, static utility classes like java.util.Collections can now (finally) be considered an anti-pattern, in-general (of course not always). My guess is that adding support for this behavior was trivial once virtual extension methods were implemented, otherwise it probably wouldn't have been done.

On a similar note, an example of how these new features can be of benefit is to consider one class that has recently annoyed me, java.util.UUID. It doesn't really provide support for UUID types 1, 2, or 5, and it cannot be readily modified to do so. It's also stuck with a pre-defined random generator that cannot be overridden. Implementing code for the unsupported UUID types requires either a direct dependency on a third-party API rather than an interface, or else the maintenance of conversion code and the cost of additional garbage collection to go with it. With static methods, UUID could have been defined as an interface instead, allowing real third-party implementations of the missing pieces. (If UUID were originally defined as an interface, we'd probably have some sort of clunky UuidUtil class with static methods, which would be awful too.) Lots of Java's core APIs are degraded by failing to base themselves on interfaces, but as of Java 8 the number of excuses for this bad behavior have thankfully diminished.

It's not correct to say that [t]here's virtually no difference between an interface and an abstract class, because abstract classes can have state (that is, declare fields) while interfaces cannot. It is therefore not equivalent to multiple inheritance or even mixin-style inheritance. Proper mixins (such as Groovy 2.3's traits) have access to state. (Groovy also supports static extension methods.)

It's also not a good idea to follow Doval's example, in my opinion. An interface is supposed to define a contract, but it is not supposed to enforce the contract. (Not in Java anyway.) Proper verification of an implementation is the responsibility of a test suite or other tool. Defining contracts could be done with annotations, and OVal is a good example, but I don't know whether it supports constraints defined on interfaces. Such a system is feasible, even if one does not currently exist. (Strategies include compile-time customization of javac via the annotation processor API and run-time bytecode generation.) Ideally, contracts would be enforced at compile-time, and worst-case using a test suite, but my understanding is that runtime enforcement is frowned upon. Another interesting tool that might assist contract programming in Java is the Checker Framework.

or further follow-up on my last paragraph (i.e. don't enforce contracts in interfaces), it's worth pointing out that default methods cannot override equals, hashCode and toString. A very informative cost/benefit analysis of why this is disallowed can be found here: http://mail.openjdk.java.net/pipermail/lambda-dev/2013-March/008435.html
-->
