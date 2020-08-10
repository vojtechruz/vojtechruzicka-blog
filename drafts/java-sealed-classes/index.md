---
title: 'Sealed Classes in Java 15'
date: "2020-08-15T22:12:03.284Z"
tags: ["Java"]
path: '/java-sealed-classes'
featuredImage: './seal.jpg'
disqusArticleIdentifier: '99054 http://vojtechruzicka.com/?p=99054'
excerpt: 'Sealed classes or interfaces may restrict which other classes or interfaces can extend it.'
---

![Java Sealed Classes](./seal.jpg)

Sealed classes or interfaces may restrict which other classes or interfaces can extend it.

### Preview Feature
Sealed classes are currently only available as a [preview feature](https://openjdk.java.net/jeps/12).

What does it mean?

>A preview language or VM feature is a new feature of the Java SE Platform that is fully specified, fully implemented, and yet impermanent. It is available in a JDK feature release to provoke developer feedback based on real-world use; this may lead to it becoming permanent in a future Java SE Platform.
> 
>Before the next JDK feature release, the feature's "real world" strengths and weaknesses will be evaluated to decide if the feature has a long-term role in the Java SE Platform and, if so, whether it needs refinement. Consequently, the feature may be granted final and permanent status (with or without refinements), or undergo a further preview period (with or without refinements), or else be removed.

Such features are shipped in the JDK but are not enabled by default. You need to explicitly enable them to use them. Needless to say, it is not intended for production use, but rather for evaluation and experimentation as it may get removed or heavily changed in a future release.

First, make sure you actually have [JDK 15 installed](https://jdk.java.net/15/). Then, in IntelliJ IDEA you can enable preview features under `File → Project Structure`.

![Idea Preview features](idea-enable-preview-features.png)

Alternatively, if building manually, you need to provide the following params to `javac`:

```
javac --release 15 --enable-preview ...
```

That is for compile-time. At run-time, you just provide `--enable-preview`

```
java --enable-preview ...
```


TODO https://openjdk.java.net/jeps/360