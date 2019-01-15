---
title: 'Actuator: Spring Boot Production Monitoring and Management'
date: "2018-09-03T22:12:03.284Z"
tags: ['Spring', 'Java']
path: '/spring-boot-actuator'
featuredImage: './spring-boot-actuator.jpg'
disqusArticleIdentifier: '99008 http://vojtechruzicka.com/?p=99008'
excerpt: 'Monitor and manage your application in production with Spring Boot Actuator 2.x. Gather metrics or check health easily.'
---

![Spring Boot Actuator](spring-boot-actuator.jpg)

# Basic build information
In one of my previous articles, I described how to obtain some basic information about the current build of your application at runtime in Spring Boot.

<div class="linked-post">
<div><h4 class="front-post-title" style="margin-bottom: 0.375rem;"><a href="/spring-boot-version/" style="box-shadow: none;">Detecting build version and time at runtime in Spring Boot</a></h4><small class="front-post-info"><span class="front-post-info-date">25 June, 2018</span><div class="post-tags"><ul><li><a href="/tags/spring/">#Spring</a></li><li><a href="/tags/java/">#Java</a></li></ul></div></small><div><a class="front-post-image" href="/spring-boot-version/"><div class=" gatsby-image-wrapper" style="position: relative; overflow: hidden;"><div style="width: 100%; padding-bottom: 66.5%;"></div><img src="data:image/jpeg;base64,/9j/2wBDABALDA4MChAODQ4SERATGCgaGBYWGDEjJR0oOjM9PDkzODdASFxOQERXRTc4UG1RV19iZ2hnPk1xeXBkeFxlZ2P/2wBDARESEhgVGC8aGi9jQjhCY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2P/wgARCAANABQDASIAAhEBAxEB/8QAGQAAAgMBAAAAAAAAAAAAAAAAAAMBAgQF/8QAFQEBAQAAAAAAAAAAAAAAAAAAAgP/2gAMAwEAAhADEAAAAauyMjSDrCP/xAAbEAADAAIDAAAAAAAAAAAAAAAAAQIDERITIf/aAAgBAQABBQLEVHI00KnJ2Ub8/8QAFhEBAQEAAAAAAAAAAAAAAAAAAAER/9oACAEDAQE/AbGv/8QAFhEBAQEAAAAAAAAAAAAAAAAAAAER/9oACAECAQE/AZWP/8QAGxAAAgIDAQAAAAAAAAAAAAAAACEBEQIQQVH/2gAIAQEABj8ClCxleDihF91//8QAGxABAAICAwAAAAAAAAAAAAAAAQARMUEQIVH/2gAIAQEAAT8hA7JUuxoJiIvHiFGfSFgoYn//2gAMAwEAAgADAAAAEM/f/8QAFhEBAQEAAAAAAAAAAAAAAAAAEQEQ/9oACAEDAQE/EKLj/8QAFhEBAQEAAAAAAAAAAAAAAAAAARAR/9oACAECAQE/EAwI/8QAHBABAAMBAAMBAAAAAAAAAAAAAQARITFBUWGB/9oACAEBAAE/EDMHZEVEOGn9gD2yGk0kFt6XHDrxrCnonmbQEPPk/9k=" alt="" style="position: absolute; top: 0px; left: 0px; width: 100%; height: 100%; object-fit: cover; object-position: center center; opacity: 0; transition: opacity 0.5s ease 0.5s;"><picture><source srcset="/static/addd7022e57908233618e4c15582fa6e/680c3/spring-boot-version.jpg 45w,
/static/addd7022e57908233618e4c15582fa6e/0b965/spring-boot-version.jpg 90w,
/static/addd7022e57908233618e4c15582fa6e/cc2e6/spring-boot-version.jpg 180w,
/static/addd7022e57908233618e4c15582fa6e/feef1/spring-boot-version.jpg 270w,
/static/addd7022e57908233618e4c15582fa6e/1ee31/spring-boot-version.jpg 360w,
/static/addd7022e57908233618e4c15582fa6e/e8e8f/spring-boot-version.jpg 540w,
/static/addd7022e57908233618e4c15582fa6e/ea010/spring-boot-version.jpg 1600w" sizes="(max-width: 180px) 100vw, 180px"><img alt="" src="/static/addd7022e57908233618e4c15582fa6e/cc2e6/spring-boot-version.jpg" style="position: absolute; top: 0px; left: 0px; width: 100%; height: 100%; object-fit: cover; object-position: center center; opacity: 1; transition: none 0s ease 0s;"></picture><noscript><picture><source srcSet="/static/addd7022e57908233618e4c15582fa6e/680c3/spring-boot-version.jpg 45w,
/static/addd7022e57908233618e4c15582fa6e/0b965/spring-boot-version.jpg 90w,
/static/addd7022e57908233618e4c15582fa6e/cc2e6/spring-boot-version.jpg 180w,
/static/addd7022e57908233618e4c15582fa6e/feef1/spring-boot-version.jpg 270w,
/static/addd7022e57908233618e4c15582fa6e/1ee31/spring-boot-version.jpg 360w,
/static/addd7022e57908233618e4c15582fa6e/e8e8f/spring-boot-version.jpg 540w,
/static/addd7022e57908233618e4c15582fa6e/ea010/spring-boot-version.jpg 1600w" sizes="(max-width: 180px) 100vw, 180px" /><img src="/static/addd7022e57908233618e4c15582fa6e/cc2e6/spring-boot-version.jpg" alt="" style="position:absolute;top:0;left:0;transition:opacity 0.5s;transition-delay:0.5s;opacity:1;width:100%;height:100%;object-fit:cover;object-position:center"/></picture></noscript></div></a><span class="front-post-excerpt">How to obtain artifact version, build time and other build information in a Spring Boot app at runtime?</span></div></div>
</div>

