---
title: 'xxx'
date: "2018-06-23T22:12:03.284Z"
tags: ['Spring']
path: '/spring-boot-version'
featuredImage: './spring-boot-version.jpg'
disqusArticleIdentifier: '99007 http://vojtechruzicka.com/?p=99007'
excerpt: 'yyy'
---

# Obtaining build information
## Maven plugin configuration
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

## Accessing Build Properties
After configuring your `spring-boot-maven-plugin` and building your application, you can access anformation about your application's build through `BuildProperties` object. Let the spring inject it for you:

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
# Adding custom properties
# How it works under the hood
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

# Detecting Spring profiles
It is no doubt useful to know which version of your artifact is deployed and when it was built. However, it is usually not enough. Often Spring applications use various profiles, which can significantly change the way they behave. Common usage is, for example, having a separate profile for each environment (DEV, UAT, PROD, ...) . Depending on the profile correct environmental configuration can be loaded such as DB connection and more.

It is useful to be able to determine current profiles as sometimes the app can be run with different profiles than expected. To detect the current profiles, you need just to inject `Environment` object and then you can simply obtain them by calling environment.

```java
@Autowired
private Environment environment;

environment.getActiveProfiles();
```

What's more, since you already have environment object, you can obtain any environmental properties by calling `environment.getProperty("property.name")`.

# Spring Actuator
# Conclusion