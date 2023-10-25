---
title: 'Java 9: Enhanced deprecation'
date: "2017-05-17T22:12:03.284Z"
tags: ['Java']
path: '/java-9-enhanced-deprecation'
featuredImage: './deprecated.jpg'
excerpt: '@Deprecated annotation, introduced in Java 5, received several enhancements in Java 9, which makes easier to document the deprecation of API.'
---

<PostHeader frontmatter={props.data.mdx.frontmatter} />

## Java 8 Deprecation

### @deprecated JavaDoc tag

In Java 1.1, a new JavaDoc tag was introduced - @deprecated. Java 1.1 introduced many new APIs, which were meant to replace some old ones. There was a need to document this, therefore the new tag was added. In the tag\'s body, you should define the reason, why the deprecation was introduced as well as any API, which should be used instead using @see or @link. Example can be _java.ioFile.toURL()_

```java
/**
* ...
*
* @deprecated This method does not automatically escape characters that
* are illegal in URLs. It is recommended that new code convert an
* abstract pathname into a URL by first converting it into a URI, via the
* {@link #toURI() toURI} method, and then converting the URI into a URL
* via the {@link java.net.URI#toURL() URI.toURL} method.
*/
```

Compiling an application, which uses a method with @deprecated JavaDoc tag usually results in a compiler warning, which can be disabled by using @SuppressWarnings(\"deprecation\") annotation. The compiler warning is not required by the compiler specifications, but most compilers issue the warning anyway.

### @Deprecated annotation

Java 5 added another mechanism for marking deprecation - @Deprecated annotation. Using methods, fields or classes marked with this annotation will result again in the same compiler warning, even if no @deprecated JavaDoc tag is present. The annotation and the JavaDoc tag are meant to be used together. Unlike with the JavaDoc tag, the compiler is required to always issue a warning when using code marked by @Deprecated annotation.

The annotation itself does not have any attributes, it just marks whether the API is deprecated or not.

## Problems with the old deprecation

Since the old @Deprecated annotation does not provide any attributes, all the information needs to be provided using JavaDoc tag. But the tag itself does not have any defined structure, it is just a free text. There is no standardized way to provide additional info about deprecation, such as since when is it deprecated or whether it is supposed to be terminal deprecation or not. That is - whether the API is planned to be removed in a future release or whether it is planned to be kept for a backward compatibility. This is a critical information, which plays a major role in the decision whether it dangerous to keep the deprecated API or whether it is safe to keep using it for now.

With such a vague definition of deprecation, many programmers were confused when using deprecated API. Many would keep using it anyway, as until now, Java rarely removed any obsolete API to keep the backward compatibility, so they assumed it is always safe. Other would never use it, even if it was perfectly safe and the reason for marking particular API deprecated was just that more convenient API was introduced in a newer version.

Even if the information about future removal was provided in JavaDoc, there was no way to check this using static code analysis tools, because JavaDoc does not provide a unified way of specifying such information.

## Java 9 Enhanced Deprecation

### New features

There are two new parameters of the @Deprecated annotation in Java 9. Note that both of the parameters are optional, with a default value if not specified. This ensures backward compatibility with already present annotations.

#### Since

This string parameter specifies the version at which the API became deprecated. The default value is an empty string. This is not to be confused with @since JavaDoc tag as it specifies a version at which the API was introduced, not deprecated.

#### For Removal

This boolean specifies whether this API is intended to be removed in a future release or not. The default value is false, when not specified.

### Rejected proposals

In the earlier versions of the JEP (JDK Enhancement Proposal), the annotation included additional parameters. After careful considerations, they were later removed.

The annotation used to have \"replacement\" parameter, which was supposed to provide replacement API to be used instead. This proposal was dropped, as there is rarely any drop-in replacement. Usually, there are more alternatives, with various trade-offs, advantages, and disadvantages. Different replacements would be better suited for different scenarios. Javadoc already serves better for this purpose with @see and @link and should be used for this purpose instead.

Another feature, which was not included is the reason for deprecation. Originally, this was supposed to be an enum with the following options:

-   UNSPECIFIED
-   DANGEROUS
-   OBSOLETE
-   SUPERSEDED
-   UNIMPLEMENTED
-   EXPERIMENTAL

This information is not extensible, is subjective and there is still no plain text explanation included. The specific details would still be included in JavaDoc, so it is now preferred to use JavaDoc for this purpose instead. You can read more details about criticism of this feature in [JEP 277 "Enhanced Deprecation" is Nice. But Here's a Much Better Alternative.](https://blog.jooq.org/2015/12/22/jep-277-enhanced-deprecation-is-nice-but-heres-a-much-better-alternative/)

### JDK Deprecation

The convention for JDK is that once a JDK API is marked as forRemoval=true in a certain Java version, [it will be removed](https://www.youtube.com/watch?v=T_O9merCgKw&feature=youtu.be&list=PLPIzp-E1msrYicmovyeuOABO4HxVPlhEA#t=17m05s) in the directly following major Java release. That means - when something is marked as forRemoval=true in Java 9, it is supposed to be completely removed in Java 10. Keep that in mind when using API marked for removal.

Note that this convention applies only to JDK itself and third-party libraries are free to choose any convention they see fit.

### Suppressing warnings

Until Java 9, all the deprecation compiler warnings could be suppressed using @SuppressWarnings(\"deprecation\"). Starting with Java 9, this only works for regular deprecation with forRemoval=false. Deprecated APIs intended for removal will still show a compiler warning. This is useful as many current projects suppress deprecation warnings, thinking the API will be kept there forever for the backward compatibility. In such case, you would not be able to notice if a previously deprecated API you were using was marked as for removal in the future release.

To suppress warning for API intended for removal, you need to provide @SuppressWarnings(\"removal\"). To suppress both types of warnings, you can use @SuppressWarnings({\"deprecation\", \"removal\"}).

### Static code analysis

Since the deprecated API can be marked as a subject for removal in a unified way now, it is easy for IDEs and static code analysis tools to perform the check automatically. This is very useful as the compiler warnings about deprecation are only issued at compile time. That means, for example, that compiling an application against an older version of JDK and deploying it later with a newer JDK will break the application without any warnings beforehand.

In the JDK from version 9 on, there is included a special tool for analyzing code for usage of deprecated API called _jdeprscan_, which can be found under JDK\_HOME\\bin. Currently, it supports scanning of JDK itself, but an extension is planned to support also external classes. For dynamic scanning of deprecated APIs, an introduction of a special tool _jdeprdetect_ is considered, but it will not be part of Java 9.

More info about the _jdeprscan_ tool can be found [here](https://docs.oracle.com/javase/9/tools/jdeprscan.htm#JSWOR-GUID-2B7588B0-92DB-4A88-88D4-24D183660A62).

## IDE Support

Current IDEs already offer nice support for warning you when you are using some deprecated code. IntelliJ IDEA, for example, will strikethrough any usage of deprecated code. With java 9+ and the enhanced deprecation, it will even show you a stronger warning when the deprecated code is issued for removal - the strikethrough is red in such case.

![IDEA Enhanced deprecation](./enhanced-deprecation-idea.png)


## Conclusion

The new enhanced deprecation annotation provides two more attributes - since which version was the deprecation introduced and whether it is supposed to be removed. The forRemoval parameter provides a unified way of declaring that the API is not safe for use and will be removed in a future version. It can be automatically checked by IDEs and static code analysis tools, which provides a safer detection of discontinued APIs, which are a subject for removal. The @depreacted JavaDoc tag should still be used along with the annotation to provide additional details about the reason of deprecation and the alternatives, which should be used instead. Be careful when using deprecated JDK APIs as they will be removed directly in the next major version of Java.
