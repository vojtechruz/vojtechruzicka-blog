---
title: 'How to deploy war files to Spring Boot Embedded Tomcat'
date: "2019-09-25T22:12:03.284Z"
tags: ["Java", "Spring"]
path: '/spring-boot-add-war-to-embedded-tomcat'
featuredImage: './spring-boot-add-war-to-embedded-tomcat.jpg'
disqusArticleIdentifier: '99033 http://vojtechruzicka.com/?p=99033'
excerpt: 'How to deploy external WAR files to your Spring Boot Embedded Tomcat.'
---

![Spring add war to embedded Tomcat](spring-boot-add-war-to-embedded-tomcat.jpg)

How to deploy external WAR files to your Spring Boot Embedded Tomcat.

## Deploying war
By default Spring Boot runs as a jar inside with embedded Tomcat ([although you can deploy it as a regular WAR](https://www.vojtechruzicka.com/spring-boot-war/)). Running with an embedded application server is great, but sometimes you may need to bundle another war with your embedded application. Maybe you have a legacy app you need to include and don't want to set up a regular Tomcat for this.

Fortunately, with Spring Boot, this is easy. The implementation differs depending on your version of Spring Boot.

## Spring Boot 2.x

All you need to do is declare a bean in one of your `@Configuration` classes of type `TomcatServletWebServerFactory`. Then you need to override `getTomcatWebServer()` method. Adding a war is then as simple as running `tomcat.addWebApp()`. Please note in the example below that the `webapps` directory needs to be created as it does not exist by default. It is the directory where you normally put your wars to be deployed to your Tomcat.

```java
@Bean
public TomcatServletWebServerFactory servletContainerFactory() {
    return new TomcatServletWebServerFactory() {
    
      @Override
      protected TomcatWebServer getTomcatWebServer(Tomcat tomcat) {
          // webapps directory does not exist by default, needs to be created
          new File(tomcat.getServer().getCatalinaBase(), "webapps").mkdirs();
    
          // Add a war with given context path
          // Can add multiple wars this way with different context paths
          tomcat.addWebapp("context-path", "path-to-your-war.war");
    
          return super.getTomcatWebServer(tomcat);
      }
    
    };
}
```

Instead of hardcoding your path to war and its context path, you can externalize them as properties and only load your war when these properties are present (using `@ConditionalOnProperty`).

You can either put these in your `application.properties` or pass them as command line parameters when running your app. This way, you can, for example, skip loading your war when developing locally or provide different artifacts on different environments.

```java
@Bean
@ConditionalOnProperty(name = "external.war.file")
public TomcatServletWebServerFactory servletContainerFactory(@Value("${external.war.file}") String path,
                                                             @Value("${external.war.context}") String contextPath) {
    return new TomcatServletWebServerFactory() {

        @Override
        protected TomcatWebServer getTomcatWebServer(Tomcat tomcat) {
            new File(tomcat.getServer().getCatalinaBase(), "webapps").mkdirs();

            tomcat.addWebapp(contextPath, path);

            return super.getTomcatWebServer(tomcat);
        }

    };
}
```

If you want to deploy your war to `/`, you need to use an empty string as context root. To avoid conflicts with your Spring Boot application, you can change its context root in your `application.properties` by setting `server.servlet.context-path`.


### Using dependencies from your fat jar
If you want to avoid duplicate dependencies, which are used by both of your artifacts, you can specify that your external war should use classloader of your fat jar.

```java
Context context = tomcat.addWebapp("context-path", "path-to-your-war.war");
context.setParentClassLoader(getClass().getClassLoader());
```
 

## Spring Boot 1.x
Spring Boot 2.x came with a lot of refactoring, and you need to use a different class to deploy your war when running Spring Boot 1.x. Notice also the `try-catch` block, which is necessary to catch a checked exception thrown by the method.

```java
@Bean
public EmbeddedServletContainerFactory servletContainerFactory() {
    return new TomcatEmbeddedServletContainerFactory() {

        @Override
        protected TomcatEmbeddedServletContainer getTomcatEmbeddedServletContainer(
                Tomcat tomcat) {

            new File(tomcat.getServer().getCatalinaBase(), "webapps").mkdirs();
            
            try {
                tomcat.addWebapp("context-path", "path-to-your-war.war");
            } catch (ServletException e) {
                log.error("Unable to deploy war to embedded Tomcat");
            }

            return super.getTomcatEmbeddedServletContainer(tomcat);
        }

    };
}
```

If you want to change context path of your Spring Boot application, the process is the same as for 2.x except for the property name in `application.properties` is different - for version 1.x use `server.context-path`.

## Adding support for JSPs
If your external non-Spring Boot war contains JSPs, you need to make sure you provide proper dependencies for them as the embedded Tomcat does not contain them by default. 


For Maven, you can use:

```xml
<dependency>
    <groupId>org.apache.tomcat.embed</groupId>
    <artifactId>tomcat-embed-jasper</artifactId>
</dependency>
<dependency>
    <groupId>javax.servlet</groupId>
    <artifactId>jstl</artifactId>
</dependency>
```

For Gradle use this instead:

```
compile "org.apache.tomcat.embed:tomcat-embed-jasper"
compile "javax.servlet:jstl"
```