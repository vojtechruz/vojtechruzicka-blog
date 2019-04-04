---
title: 'Java 12 Enhanced Switch'
date: "2019-04-07T22:12:03.284Z"
tags: ["Java"]
path: '/java-enhanced-switch'
featuredImage: './switch.jpg'
disqusArticleIdentifier: '99022 http://vojtechruzicka.com/?p=99022'
excerpt: 'Java 12 introduced whole lot of useful improvements to the good old switch, which makes it way more useful.'
---

![Switch](switch.jpg)

Java 12 introduced a whole lot of useful improvements to the good old switch, which makes it way more useful.

## Traditional switch
Good old switch is available in Java from the very, and little has changed since then until now. Java's switch follows closely the design of C and C++ including the weird parts.

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

Nothing fancy, you supply an HTTP result code, and it prints what does it mean. For each code provided, only the corresponding block is executed. As long as you remember to include `break`.

When a case is matched and executed, the switch automatically continues to the next case unless there was a `break` statement.

Let's look at an example. Let's pretend we forgot to include a break in the case 404:

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

When we pass `404` to the switch, the first case is a match and the block inside is executed. Because there is no break, the execution continues to the `case 418:` block even though the input is clearly not 418. In this block, there is `break` so the switch finally ends. The output is, however, the following:

```
Not found!
I am a teapot!
```

Not what we intended right? While fall-through behavior can be useful sometimes, more often than not it is just a result of accidentally missed break. Switch statements are therefore error-prone. In more complicated scenarios when there is a missing break, you may be in doubt whether it is an error or it was intentional. It can be useful in low-level code, which is performance-sensitive, but in the high-level code, it can be dangerous.

## Single value cases
One of the unfortunate limitations of the switch is that in each case, there can be just a single value. This forces you to rely on fall-through if you want to have the same behavior for multiple values.

```java
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
```java
case 400, 404, 405:
    System.out.println("Something is wrong with the request!");
