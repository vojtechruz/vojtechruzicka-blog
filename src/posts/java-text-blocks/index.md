---
title: 'Java 13 Text Blocks'
date: "2019-06-23T22:12:03.284Z"
tags: ["Java"]
path: '/java-text-blocks'
featuredImage: './java-text-blocks.jpg'
disqusArticleIdentifier: '99028 http://vojtechruzicka.com/?p=99028'
excerpt: 'Java 13 finally brings support for multi-line string literals after dropping similar functionality from Java 12.'
---

![Java Text Blocks](java-text-blocks.jpg)

Java 13 finally brings support for multi-line string literals after dropping similar functionality from Java 12.

## String literals in Java
Declaring a string literal in Java is easy:

```java
String myString = "Behold, a string literal!";
```

Nothing new, right? Traditional string literals have, however, some inconvenient limitations.

First of all, the whole literal needs to be on just one line. This is ok for simple short strings, but for longer ones, you need to resort to concatenating multiple string literals. If you want also to include line breaks, you need to add `\n`.

```java
String myString = "This is my string\n" +
        "which I want to be \n" +
        "on multiple lines.";
```

This is cumbersome and hard to read. The other problem is that various characters cannot be represented directly, but need to be escaped, such as `"` or `\`. This makes your strings even harder to read and work with.

```java
String path = "Open \"C:\\Program Files\\Java\\jdk1.8.0_152\"";
```

This gets especially messy in cases such as regular expressions. How to handle this issue though?

## Other JVM languages
As usually, Java is late to introduce a functionality which is already common in many other languages, even those on JVM. Kotlin, Scala or Groovy already support multiline strings literals using `"""` notation instead of usual `"`. Look at the following example in Kotlin.

```kotlin
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
In Java 12, there was originally proposal to include [Raw String Literals (JEP-326)](http://openjdk.java.net/jeps/326). The behavior was very similar to the example in Kotlin above. But instead of using `""""` as in other JVM languages, it used backtick `` ` `` notation. The concept was slightly unusual in a way that you could use any number of backticks and the same amount of backticks at the end. This way it was not necessary to escape backticks inside a spring literal no matter how many consecutive backticks were present.

```
`This uses a single backtick`
``This can contain a backtick `, see?``
```I can use any number of backticks```
``` 

One problem with raw string literals is usually indentation. Every character in the multiline raw string literal is interpreted as is - including indentation, which is supposed to be there just for better code readability rather than part of the literal itself. Consider the following example:

```java
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

You would need to fix this manually, possibly with newly proposed String methods `align()` and `indent()`. Not very practical, but it's something you would have to endure if using raw strings.

You can read more about original Raw String Literals proposal in the following article:

