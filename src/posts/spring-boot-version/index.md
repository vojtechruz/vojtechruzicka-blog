---
title: 'Detecting build version and time at runtime in Spring Boot'
date: "2018-06-25T22:12:03.284Z"
tags: ['Spring', 'Java']
path: '/spring-boot-version'
featuredImage: './spring-boot-version.jpg'
excerpt: 'How to obtain artifact version, build time and other build information in a Spring Boot app at runtime?'
---

![Spring boot Version Info](./spring-boot-version.jpg)

This post covers obtaining simple build-related information without adding any additional dependencies. For much more detailed info, various metrics and health monitoring you should consider using Spring Boot Actuator:

<div class="linked-article"><h4 class="front-post-title" style="margin-bottom: 0.375rem;"><a href="/spring-boot-actuator/" style="box-shadow: none;">Actuator: Spring Boot Production Monitoring and Management</a></h4><small class="front-post-info"><span class="front-post-info-date">03 September, 2018</span><div class="post-tags"><ul><li><a href="/tags/spring/">#Spring</a></li><li><a href="/tags/java/">#Java</a></li></ul></div></small><div><a class="front-post-image" href="/spring-boot-actuator/"><div class=" gatsby-image-wrapper" style="position: relative; overflow: hidden;"><div style="width: 100%; padding-bottom: 75%;"></div><img src="data:image/jpeg;base64,/9j/2wBDABALDA4MChAODQ4SERATGCgaGBYWGDEjJR0oOjM9PDkzODdASFxOQERXRTc4UG1RV19iZ2hnPk1xeXBkeFxlZ2P/2wBDARESEhgVGC8aGi9jQjhCY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2P/wgARCAAPABQDASIAAhEBAxEB/8QAFwAAAwEAAAAAAAAAAAAAAAAAAAQFA//EABYBAQEBAAAAAAAAAAAAAAAAAAEAAv/aAAwDAQACEAMQAAABSozacLmxh//EABkQAAMBAQEAAAAAAAAAAAAAAAECAwARBP/aAAgBAQABBQJfSy6NjXMOFYdMgqEnf//EABQRAQAAAAAAAAAAAAAAAAAAABD/2gAIAQMBAT8BP//EABQRAQAAAAAAAAAAAAAAAAAAABD/2gAIAQIBAT8BP//EABwQAAEEAwEAAAAAAAAAAAAAAAEAEBESAiEiYf/aAAgBAQAGPwLWIRuA02hcmT63/8QAGxAAAwACAwAAAAAAAAAAAAAAAAERITFRYXH/2gAIAQEAAT8hxQ4VCaiFzWvDPkTpUYaTnAg8I//aAAwDAQACAAMAAAAQLy//xAAWEQEBAQAAAAAAAAAAAAAAAAAAARH/2gAIAQMBAT8QrH//xAAXEQADAQAAAAAAAAAAAAAAAAAAASER/9oACAECAQE/EMQ3af/EABwQAQEAAgMBAQAAAAAAAAAAAAERACExQaFRwf/aAAgBAQABPxBwBR+L+5rml6GIiHkO1u8s1qxV7leG40Wu4YkufaXh79z/2Q==" alt="" style="position: absolute; top: 0px; left: 0px; width: 100%; height: 100%; object-fit: cover; object-position: center center; opacity: 0; transition-delay: 500ms;"><picture><img sizes="(max-width: 180px) 100vw, 180px" srcset="/linked/spring-boot-actuator/5e4a3/spring-boot-actuator.jpg 45w,
/linked/spring-boot-actuator/e451c/spring-boot-actuator.jpg 90w,
/linked/spring-boot-actuator/29fd0/spring-boot-actuator.jpg 180w,
/linked/spring-boot-actuator/b3ebb/spring-boot-actuator.jpg 270w,
/linked/spring-boot-actuator/8841e/spring-boot-actuator.jpg 360w,
/linked/spring-boot-actuator/95b54/spring-boot-actuator.jpg 540w,
/linked/spring-boot-actuator/989b1/spring-boot-actuator.jpg 1600w" src="/linked/spring-boot-actuator/29fd0/spring-boot-actuator.jpg" alt="" style="position: absolute; top: 0px; left: 0px; width: 100%; height: 100%; object-fit: cover; object-position: center center; opacity: 1; transition: opacity 500ms ease 0s;"></picture><noscript><picture><img sizes="(max-width: 180px) 100vw, 180px" srcset="/linked/spring-boot-actuator/5e4a3/spring-boot-actuator.jpg 45w,
/linked/spring-boot-actuator/e451c/spring-boot-actuator.jpg 90w,
/linked/spring-boot-actuator/29fd0/spring-boot-actuator.jpg 180w,
/linked/spring-boot-actuator/b3ebb/spring-boot-actuator.jpg 270w,
/linked/spring-boot-actuator/8841e/spring-boot-actuator.jpg 360w,
/linked/spring-boot-actuator/95b54/spring-boot-actuator.jpg 540w,
/linked/spring-boot-actuator/989b1/spring-boot-actuator.jpg 1600w" src="/linked/spring-boot-actuator/29fd0/spring-boot-actuator.jpg" alt="" style="position:absolute;top:0;left:0;opacity:1;width:100%;height:100%;object-fit:cover;object-position:center"/></picture></noscript></div></a><span class="front-post-excerpt">Monitor and manage your application in production with Spring Boot Actuator 2.x. Gather metrics or check health easily.</span></div></div>

## Obtaining build information
It can often be useful to obtain information about artifact, version, build time and other at runtime. Sure, most of this information is already in your `pom.xml` file, but it can be tricky to retrieve these when the application is running.

