---
title: 'JavaFX Tutorial: Getting started'
date: "2019-09-20T22:12:03.284Z"
tags: ["Java", "JavaFX"]
path: '/javafx-getting-started'
featuredImage: './install.jpg'
disqusArticleIdentifier: 'TODO http://vojtechruzicka.com/?p=TODO'
excerpt: 'How to setup and start working with JavaFX using Maven, Gradle or JavaFX SDK.'
---

![Getting started](install.jpg)

How to set up and start working with JavaFX using Maven, Gradle or JavaFX SDK.

## Getting Java
JavaFX, of course, requires you to have JDK installed. Obtaining the required dependencies, however, varies based on which version of Java you have.

JavaFX was introduced as a part of Java 8 release. However, it was later removed from JDK and moved to a separate module in Java 11.

This means, if you are targeting Java 8-10, you have all the required dependencies as a part of your JDK already. Hooray! If you are using a newer version of Java - that is 11+, you need to get the dependencies separately.

## Maven
Obtaining and managing dependencies manually is quite inconvenient, and in a real application, you would rarely do so. It is much better to use a dependency management system such as Maven or Gradle. This way, you can just declare what dependencies you are using and what versions and it takes care of the rest.

### Maven archetype
Of course, you can set up your Maven project by hand, from scratch. However, you may prefer a more convenient way of generating the base project structure and contents for you by Maven.

Maven has a concept of archetypes, which basically means you can generate different types of projects from a template. There are numerous archetypes for various types of projects, and fortunately, there is a couple for JavaFX. The archetype you can choose depends on which version of Java are you using.

#### Java 8 archetype
You can use [com.zenjava:javafx-basic-archetype](https://mvnrepository.com/artifact/com.zenjava/javafx-basic-archetype), or you can look for more archetypes yourself if this one does not suit you.

You can easily generate a project from your command line with Maven using the archetype above:

```
mvn archetype:generate -DarchetypeGroupId=com.zenjava -DarchetypeArtifactId=javafx-basic-archetype
```

Alternatively, you can create a new Maven project from an archetype directly in your IDE.

#### Java 11 archetype

For Java 11, you can use [org.openjfx:javafx-archetype-simple](https://mvnrepository.com/artifact/org.openjfx/javafx-archetype-simple).

To generate the project simply run:

```
mvn archetype:generate -DarchetypeGroupId=org.openjfx -DarchetypeArtifactId=javafx-archetype-simple
```

### Manual Maven setup
If you want more control, you can, of course, set up your Maven project manually instead of generating it from an archetype.

To get started, you need two components. The first one is [Maven Plugin for Java FX](https://github.com/openjfx/javafx-maven-plugin).

Simply add the following to your `pom.xml`:

```xml
    <build>
        <plugins>
            <plugin>
                <groupId>org.openjfx</groupId>
                <artifactId>javafx-maven-plugin</artifactId>
                <version>0.0.3</version>
                <configuration>
                    <mainClass>com.example.App</mainClass>
                </configuration>
            </plugin>
        </plugins>
    </build>
```

Note that `<mainclass>` needs to point to your main class, which has the main method and extends `javafx.application.Application`. We'll cover it in the next article in the series.

The second part is adding a dependency for [JavaFX controls](https://mvnrepository.com/artifact/org.openjfx/javafx-controls):

```xml
<dependency>
    <groupId>org.openjfx</groupId>
    <artifactId>javafx-controls</artifactId>
    <version>11.0.2</version>
</dependency>
```

## Gradle
Gradle currently [does not support generating projects from archetypes directly](https://github.com/gradle/gradle/issues/3840).

You can use an unofficial [Gradle Archetype Plugin](https://github.com/orctom/gradle-archetype-plugin/) and use Maven archetypes mentioned above.

Alternatively, you can generate your project using Maven from an archetype and then convert it to a Gradle project by using the following command in the directory containing your `pom.xml`:

```
gradle init
``` 

### Manual Gradle setup 
Similar to Maven manual setup, you need to add JavaFX plugin:

```
plugins {
  id 'application'
  id 'org.openjfx.javafxplugin' version '0.0.8'
}
```

And dependency to controls:

```
javafx {
    version = "11.0.2"
    modules = [ 'javafx.controls' ]
}
```

## JavaFX SDK
There is yet another option to use JavaFX locally. You can download [JavaFX SDK](https://gluonhq.com/products/javafx/). It contains all the required libraries, which you can then link to your project in your IDE or add to classpath.

This may be useful when you are not familiar with Gradle or Maven and just for local development. When distributing your app, it gets inconvenient as you need to make sure you include all the required dependencies.

With this option, you can generate a non-Maven/Gradle project in your IDE, which contains all the essential files. In IntelliJ IDEA, you can simply go to:

```
File → New → Project → JavaFX
```

## Further Reading
- [Hello World JavaFX application source code - Gradle](https://github.com/openjfx/samples/tree/master/HelloFX/Gradle)
- [Hello World JavaFX application source code - Maven](https://github.com/openjfx/samples/tree/master/HelloFX/Maven)
- [JavaFX 13 and IntelliJ](https://openjfx.io/openjfx-docs/#IDE-Intellij)
- [JavaFX 13 and NetBeans](https://openjfx.io/openjfx-docs/#IDE-NetBeans)
- [JavaFX 13 and Eclipse](https://openjfx.io/openjfx-docs/#IDE-Eclipse)

## Next steps
This article is the first one in the JavaFX Series. In the next one, we'll cover [how to create and run your very first JavaFX application](TODO).
