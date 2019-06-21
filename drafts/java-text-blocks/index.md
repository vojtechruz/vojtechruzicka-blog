---
title: 'Java 13 Text Blocks'
date: ""2019-06-21T22:12:03.284Z""
tags: ["Java"]
path: '/java-text-blocks'
featuredImage: './java-text-blocks.jpg'
disqusArticleIdentifier: 'TODO http://vojtechruzicka.com/?p=TODO'
excerpt: 'Java 13 finally brings support for multi-line string literals after dropping similar functionality from Java 12.'
---

![Java Text Blocks](./java-text-blocks.jpg)

Java 13 finally brings support for multi-line string literals after dropping similar functionality from Java 12.

## String literals in Java
Declaring a string literal in Java is easy:

```java
String myString = "Behold, a string literal!";
```

Nothing new, right? Traditional string literals have, however, some inconvenient limitations.

First of all, the whole literal needs to be on just one line. This is ok for simple short strings, but for longer ones, you need to resort to concatenating multiple string literals.

```java
String myString = "This is my string\n" +
        " which I want to be \n" +
        "on multiple lines.";
```

This is cumbersome and hard to read. The other problem is that various characters cannot be represented directly, but need to be escaped with `\`, such as `"` or "\".

This makes your strings even harder to read and work with.

```java
String path = "Open \"C:\\Program Files\\Java\\jdk1.8.0_152\"";
```

This gets especially messy in cases such as regular expressions. How to handle this issue though?

## Other JVM languages
As usually, Java is late to introduce functionality which is already common in many other languages, even those on JVM. Kotlin, Scala or Groovy already support multiline strings literals using `""""` notation instead of usual `"`. Look at the following example in Kotlin.

```
val text = """
This is my cool string,
which I want to span
multiple lines.
It can have backslash \
and even double-quotes "
"""
```

As you can notice, not only is it multiline, but also you don't need to escape your characters anymore. This is called Raw String literal, which means all the characters are interpreted as is and no escaping is necessary.

