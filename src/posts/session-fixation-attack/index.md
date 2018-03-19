---
title: Session Fixation Attack
date: "2017-02-20T22:12:03.284Z"
tags: ['Security', 'HTTP']
path: '/session-fixation-attack'
featuredImage: './session-fixation.jpg'
disqusArticleIdentifier: '578 http://vojtechruzicka.com/?p=578'
excerpt: Session fixation is a type of attack, where the attacker can hijack user's session. What are some of the variants and how to prevent this type of attack?
---
![session fixation attack](./session-fixation.jpg)

Session fixation is a type of attack, where the attacker can hijack user's session. What are some of the variants and how to prevent this type of attack?

Introduction
------------

Session Fixation is a type of vulnerability, where the attacker can trick a victim into authenticating in the application using Session Identifier provided by the attacker. Unlike Session Hijacking, this does not rely on stealing Session ID of an already authenticated user. Instead, the attacker makes the victim use SID, which he already knows and which can he later use to make requests using victim's authenticated session.

The basic execution of the attack is the following:

1.  The attacker obtains valid Session ID himself.
2.  The victim is tricked into submitting provided Session ID in their authentication request.
3.  The victim is now authenticated with the unchanged Session ID.
4.  The Attacker can now send requests using victim's Session ID as if they were fully authenticated.

Obtaining Session ID
--------------------

### Fabricated SID

The most basic example is where the server accepts not only SIDs, which it generated but any SIDs provided by the client. When such server receives a new unknown SID with a request, it creates a new session associated with the SID provided. In that case, the attacker can choose any SID they want and trick the victim to use it.

### Server generated SID

When the server is configured to accept only SIDs it actually generated, it is slightly less vulnerable. The difference is that the attacker has to send a request to the server and obtain a new valid SID provided by the server. Then it needs to make the victim to use the very same Session Id to authenticate. Once the victim authenticates, the attacker can use the same SID to act as an authenticated user. This attack vector is more difficult as each session has time-out interval and is terminated when the user is inactive for that period of time. Therefore, the attacker needs to make sure the victim authenticates before the session expires or they need to keep prolonging the session. Server-generated SIDs are not preventing session fixation attacks, but make it harder, so it is still recommended to have it enabled.

Passing SID to the victim
-------------------------

Once the attacker has the Session Id obtained, they need to make sure the victim uses the same SID to authenticate. There are several ways to do this.

### URL Parameter

The easiest way to make the victim use the attacker\'s SID is when the server supports Session Id passed as an URL parameter.

It this case the attacker sends the victim a link containing SID, for example:

```java
https://www.example.com/?SID=123456
```

The victim uses the link to Sign in to the application. Because the Session Id is already provided, the server does not generate a new SID but uses the provided one instead. Once the victim is authenticated, the SID (known to the attacker) remains the same and the session is compromised.

