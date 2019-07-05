---
title: 'History of Java interface feature changes'
date: "2019-07-05T22:12:03.284Z"
tags: ["Java"]
path: '/java-interface-history'
featuredImage: './java-interface-history.jpg'
disqusArticleIdentifier: '99029 http://vojtechruzicka.com/?p=99029'
excerpt: 'Java interface changed a lot through the years. What were the changes during its evolution?'
---

![Java Interface History](java-interface-history.jpg)

Java interface changed a lot through the years. What were the changes during its evolution?

## Original interfaces
Interfaces in Java 1.0 were pretty simple compared to what they are now. They could include only two types of items - constants and public abstract methods.

### Constant fields
Interfaces can contain fields, same as regular classes with a few distinctions:
- Fields must be assigned a value
- Fields are considered public static final
- Public static and final modifiers don't need to be explicitly stated

```java
public interface MyInterface {
    int MY_CONSTANT = 9;
}
```

Even though it is not explicitly stated, `MY_CONSTANT` field is considered a constant which is `public`, `static` and `final`. You can add these modifiers anyway, but it is redundant.

## Abstract methods
The most important members of an interface are its methods. Interface methods have its differences from ordinary class methods as well:
- Methods don't have bodies
- Implementation is provided by classes implementing the interface
- Methods are considered public abstract even if not explicitly stated
- Cannot be final as abstract and final is an invalid combination

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
Java 5 introduced the concept of [Generics](https://docs.oracle.com/javase/tutorial/java/generics/index.html). In a nutshell, generics allow you to used type parameters instead of explicit types. This way, you can write code, which works with various number of types without sacrificing type safety or providing an implementation for each individual type.

In interfaces, from Java 5, you can define type parameters and then use them instead of the return type of a method or a method parameter type.

The following interface `Box<T>` works no matter whether you use it to store Strings, Integers, Lists, Shoes, or any other type.

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
Since Java 8, there you can include static methods in your interfaces. It works in a very different way than interfaces pre-Java 8. Originally methods in interfaces were all abstract, meaning you provide only the signature but not implementation. The implementation is the responsibility of classes implementing your interface.

With static methods in interfaces, you need to provide also implementation of the method's body. To include such method, simply use `static` keyword as usual. Static methods are considered public by default.

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
Unlike regular static methods, static methods in interfaces are not inherited. This means that if you want to call such method, you need to do it directly on the interface instead of an implementing class.

```java
MyInterface.staticMethod();
```

This behavior is very useful for preventing multiple inheritance issues. Imagine you have a class implementing two interfaces. Each of the interfaces has a static method with the same name and signature. Which one should take priority?

### Why is it useful
Imagine you have an interface and a whole bunch of helper methods which operate with classes implementing this interface.

Traditionally there used to be an approach of a companion class. In addition to the interface, there would be a utility class with a very similar name holding the static methods belonging to the interface.

You can find examples directly in the JDK. Interface `java.util.Collection` and corresponding utility class `java.util.Collections`.

With static methods in interfaces, this approach is obsolete and no longer necessary or recommended. You can have everything in one place together.

## Default methods
Default methods are similar to static methods in a way that that you need to provide method body. To declare a  default method simply use `default` keyword.

```java
public interface MyInterface {
    default int doSomething() {
        return 0;
    }
}
```

Unlike static methods, default methods are inherited by classes implementing the interface. What's important, the implementing class can choose to override the default behavior provided by the interface.

There is one exception, though. You cannot have default methods in your interface with the same signature as Object's `toString`, `equals` and `hashCode`. Check Brian Goetz's answer on the following page to understand the rationale behind the decision - [Allow default methods to override Object's methods](http://mail.openjdk.java.net/pipermail/lambda-dev/2013-March/008435.html).

### Why is it useful
Implementation directly in interfaces. It doesn't look quite right. So why was this functionality introduced in the first place?

There is one problem with interfaces. Once you expose your interfaces to other people, it is very hard to change them. Once you specify your API and others start using it, it is pretty much set in stone. Unless you want to break all your users.

Java, traditionally, takes backward compatibility very seriously. Default methods provide a way to extend existing interfaces with new methods. What's crucial is that default methods already provide some implementation. That means that classes implementing your interface does not need to implement any new methods and are still compatible. Of course, they can decide to later override default methods if the implementation is not fitting. So in a nutshell, you can provide new functionality to existing classes implementing your interface while preserving binary compatibility.

### Conflicts
Let's assume we have one class implementing two interfaces. These interfaces have each a default method with the same name and signature. 

```java
interface A {
    default int doSomething() {
        return 0;
    }
}

interface B {
    default int doSomething() {
        return 42;
    }
}

class MyClass implements A, B {
}
```

Now the same default method with the same signature is inherited from two different interfaces. Each interface has a different implementation.

So how does our class know which of the two different implementations should it use?

It doesn't. The code above results in a compilation error. If you need to make it work, you need to override the conflicting method in your class.

```java
interface A {
    default int doSomething() {
        return 0;
    }
}

interface B {
    default int doSomething() {
        return 42;
    }
}

class MyClass implements A, B {

    // Without this the compilation fails    
    @Override
    public int doSomething() {
        return 256;
    }
}
```

## Private methods
With Java 8 and the introduction of default and static methods, interfaces could suddenly contain not only method signatures but also implementation. When writing such implementations, it is a good practice to compose more complicated methods out of several simpler methods. Such code is easier to reuse, maintain, and understand.

Usually, you would use mostly private methods for such purpose because they are implementation detail and should not be visible and usable from the outside.

However, in Java 8, you cannot have private methods in interfaces. That means you could either:
1. Use long, complex and hard to understand method bodies.
2. Use helper methods which are part of the interface. This breaks encapsulation and pollutes public API of the interface and implementing classes.

Fortunately, [since Java 9, you can use private methods in interfaces](http://openjdk.java.net/jeps/213). They have the following characteristics:
- have method body, are not abstract
- can be static or non-static
- are not inherited by implementing classes and interfaces
- can call other methods from the interface
   - *private* can call private, abstract, default or static methods
   - *private static* can call only static and static private methods

```java
public interface MyInterface {

    private static int staticMethod() {
        return 42;
    }

    private int nonStaticMethod() {
        return 0;
    }
}
```

## Chronological order
Here is a chronological  list of the changes by Java version:

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
