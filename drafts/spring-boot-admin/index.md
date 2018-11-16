---
title: 'Spring Boot Admin Tutorial'
date: "2018-11-13T22:12:03.284Z"
tags: ['Spring', 'Java']
path: '/spring-boot-admin'
featuredImage: './spring-boot-admin.png'
disqusArticleIdentifier: '99016 http://vojtechruzicka.com/?p=99016'
excerpt: 'Monitor and manage you Spring Boot apps  with a nice UI on top of Spring Boot Actuator endpoints.'
---

![Spring Boot Admin](spring-boot-admin.png)

## Spring Boot Actuator
Actuator is a Spring Boot module, which adds REST/JMX endpoints to your application so you can easily monitor and manage your application in production. The endpoints offer health-check, metrics monitoring, access to logs, threaddumps, heapdumps, environmental info and more. I've covered Actuator in depth in the following article:

<div class="linked-post"><h4 class="front-post-title" style="margin-bottom: 0.375rem;"><a href="/spring-boot-actuator/" style="box-shadow: none;">Actuator: Spring Boot Production Monitoring and Management</a></h4><small class="front-post-info"><span class="front-post-info-date">03 September, 2018</span><div class="post-tags"><ul><li><a href="/tags/spring">#Spring</a></li><li><a href="/tags/java">#Java</a></li></ul></div></small><div><a class="front-post-image" href="/spring-boot-actuator/"><div class=" gatsby-image-wrapper" style="position: relative; overflow: hidden;"><div style="width: 100%; padding-bottom: 75%;"></div><img alt="" src="data:image/jpeg;base64,/9j/2wBDABALDA4MChAODQ4SERATGCgaGBYWGDEjJR0oOjM9PDkzODdASFxOQERXRTc4UG1RV19iZ2hnPk1xeXBkeFxlZ2P/2wBDARESEhgVGC8aGi9jQjhCY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2P/wgARCAAPABQDASIAAhEBAxEB/8QAFwAAAwEAAAAAAAAAAAAAAAAAAAQFA//EABYBAQEBAAAAAAAAAAAAAAAAAAEAAv/aAAwDAQACEAMQAAABSozacLmxh//EABkQAAMBAQEAAAAAAAAAAAAAAAECAwARBP/aAAgBAQABBQJfSy6NjXMOFYdMgqEnf//EABQRAQAAAAAAAAAAAAAAAAAAABD/2gAIAQMBAT8BP//EABQRAQAAAAAAAAAAAAAAAAAAABD/2gAIAQIBAT8BP//EABwQAAEEAwEAAAAAAAAAAAAAAAEAEBESAiEiYf/aAAgBAQAGPwLWIRuA02hcmT63/8QAGxAAAwACAwAAAAAAAAAAAAAAAAERITFRYXH/2gAIAQEAAT8hxQ4VCaiFzWvDPkTpUYaTnAg8I//aAAwDAQACAAMAAAAQLy//xAAWEQEBAQAAAAAAAAAAAAAAAAAAARH/2gAIAQMBAT8QrH//xAAXEQADAQAAAAAAAAAAAAAAAAAAASER/9oACAECAQE/EMQ3af/EABwQAQEAAgMBAQAAAAAAAAAAAAERACExQaFRwf/aAAgBAQABPxBwBR+L+5rml6GIiHkO1u8s1qxV7leG40Wu4YkufaXh79z/2Q==" style="position: absolute; top: 0px; left: 0px; width: 100%; height: 100%; object-fit: cover; object-position: center center; opacity: 0; transition: opacity 0.5s ease 0.5s;"><picture><source srcset="/static/spring-boot-actuator-baf5805d4d2a459f3093063c6419e782-680c3.jpg 45w,
/static/spring-boot-actuator-baf5805d4d2a459f3093063c6419e782-0b965.jpg 90w,
/static/spring-boot-actuator-baf5805d4d2a459f3093063c6419e782-cc2e6.jpg 180w,
/static/spring-boot-actuator-baf5805d4d2a459f3093063c6419e782-feef1.jpg 270w,
/static/spring-boot-actuator-baf5805d4d2a459f3093063c6419e782-1ee31.jpg 360w,
/static/spring-boot-actuator-baf5805d4d2a459f3093063c6419e782-e8e8f.jpg 540w,
/static/spring-boot-actuator-baf5805d4d2a459f3093063c6419e782-ea010.jpg 1600w" sizes="(max-width: 180px) 100vw, 180px"><img alt="" src="/static/spring-boot-actuator-baf5805d4d2a459f3093063c6419e782-cc2e6.jpg" style="position: absolute; top: 0px; left: 0px; width: 100%; height: 100%; object-fit: cover; object-position: center center; opacity: 1; transition: opacity 0.5s ease 0s;"></picture><noscript><picture><source srcSet="/static/spring-boot-actuator-baf5805d4d2a459f3093063c6419e782-680c3.jpg 45w,
/static/spring-boot-actuator-baf5805d4d2a459f3093063c6419e782-0b965.jpg 90w,
/static/spring-boot-actuator-baf5805d4d2a459f3093063c6419e782-cc2e6.jpg 180w,
/static/spring-boot-actuator-baf5805d4d2a459f3093063c6419e782-feef1.jpg 270w,
/static/spring-boot-actuator-baf5805d4d2a459f3093063c6419e782-1ee31.jpg 360w,
/static/spring-boot-actuator-baf5805d4d2a459f3093063c6419e782-e8e8f.jpg 540w,
/static/spring-boot-actuator-baf5805d4d2a459f3093063c6419e782-ea010.jpg 1600w" sizes="(max-width: 180px) 100vw, 180px" /><img src="/static/spring-boot-actuator-baf5805d4d2a459f3093063c6419e782-cc2e6.jpg" alt="" style="position:absolute;top:0;left:0;transition:opacity 0.5s;transition-delay:0.5s;opacity:1;width:100%;height:100%;object-fit:cover;object-position:center"/></picture></noscript></div></a><span class="front-post-excerpt">Monitor and manage your application in production with Spring Boot Actuator 2.x. Gather metrics or check health easily.</span></div></div>