In Java, you can define how should the session ID be transmitted in web.xml. There are [three options](http://www.logicbig.com/tutorials/java-ee-tutorial/java-servlet/session-tracking-mode/) - URL, COOKIE, SSL. To prevent session fixation attack using URL parameter, you should set tracking mode either to COOKIE or SSL.

```xml
<session-config>
    <tracking-mode>COOKIE</tracking-mode>
</session-config>
```

### Setting cookie via XSS

When a server is not using URL parameter to pass the SID, it usually uses cookies. While cookies are a safer approach, they can also be vulnerable.

Cross-site scripting (XSS) is a type of vulnerability, where malicious javascript code can be executed in the victim\'s browser. This can be combined with various other vulnerabilities to perform an attack. Javascript can be used to set cookies. For security reasons, you can set cookies only for the domain of your current page. However, in XSS the malicious javascript is actually served from the same domain, so this safeguard is avoided. Malicious javascript can then be used to set a value of session cookie to the SID know by the attacker.

Be aware that the attributes of the session cookie can be set in a way that the cookie is persisted after browser quits and the expiration date can be set in the distant future.

Cookies can have optional parameter HttpOnly. With this parameter, client-side scripts will not be able to access the value of such cookie. Session Cookies should be always HttpOnly to mitigate various XSS related session vulnerabilities. When using HTTPS, the session cookie should also have \"Secure\" parameter, which makes sure that it only gets transmitted when a secure connection is established.

Starting with Servlet 3.0, you can declare in web.xml that all session cookies should be HttpOnly and/or Secure.

```xml
<session-config>
  <cookie-config>
    <secure>true</secure>
    <http-only>true</http-only>
  </cookie-config>
</session-config>
```

### Setting cookie via meta tag

A Lesser known fact is that on the client\'s side you can set cookies not only using JavaScript but also in document\'s header using a special meta tag.

```html
<meta http-equiv="Set-Cookie" Content="SID=123456;expires=Saturday,18-Feb-2017 12:00:00 GMT">
```

This works even when the JavaScript is disabled. The most common way to exploit this vulnerability would be in a situation where the page displays content provided by the users. If it\'s not properly sanitized, the meta tag can be injected into the code of the page. Although the meta tags belong to the header part of the HTML page, the attack is likely to succeed even if injected into the body, depending on the browser used, [as it often gets interpreted](http://stackoverflow.com/q/1447842/4560142).

Changing Session Id - Servlets
------------------------------

A good countermeasure against the session fixation attack is to change Session ID every time user authenticates. The way it can be changed differs depending on Servlet version.

### Servlet 3.0 and lower

Prior to version 3.1, there is no direct way to change session id while preserving this session's data. The only way how to handle post-authentication Session ID change is:

1.  Copy the required data from the old session
2.  Invalidate the old session - [httpServletRequest.getSession(false).invalidate()](https://javaee-spec.java.net/nonav/javadocs/javax/servlet/http/HttpSession.html#invalidate());
3.  Create a new session, which is assigned a different JSESSIONID - [getSession()](https://javaee-spec.java.net/nonav/javadocs/javax/servlet/http/HttpServletRequest.html#getSession())
4.  Save the copied data from the old session in the new session.

### Servlet 3.1 and higher

Fortunately, JavaEE 7 and Servlets 3.1 bring a simpler way of changing Session ID without the need of invalidating the old session and creating a new one.

```java
httpServletRequest.changeSessionId();
```

Additionally, Servlets 3.1 provides new [HttpSessionIdListener](https://docs.oracle.com/javaee/7/api/javax/servlet/http/HttpSessionIdListener.html), which can be used to get notifications whenever Session Id is changed.

Please note - while servlet specification does not provide any session fixation protection out of the box, some of the application servers provide their own solution, [like Tomcat](http://www.tomcatexpert.com/blog/2011/04/25/session-fixation-protection).

Spring Security
---------------

The good news is that Spring Security provides [session fixation protection](http://docs.spring.io/spring-security/site/docs/current/reference/htmlsingle/#ns-session-fixation) out of the box and it is enabled by default. If necessary, the mechanism can be changed or completely disabled. The default mechanism depends on the version of Servlet container used:

-   For Servlets 3.0 and older, \"migrateSession\" will be used - a new session is created and all the attributes of the old session are copied to the new one.
-   For Servlets 3.1 and newer, \"changeSessionId\" will be used - HttpServletRequest\#changeSessionId() method provided by the Servlet Container will be used. All the attributes of the existing session are preserved, but Session ID is changed.

There are two additional settings, which can be used:

-   \"newSession\" - New session is created, but all the attributes of the old session are not preserved. Protects against session fixation and may be useful, when session data are no longer needed after login.
-   \"none\" - Do not create new session nor change session id. Leaves application vulnerable to session fixation. Should be avoided if possible.

To configure session fixation protection in XML, you can use session-fixation-protection attribute of the \<session-management\> tag:

```xml
<session-management session-fixation-protection="migrateSession">
  ...      
</session-management>
```

or in Java configuration:

```java
@Configuration
@EnableWebSecurity
public class SecurityConfig extends WebSecurityConfigurerAdapter {

    @Override
    protected void configure(HttpSecurity httpSecurity) throws Exception {
        httpSecurity.sessionManagement().sessionFixation().newSession();
    }

    …
}
```

Conclusion
----------

There are various ways to mitigate session fixation and other session-related vulnerabilities:

1.  If it is not necessary, do not create sessions for unauthenticated users. In some cases, it is required (such as keeping track of user\'s shopping cart even when not logged in) and it cannot be avoided.
2.  Always change Session ID when a user authenticates.
3.  Avoid sending Session ID as an URL parameter.
4.  Support only SIDs generated by the server, not user provided ones.
5.  When using cookies for SIDs, make sure they are HttpOnly and Secured.
6.  Use HTTPS.
7.  Make sure sessions have timeouts set and they are not too long.
8.  Make sure there is a way for the user to terminate the session manually (logout).
9.  You may consider checking whether all the requests for the same session are coming from the same IP/User-Agent.
