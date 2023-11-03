---
title: 'Java 10 – var – Local Variable Type Inference (JEP-286)'
date: "2018-01-04T22:12:03.284Z"
dateModified: "2018-12-16"
tags: ['Java']
path: '/java-10-var-local-variable-type-inference-jep-286'
featuredImage: './local-variable-inference-java-10.jpg'
excerpt: 'In Java 10, you no longer need to explicitly declare a type of local variables, which significantly reduces boilerplate and increases readability.'
---

<PostHeader frontmatter={props.data.mdx.frontmatter} />

## Type inference in Java 7 - The Diamond operator

There is no denying that Java can be very verbose. Take variable declaration and assignment for example.

```java
User joe = new User();
```

The type is repeated twice even if it is the same on left and right. With Generics, the boilerplate is even more apparent.

```java
Map<User, List> accounts = new Map<User, List>();
```

In Java 7, there is a nice feature, called diamond operator. It allows you to provide just a pair of empty angle brackets instead of all the type parameters declaration on the right-hand's side.

```java
Map<User, List> accounts = new HashMap<>();
```

Much better, right?

## JEP 286: Local-Variable Type Inference

Even though the diamond operator helps a bit, you can use it for generics only, and there is still a lot of boilerplate. What if you could just write \'var\' instead of an explicit type like this:

```java
var joe = new User();
```

No more type duplication and much more concise, right? Don\'t get fooled though - this does not mean that Java has suddenly a dynamic typing now. Everything is still statically typed. It is just syntactic sugar for writing:

```java
User joe = new User();
```

How is this possible? Well, if you are declaring a variable and initializing it at the same time (assigning a value), you can detect what type your variable should be based on the value assigned. No need to repeat the type twice. Since it is just a syntactic sugar, the compiler detects the type at compile time and the resulting bytecode is exactly the same as if you declared the type explicitly.

