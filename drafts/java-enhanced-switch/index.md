---
title: 'Java 12 Enhanced Switch'
date: "2019-04-07T22:12:03.284Z"
tags: ["Java"]
path: '/java-enhanced-switch'
featuredImage: './switch.jpg'
disqusArticleIdentifier: '99022 http://vojtechruzicka.com/?p=99022'
excerpt: ''
---

![Switch](switch.jpg)


## Traditional switch
Good old switch is available in Java from the very beggining and little has changed since then until now. Java's switch follows closely the design of C and C++ including the weird parts.

### Fall-through
Most notably, the infamous **fall-through** behavior. What does it mean? Let's look at a simple switch first:

```java
switch (errorCode) {
    case 404:
        System.out.println("Not found!");
        break;
    case 418:
        System.out.println("I am a teapot!");
        break;
    case 500:
        System.out.println("Internal server error!");
        break;
    default:
        System.out.println("Unknown code!");
}
```

Nothing fancy, you supply a HTTP result code and it prints what does it mean. For each code provided, only the corresponding block is executed. As long as you remember to include `break`.

When a case is matched and executed, the switch automatically continues to the next case unless there was a `break` statement.

Let's look at an example. Let's pretend we forgot to include break in the case 404:

```java
switch (errorCode) {
    case 404:
        System.out.println("Not found!");
        // missing break here !!!
    case 418:
        System.out.println("I am a teapot!");
        break;
    case 500:
        System.out.println("Internal server error!");
        break;
    default:
        System.out.println("Unknown code!");
}
```

When we pass `404` to the switch, the first case is a match in the block inside is executed. Because there is no break, the execution continues to the `case 418:` block even though the input is clearly not 418. In this block there is `break` so the switch finally ends. The output is however the following:

```
Not found!
I am a teapot!
```

Not what we intended right? While fall-through behavior can be useful sometimes, more often than not it is just a result of accidentally missed break. Switch statements are therefore error prone. In more complicated scenarious when there is missing break, you may be in doubt whether it is an error or it was intentional. It can be useful in low level code, which is performance-sensitive, but in high level code is dangerous.

## Single value cases
On of the unfortunate limitations of switch is that in each case, there can be just a single value. This forces you to rely on fallthrough if you want to have the same behavior for multiple values.

```
switch (errorCode) {
    case 400:
    case 404:
    case 405:
        System.out.println("Something is wrong with the request!");
        break;
    case 500:
    case 501:
    case 505:
        System.out.println("Something is wrong with the server!");
        break;
}
```

What would be much simpler is specifying multiple values per case:
```
case 400, 404, 405:
        System.out.println("Something is wrong with the request!");
```

Unfortunately, traditional old switch does not support this.

