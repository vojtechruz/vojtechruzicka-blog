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
compile("org.springframework.boot:spring-boot-devtools")
```

Note that the dependency is declared as optional. This is important.

TODO why
--------------

