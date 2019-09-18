---
title: 'Maven archetypes tutorial'
date: "2019-09-20T22:12:03.284Z"
tags: ["Maven"]
path: '/maven-archetypes'
featuredImage: './archetype.jpg'
disqusArticleIdentifier: 'TODO http://vojtechruzicka.com/?p=TODO'
excerpt: 'How to generate new projects from Maven archetypes, crate your own and number of alternative tools.'
---

![Maven Archetypes](archetype.jpg)

## Archetypes
When starting a new project, it can be tedious and time consuming to set up everything from scratch. Fortunately, MAven has built-in functonality which allows you to generate a project from a template. This template is called archetype.

There is a number of archetypes available which allow you to create various types of projects.

You can even create your own archetypes and share them with others.

## Generating from command line
You can generate your project from an archetype in your command line using the following commad via [Maven Archetype Plugin](https://maven.apache.org/archetype/maven-archetype-plugin/):

```
mvn archetype:generate 
-DarchetypeGroupId=org.springframework.boot 
-DarchetypeArtifactId=spring-boot-sample-simple-archetype 
-DarchetypeVersion=1.0.2.RELEASE
```

In the example above, you specify just identifiers you your archetype and the command starts in interactive mode and asks you for all the required information such as grouId, artifactId and version of your new project. You fill these in in your terminal and the project is generated for you. 

```{4-7}
mvn archetype:generate 
-DarchetypeGroupId=org.springframework.boot 
-DarchetypeArtifactId=spring-boot-sample-simple-archetype 
-DarchetypeVersion=1.0.2.RELEASE 
-DartifactId=my-app 
-DgroupId=com.example 
-Dversion=1.0-SNAPSHOT 
-DinteractiveMode=false
```

However, you can specify all these upfront so no interaction is needed from your side. This can be useful , for example, when running project as a part of some automated script which should not have any user interaction.

## Generating from IDEA
Generating projects in IDEA from archetypes is easy. Just go to:

```
File → New → Project... → Maven
```

[IDEA new Maven Project from archetype](idea-maven-archetype.png)

Here all you need to do is check `Create from archetype` and select your desired one.

However, the amount of archetypes listed is fairly limited. Fortunately you can add any available archetype by clicking `Add archetype`.

[IDEA add archetype](idea-add-archetype.png)

Now you can continue with creating your Maven project as usual.

## Creating your own archetype

### From existing project

### From scratch

## Alternatives
Maven archetypes are a great built-in way of generating project scaffolding, however there are more alternatives worth exploring, which may be better sited in some cases.

### Gradle
If you prefer Gradle over Maven, working with archetypes gets a little trickier because Gradle currently [does not support generating projects from archetypes directly](https://github.com/gradle/gradle/issues/3840).

There is an unofficial [Gradle Archetype Plugin](https://github.com/orctom/gradle-archetype-plugin/), which you can use to work with Maven archetypes.

As an alternative, you can generate your project first using Maven from an archetype and then convert it to a Gradle project by using the following command in the directory with your `pom.xml`:

```
gradle init
``` 

### Spring Boot Initializr
When working with Spring Boot, you can still use Maven archetypes, but there is a better, way more powerful tool offered directly by Spring.

It is called [Spring Initializr](https://start.spring.io/). It is a simple wizard, where you can define many options for your application and then generates your project based on your choices.

[Spring Boot Initializr](spring-boot-initializr.png)

Yu can configure various options such as:
- Language: Java, Kotlin or Groovy
- Spring version
- Java version
- Maven / Gradle
- Jar/War packaging
- Dependencies such as DB, Security, Web, [Actuator](https://www.vojtechruzicka.com/spring-boot-actuator/) and many more

You can see there is a lot of configuration options to choose from. Also, you can see that unlike with Maven archetypes, you can generate your project even when using Gradle.

Instead of using the default web interface, there is even a more convenient way of generating your project directly in IntelliJ IDEA.

```
File → New Project → Spring Initializr
``` 

### Yeoman
[Yeoman](https://yeoman.io/) is an interesting tool, which allows you do generate a project using one of their many [generators](https://yeoman.io/generators/).

What's interesting is that unlike Maven, it is not focused solely on JVM ecosystem. You can generate project for pretty much any language or framework and their combinations.

That means you can have generator for an application with Java backend, React frontend and Docker integration. Or anything else you can think of as there are many generators available.

### JHipster
[JHipster](https://www.jhipster.tech/) is actually a Yeoman generator under a hood. It allow you to generate Spring Boot projects with Frontend in Either React, Angular or Vue.

There is much more though. It optionally supports microservices and cloud deployment. It integrates sass, webpack, bootstrap, various databases, ELK, caching, docker, WebSockets and much more.

It is definitely worth checking if you want to easily generate your whole application front to back with a standardized opinionated stack.

## Conclusion
Maven archetypes offer you an easy way to generate basic project scaffolding for various project types without the hassle of a manual approach. Still, there are some alternatives mentioned above which may be better in some cases such as Spring Boot Initializr or JHipster.