<div class="linked-article"><h4 class="front-post-title" style="margin-bottom: 0.375rem;"><a href="/raw-strings/" style="box-shadow: none;">Java Raw String Literals</a></h4><small class="front-post-info"><span class="front-post-info-date">26 November, 2018</span><div class="post-tags"><ul><li><a href="/tags/java/">#Java</a></li></ul></div></small><div><a class="front-post-image" href="/raw-strings/"><div class=" gatsby-image-wrapper" style="position: relative; overflow: hidden;"><div style="width: 100%; padding-bottom: 66.6667%;"></div><img src="data:image/jpeg;base64,/9j/2wBDABALDA4MChAODQ4SERATGCgaGBYWGDEjJR0oOjM9PDkzODdASFxOQERXRTc4UG1RV19iZ2hnPk1xeXBkeFxlZ2P/2wBDARESEhgVGC8aGi9jQjhCY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2P/wgARCAANABQDASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAABAAD/8QAFgEBAQEAAAAAAAAAAAAAAAAAAAID/9oADAMBAAIQAxAAAAFOBETpnIj/xAAaEAADAAMBAAAAAAAAAAAAAAAAAQIDESES/9oACAEBAAEFAoyoeVO/VHWTPd6P/8QAFREBAQAAAAAAAAAAAAAAAAAAECH/2gAIAQMBAT8Bh//EABURAQEAAAAAAAAAAAAAAAAAAAAR/9oACAECAQE/AVf/xAAZEAACAwEAAAAAAAAAAAAAAAAAARARITH/2gAIAQEABj8CxWjDjFbjEf/EABwQAQACAwADAAAAAAAAAAAAAAEAESExYUGBkf/aAAgBAQABPyHZADLdQ+p4Go3uD7NDiV4g7L6lMIf/2gAMAwEAAgADAAAAEL8//8QAFxEBAAMAAAAAAAAAAAAAAAAAAAERUf/aAAgBAwEBPxAuMf/EABURAQEAAAAAAAAAAAAAAAAAABAR/9oACAECAQE/EIP/xAAdEAEAAgIDAQEAAAAAAAAAAAABABEhMVFhgUFx/9oACAEBAAE/ELrnsKPwvbC+zeEnjvEuyxVoaeZ1LNyjKKRwv2WB61TXgHd3P//Z" alt="" style="position: absolute; top: 0px; left: 0px; width: 100%; height: 100%; object-fit: cover; object-position: center center; opacity: 0; transition-delay: 500ms;"><picture><source srcset="/linked/raw-strings/5e4a3/raw-strings.jpg 45w,
/linked/raw-strings/e451c/raw-strings.jpg 90w,
/linked/raw-strings/29fd0/raw-strings.jpg 180w,
/linked/raw-strings/b3ebb/raw-strings.jpg 270w,
/linked/raw-strings/8841e/raw-strings.jpg 360w,
/linked/raw-strings/2b1a3/raw-strings.jpg 900w" sizes="(max-width: 180px) 100vw, 180px"><img sizes="(max-width: 180px) 100vw, 180px" srcset="/linked/raw-strings/5e4a3/raw-strings.jpg 45w,
/linked/raw-strings/e451c/raw-strings.jpg 90w,
/linked/raw-strings/29fd0/raw-strings.jpg 180w,
/linked/raw-strings/b3ebb/raw-strings.jpg 270w,
/linked/raw-strings/8841e/raw-strings.jpg 360w,
/linked/raw-strings/2b1a3/raw-strings.jpg 900w" src="/linked/raw-strings/29fd0/raw-strings.jpg" alt="" loading="lazy" style="position: absolute; top: 0px; left: 0px; width: 100%; height: 100%; object-fit: cover; object-position: center center; opacity: 1; transition: opacity 500ms ease 0s;"></picture><noscript><picture><source srcset="/linked/raw-strings/5e4a3/raw-strings.jpg 45w,
/linked/raw-strings/e451c/raw-strings.jpg 90w,
/linked/raw-strings/29fd0/raw-strings.jpg 180w,
/linked/raw-strings/b3ebb/raw-strings.jpg 270w,
/linked/raw-strings/8841e/raw-strings.jpg 360w,
/linked/raw-strings/2b1a3/raw-strings.jpg 900w" sizes="(max-width: 180px) 100vw, 180px" /><img loading="lazy" sizes="(max-width: 180px) 100vw, 180px" srcset="/linked/raw-strings/5e4a3/raw-strings.jpg 45w,
/linked/raw-strings/e451c/raw-strings.jpg 90w,
/linked/raw-strings/29fd0/raw-strings.jpg 180w,
/linked/raw-strings/b3ebb/raw-strings.jpg 270w,
/linked/raw-strings/8841e/raw-strings.jpg 360w,
/linked/raw-strings/2b1a3/raw-strings.jpg 900w" src="/linked/raw-strings/29fd0/raw-strings.jpg" alt="" style="position:absolute;top:0;left:0;opacity:1;width:100%;height:100%;object-fit:cover;object-position:center"/></picture></noscript></div></a><span class="front-post-excerpt">Java finally brings support for raw strings. They can span multiple lines and you don't need to escape special characters. Especially useful for regular expressions.</span></div></div>

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

It is not supposed to be an implementation of Raw String Literals, but rather multiline String literals, which will still allow escapes, although you'll not be required to use all of them. On top of that, it will not be necessary to handle all the indentation issues, which was necessary with Raw String Literals.


## Preview Feature
Text blocks will be only available as a preview feature in Java 13. What does it mean?

> A preview language or VM feature is a new feature of the Java SE Platform that is fully specified, fully implemented, and yet impermanent. It is available in a JDK feature release to provoke developer feedback based on real-world use; this may lead to it becoming permanent in a future Java SE Platform.

> Before the next JDK feature release, the feature's "real world" strengths and weaknesses will be evaluated to decide if the feature has a long-term role in the Java SE Platform and, if so, whether it needs refinement. Consequently, the feature may be granted final and permanent status (with or without refinements), or undergo a further preview period (with or without refinements), or else be removed.

Such features are shipped in the JDK but are not enabled by default. You need to explicitly enable them to use them. Needless to say, it is not intended for production use, but rather for evaluation and experimentation as it may get removed or heavily changed in a future release.

You'll need to download [JDK 13](https://jdk.java.net/13/). In IntelliJ, go to `File → Project Structure` and make sure you have JDK 13 selected under Project SDK. To enable Text Blocks as a preview feature, be sure to select `13 (Preview) - Text blocks` under `Project language level`.

