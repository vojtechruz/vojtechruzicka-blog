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
In Spring MVC, web.xml used to be the place, where you needed to declare and configure Dispatcher Servlet, which is a Front Controller, receiving all the requests and dispatching to all the other components such as Controllers. Fortunately, spring offers a convenient, xml-free way of declaring Dispatcher servlet.

# Interface WebApplicationInitializer
In version 3.1, Spring introduced WebApplicationInitializer. It is an interface, which you can implement. If you do so, Spring will detect your class and execute its method onStartup(ServletContext container), inside which you can define Configuration of your Dispatcher Servlet and do all the other configuration such as registering and mapping of other servlets, filters or lifecycle listeners. Most importantly, inside the method, you'll need to create your application context. This usually means having root application context and web application context. The specific class you'll need to use for your app context will depend whether you still use XML configuration or Java configuration.

### XML Config
To created application context based on XML configuration files, you'll need to use XmlWebApplicationContext.
```java
public class XmlWebAppInitializer implements WebApplicationInitializer {

    @Override
    public void onStartup(ServletContext container) throws ServletException {
        XmlWebApplicationContext rootContext = new XmlWebApplicationContext();
        rootContext.setConfigLocation("/WEB-INF/config/root-context.xml");

        container.addListener(new ContextLoaderListener(rootContext));

        XmlWebApplicationContext dispatcherContext = new XmlWebApplicationContext();
        dispatcherContext.setConfigLocation("/WEB-INF/config/servlet-context.xml");

        ServletRegistration.Dynamic dispatcher = container.addServlet("dispatcher", new DispatcherServlet(dispatcherContext));
        dispatcher.setLoadOnStartup(1);
        dispatcher.addMapping("/");
    }
}
```

### Java Config
If you are already using Java Configuration files in favor of XML or you want to migrate, you'll need Application context which will load the  configration from annotation-based java classes. You'll need to use AnnotationConfigWebApplicationContext instead of XmlWebApplicationContext.

```java
public class AnnotationWebAppInitializer implements WebApplicationInitializer {

    @Override
    public void onStartup(ServletContext container) throws ServletException {
        AnnotationConfigWebApplicationContext rootContext = new AnnotationConfigWebApplicationContext();
        rootContext.register(RootConfig.class);

        container.addListener(new ContextLoaderListener(rootContext));

        AnnotationConfigWebApplicationContext dispatcherContext = new AnnotationConfigWebApplicationContext();
        dispatcherContext.register(WebConfig.class);

        ServletRegistration.Dynamic dispatcher = container.addServlet("dispatcher", new DispatcherServlet(dispatcherContext));
        dispatcher.setLoadOnStartup(1);
        dispatcher.addMapping("/");
    }
}
```

## More servlets, filters and listeners
So far so good, our Dispatcher servlet is configured. But web.xml is not used only for dispatcher, but for all the servlets, their filters, listeners and more. How to configure these?

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
