---
title: 'How to protect your HTTP Cookies'
date: "2018-01-18T22:12:03.284Z"
tags: ['HTTP']
path: '/protect-http-cookies'
featuredImage: './protect-cookies.jpg'
disqusArticleIdentifier: '1444 http://vojtechruzicka.com/?p=1444'
excerpt: 'Protecting your sensitive cookies is very important as stolen session cookie means an attacker can take your identity and wreak havoc.'
---
![protect cookies](./protect-cookies.jpg)

Protecting your sensitive cookies is very important as stolen session cookie means an attacker can take your identity and wreak havoc.

What are Cookies
----------------

HTTP protocol itself is stateless. That means when a server receives two requests it cannot tell whether they originate from the same user. There is no conversation context preserved between requests. While it has many advantages such as good scalability, often you want to identify a user you already interacted with and keep state. For example, a user should usually be able to log-in and after that, all their requests should be considered as those of an authenticated user. In other words, you want to recognize such user when they send their next request.

But how can you achieve this? One way is using Cookies. Whenever a server receives a request from a client, it can provide a special HTTP response header called *Set-Cookie*. It can look something like this:

```json
Set-Cookie: [cookie_name]=[cookie_value]
```

What it basically says is: Here is a little piece of information (cookies are key-value pairs). I want you to remember it. And I want you to send it back to me with your future requests. So I know it is you. The client's browser receives this information and stores the cookie on the client's machine. Whenever that client makes a request to the server, the browser checks all the cookies, selects these which are relevant to the current server and sends them as HTTP headers.

```json
Cookie:=[cookie_name]=[cookie_value]; [other_cookie_name]=[other_cookie_value]
```

Securing the cookies
--------------------

Okay, so cookies can be used to store information on the client and then sent to a server with each request. Information such as the unique identifier of a logged in user. And it is sent in the form of HTTP header. Now imagine someone gets their dirty hands on your precious cookie. Since your session cookie represents your identity, the attacker can use it to impersonate you. To perform restricted actions as if they were you. Transfer money, steal sensitive information, delete important data -- this kind of stuff. This means you need to make sure your cookies are as protected as possible. So what are the ways you can mitigate the risk of someone stealing your cookies?

Preventing Cross Site Scripting with HttpOnly attribute
-------------------------------------------------------

Cookies can be directly accessed from javascript. It is very easy:

```javascript
var cookies = document.cookie;
```

Not only it is easy to steal cookies this way, but the attacker can tamper with existing cookies or create new ones:

```javascript
document.cookie = "my_precious_cookie=some_harmful_value";
```

You may think you are safe because you are in control of what javascript gets executed on your pages. Wrong. If your application contains Cross-Site Scripting vulnerability, it is easy for an attacker to inject any malicious javascript to be executed on the victim's machines. Once they do that, it is easy to steal your cookies and send them to the attacker.

