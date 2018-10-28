---
title: 'Faster Development with Spring Boot Devtools'
date: "2018-09-08T22:12:03.284Z"
tags: ['Spring', 'Java']
path: '/spring-boot-devtools'
featuredImage: './spring-dev-tools.jpg)'
disqusArticleIdentifier: '99012 http://vojtechruzicka.com/?p=99012'
excerpt: 'How to speed up your Spring Boot development even more with Devtools.'
---

![Spring Boot Devtools](./spring-dev-tools.jpg)

# Setup
As usually worth Spring Boot, the setup is really simple. All you need to do is to add the right dependency and yo are good to go. Spring Boot will detect this and auto-configure Devtools accordingly.

If you are using Maven:
```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-devtools</artifactId>
    <optional>true</optional>
</dependency>
```

Or when using Gradle:
```
configurations {
	developmentOnly
	runtimeClasspath {
		extendsFrom developmentOnly
	}
}
dependencies {
	developmentOnly("org.springframework.boot:spring-boot-devtools")
}
```

Note that the dependency is declared as optional. This is important. This will prevent devtools dependency being  transitively applied to other modules that depend on your project.

## Automatic Restart
Whenever there is a change in files on your classpath, devtools automatically restart your running application. When developing locally this can be valuable as it saves you don't need to manually restart your application.

On it's own it wouldn't be so useful as restarts can still take a lot of time. Fortunately, these restarts are way faster than ordinary restarts because of a clever trick, which devtools use.

You see, when developing an application you usually change a class of few and want to check results in your running application for a feedback. The point is that you don't change all the hundreds or thousands of classes at once. You just change a tiny fraction of your application. And of course, majority of loaded classes are from frameworks and third party libs.
 
 Under the hood Spring Devtools use two classloaders - *base* and *restart*. Classes which do not change are loaded by *base* classloader. Classes you are working with are loaded by *restart* classloader. Whenever a restart is triggered, *restart* classloader is discarded and recreated. This way restarting your application is much faster than usual and can be a viable alternative to dynamic class reloading with tools such as JRebel.

### Triggering a restart in an IDE
The restart is triggered whenever there is a change on classpath. However, this varies depending on your IDE. That means, it is not enough to just change your '.java' files, what matters is that IDE actually updates '.class' files on the classpath.

When using IntelliJ IDEA, you need to build your project (Ctrl + F9 or *Build → Build Project*). In Eclipse it is enough to just save your files.

## Development only
The usage of the Spring Boot Devtools is intended only for development, not for production. If your application detects you're running in production, devtools are automatically disabled.

For this purposes, whenever you run your app as a fully packaged artifact such as jar with embedded application server, it is considered to be production app:

```
java -jar devtools-example-1.0.0.jar
```

Same applies when your app is started via special classloader, such as on a application server. In contrast, when you run an exploded artifact (such as in your IDE), your application is considered in development mode. The same applies when using spring-boot-plugin to run the application:

Maven:
```
mvn spring-boot:run
```

Gradle:
```
gradle bootRun
```