```

Unfortunately, the old traditional switch does not support this.

## Enhanced Switch
Java 12 brought a whole lot of improvements to the traditional switch as [Java Enhancement Proposal 325: Switch Expressions (Preview)](http://openjdk.java.net/jeps/325). It solves most of the issues of the traditional switch and is prerequisite of [pattern matching](https://openjdk.java.net/jeps/305), which is to be provided in the future.

### Preview Feature
Enhanced switch functionality is, however, only available as a [preview feature](http://openjdk.java.net/jeps/12).

What does it mean?

>A preview language or VM feature is a new feature of the Java SE Platform that is fully specified, fully implemented, and yet impermanent. It is available in a JDK feature release to provoke developer feedback based on real-world use; this may lead to it becoming permanent in a future Java SE Platform.
> 
>Before the next JDK feature release, the feature's "real world" strengths and weaknesses will be evaluated to decide if the feature has a long-term role in the Java SE Platform and, if so, whether it needs refinement. Consequently, the feature may be granted final and permanent status (with or without refinements), or undergo a further preview period (with or without refinements), or else be removed.

Such features are shipped in the JDK but are not enabled by default. You need to explicitly enable it to use it. Needless to say, it is not intended for production use, but rather for evaluation and experimentation as it may get removed or heavily changed in another release.

First, make sure you actually have JDK 12 installed. Then, in IntelliJ IDEA you can enable preview features under `File -> Project Structure`.

![Idea Preview features](idea-enable-preview-features.png)

Alternatively, if building manually, you need to provide the following params to `javac`:

```
javac --release 12 --enable-preview ...
```

That is for compile-time. At run-time, you just provide `--enable-preview`

```
java --enable-preview ...
```

### Multiple values in a case
We already covered that one value per `case` is problematic and it limits you. Fortunately, with an enhanced switch, there is no longer such limitation. You can simply provide multiple comma-separated values:

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

Nice, concise and much easier to read than multiple cases with fall-through, right? So far so good. Note that we still use `break` statements.

### Switch expression
The traditional switch is a **statement**. In addition to that, the new switch also adds the possibility of switch **expression**.

What is the difference? In a nutshell, the statement is imperative to do some logic. The expression returns some value.

Take for example the `if-else` statement. If some condition is met, it executes `if` block. If the condition is not met, it executes else block:

```java
if(condition) {
    // do something
} else {
    // do something else
}
```

The same `if-else` logic can be achieved with the ternary operator s an expression, which returns some value if the condition is met and a different value otherwise:

```java
x = condition ? 1 : 2;
```

With the switch it is similar. The traditional switch is a statement. It directs the control flow based on your input. However, you can use the new switch also as an expression. That is, based on your input it can directly return some value.

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

As you can see we can now use the result of a switch expression and assign it to a variable.

Notice a few differences to the regular switch statement. First of all, it needs to end with a semicolon. Then, `break` is used differently. Instead of plain `break;` we use break with a value. It indicates what value should be returned from the expression. It is similar to `return;` and `return 5;` in methods. A void method which do not return value have just simple `return;` methods which do return some value have `return value;`. Switch statement, which does not return value, does have plain `break;`. Switch expression, which does return value have `break value;`.

### Null Pointer Exception Safety
There is another significant difference. Unlike with regular switch, the switch expression needs to cover all the possible input values.

Let's look at the previous example. The `errorCode` input is an integer. It has, of course, many possible values. Two first cases cover 404 and 500, the rest of the values is covered with the `default` branch.

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

So with switch expression, you have to provide a return value for all the possible inputs. Either by providing `case` for all the possible inputs (which can be easy for enums) or by providing `default` case.

This has some nice implications. The regular switch is error-prone when you forget to include one of the values, for example when using enums. Or when you later add another enum item but forget to update your switch statements. This cannot happen with switch expression as you would get compile error. Also, you cannot get null pointer exception as a result of switch expression.

### Switch with arrows
So far we've seen some nice improvements to the good old switch. One of the major nuisances was not covered though. Even with multi-value `case` blocks, we still had to make sure we included `break` properly otherwise we could face some nasty fall-through bugs.

Fortunately, the new switch can prevent this. There is a new type of syntax available using `->`.

```java
switch (errorCode) {
      case 404 -> System.out.println("Not found!");
      case 500 -> System.out.println("Internal server error!");
}
```

This syntax can be used for both switch statement and switch expression. In the example above we are using a simple switch statement. In the case of `->` switch you don't need to include `break` and it does not have fall-through behavior. And you can still use multiple values per one `case`.

It's more concise, easier to read and fool-proof — no more nasty errors. 

Now you have two options: if you want to use fall-through behavior, you use the switch with `case:`, otherwise, you can use the switch with `case ->`. Whatever approach you use, you need to stick with it for all the `case` branches in one switch. This results in error:

```java
// Invalid: both 'case:' and 'case ->' in the same switch
switch (errorCode) {
    case 404 -> System.out.println("Not found!");
    case 500: System.out.println("Internal server error!");
}
```

### Scope
One of the issues with the traditional switch is its scope. The whole switch statement is a single scope. That means if you declare a variable in one of the `case` branches, it exists in all the subsequent branches until the end of the switch.

```java
switch (errorCode) {
    case 404:
        System.out.println();
        String message = "Not found!";
        break;
    case 500:
        // Cannot declare 'message', it already exists
        String message = "Internal server error!";
        break;
}
```

This is, of course, needed for proper working of fall-through behavior. If you want to threat individual `case` branches as separate scope, you need to introduce a `{}` block, which is treated as a separate scope:

```java
switch (errorCode) {
    case 404: {
        // This variable exists just in this {} block
        String message = "Not found!";
        break;
    }
    case 500: {
        // This is ok, {} block has a separate scope
        String message = "Internal server error!";
        break;
    }
}
```

With switch using `->` there is no confusion with scoping. On the right side of `->` there can be either single expression, `throw` statement or a `{}` block. As a consequence of this, any local variables you want to declare and then use need to be enclosed in a `{}` block, which has its own scope, so no more variable clashing.

## IntelliJ IDEA support
The good news is that IDEA already has nice support for the extended switch.

In the example below, you can see a quick-fix for replacing the traditional switch with a switch expression. Note that IDEA also automatically adds a default branch, so all the possible inputs are covered.

![IDEA replace with switch expression](idea-replace-with-switch-expression.gif)

IDEA also warns you when your switch is not compliant, such in a case where you don't cover all the possible input values. Moreover, it offers you a quick fix:

![IDEA add default branch](idea-add-default-branch.gif)

If idea detects you have multiple `case` branches with the same behavior, it will warn you and offer you to merge these branches together:

![IDEA Merge case branches](idea-merge-branches.gif) 

## Future enhancements
As part of the [JEP-325](https://openjdk.java.net/jeps/325) specification, there is also mentioned another improvement, which is not currently implemented (as of Java 12), but may be introduced in the future.

> As a target of opportunity, we may expand switch to support switching on primitive types (and their box types) that have previously been disallowed, such as float, double, and long.

Currently, the switch allows input values only of types char, int, byte, short, their object wrappers (Character, Byte, Short, Integer) and String (since Java 7).

## Summary
- In Java 12 enhanced switch is a preview feature, which needs to be explicitly enabled
- You can now use `case` for multiple values
- In addition to the traditional switch statement, you can use switch expression, which returns a value
- Switch expression must cover all possible input values of given input type
- You can use new `->` syntax which does not have fall-through and does not require a break
- You cannot combine `case:` and `case ->` in one switch
- Both switch expressions and switch statements can use both case syntax (`->` or `:`)