## Raw String literals in Java
In Java 12, there was originally proposal to include [Raw String Literals (JEP-326)](http://openjdk.java.net/jeps/326). The behavior was very similar to the example in Kotlin above. But instead of using `""""` as in other JVM languages, it used backtick `\`` notation. The concept was slightly unusual in a way that you could use any number of backticks and the same amount of backtick at the end. This way it was not necessary to escape backticks inside a spring literal no matter how many consecutive backticks were present.

```
`This uses a single backtick`
``This can contain a backtick `, see?``
```I can use any number of backticks```
``` 

One problem with raw string literals is usually indentation. Every character in the multiline raw string literal is interpreted as is including indentation, which is supposed to be ther just for better code readability rather than part of the literal itself. Consider the following example:

```
  public static void main(String[] args) {
      String myString =
      `This is my string
      which I want to be
      on multiple lines.`;
      System.out.println(myString);
  }
```    

If you print it, all the lines except the first will have indentation present.

```
This is my string
        which I want to be
        on multiple lines.
```

You would neet to fix this menually, possibly with newly itroduced String methods `align()` and `indent()`. Not very practical, but it's something you have to endure if using raw strings.

You can read more about original Raw String Literals proposal in the following article:

TODO

This proposal was, however [dropped before the final release](http://mail.openjdk.java.net/pipermail/jdk-dev/2018-December/002402.html) of Java 12 and is now considered obsolete.

> While we can expect that for any language feature, there will be a 
  nontrivial volume of "I would have preferred it differently" feedback, 
  in reviewing the feedback we have received, I am no longer convinced 
  that we've yet got to the right set of tradeoffs between complexity and 
  expressiveness, or that we've explored enough of the design space to be 
  confident that the current design is the best we can do.  By 
  withdrawing, we can continue to refine the design, explore more options, 
  and aim for a preview that actually meets the requirements of the 
  Preview Feature process (JEP 12).

## Multiline String literals in Java
After the withdrawal of the original proposal, [the discussion was restarted](https://mail.openjdk.java.net/pipermail/amber-spec-experts/2019-January/000931.html) and resulted in a brand new proposal, which will be introduced in Java 13 as a Preview Feature. Its called [JEP 355: Text Blocks (Preview)](https://openjdk.java.net/jeps/355).

It is not supposed to be implementation of Raw String Literals, but rather multiline String literals, which will still allow escapes, although you'll not be required to use all of them. On top of that, it will not be necessary to handle all the indentation issues, which was necessary with Raw String Literals.


## Preview Feature
Text blocks will be only available as a preview feature in Java 13. What does it mean?

> A preview language or VM feature is a new feature of the Java SE Platform that is fully specified, fully implemented, and yet impermanent. It is available in a JDK feature release to provoke developer feedback based on real-world use; this may lead to it becoming permanent in a future Java SE Platform.

> Before the next JDK feature release, the feature's "real world" strengths and weaknesses will be evaluated to decide if the feature has a long-term role in the Java SE Platform and, if so, whether it needs refinement. Consequently, the feature may be granted final and permanent status (with or without refinements), or undergo a further preview period (with or without refinements), or else be removed.

Such features are shipped in the JDK but are not enabled by default. You need to explicitly enable them to use them. Needless to say, it is not intended for production use, but rather for evaluation and experimentation as it may get removed or heavily changed in a future release.

When building your app you need to specify that preview features should be turned on by providing  the following params to `javac`:

```
javac --release 12 --enable-preview ...
```

That is for compile-time. At run-time, you just provide `--enable-preview`

```
java --enable-preview ...
```

## Text Blocks
Unlike the declined Raw String Literals, Text Blocks are surrounded by three double quotes `""""`, same as in Groovy or Kotlin. It is more in sync with plain String literals and other JVM languages.

```
String myBlock =  """
                  line 1
                  line 2
                  line 3
                  """
```

### Escaping 

Note that Text Blocks are not raw strings and you can still use escapes. However, you don't need to bother with the most common ones.
- New line `\n` is no longer needed as Text  Blocks are multi-line by nature. 
- You don't need to escape `"` double quotes as they no longer mark String literal end

```
String myBlock =  """
                  First line
                  Second Line with " quotes
                  """
```

Since the quoting is allowed, you technically can include `\n` and `\"`, but it is not necessary and discouraged. You still do need to escape slash `\\`. But in general Text Blocks involve lot less escaping than good old String literals. All the escape sequences which can be used in String literals can be also used for Text Blocks. Check the [Java spec](https://docs.oracle.com/javase/specs/jls/se12/html/jls-3.html#jls-3.10.6) for the full list.

### Line end normalization

### Indentation handling

<!--

- https://openjdk.java.net/jeps/355
- preview feature
- previously raw string literals were withdrawn: https://openjdk.java.net/jeps/326
- dont support string interpolation
- two dimensional block of text rather than one dimensional sequence of characters
-  anywhere that a string literal could appear
- The content may include line terminators directly, unlike the characters in a string literal. The use of \n in a text block is permitted, but not necessary or recommended. For example, the text block:
- The content may include double quote characters directly, unlike the characters in a string literal. The use of \" in a text block is permitted, but not necessary or recommended. Fat delimiters (""") were chosen so that " characters could appear unescaped, and also to visually distinguish a text block from a string literal.

Here are some examples of ill-formed text blocks:

String a = """""";   // no line terminator after opening delimiter
String b = """ """;  // no line terminator after opening delimiter
String c = """
";        // no closing delimiter (text block continues to EOF)
String d = """
abc \ def
""";      // unescaped backslash (see below for escape processing)

At run time, a text block is evaluated to an instance of String, just like a string literal. Instances of String that are derived from text blocks are indistinguishable from instances derived from string literals. Two text blocks with the same processed content will refer to the same instance of String due to interning, just like for string literals.
-->