This feature is likely to be part of Java 10 and is described in detail in [Java Enhancement Proposal 286](http://openjdk.java.net/jeps/286).

## Better readability

The main benefit of this feature is not that you can WRITE less code. Optimizations of writing speed are greatly overrated and are much less important than reading speed and readability. After all, you are going to spend much more time reading a piece of code than writing it.

Using var improves the readability in two ways. First, there is a lesser amount of text to read and the information about type is not duplicated. That means less boilerplate to filter out when reading. Second, when all the type definitions on the left have the same length, it is much easier to read line by line as all the variable names are neatly aligned. And when you are using nice, self-explanatory variable names clearly revealing intent, it is in most cases all you need to know. Type is just a detail, which you can look for when needed, but unnecessary when skipping through the code. Compare this:

```java
var userService = new UserService();
var userAccounts = userService.getUserAccounts();
var myAccounts = userAccounts.get(ME);
```

To This:

```java
UserService userService = new UserService();
Map<User, List<PersonalAccount>> userAccounts = userService.getUserAccounts();
List<PersonalAccount> myAccounts = userAccounts.get(ME);
```

## Limitations

Locations and situations where you can use var are actually somewhat limited. As the name suggests, you can use it only for local variables. Not for class fields, not for method return types. The only place where you can use them is in for and for-each loops:

```java
for (var user: users) {...}
for (var i = 0; i < users.size(); i++) {...}
```

Another limitation is that variable declared using var needs to be immediately assigned. That means the following is not valid:

```java
var joe;
joe = new User();
```

Initializing var variable with null is also not allowed. You cannot also declare multiple variables in a compound declaration.

```java
int x = 1, y = 2; //OK
var x = 1, y = 2; //Not OK
```

Also, be careful when combining var and the diamond operator.

```java
var users = new HashHap<>();
```

In this case, you are forcing the compiler to infer both left and right-hand side. Usually, it will result in a compiler error. Or in some cases, it will just infer Object as a generic type parameter.

## Backwards compatibility

How does this feature affect your existing applications? Will they be compatible? Adding a new keyword would mean that you no longer can use it as an identifier, which would break existing applications. In fact, var is not a keyword, but rather a reserver type name.  That means you can still use var as variable, package or method name. You cannot, however, use it now as a class or interface name. Applications doing so will no longer compile. Fortunately, such name conflicts with Java naming convention, so you should be safe. As long as you follow the convention, that is.

## Performance

If you are concerned about a performance hit this feature could bring, don\'t be. Remember, the types are not inferred at runtime but at compile time. That means the resulting bytecode is the same as with explicit type declaration - it does include the information about the type. That means no extra processing at runtime.

## Criticism

### Readability decreased

Some argue that using var achieves actually the opposite effect - the code is less readable as in some cases it is not obvious which type a variable has when reading the code. That is mostly in cases when not explicitly calling a constructor in the assignment but rather calling a method. To some degree, it is true. You need to be careful in such cases. The good news is that you can still use explicit type declaration when appropriate. But usually, it may not even be necessary. When you have a good name of the variable and the method called, you will have a pretty good idea what is going on even without explicit type. If you find a cryptic statement with var, it will be in many cases just an indication that you cannot express intent in variable and method names well enough. And of course, a good IDE will help a lot.

### val not included

In most of other statically typed languages, the Local Variable Inference is already a thing. Java is, as always, late to the party. On JVM, both Kotlin and Scala support it and both in a different way than Java. Instead of just var, they provide two options - var and val. Var is meant for variables, which can be reassigned, val for those that not (it is the equivalent of Java\'s final keyword).

Why does not Java offer the same? Actually, when the JEP-286 was discussed, there were both variants on the table. There was a [survey ](https://www.surveymonkey.com/results/SM-FLWGS5PW/)with about 2500 respondents, which was supposed to gather preferences on which option should be chosen. Including some other naming conventions such as let or auto.

While var + val variant was a clear winner by a number of votes (48% vs 23%), it was rejected in favor of var only. To [quote Brian Goetz](http://mail.openjdk.java.net/pipermail/platform-jep-discuss/2016-December/000066.html):

> While it was not the most popular choice in the survey, it was
> clearly the choice that the most people were OK with.  Many hated
> var/val; others hated var/let.  Almost no one hated var-only.

There are more reasons of course. One of them is a clash with final keyword. Val would basically mean *final var* leading to inconsistency of final keyword usage. For local variables, val would not be so important anyway as they are usually [effectively final](http://ilkinulas.github.io/programming/java/2016/03/27/effectively-final-java.html) anyway and immutability is much more important on field level than on method level, where each method is ideally very short.

## Try It

Even though Java 10 is not released yet, you can already try the feature. Download [JDK 10](http://jdk.java.net/10/). IntelliJ IDEA already has [good support](https://blog.jetbrains.com/idea/2017/11/intellij-idea-2017-3-eap-brings-support-for-local-variable-type-inference/) for this feature.

## UPDATE: Style guide 
Check out this useful guide for `var` best practices - [Style Guidelines for Local Variable Type Inference in Java](http://openjdk.java.net/projects/amber/LVTIstyle.html).

## UPDATE: Java 11
Currently (even pre-java 10), for lambdas you can omit explicit type declaration and it will be inferred.

```java
(x, y) -> x.process(y)
```

From Java 11, you'll be able to use `var` here also, so the syntax is uniform. 

```java
(var x, var y) -> x.process(y)
```

Apart from uniform syntax, it does not look very appealing as it is just more characters with the same effect. There are some advantages though.

When you use implicitly typed parameters in your lambdas (such as `(x, y) -> ...`), you cannot use annotations on the parameters. You cannot also make the parameters final. With `var`, you can use both annotations and `final` as you could with the explicit type declaration. It is just more concise as you use only `var` instead of explicit type.

```java
// Invalid: Implicit types without var cannot have annotations or final 
(final x, @NotNull y) -> ...
// Valid: Explicit types support both, but are less concise
(final String x, @NotNull String y) -> ...
// Valid: var supports both and is concise
(final var x, @NotNull var y) -> ...
```

There are some limitations though. If you use `var`, you need to use it for all the parameters, not just some of them. That means you cannot combine `var` and explicitly declared types and implicitly declared types with no keyword:

```java
// Invalid: All parameters must have `var` or nothing
(var x, y) -> ...
// Invalid: Cannot mix explicit type and var
(var x, int y) -> ...
```

See [JEP 323: Local-Variable Syntax for Lambda Parameters](http://openjdk.java.net/jeps/323) for more details.

## Conclusion

The Local Variable Inference is a nice feature, which reduces boilerplate and increases readability. As always, var on its own is no silver bullet. You need to make sure that you use descriptive variable names and in case type information is not apparent you can still use good old explicit type declaration.