## Spring Boot Admin
Actuator is powerful and great and it is easy and convenient to consume the endpoints with some other application - you just make a simple REST call. It is not so great when used by a human. For humans, it is much more convenient to have a nice user interface you can use to browse all the monitoring data and manage your application. This is actually what Spring Boot Admin Does. It provides you a nice UI layer on top of actuator endpoints with a few extra features on top.

Spring Boot Admin is not a core module provided by Spring team, it was created by a company called [Codecentric](https://blog.codecentric.de/en/). Still, the code is publicly available on [Github](https://github.com/codecentric/spring-boot-admin).

## Client And Server
Unlike Actuator, Spring Boot Admin actually comes in two parts - Client and Server.

The server part contains the Admin User Interface and runs independently from the monitored applications. The Client part is the monitored application, which registers with the Admin Server part.

This way, even if our application is down or not working properly, the monitoring server is still up and running. Now imagine you have multiple applications (such as Spring Boot microservices) and each of them can be running in multiple instances. With traditional Actuator monitroing, this is hard as you need to access each of them separately and you need to keep track how many instances and where are running.

With Spring Boot Admin, each instance of your monitored application (Client) registers with the Server after it starts. Then you have single point (Admin Server), where you can check them all.

![Spring Boot Admin - Multiple Applications and instances](spring-bbot-admin-multi-instances.png)

## Source Code
The source code with a finished application can be found in [this Github repository](https://github.com/vojtechruz/spring-boot-admin).

## Server Setup
Let's first look into how to setup Spring Boot Admin Server. Let's start with a fresh Spring Boot application. You can easily create one using [Spring Initializr](https://start.spring.io/).

After creating the project, first thing we need is a Spring Boot Admin Server dependency:

```xml
<dependency>
    <groupId>de.codecentric</groupId>
    <artifactId>spring-boot-admin-starter-server</artifactId>
    <version>2.1.0</version>
</dependency>
```

Next, we need to enable Admin Server by annotating our main application class with `@EnableAdminServer`:

```java{2}
@SpringBootApplication
@EnableAdminServer
public class SpringBootAdminServerApplication {

    public static void main(String[] args) {
        SpringApplication.run(SpringBootAdminServerApplication.class, args);
    }
}
```

And that's it. Now youcan run your application and after opening `http://localhost:8080/` you should see this:

![Admin Server - No clients](spring-boot-admin-server-no-apps.png)

The serer is running, but no clients are registered yet. Lets change that.

## Client Setup
Same as with server setup, the first step is to add a proper dependency to an existing application:

```xml
<dependency>
    <groupId>de.codecentric</groupId>
    <artifactId>spring-boot-admin-starter-client</artifactId>
    <version>2.1.0</version>
</dependency>
```

Then you need to define URL where is your Admin Server running:

```properties
spring.boot.admin.client.url=http://localhost:8080
```

### Adding Actuator
Now you should be able to run both client and server. Just make sure there is not port conflict as both apps by default will use 8080. For testing purposes, you can set `server.port=0` in you `application.properties` so your client will use a random port on startup. This way you can test launching multiple instances running on different ports.

When you open Admin Server UI, you should see your application. When you click the app name, a page with application details will show up.

![Missing Actuator](spring-boot-admin-without-actuator.png)

If you see a screen like above with just a minimum of information, it means that you don't have Actuator as a part of your project. Remember, Spring Boot Admin uses Actuator endpoints under the hood. Fortunately, you need just to add a simple dependency and auto-configuration will take care of the rest.

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-actuator</artifactId>
</dependency>
```

However, most of the endpoints are not exposed by Actuator by default. You need to change your configuration in `application.properties` to expose them:

```properties
management.endpoints.web.exposure.include=*
```

After exposing your Actuator endpoints, you should see much more information in your Admin:

![Admin with Actuator Endpoints exposed](./spring-boot-admin-with-actuator.png)

For detailed tutorial on Spring Boot Actuator configuration heck [this article](https://www.vojtechruzicka.com/spring-boot-actuator/).

## Security
Now when everything is running, we should make sure our actuator endpoints and the Admin UI are not publicly available to everyone.

## Client Security
If you are already using Spring Security, the above will not work for you as the Actuator endpoints are secured by default and Admin server will not be able to access them. For testing purposes you can temporarily disable Actuator endpoint security by `management.security.enabled=false`.

But we do want to have security enabled. If you are using basic authentication, you can just provide username and password in your properties file. These credentials will be used by Admin Server to authenticate with the client's actuator endpoints:

```properties
spring.boot.admin.client.instance.metadata.user.name=joe
spring.boot.admin.client.instance.metadata.user.password=my-secret-password
```

By default, if not configured otherwise, Spring Boot will use default user `user` and auto-generated password each time your app starts. You can check the password in the console during startup. If you want to provide username and password required by your app explicitly, you can define it in your properties:

```properties
spring.security.user.name=joe
spring.security.user.password=my-secret-password
```

## Server Security

<!--
Docs: http://codecentric.github.io/spring-boot-admin/current/


https://github.com/codecentric/spring-boot-admin

Links:
http://codecentric.github.io/spring-boot-admin/current/
https://www.baeldung.com/spring-boot-admin
https://dzone.com/articles/a-look-at-spring-boot-admin
https://zoltanaltfatter.com/2018/05/15/spring-cloud-discovery-with-spring-boot-admin/

-->