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

## Enabling Spring for the controller
First thing we need to do is to annotate our existing JavaFX controller with `@Component` gets recognized and managed by Spring. Next we need to add `@FxmlView` annotation, so it gets recognized by FX Weaver.

```java{4-5}
import net.rgielen.fxweaver.core.FxmlView;
import org.springframework.stereotype.Component;

@Component
@FxmlView("main-stage.fxml")
public class MyController {
}
```

Note the parameter  of `@FxmlView("main-stage.fxml")`. It specifies the name of your `.fxml` file, which should be matched with the controller. It is optional, if you dont specify it will use the name of the controller class as the file name with `.fxml` extension. **The FXML file needs to be in the same package as the controller, but in the resources folder**.

## Making sure everything works
Now let's make sure everyhting works and integrates nicely. Let's run our `@SpringBootApplication` with its `main` method. You should see a simple window with a label, nothing fancy.

Ok, that means that the application runs, but we didn't really do anything Spring-specific in our controller. No dependency injection or anything. Let's try that now.

### Adding a Service
To make sure Spring integration works properly, let's create a new Spring-managed service. Later, we'll inject it in our controller and use it there.

```
import org.springframework.stereotype.Service;

@Service
public class WeatherService {

    public String getWeatherForecast() {
        return "It's gonna snow a lot. Brace yourselves, the winter is coming.";
    }
}
```

Nothing special, it's a service for weather forecasting, which is not very dynamic right now, but it will be enought for our example.

### Injecting the service
Now let's inject our new service into our existing controller. It's the usual Spring stuff, nothing special here.

```java{5,7-10}
@Component
@FxmlView("main-stage.fxml")
public class MyController {

    private WeatherService weatherService;

    @Autowired
    public MyController(WeatherService weatherService) {
        this.weatherService = weatherService;
    }
}
```

### Loading the forecast
Now we need to load the data from our service somehow. Let's change our FMXL view, so:

1. There is a button which loads the data from `WeatherService` on click
2. The loaded data is shown in a label

```xml{11-12}
<?xml version="1.0" encoding="UTF-8"?>

<?import javafx.scene.control.*?>
<?import javafx.scene.layout.*?>

<VBox xmlns="http://javafx.com/javafx"
            xmlns:fx="http://javafx.com/fxml"
            fx:controller="com.vojtechruzicka.javafxweaverexample.MyController"
            prefHeight="100.0" prefWidth="350.0" spacing="10" alignment="CENTER">

    <Label fx:id="weatherLabel"/>
    <Button onAction="#loadWeatherForecast">Get weather</Button>
</VBox>
```

Not the `fx:id="weatherLabel"` identifier, we'll use it to get access to this label in our controller, so we can change its text.

`onAction="#loadWeatherForecast"` is a method on our controller, which should be caled when the button is clicked. We still need to add it to the controller. Let's do it now.

### Controller logic
The last step is to change our controller so it reacts to the button click in the view, loads weather forecast data and sets it to our label.

So we need a reference to the label from our view, so we can change its text. We need to select its name to match the `fx:id="weatherLabel"`.

```
@FXML
private Label weatherLabel;
```

Now we need to add the method, which is called when the button is clicked - `onAction="#loadWeatherForecast"`.

```
public void loadWeatherForecast(ActionEvent actionEvent) {
    this.weatherLabel.setText(weatherService.getWeatherForecast());
}
```

In this method we take the weather forecast from the service and set it to our label, which we defiend before. 

If you run the app now, after you click the button, it should load the current weather forecast.

![Weather app is running!](weather-app.png)

## Accessing components from view
As in plain JAvaFX, you can declare components from view to be injected to you controller, so you can interact wit them.

```
@FXML
private Label weatherLabel;
```

We already saw this works well, you just need to be careful about timing. Our controller is annotated by `@Component`, so it is a regular Spring-managed bean. It means it is instantiated by Spring when the application context starts and all the dependencies are injected. However, the weaving by FX Weaver happens later. And during this weaving the component references are injected. 

This has one implication. In your constructor and `@PostConstruct` you can already work with Spring injected dependencies as usual. However, be aware that during this time, references to components from the view are not yet available and are therefore null.

## Example repository
There is [an example repository](https://github.com/vojtechruz/javafx-weaver-example) for this blog post, where you can check the final project.

## Conclusion
FX Weaver provides a nice and easy way to integrate Spring with JavaFX applications. It is otherwise not so straightforward as JavaFX manages 