---
title: Avoid Utility Classes
date: "2017-03-07T22:12:03.284Z"
tags: ['OOP', 'Java']
path: '/avoid-utility-classes'
---
![Utility Class](./avoid-utility-classes.jpg)

Utility classes, while popular, have some serious implications and you should think twice before using them.

What is Utility Class?
----------------------

Utility Class, also known as Helper class, is a class, which contains just static methods, it is stateless and cannot be instantiated. It contains a bunch of related methods, so they can be reused across the application. As an example consider Apache StringUtils, CollectionUtils or java.lang.Math.

### Implementation

Utility Class is usually declared final, so it cannot be subclassed. The constructor is declared as private with an explaining comment and even possible exception when invoked. With a private constructor declared, the default one is not generated and class cannot be instantiated by other classes.

```java
public final class UtilityClass {

    // Private constructor to prevent instantiation
    private UtilityClass() {
        throw new UnsupportedOperationException();
    }

    //public static methods here

}
```

Why are Util Classes so common?
-------------------------------

By the OOP principles,  an object should contain both data and a behavior performed over that data. Utility classes are just behavior, all the data are passed as inputs. It is in no way Object Oriented, it is a more of a Procedural way of thinking. When switching to OOP, developers with a procedural mindset usually used a lot of utility classes as it is closer to their way of thinking. Unnecessary Util Classes became very common even if there was a good OO alternative. And most people didn't question the pattern as it was so widespread.

These days, it is more about convenience. First of all, it is much easier to use Util Classes than regular ones, because there is no need to instantiate them, so it is just less code and overall simpler. The second of all, Util Classes are a convenient stash of methods which do not belong anywhere else. When adding some new functionality, it is much easier to put it in some generic Util Class, which already contains various methods barely having anything in common than to actually think about proper OO design.

The Downside
------------

The main problem is that a class depending on a static method from a Utility Class has tight coupling. You are using a specific external dependency, not an abstraction. There is no way to switch that dependency under various circumstances. Usually, you would be able to provide a subclass of that dependency instead or another dependency implementing the interface. You lose that flexibility completely.

### Testing

Since you have a hard dependency on the Util Class, you cannot easily provide a mock implementation. That makes testing rather difficult. You cannot isolate dependencies on Utility Classes and test just your class in isolation. Therefore you are testing all your static dependencies as well. [Miško Hevery](http://misko.hevery.com/about/) has a nice article about that - [Static Methods are Death to Testability](http://misko.hevery.com/2008/12/15/static-methods-are-death-to-testability/).

### Inversion of Control

Ideally, a class should not be responsible for obtaining its dependencies. They should be externally injected through constructors or setters without class knowing specific implementation. This can be managed by Dependency Injection containers or manually, for example in tests. Depending on needs, different implementations can be provided. In case of setters, the behavior can be changed even at runtime. This is not possible when using Utility Classes.

When all the dependencies are provided externally, the class does not suffer from \"dependency hiding\". From the class\'s public interface it is obvious, which dependencies it requires to proper function. It is still not a violation of encapsulation as the class just clearly states its collaborators, but does not reveal the way of using them to perform its core purpose.

### Proxying

Many frameworks depend on dynamic proxies for adding additional functionality to class instances. Consumers are provided with a proxy instead of a regular instance. It has the required type but provides some other behavior on top of that. For example, you can add method-level security restricting access to methods unless the user has a specific role. Another example can be adding AOP logging to method calls (which is not a core responsibility of the class but rather cross-cutting concern and should be managed externally). Such behavior cannot be added to classes using dynamic proxies.

### Single Responsibility

As already mentioned, a class using Utility Class is responsible not only for its original role, but also for obtaining its dependencies. Another problem is that existing Utility Classes have tendencies to rot. Usually, such classes are created from a code, which has no better or proper place to be. Over time, if you are not very strict, these classes tend to accumulate more and more code, which may be not so related to the original methods. The class would lose its original single responsibility and become a jack-of-all-trades.

Alternatives
------------

In most of the cases, it is preferable to add behavior directly to the already existing classes as non-static methods. This way, proper OO design is maintained without any of the downsides of the static methods.

If there is no such place to put that logic in, it is still better to create a new class with the desired behavior. But not as a Util Class with static methods, but as a regular class, which needs to be instantiated and can be subclassed. In such case, this dependency should be provided to the consumer class via a constructor or setter. It is slightly more code and less convenient but the benefits far outweigh this.

If you decide, in spite of all the drawbacks, to use Utility Classes, make sure at least to separate logic well into different classes so you do not end with almighty god Utility Class containing various unrelated functionalities.

Conclusion
----------

I wouldn't go as far as saying that utility classes are evil and should never ever be used. However, when creating one, think twice. Be aware of all the implications of such approach. Maybe you there is already a class where that functionality would fit. Maybe you can use a regular instantiable class instead. Should it really be a util class or are you just too lazy to find a proper place to put the new logic in?
