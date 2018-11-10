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



-------
by codecentric: https://blog.codecentric.de/en/
git repo: https://github.com/codecentric/spring-boot-admin
Docs: http://codecentric.github.io/spring-boot-admin/current/

```xml
<dependency>
    <groupId>de.codecentric</groupId>
    <artifactId>spring-boot-admin-starter-server</artifactId>
    <version>2.1.0</version>
</dependency>
```

```xml
<dependency>
    <groupId>de.codecentric</groupId>
    <artifactId>spring-boot-admin-starter-client</artifactId>
    <version>2.1.0</version>
</dependency>
```

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

Links:
https://www.baeldung.com/spring-boot-admin