Having such information at runtime can be useful. For example, imagine a scenario, where you expose a REST endpoint, which can tell the client what your current version of the application is, when was it built and so on. It can be useful because you can quickly determine what version of the app is currently deployed. This can be especially important in non-production environments, where the app is frequently deployed or even with continuous deployment in production. In such cases, it is vital to know what build exactly is currently running when testing and submitting bug reports. Maybe the issue reported is already fixed in a newer version or maybe the bug still occurs because the new version is implemented, but not deployed yet.

In any case, having build information can be handy and it is useful to know how to obtain it at runtime. In Spring Boot, it is fortunately quite easy.

## Build plugin configuration
If you are using Spring Boot, your `pom.xml` should already contain [spring-boot-maven-plugin](https://docs.spring.io/spring-boot/docs/2.0.3.RELEASE/maven-plugin/). You just need to add the following configuration.

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

It instructs the plugin to execute also [build-info](https://docs.spring.io/spring-boot/docs/2.0.3.RELEASE/maven-plugin/build-info-mojo.html) goal, which is not run by default. This generates build meta-data about your application, which includes artifact version, build time and more. 

If you are using Gradle, just add the following to your `build.gradle` file:

```json
springBoot {
    buildInfo()
}
```

## Accessing Build Properties
After configuring your `spring-boot-maven-plugin` and building your application, you can access information about your application's build through `BuildProperties` object. Let the Spring inject it for you:

```java
@Autowired
BuildProperties buildProperties;
```

Now you can access various information from this object.

```java
// Artifact's name from the pom.xml file
buildProperties.getName();
// Artifact version
buildProperties.getVersion();
// Date and Time of the build
buildProperties.getTime();
// Artifact ID from the pom file
buildProperties.getArtifact();
// Group ID from the pom file
buildProperties.getGroup();
```
## Adding custom properties
If predefined properties are not enough, you can pass your own properties from `pom.xml` file to `BuildProperties`.

```xml{9-14}
<plugin>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-maven-plugin</artifactId>
    <executions>
        <execution>
            <goals>
                <goal>build-info</goal>
            </goals>
            <configuration>
                <additionalProperties>
                    <java.version>${java.version}</java.version>
                    <some.custom.property>some value</some.custom.property>
                </additionalProperties>
            </configuration>
        </execution>
    </executions>
</plugin>
```

You can pass a value directly or use your custom properties defined in the `<properties>` section of your `pom.xml` and then referenced using `${property.name}` placeholder.

You can access custom properties defined this way by calling `buildProperties.get("property.name")`.

For Gradle projects, custom properties can be defined this way:

```json
springBoot {
    buildInfo {
        properties {
            additional = [
                'property.name': 'property value',
                'other.property': 'different.value'
            ]
        }
    }
}
```

## How it works under the hood
When `build-info` of `spring-boot-maven-plugin` is run, it generates a property file containing all the build information. By default, it is located at `${project.build.outputDirectory}/META-INF/build-info.properties`, but you can customize it by providing `outputFile` parameter. The file looks something like this:

```properties
#Properties
#Sat Jun 23 15:58:56 CEST 2018
build.version=0.0.1-SNAPSHOT
build.group=com.vojtechruzicka
build.name=spring-rest-docs-example
build.artifact=spring-rest-docs-example
build.time=2018-06-23T13\:58\:56.742472800Z
```

When Spring detects there is this file on the classpath, it creates `BuildProperties` bean unless it is explicitly declared. This is configured in `org.springframework.boot.autoconfigure.info.ProjectInfoAutoConfiguration`. This is a nice example of Spring Boot Auto-Configuration, where certain beans can be created just by having specific files on the classpath.

```java
@ConditionalOnResource(resources = 
"${spring.info.build.location:classpath:META-INF/build-info.properties}")
@ConditionalOnMissingBean
@Bean
public BuildProperties buildProperties() throws Exception {
    return new BuildProperties(
            loadFrom(this.properties.getBuild().getLocation(), 
            "build"));
}
```

## Detecting Spring profiles
It is no doubt useful to know which version of your artifact is deployed and when it was built. However, it is usually not enough. Often Spring applications use various profiles, which can significantly change the behavior. Typical usage is, for example, having a separate profile for each environment (DEV, UAT, PROD, ...). Depending on the profile, the correct environmental configuration can be loaded such as DB connection and more.

It is useful to be able to determine current profiles as sometimes the app can be run with different profiles than expected. To detect the current profiles, you need just to inject `Environment` object and then you can simply obtain them by calling `getActiveProfiles()`.

```java
@Autowired
private Environment environment;

environment.getActiveProfiles();
```

What's more, since you already have environment object, you can obtain any environmental properties by calling `environment.getProperty("property.name")`.

## Spring Actuator & Admin
While this approach gives you basic build and version info, sometimes you may need a more powerful tool. [Spring Boot Actuator](https://docs.spring.io/spring-boot/docs/current/reference/htmlsingle/#production-ready) is a sub-project of Spring Boot, which adds some production-grade monitoring and management tools exposed as REST and JMX endpoints. In fact, it can easily be configured to use build information provided by `BuildProperties` and provide them through one of its endpoints.

[Spring Boot Admin](https://github.com/codecentric/spring-boot-admin) is a community project, which provides a nice user interface on top of Spring Actuator endpoints, so the app is more comfortable to manage through a nice admin GUI.

## Conclusion
Having access to version and build information at runtime can be quite useful. In Spring boot application, you can easily obtain the info by altering the Spring Boot Maven/Gradle plugin configuration to generate the `build.properties` file and then accessing it through `BuildProperties` object.

For simple scenarios, this is an easy and quick solution and should work for you. If you need something more powerful, look at Spring Actuator or Spring Admin, which can provide the build metadata functionality plus a lot more.