---
title: ''
date: "2019-11-11T22:12:03.284Z"
tags: ["Git"]
path: '/commitlint'
featuredImage: './.jpg'
disqusArticleIdentifier: '99044 http://vojtechruzicka.com/?p=99044'
excerpt: ''
---

![Commitlint](.jpg)

## JavaFX & Spring

## JavaFX-Weaver
 [JavaFX-Weaver](https://github.com/rgielen/javafx-weaver/) is a project by [Rene Gielen](https://twitter.com/rgielen), which aims to integrate Spring and JavaFX.

## Getting started
Let's try with a plain simple Spring Boot project and let's try to integrate JavaFx. You can generate a new project using [Spring Initializr](https://start.spring.io/). You don't need to add any dependencies here. If you want to avoid getting into setting up JavaFX as a dependency, select a Java version pre-11 [as it still contains JavaFXas a part of the JDK](https://www.vojtechruzicka.com/javafx-getting-started/).

### Adding a controller
We'll need a controller and a companion `.fxml` view to be able to test that our application works properly both with Spring and JavaFx. Let' create a controller first. Let's keep it empty for now.

```java
public class MyController {
}
```

### Adding a view
Now we need a `.fxml` file which will be used with our controller as a view. We'll place it in the `resources` folder. **For the integration to work properly it is necessary to create it in the resources folder, but in a directory structure matching the package where is our controller**.

For example, let's assume our controller is in package `com.vojtechruzicka.javafxweaverexample`. The `.fxml` file needs to be placed exaclty here:

```
src\main\resources\com\vojtechruzicka\javafxweaverexample
```

Let's call our file `main-scene.fxml`.

## Dependencies
If you are using plain Spring, the setup is little different, but for Spring Boot you just need to add the following dependency to your `pom.xml` file:

```xml
<dependency>
    <groupId>net.rgielen</groupId>
    <artifactId>javafx-weaver-spring-boot-starter</artifactId>
    <version>1.3.0</version>
</dependency>
```

Or this one if you are using Gradle:

```
implementation 'javafx-weaver-spring-boot-starter:1.3.0'
```

## Spring Boot Application class
When we generated our base Spring Boot application, the main application class was also generated for us. It is the class annotated with `@SpringBootApplication`, which is used as an entry-point to run the whole app.

But wait! JavaFX has also its [main application class](https://www.vojtechruzicka.com/javafx-hello-world/#application-class), which is used as an entry point for starting JavaFX applications.

That's confusing. So which one should be actually used to run our app which is both Spring Boot and JavaFX?

We'll still use our `@SpringBootApplication` with a slight modification. Instead of running the Spring app directly, we'll use it to run our JavaFX app. Ann the JavaFX Application will be responsible for properly starting Spring application context and integrate everything together using JavaFX Weaver.

We need first to make sure that the Spring Boot app launches our JAvaFX app.

```java{13}
import javafx.application.Application;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class SpringBootExampleApplication {

    public static void main(String[] args) {
        // This is how normal Spring Boot app would be launched
        // SpringApplication.run(SpringBootExampleApplication.class, args);

        // JavaFxApplication doesn't exist yet, 
        // we'll create it in the next step
        Application.launch(JavaFxApplication.class, args);
    }
}
```

## JavaFX Application class
Now our `@SpringBootApplication` is calling out `JavaFxApplication`, which does not exist yet. Let's create it now.

```java
public class JavaFxApplication extends Application {

    private ConfigurableApplicationContext applicationContext;

    @Override
    public void init() {
        String[] args = getParameters().getRaw().toArray(new String[0]);

        this.applicationContext = new SpringApplicationBuilder()
                .sources(SpringBootExampleApplication.class)
                .run(args);
    }

}
```

When the JavaFX initializes, it creates a new application context based on configuration in our `SpringBootExampleApplication` - the main class of the Spring Boot application, which we modified in the previous step.

Now we have a Spring Boot application running with our new application context. But we need to make sure the context is properly closed when the JavaFX application terminates. For example, when you close the window. Let's handle this now.

```java
@Override
public void stop() {
    this.applicationContext.close();
    Platform.exit();
}
```

Now the last part is to actually create a new window (Stage) and show it.

```
@Override
public void start(Stage stage) {
    FxWeaver fxWeaver = applicationContext.getBean(FxWeaver.class);
    Parent root = fxWeaver.loadView(MyController.class);
    Scene scene = new Scene(root);
    stage.setScene(scene);
    stage.show();
}
```

This is where Fx Weaver comes into play. We need to obtain its bean from the application context and then use it to load our FXML. 

## Spring managed controllers
Traditionally we would create our Stage using `FXMLLoader`, which would load the FXML file and create a Controller instance declared in it for us.

```
FXMLLoader loader = new FXMLLoader();
URL xmlUrl = getClass().getResource("/main-scene.fxml");
loader.setLocation(xmlUrl);
Parent root = loader.load();
Scene scene = new Scene(root);
stage.setScene(scene);
stage.show();
```
    
So why are we using FX Weaver instead? What's problematic is that `FXMLLoader` creates the controller instance for us. That means it is not created and managed by Spring. Therefore we cannot use dependency injection and other spring goodies in our controllers. And that's why we introduced Spring in our JavaFX in the first place!

But when FX Weaver creates the controller for us, it creates it as a spring managed bean, so we can fully utilize the features of Spring.