## Enhanced Switch
Java 12 brought whole lot of improvements to the traditional switch as [Java Enhancement Proposal 325: Switch Expressions (Preview)](http://openjdk.java.net/jeps/325). It solves most of the issues of traditional switch and is prerequisite of [pattern matching](https://openjdk.java.net/jeps/305), which is to be provided in the future.

### Preview Feature
Enhanced switch functionality is, however, only available as a [preview feature](http://openjdk.java.net/jeps/12).

What does it mean?

>A preview language or VM feature is a new feature of the Java SE Platform that is fully specified, fully implemented, and yet impermanent. It is available in a JDK feature release to provoke developer feedback based on real world use; this may lead to it becoming permanent in a future Java SE Platform.
> 
>Before the next JDK feature release, the feature's "real world" strengths and weaknesses will be evaluated to decide if the feature has a long-term role in the Java SE Platform and, if so, whether it needs refinement. Consequently, the feature may be granted final and permanent status (with or without refinements), or undergo a further preview period (with or without refinements), or else be removed.

Such features are shipped in the JDK but are not enabled by default. You need to explicitly enable it to use it. Needless to say, it is not intended for production use, but rather for evaulation and experimentation as it may get removed or heavily changed in another release.

First, make sure you actually have JDK 12 installed. Then, in IntelliJ IDEA you can enable preview features under `File -> Project Structure`.

![Idea Preview features](idea-enable-preview-features.png)

Alternatively, if building manually, you need to provide the following params to `javac`:

```
javac --release 12 --enable-preview ...
```

That is for compile-time. At run you just provide `--enable-preview`

```
java --enable-preview ...
```

### Multiple values in a case
We already covered that one value per `case` is problematic and it limits you. Fortunately, with enhanced switch, there is no longer such limitation. You can simply provide multiple comma-separated values:

```java
switch (errorCode) {
    case 400, 404, 405:
        System.out.println("Something is wrong with the request!");
        break;
    case 500, 501, 505:
        System.out.println("Something is wrong with the server!");
        break;
}
```

Nice, concise and much easier to read than multiple cases with fall-through, right? So far so good. Note that we still use break.

### Switch expression
The traditional switch is a **statement**. In addition to that, the new switch adds also possibility of switch **expression**.

What is the difference? In a nutshell, statement is a imperative to do some logic. Expression returns some value.

Take for example `if-else` statement. If some condition is met, it executes `if` block. If the condition is not met,it executes else block:

```java
if(condition) {
    // do something
} else {
    // do something else
}
```

The same `if-else` logic can be achieved with ternary operator s an expression, which returns some value if the condition is met and a different value otherwise:

```java
x = condition ? 1 : 2;
```

With switch it is similar. Traditional switch is a statement. It directs the control flow based on your input. However, you can use the new switch also as an expression. That is, based on your input it can directly return some value.

```java
String message = switch (errorCode) {
    case 404:
        break "Not found!";
    case 500:
        break "Internal server error!";
    default:
        throw new IllegalArgumentException("Unexpected value: " + errorCode);
};
```

As you can see we can now use result of a switch expression and assign it to a variable.

Notice a few differences to the regular switch statement. First of all, it needs to end with semicolon. Then, `break` is used differently. Instead of plain `break;`we use break with a value. It indicates what value should be returned from the expression. It is similar to `return;` and `return 5;` in methods. Void method which do not return value have just simple `return;` methods which do return some value have `return value;`. Switch statement, which does not return value, does have plain `break;`. Switch expression, which does return value have `break value;`.

### Null Pointer Exception Safety
There is one another major difference. Unlike with regular switch, the switch expression needs to cover all the possible input values.

Let's look at the previous example. The `errorCode` input is integer. It has, of couse many possible values. Two first cases cover 404 and 500, the rest of the values is covered with `default` branch.

That means that all possible integer values are covered. No matter what the input is, the switch always returns something. Let's try to remove the default branch just as a test.

```java
String message = switch (errorCode) {
    case 404:
        break "Not found!";
    case 500:
        break "Internal server error!";
    // default:
    //    throw new IllegalArgumentException("Unexpected value: " + errorCode);
};
```

This will result in the following error:

```
Error:(11, 26) java: the switch expression does not cover all possible input values
```

So with switch expression you have to provide return value for all the possible inputs. Either by providing `case` for all the possible inputs (which can be easy for enums) or by providing `default` case.

This has some nice implications. Regular switch is error-prone when you forget to include one of the values, for example when using enums. Or when you later add another enum item, but forget to update you switch statements. This cannot happen with switch expression as you would get compile error. Also you cannot get null pointer exception as a result of switch expression.

### Switch with arrows
So far we've seen some nice improvements to the good old switch. One of the major nuisances was not covered though. Even with multi-value `case` blocks, we still had to make sure we included `break` properly otherwise we could face some nasty fall-through bugs.

Fortunately, new switch can prevent this. There is a new type of syntax available using `->`.

```java
switch (errorCode) {
      case 404 -> System.out.println("Not found!");
      case 500 -> System.out.println("Internal server error!");
  };
```

This syntax can be used for both switch statement and switch expression. In the example above we are using simple switch statement. In case of `->` switch you don't need to include `break` and it does not have fall-through behavior. An you can still use multiple values per one `case`.

It's more concise, easier to read and fool-proof. No more nasty errors. 

Now you have two options, if you want to use fall-through behaviour, you use switch with `case:`, otherwise you can use switch with `case ->`. Whatever approach you use, you need to stick with if for all the `case` branches in one switch. This results in an error:

```java
// Invalid: both 'case:' and 'case ->' in the same switch
switch (errorCode) {
    case 404 -> System.out.println("Not found!");
    case 500: System.out.println("Internal server error!");
};

```

## IntelliJ IDEA support

TODO
- scoping
https://www.chrisnewland.com/java-variable-scope-in-switch-statement-150
- preparation for pattern matching http://cr.openjdk.java.net/~briangoetz/amber/pattern-match.html
- intellij idea support
   - https://blog.jetbrains.com/idea/2019/01/intellij-idea-2019-1-early-access-program-is-open/
   - https://blog.jetbrains.com/idea/2019/02/java-12-and-intellij-idea/
- arrow and colon syntax ins not allowed
- must cover all posible enum values   
As a target of opportunity, we may expand switch to support switching on primitive types (and their box types) that have previously been disallowed, such as float, double, and long.