While this can be handy, it is usually not sufficient. There is a lot more you are usually interested in. And most importantly, it does not involve just the information known at build time, but rather what is the application's current status at runtime. In these situations, you should use Spring Boot Actuator.

# Spring Boot Actuator
In short, Spring Boot Actuator is one of the sub-projects od Spring Boot, which adds monitoring and management support for your applications running in production. It exposes various HTTP or JMX endpoints you can interact with.

This post covers Actuator 2.x. If you're using Spring Boot 1.x, be aware that there were many changes in the version 2 and you should look for version 1.x specific configuration instead.

# Source code
The source code of example application using Spring Boot Actuator can be found [here](https://github.com/vojtechruz/spring-boot-actuator-example).

# Adding Dependencies
The basic setup is really simple. You just need to add one dependency to your project - `spring-boot-starter-actuator`. 

Maven:
```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-actuator</artifactId>
</dependency>
```

Gradle:
```
compile("org.springframework.boot:spring-boot-starter-actuator")
```

As usual, once this dependency is on the classpath, Spring Boot is able to detect this and auto-configures Actuator for you. Just rebuild and start your application.

# Up and Running
Now if you run your application, you can check all the available endpoints by accessing `/actuator`. That means, if you are running locally on port 8080, you'll need to open `http://localhost:8080/actuator`. You should see something similar to this:

```json
{
  "_links": {
    "self": {
      "href": "http://localhost:8080/actuator",
      "templated": false
    },
    "health": {
      "href": "http://localhost:8080/actuator/health",
      "templated": false
    },
    "info": {
      "href": "http://localhost:8080/actuator/info",
      "templated": false
    }
  }
}
```

This is the list of all the available Actuator endpoints. As you can see, there is just two of them: health and info. Let's try `/health` first.

```json
{"status":"UP"}
```

And now `/info`. It looks like it is returning just an empty json: `{}`. 

# More endpoints
Not very impressive so far. Of course, Actuator offers much more than this. Otherwise, it wouldn't be very useful. There are some examples of available endpoints, with the full list available in the [official docs](https://docs.spring.io/spring-boot/docs/current/reference/html/production-ready-endpoints.html#production-ready-endpoints).

| Endpoint   | Description   |
|------------|---------------|
| health  | Application health info  |
| info  | Info about the application  |
| env  | Properties from environment  |
| metrics  | Various metrics about the app  |
| mappings  | `@RequestMapping` Controller mappings  |
| shutdown  | Triggers application shutdown  |
| httptrace  | HTTP request/response log  |
| loggers  | Display and configure logger info  |
| logfile  | Contents of the log file  |
| threaddump  | Perform thread dump  |
| heapdump  | Obtain JVM heap dump  |
| caches  | Check available caches  |
| integrationgraph | Graph of Spring Integration components  |

## Exposing endpoints
For most of the endpoints, Actuator offers two ways of connecting to them:
- HTTP REST endpoint
- JMX endpoint

By default, as we already saw, only *health* and *info* endpoints are exposed over HTTP. However, all of them are exposed over JMX (where applicable) by default.

You can configure in your `application.properties` which endpoints should be exposed:

```properties
# Expose over JMX
management.endpoints.jmx.exposure.exclude=shutdown
management.endpoints.jmx.exposure.include=*
# Expose HTTP REST Endpoint
management.endpoints.web.exposure.exclude=
management.endpoints.web.exposure.include=health,info,metrics
```

As you can see, you can define endpoints by name or use `*` to represent all endpoints. You can combine include and exclude filters.

If you change your configuration to expose all the endpoints over HTTP and restart your app, your `/actuator` endpoint will now show many more URLs.

```properties
management.endpoints.web.exposure.include=*
```

## Enabling / Disabling endpoints
You can configure not only whether an endpoint is exposed over HTTP or JMX, but also you can turn specific endpoints on/off. All the endpoints except `shutdown` are enabled by default (although not exposed over HTTP).

```properties
# Disable an endpoint
management.endpoint.[endpoint-name].enabled=false

# Specific example for 'health' endpoint
management.endpoint.health.enabled=false

# Instead of enabled by default, you can change to mode
# where endpoints need to be explicitly enabled
management.endpoints.enabled-by-default=false

```

# /health
As we already saw, the information provided by `/health` endpoint is rather unimpressive.

```json
{"status":"UP"}
```

Fortunately, this is just the default state and we can show much more details.

```properties
management.endpoint.health.show-details=always
```

Now the information available is much richer. The exact details vary based on your specific dependencies. For example, whether you use a data source and which one.

```json
{
  "status": "UP",
  "details": {
    "db": {
      "status": "UP",
      "details": {
        "database": "H2",
        "hello": 1
      }
    },
    "diskSpace": {
      "status": "UP",
      "details": {
        "total": 497336446976,
        "free": 202989006848,
        "threshold": 10485760
      }
    }
  }
}
```

Of course, it may not be a good idea to show such information to everyone publicly. Fortunately, you can restrict access, so the details are available to users with specific roles only. Instead of `always`, you rather use `when-authorized` and then you can specify the allowed roles.

```properties
management.endpoint.health.show-details=when-authorized
management.endpoint.health.roles=ADMIN
```

# /info
When we tried to call `/info` endpoint before, all we've got was just an empty response `{}`. Of course, we can do better. Let's examine various ways we can display more info.

## Build Properties
In the article [I referenced at the beginning of this post](https://www.vojtechruzicka.com/spring-boot-version/), I  describe how to obtain information about the artifact and its build properties. The idea is simple, configure Spring Boot Maven/Gradle plugin to generate `build-info.properties` file, which contains the required information. 

What's great is that if you do use Actuator, it automatically detects `build-info.properties` file and displays its contents through the `/info` endpoint. All you need to do is to add a simple config to your Spring Boot Maven/Gradle Plugin.

Maven `pom.xml` file:
```xml{4-11}
<plugin>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-maven-plugin</artifactId>
    <executions>
        <execution>
            <id>build-info</id>
            <goals>
                <goal>build-info</goal>
            </goals>
        </execution>
    </executions>
</plugin>
```

Gradle `build.gradle` file:

```json
springBoot {
    buildInfo()
}
```

Info endpoint now provides build info information:

```json
{
  "build": {
    "version": "1.0.0-SNAPSHOT",
    "artifact": "spring-boot-actuator-example",
    "name": "spring-boot-actuator-example",
    "group": "com.vojtechruzicka",
    "time": "2018-09-01T19:03:06.446Z"
  }
}
```

## Git Properties
Actuator automatically detects `git.properties` file, which contains useful information about your git repository. To generate it, you'll need to add a specific plugin to your build config.

In Maven `pom.xml`:
```xml
<plugin>
    <groupId>pl.project13.maven</groupId>
    <artifactId>git-commit-id-plugin</artifactId>
</plugin>
```

Gradle uses a [different plugin](https://github.com/n0mer/gradle-git-properties):
```
plugins {
    id "com.gorylenko.gradle-git-properties" version "1.5.1"
}
```

After rebuilding and restarting the `/info` endpoint displays some git info.
```json
{
  "git": {
    "commit": {
      "time": "2018-09-01T19:46:31Z",
      "id": "493f071"
    },
    "branch": "master"
  }
}
```

## Environment properties
Finally, Actuator automatically detects all the environmental properties, which start with `info.`. You can try it by adding a new property to your `application.properties`, which starts with `info.`.

```properties
info.my-custom-property=What a nice property!
```

Then it is returned by the `/info` endpoint.

```json
{"my-custom-property":"What a nice property!"}
```

What's useful is that it shows properties from various sources, not only `application.properties`.
- Environment variables
- Command line arguments
- Servlet Config/Context params
- And [many more](https://docs.spring.io/spring-boot/docs/current/reference/html/boot-features-external-config.html)

# /metrics
This endpoint exposes information about various metrics. By calling `/metrics` you get names of all which are available.

```json
{
  "names": [
    "jvm.memory.max",
    "jvm.memory.used",
    "jdbc.connections.active",
    "http.server.requests",
    "jvm.gc.memory.promoted",
    "system.cpu.usage",
    "tomcat.cache.hit",
    "tomcat.cache.access",
    "jvm.gc.max.data.size",
    "jdbc.connections.max",
    "jdbc.connections.min",
    "jvm.memory.committed",
    "system.cpu.count",
    "logback.events",
    ...
  ]
}
```

If you want to display data for a specific metric, instead of calling `/metrics` you call `/metrics/{metric-name}`. For example, calling `/metrics/jvm.memory.used` will return response similar to this:

```json
{
  "name": "jvm.memory.used",
  "measurements": [
    {
      "statistic": "VALUE",
      "value": 2.44780736E8
    }
  ],
  "availableTags": [
    {
      "tag": "area",
      "values": [
        "heap",
        "nonheap"
      ]
    },
    {
      "tag": "id",
      "values": [
        "Compressed Class Space",
        "PS Survivor Space",
        "PS Old Gen",
        "Metaspace",
        "PS Eden Space",
        "Code Cache"
      ]
    }
  ]
}
```

Metrics were completely reworked in version 2. Version 1 uses its own proprietary metric system, which is hierarchical. This does not work very well in the cloud with many application instances. Actuator version 2 uses an entirely new system for managing metrics. It is dimensional in nature and it utilizes [Micrometer](https://micrometer.io/).

> Micrometer provides a simple facade over the instrumentation clients for the most popular monitoring systems, allowing you to instrument your JVM-based application code without vendor lock-in. Think SLF4J, but for metrics.

So in addition to dimensional focus, you now have a nice facade to integrate various popular existing solutions such as Prometheus, Atlas, CloudWatch, Ganglia or New Relic. You can read more details in [Micrometer: Spring Boot 2's new application metrics collector](https://spring.io/blog/2018/03/16/micrometer-spring-boot-2-s-new-application-metrics-collector)

# Securing Actuator endpoints
Leaving your actuator endpoints exposed for anybody to access is not a good idea. That's why the vast majority of them are not exposed by default. Once you do expose them, you should make sure they are adequately protected.

The good news is that if you use Spring Security, Actuator endpoints are secured by default. If you're not using Spring Security, you can add this dependency:

```
Maven:
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-security</artifactId>
</dependency>

Gradle:
compile 'org.springframework.boot:spring-boot-starter-security'
```

If you rebuild and restart your app, you'll notice that now you are required to log in if accessing the actuator endpoints. By default, the username is `user` and the password is randomly generated and printed to the console every time the application starts:

```
Using generated security password: f7b833aa-5a1c-42f4-b913-70c1abe47cb6
```

Protecting all the endpoints like this may be sufficient in many cases, you'll just usually change how user's credentials are validated. If you need more fine-grained control, you should create a configuration class extending `WebSecurityConfigurerAdapter` and override the `configure` method:

```java
@Configuration
public class ActuatorSecurityConfiguration extends WebSecurityConfigurerAdapter {

    @Override
    protected void configure(HttpSecurity http) throws Exception {
        http.authorizeRequests()
            .requestMatchers(EndpointRequest.to(ShutdownEndpoint.class))
                .hasRole("ADMIN")
            .requestMatchers(EndpointRequest.to(HealthEndpoint.class, InfoEndpoint.class))
                .permitAll()
            .requestMatchers(EndpointRequest.toAnyEndpoint())
                .fullyAuthenticated()
            .and().httpBasic();
    }
}
```

In the example above, the `/shutdown` endpoint is accessible only for an authenticated user with role ADMIN. Endpoints `/health` and `/info` are accessible for anybody. All the other endpoints are accessible only for fully authenticated users.

Notice that we are not matching by URL of the endpoints but rather by class, so we are not tightly coupled to the URL to which an endpoint is mapped to. If URLs are reconfigured, we don't need to change our security config.

# Actuator 1.x vs 2.x
Many of the changes brought with Spring Boot 2.0 are in fact in the Actuator module.

Actuator endpoints are now technology independent. Before, they relied on Spring MVC. Now it does not matter whether you use MVC, Jersey or the new Spring WebFlux.

In version 1.x there was a special security configuration just for actuator endpoints. This was dropped and you now use Spring Security directly as you would for any other endpoint. It is much simpler and more consistent.

The old version of Actuator used to have proprietary metrics, but 2.x uses [Micrometer](https://micrometer.io/). This was later [backported](https://micrometer.io/docs/ref/spring/1.5) even to 1.x.

There were some new endpoints introduced, some were renamed to more descriptive names. The configuration properties were also reworked and are now neatly grouped together by common prefix.

More detailed description of the changes can be found in [Spring Boot 2.0 actuator change analysis](https://blog.frankel.ch/spring-boot-2-actuator-change-analysis/). If you are migrating from version 1.x [this guide](https://github.com/spring-projects/spring-boot/wiki/Spring-Boot-2.0-Migration-Guide#spring-boot-actuator) may come in handy.

# Adding Graphical User Interface
Actuator endpoints are great, but monitoring and managing your application just through JMX and HTTP endpoints may be too low-level and cumbersome for many. If you prefer a nice GUI instead of interacting with endpoints directly, there's a great tool just for this. It is called [Spring Boot Admin](https://github.com/codecentric/spring-boot-admin). It is a third-party open-source project, which gives you a nice UI to manage and monitor your applications. What's more, a single instance of Spring Boot Admin can monitor multiple applications and/or multiple instances of each application. That's really useful in the cloud environment with many dynamic instances of your app.

<div class="linked-post"><div><h4 class="front-post-title" style="margin-bottom: 0.375rem;"><a href="/spring-boot-admin/" style="box-shadow: none;">Spring Boot Admin Tutorial</a></h4><small class="front-post-info"><span class="front-post-info-date">18 November, 2018</span><div class="post-tags"><ul><li><a href="/tags/spring/">#Spring</a></li><li><a href="/tags/java/">#Java</a></li></ul></div></small><div><a class="front-post-image" href="/spring-boot-admin/"><div class=" gatsby-image-wrapper" style="position: relative; overflow: hidden;"><div style="width: 100%; padding-bottom: 56.9279%;"></div><img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAALCAIAAADwazoUAAAACXBIWXMAACToAAAk6AGCYwUcAAABFUlEQVQoz2P4TwFgAOJ/QAgG/8jQjAz+kar5/JcX+fd2F93b3fn4+K+/fyFGQJzzD9VENKMZ/vz7G3FjffTNDdl3d2idnbn+zU2g6Le/v4Hq/v4DKf7x98+ff1BdQJG//xAmMFz48jL7zs6WR0daHx9tf3y068nx97+/b357e/u7u4c/Pjrx6cmGNzd3v7+3/8ODU5+f7Xp/Dyi+5/3905+fAm1lePXra/7d3ZE3NoRdX+d/bc3sF+eBRt7/8eHO93cff/+49vX1k5+fnv38DCTf/f7+8tfX578+v/797e3v70AngPy8+s11p8tLPa6siLy54fWvr8jhT1RUAfU8//nl05+fsNAijLBG1T+S4xmoB4xIAwDF53Mx+yjpVwAAAABJRU5ErkJggg==" alt="" style="position: absolute; top: 0px; left: 0px; width: 100%; height: 100%; object-fit: cover; object-position: center center; opacity: 0; transition: opacity 0.5s ease 0.5s;"><picture><source srcset="/static/082e3acd6e69050d80651011afcd3022/68179/spring-boot-admin.png 45w,
                         /static/082e3acd6e69050d80651011afcd3022/af06e/spring-boot-admin.png 90w,
                         /static/082e3acd6e69050d80651011afcd3022/c5537/spring-boot-admin.png 180w,
                         /static/082e3acd6e69050d80651011afcd3022/fa946/spring-boot-admin.png 270w,
                         /static/082e3acd6e69050d80651011afcd3022/b0661/spring-boot-admin.png 360w,
                         /static/082e3acd6e69050d80651011afcd3022/3ae35/spring-boot-admin.png 540w,
                         /static/082e3acd6e69050d80651011afcd3022/7764c/spring-boot-admin.png 1595w" sizes="(max-width: 180px) 100vw, 180px"><img alt="" src="/static/082e3acd6e69050d80651011afcd3022/c5537/spring-boot-admin.png" style="position: absolute; top: 0px; left: 0px; width: 100%; height: 100%; object-fit: cover; object-position: center center; opacity: 1; transition: none 0s ease 0s;"></picture><noscript><picture><source srcSet="/static/082e3acd6e69050d80651011afcd3022/68179/spring-boot-admin.png 45w,
                         /static/082e3acd6e69050d80651011afcd3022/af06e/spring-boot-admin.png 90w,
                         /static/082e3acd6e69050d80651011afcd3022/c5537/spring-boot-admin.png 180w,
                         /static/082e3acd6e69050d80651011afcd3022/fa946/spring-boot-admin.png 270w,
                         /static/082e3acd6e69050d80651011afcd3022/b0661/spring-boot-admin.png 360w,
                         /static/082e3acd6e69050d80651011afcd3022/3ae35/spring-boot-admin.png 540w,
                         /static/082e3acd6e69050d80651011afcd3022/7764c/spring-boot-admin.png 1595w" sizes="(max-width: 180px) 100vw, 180px" /><img src="/static/082e3acd6e69050d80651011afcd3022/c5537/spring-boot-admin.png" alt="" style="position:absolute;top:0;left:0;transition:opacity 0.5s;transition-delay:0.5s;opacity:1;width:100%;height:100%;object-fit:cover;object-position:center"/></picture></noscript></div></a><span class="front-post-excerpt">Monitor and manage you Spring Boot apps with a nice UI on top of Spring Boot Actuator endpoints.</span></div></div></div>

# Conclusion
Spring Boot Actuator offers a powerful solution for monitoring and managing your application in production. It offers interaction either over JMX or HTTP endpoints. If you prefer GUI instead try Spring Boot Admin on top of Actuator Endpoints. However, bear in mind that having public endpoints which allow you to tinker with your app and expose sensitive data is not a good idea. Always be sure to secure your endpoints. 