![JDK 13 IDEA settings](jdk-13-idea-preview.png)

When building your app manually, you need to specify that preview features should be turned on by providing  the following params to `javac`:

```
javac --release 13 --enable-preview ...
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

There is no runtime difference between Text Block and String literal. Both result in an instance of String. If they have the same value, they'll get interned as usual and end up as the same instance. Everywhere you can use String literal, you can also use Text Block.

## Processing
Unlike regular String literals, Texts block are processed by the compiler in three steps:
1. Line ends are normalized
2. Excess whitespace is removed
3. Escaped characters are interpreted

### Line end normalization
Windows and UNIX-based operating systems have different characters to represent line endings.

Windows uses Carriage Return `\r` and Line Feed `\n`, while Unix-based systems use just Line Feed. The problem is that Text Blocks use new line characters directly from the source code, instead of using `\n` such as regular string literals. That means that source code created on Unix would have Strings with different line endings when compiled on windows. The Strings would look identical to the naked eye but would have different line endings.

To prevent this, Java compiler takes all the line endings in Text Blocks and normalizes them to Line Feed `\n`. What is important is that this is done before evaluating escaped characters. That means that if you explicitly need to include Carriage Return using `\r`, you can, as it is evaluated after line ending normalization and would not be affected.

### Indentation removal
Remember the example with Raw String Literals and indentation? Raw string literals interpret all the characters including indentation. So whitespace which was supposed just to make your source code easier to read actually becomes part of your strings. In the vast majority of the cases, this is not desired behavior.

Fortunately, Java compiler removes unwanted whitespace when compiling Text Blocks.

- All the trailing whitespace is removed from the end of the lines.
- Leading common whitespace is removed from the start of each line. 

What does this mean exactly? Let's look at the following code:

```
String html = """
    public static void main(String[] args) {
        String html = """
                      <html>
                        <body>
                          <p>Hello, world</p>
                        </body>
                      </html>
                      """;
    }
```

The HTML code snippet contains a whole lot of whitespace, but it does not really belong to it. It just makes it well aligned within the source file. What is significant is the relative indentation inside the block.

In other words: If every line in the snipped starts with 22 whitespaces, we can ignore them. These 22 spaces are *common whitespace prefix*, which can be ignored and only what is on top of that should be kept.

Let's replace common prefix with `.`. All of these spaces will be discarded. Only spaces marked with `-` will be kept as they exceed the common whitespace prefix.

```
        String html = """
......................<html>
......................--<body>
......................----<p>Text Blocks are awesome!</p>
......................--</body>
......................</html>
......................""";
```

The result will be:

```
<html>
  <body>
    <p>Text Blocks are awesome!</p>
  </body>
</html>
```

Note that in this step only direct whitespace is removed. If you have whitespace in a form of escaped characters such as `\n` or `\t`, it will not be removed.

### Escaping 
Text Blocks are not raw strings and you can still use escapes. However, you don't need to bother with the most common ones.
- New line `\n` is no longer needed as Text  Blocks are multi-line by nature. 
- You don't need to escape `"` double quotes as they no longer mark String literal ending

```
String myBlock =  """
                  First line
                  Second Line with " quotes
                  """
```

Since the quoting is allowed, you technically can include `\n` and `\"`, but it is not necessary and it is discouraged. You still do need to escape slash `\\`. But in general Text Blocks involve a lot less escaping than good old String literals. All the escape sequences, which can be used in String literals, can be also used for Text Blocks. Check the [Java spec](https://docs.oracle.com/javase/specs/jls/se12/html/jls-3.html#jls-3.10.6) for the full list.

Interpreting escaped characters as the last of the three steps is important as your escapes are not affected by line ending normalization and whitespace removal.

## New String Methods
As part of Text Blocks proposal, there are three new Methods of `String` class.

1. `translateEscapes()` - translates escape sequences in the string escept for unicode ones.
2. `stripIndent()` - strips away common whitespace from the beginning of each line.
3. `formatted(Object... args)` - Convenience method, equivalent of String.format(string, args)

## Conclusion
- Text Blocks offer a convenient way of working with multi-line string literals.
- To create a Text Block simply surround your string with `""""`. 
- You can use Text Blocks anywhere you can use String Literals
- Line endings are normalized to LF
- Extra whitespace is stripped from the beginning and the end of each line. Only relative indentation is preserved.
- It is a preview feature in Java 13, which needs to be explicitly enabled
- Raw String literals proposal was withdrawn from Java 12; Text Blocks got introduced later instead
