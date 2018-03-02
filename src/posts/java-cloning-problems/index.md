---
title: 'Java Cloning Problems'
date: "2017-06-07T22:12:03.284Z"
tags: ['Java']
path: '/java-cloning-problems'
---

Java\'s mechanism for copying objects is deeply flawed. What are the alternatives? What are the pitfalls if you decide to use Java cloning anyway?
<!--more-->
![cloning](./clone.jpg)

Why clone objects?
------------------

There are several reasons why you may want to create a copy of an already existing object. For example - you may want to create just a slightly different version based on an existing object. The most common scenario would be probably making [defensive copies](http://www.javacreed.com/what-is-defensive-copying/) of objects. That is - if you are providing internal data of an object to other objects, you often want to make sure that instead of providing a reference to your actual internal state, you rather provide a copy. This means that no matter what the consumers do with the data, your original object is safe and is not affected.

Cloneable
---------

Java provides a mechanism for cloning of objects. Unfortunately, this mechanism is seriously flawed. There is the Cloneable interface. You would expect the interface to have a clone() method, which would return a copy of the object. Sadly, it is not the case. Cloneable is just a marker interface. That means, it has no methods whatsoever, it just marks the class as suitable for cloning. The clone method is present on the Object class instead.

The description of the Object's clone() method is the following (from the JavaDoc):

> The method {@code clone} for class {@code Object} performs a specific cloning operation. First, if the class of this object does not implement the interface {@code Cloneable}, then a {@code CloneNotSupportedException} is thrown. \... Otherwise, this method creates a new instance of the class of this object and initializes all its fields with exactly the contents of the corresponding fields of this object, as if by assignment; the contents of the fields are not themselves cloned. Thus, this method performs a \"shallow copy\" of this object, not a \"deep copy\" operation.
>
> The class {@code Object} does not itself implement the interface\* {@code Cloneable}, so calling the {@code clone} method on an object whose class is {@code Object} will result in throwing an exception at run time.

The implementation of Object\'s clone() method is - first check whether the current class actually implements Cloneable. If yes, proceed with the cloning execution. If not, throw CloneNotSupportedException checked exception.

The problem with the object\'s clone() method is that it is protected. That is a serious issue. By implementing Cloneable, the class does not actually provide cloning functionality. You cannot be sure that a class implementing Clonable actually overrides the clone method. What\'s worse, you cannot accept objects of type Clonable in your method and call clone(). You need to know the exact type (e.g., Person) to be able to call clone(). The use of Clonable interface is highly inconsistent with the regular use of interfaces. Instead of committing to be able to provide some functionality to the callers, implementing Cloneable instead modifies the behavior of a protected method in a whole different class.
 
### Implementation

The first thing you need to do for your class to support cloning is to implement Cloneable interface. Even if you don\'t want to write any custom cloning logic and you want to use the shallow cloning provided by Object, you cannot. You are unable to use clone method inherited from the Object as it is protected and would not be directly accessible. You need to override it and make it public. To utilize default cloning implementation provided by Object, you then need to call super.clone().

The basic implementation of the clone method in a class implementing Cloneable interface would be similar to this:

```java
@Override
public Object clone() throws CloneNotSupportedException {
    return super.clone();
}
```

Note that the clone method returns Object. The caller would then need to cast the object every time the method is called. Fortunately, since Java 5, you can [change the return type](https://www.java-tips.org/covariant-return-types.html) of an overriding method as long as the new type is a subtype of the original type. That means, If you are writing the clone method for a Person class, you can return directly Person. You still need to cast inside the clone method, but you remove this burden from the callers. Also, it is valid to [remove exception](https://www.javatpoint.com/exception-handling-with-method-overriding) declaration from an overriding method. Therefore, we can safely remove the checked exception (throws CloneNotSupportedException) to make the usage a bit more convenient - callers are not forced to catch checked exception CloneNotSupportedException anymore.

```java
@Override
public Person clone() throws CloneNotSupportedException {
    return (Person)super.clone();
}
```

### Deep copy

The implementation above utilizes Object\'s implementation of cloning thus returning a [shallow copy](https://stackoverflow.com/q/184710/4560142) of the object. That means, if the copied object contains references to other objects, these objects are not cloned. This results in copied object pointing to the same objects as the original. A deep copy would clone even referenced objects. It may be fine in some cases, but not in others. Usually, you want your copies to be independent and changes in one should not result in unwanted changes in the other.

Nevertheless, the shallow copy could be sufficient in some cases. One of the cases is if the object is immutable (including its references). If the object cannot change state, it safe to provide just a shallow copy functionality. The same applies if all the fields of the object\'s fields are primitives (and/or immutables). Primitives are copied by value, not by reference, which means the copied instance will be completely independent on the original.

In other cases, it is necessary to provide deep copy functionality. The problem is that you can no longer use Object\'s clone mechanism for that and you need to implement your own. In such cases, it may be easier to try on of the alternative cloning approaches (see Alternatives below). If you want to implement it anyway, you have basically two options. First - do all the cloning manually - create a new instance using a constructor and fill all the fields. Second - still use super.clone(), but instead of returning the cloned object directly, just manually copy the fields which are not safe - that is primitive or immutable.

The problem with the second approach is that it does not work well with final fields as you cannot receive an already constructed object and then assign its final fields. That goes directly against maximizing immutability.

Alternatives
------------

### Copy Constructors

One option to provide copy functionality to your class instead of implementing Cloneable is to provide a copy constructor(s) instead. A copy constructor is like a regular constructor, which returns a new instance of the class. As an input, it has an object, which is supposed to be copied.  Inside the body of the constructor, you implement your custom cloning logic.

```java
public Person(Person personToCopy) {
    this.firstName = personToCopy.firstName;
    this.lastName = personToCopy.lastName;
    ...
}
```

This has several advantages. You don\'t need to implement any interface. You can accept any interface your class implements as an input and use it as a source of the clone instead (however, then this is rather a conversion constructor then, but can be useful under some circumstances). It does not force you to throw CloneNotSupportedException checked exception (and the caller is not forced to catch the exception).

### Static Factory Methods

This approach is similar to copy constructors and has similar advantages. The difference is that instead of a constructor, it utilizes a static method, which takes an object to be copied as an input and returns a copied instance.

```java
public static Person deepCopyPerson(Person personToCopy) {
    Person copiedPerson = new Person();
    copiedPerson.firstName = personToCopy.firstName;
    copiedPerson.lastName = personToCopy.lastName;
    ...
    return copiedPerson;
}
```

I find it useful to include in the method\'s name whether it is a deep or a shallow copy, so it is immediately obvious from the code and it does not need to be documented separately. Depending on the needs you can choose whether you need a shallow or a deep copy or provide both. Unlike with copy constructors, you can decide whether to return an instance of the same class or rather any subclass.

### Serialization/Deserialization

Cloning and creating new instances through copy constructors and static factory methods are not the only ways to create a new instance of a class. A new instance is also created when deserializing a previously serialized object. Therefore, instead of cloning, you can serialize an object and then immediately deserialize it. That would result in a new instance created.

The good news is that there are already libraries supporting cloning using serialization/deserialization, such as [Apache Commons Serialization Utils](https://commons.apache.org/proper/commons-lang/apidocs/org/apache/commons/lang3/SerializationUtils.html). This makes it very easy to clone objects using SerializationUtils.clone()

```java
public static T clone(T object)
```

The serialization approach has some advantages:

-   Simple alternative to cloning, especially when using library such as Apache Commons
-   Provides Deep Cloning
-   Suitable even for complex object graphs
-   Can be used on existing classes that currently provide just shallow copy

This also has some limitations and disadvantages:

-   All the classes in the object graph needs to implement Serializable
-   Transient fields are not cloned (Transient means not to be serialized)
-   Way more expensive than clone or copy constructors/factory methods

In some cases, this can be used, but you don\'t always have the luxury of having all the objects Serializable and with no transient fields. Especially when using third-party classes. Also, the performance hit is very significant. Depending on the amount of cloning required and performance requirements, it can be easily too much. More info about performance hit and the serialization approach, in general, can be found in [Java Tip 76: An alternative to the deep copy technique](http://www.javaworld.com/article/2077578/learn-java/java-tip-76--an-alternative-to-the-deep-copy-technique.html).

### Reflection

Reflection is yet another way of making a copy of an object. Using reflection you can read all the fields of a class, then copy them and then assign them to a new instance even if the fields are not publicly accessible. There are various libraries and utilities providing this functionality.

If you are following JavaBeans convention and a shallow copy is enough for you (maybe all the fields are immutable/primitives?), you can use [Apache Commons BeanUtils.cloneBean()](https://commons.apache.org/proper/commons-beanutils/javadocs/v1.8.3/apidocs/org/apache/commons/beanutils/BeanUtils.html#cloneBean(java.lang.Object)), which provides this functionality. Alternatively, if you are using Spring, you can use similar util - [Spring BeanUtils.copyProperties()](http://docs.spring.io/spring/docs/current/javadoc-api/org/springframework/beans/BeanUtils.html).

If you are looking for a deep copy, you cannot use BeanUtils. There are some other alternatives, such as [uk.com.robust-it.cloning library](https://github.com/kostaskougios/cloning) or [Kryo\'s deep cloning feature](https://github.com/EsotericSoftware/kryo#copyingcloning).

This approach can be used even if the classes don\'t implement the Serializable and therefore is well suited also for third-party libraries, where you cannot modify the code to support serialization or regular cloning. The performance is also much better than the regular serialization.

Conclusion
----------

The process to make your class cloneable is the following:
1.  Implement the Cloneable interface
2.  Override the clone() method.
3.  Call super.clone() if a shallow copy is sufficient.
4.  Implement custom cloning logic, if a deep copy is required.

Alternatively, you can use various existing third-party libraries, which are usually based on serialization/deserialization or reflection approach.

Further Reading
---------------

- [Josh Bloch on Design - Copy Constructor versus Cloning](http://www.artima.com/intv/bloch13.html)
- [Java Design Issues - A Conversation with Ken Arnold, Part VI - The clone Dilemma](http://www.artima.com/intv/issues3.html)
- [Effective Java, 2nd Edition, Item 11: Override clone judiciously](https://www.amazon.com/Effective-Java-2nd-Joshua-Bloch/dp/0321356683)