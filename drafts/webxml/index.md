---
title: 'Get rid of web.xml in Spring MVC App'
date: ""
tags: ['Java', 'Spring']
path: '/spring-get-rid-of-web-xml'
featuredImage: './get-rid-of-webxml.jpg'
disqusArticleIdentifier: ''
excerpt: 'From Servlet 3.0 on, web.xml is optional. How to get rid of it in your Spring MVC app?'
---

![Get rid of webm.xml](./get-rid-of-webxml.jpg)

From Servlet 3.0 on, web.xml is optional. How to get rid of it in your Spring MVC app?

# web.xml and Servlet 3.0
Web.xml also known as deployment descriptor is traditionally used as a configuration file for Java web applications. It defines servlets, their mappings, servlet filters, lifecycle listeners and more. Originally it was the only was to provide such configuration. Over the time, once popular XML configuration lost its appeal and popularity in favor of Java based annotation configuration. The same trend could also be observed in Spring Framework.

With Servlet version 3.0, deployment descriptor is no longer mandatory. 

TODO what is replacement mechanism 

# web.xml and Spring MVC
In Spring MVC, web.xml used to be the place, where you needed to declare and configure Dispatcher Servlet, which is a Front Controller, dispatching requests to the 


# Updating your Maven WAR plugin
After removing *web.xml* file, your maven build may break complaining that the file is missing. This happens when you're using older version of Maven WAR Plugin. You can set configuration flag *failOnMissingWebXml* to false to fix the error. 

```xml
<build>
    <plugins>
        <plugin>
            <artifactId>maven-war-plugin</artifactId>
            <version>2.4</version>
            <configuration>
                <failOnMissingWebXml>false</failOnMissingWebXml>    
            </configuration>
        </plugin>
    </plugins>
</build>
```

Or better yet, if you upgrade your plugin version to 3+, the default value of *failOnMissingWebXml* is now set to false and does not need to be explicitly specified anymore.