Because of such situations, it would be really handy to disable access to your cookies from javascript. Fortunately, you can do it quite easily. When the server sets cookies, you can provide some additional attributes. One of them is [HttpOnly](https://www.owasp.org/index.php/HttpOnly), which says that the cookie will not be accessible in the client\'s browser from javascript:

```json
Set-Cookie: [cookie_name]=[cookie_value]; HttpOnly
```

Protect Cookies during transport with Secure attribute
------------------------------------------------------

Alright, we've mitigated the risk that the attacker will steal or change our cookies from javascript. But there are more ways to steal our cookies. One of them is in-transit. That means someone can read the request on its way to the server and they will be able to see the cookie as it is just an HTTP header. How do we prevent this?

You should use HTTPS of course, so your data is secure even in-transit. This way man-in-the-middle cannot read your cookies. Unless... Well, there are ways a client can access your HTTPS site using regular HTTP. Maybe they manually type http://. Maybe you have mixed content. Maybe you do use HTTP Strict Transport Security to enforce HTTPS, but the client's browser does not support it yet. Either way, you risk your precious cookies transmitted over an unsecured channel.

Fortunately, there is a way to prevent this. Similar to *HttpOnly*, there is another attribute that instructs the browser that it should only send the cookie over a secured channel.

```json
Set-Cookie: [cookie_name]=[cookie_value]; Secure
```

Prevent Cross-Site Request Forgery with SameSite attribute
----------------------------------------------------------

When a browser reads a page, there are usually some resources from other domains, which are loaded as well such as images, scripts or social media buttons. The default browser behavior is that it sends cookies which browser has for the external site with the request. Since cookies are sent with cross-domain requests, this can be exploited to trick a previously authenticated user into performing some restricted action on the external site. This type of attack is called [Cross-Site Request Forgery](https://www.owasp.org/index.php/Cross-Site_Request_Forgery_(CSRF)) (or CSRF).

Fortunately, when setting a cookie, you can specify that browser should send it to you only if the request is originating from the same origin (is not cross-domain). This cookie parameter is called *SameSite*. It has two possible values:

1.  strict
2.  lax

*Strict* option prevents sending cookies from different origin altogether. While this is safe, it can be really painful for the users. For example, if you click a link to a social media or GitHub, you would be redirected there without being logged in and you would need to authenticate again.

The second option, *lax*, is more forgiving. It will allow sending the cookie cross-origin as long as the HTTP method is GET only and you are navigating to the root (top level).

While this is really good protection against some sorts of CSRF (still does not help if the session ID is, for example, transferred a URL parameter), it is not yet widely supported by the browsers (as of 1/2018). You can check current support on [Can I Use](https://caniuse.com/#search=samesite).

![protect-cookies-2](./protect-cookies-2.jpg)

Minimize Cookie Availability
----------------------------

### Don't Share cookies with subdomains

By default, when not specified otherwise, a cookie is only sent to a sub-domain, which set the cookie. That means that if you set a cookie from *account.example.com* it will not be sent to *forum.example.com*. You can, however, specify the *Domain* attribute of the cookie.

```json
Set-Cookie: [cookie_name]=[cookie_value]; Domain=account.example.com
```

If you specify just a root domain (*example.com*) and not the subdomain (*account.example.com*), the cookie will be sent to ANY subdomain of the root domain. Don't do this as you want to minimize the number of places your cookies are sent to.

### Don't share cookies with other applications

There is another parameter which can be used to define the scope of the cookie, similar to *Domain*. It is called *Path*. It is used to define resources under the domain, to which the cookie will be sent. For example, path \'*/\'* means everything, */blog* means every resource starting with \'*blog\'*, eg:

```json
http://www.example.com/blog/2017/
```

By default, if unspecified, it is set to the path of the resource which set the cookie. Be careful not to set manually a value which is too permissive. When you set \'/\' that means that all the resources on the given domain will receive the cookie. This can be dangerous when you have multiple applications sitting on the same domain which are different only in their path:

```json
http://www.example.com/first-app
http://www.example.com/second-app
```

In this case, the apps would be sharing cookies. That means that if one of them is vulnerable it can make the other one vulnerable as well as you could steal the other app's cookies. For example using Cross Site Scripting.

### Limit cookie lifespan

In the same way you want to reduce the cookie's scope to minimize the number of places where it can be stolen, you want to minimize the cookie's lifespan to decrease the time when the cookie is vulnerable.

Cookie lifespan is, if not specified, just for one session. That means until the user closes their browser. Well, at least in theory. These days browsers usually have some mechanisms for session restoration or continue to run in the background so you [cannot depend](http://blog.petersondave.com/cookies/Session-Cookies-in-Chrome-Firefox-and-Sitecore/) on session cookies being immediately wiped.

You can specify cookie expiration or lifespan using *Max-Age* and *Expires* [attributes.](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie)

For sensitive cookies use the shortest sufficient lifespan possible. Using these parameters you can set cookie lifespan to infinity, which is obviously not a good idea. It is also worth mentioning that to further limit the lifespan of your session cookies, you should limit session duration server side and provide your users with a means of manually terminating their session (logout).

Conclusion
----------

It is extremely important to protect your sensitive cookies, such as these containing session identifiers. If such a cookie is lost, an attacker can assume your identity and do everything you have permissions to do. You should protect your cookies against Cross Site Scripting with HttpOnly attribute so they are not available from javascript.

Cookies are also vulnerable during transport, so you should apply HTTPS and make sure your sensitive cookies are not transmitted using plain HTTP by specifying *Secured* cookie attribute.

To defend against Cros Site Request Forgery, you should add the *SameSite* attribute with either *strict* or *lax* value. But be aware of currently limited browser support.

The limit attack vectors you should keep the availability of your cookie at the minimum. That means limiting the scope (*Domain* and *Path*) and lifespan (*Expires* and *Max-Age*).