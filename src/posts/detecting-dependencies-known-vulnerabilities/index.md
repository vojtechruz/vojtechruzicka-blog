---
title: 'Detecting dependencies with known vulnerabilities   '
date: "2017-03-23T22:12:03.284Z"
dateModified: "2018-12-16"
tags: ['Java', 'Security']
path: '/detecting-dependencies-known-vulnerabilities'
featuredImage: './dc-large.png'
disqusArticleIdentifier: '808 http://vojtechruzicka.com/?p=808'
excerpt: 'How to automatically detect vulnerable third-party libraries as a part of your build process, integrate it with CI and track vulnerable dependencies over time?'
--- 
![detecting dependencies with known vulnerabilities](./dc-large.png)

How to automatically detect vulnerable third-party libraries as a part of your build process, integrate it with CI and track vulnerable dependencies over time?

Vulnerable Dependencies
-----------------------

Making sure your application contains security vulnerabilities is not only about securing your own code. Your application likely contains a lot of other libraries - third-party dependencies. They introduce a lot of security vulnerabilities as well, many of which you are not even aware. Once they are discovered, they are usually fixed in a new version. When you are using an old version of a library, without recent security fixes, you are at risk. When an attacker identifies you are using an old version of particular dependency, they can easily exploit that. There are even public databases of security vulnerabilities of third-party libraries, so it is quite easy to determine which ones to exploit.

OWASP, Open Web Application Security Project, periodically releases [Top Ten list of Web Application Security Vulnerabilities](https://www.vojtechruzicka.com/owasp-top-ten-2017/). \"[Using Components with Known Vulnerabilities](https://www.owasp.org/index.php/Top_10_2013-A9-Using_Components_with_Known_Vulnerabilities)\" is one of the items on their latest list:

> Components, such as libraries, frameworks, and other software modules, almost always run with full privileges. If a vulnerable component is exploited, such an attack can facilitate serious data loss or server takeover. Applications using components with known vulnerabilities may undermine application defenses and enable a range of possible attacks and impacts.

According to [The State of Open Source Security in Commercial Applications](https://info.blackducksoftware.com/rs/872-OLS-526/images/OSSAReportFINAL.pdf) study, these vulnerabilities are really widespread - on average:

-   An application has 105 open source dependencies
-   Which is 2x more than the authors were expecting
-   67% of the applications contain third-party dependency security vulnerabilities
-   22.5 vulnerability per application
-   Each of which was present there on average for 1894 days

National Vulnerability Database
-------------------------------

It is clear that it is vital to have up-to-date third-party dependencies to minimize security risk. Ideally, you would want to keep your dependencies always up to date. It is unfortunately not always possible. You may encounter a situation, where it is not so easy to update one of your dependencies. Maybe the API changed and the upgrade would involve too much refactoring. Or one of your dependencies may rely on an older version of the dependency you would want to upgrade. Or your dependencies would be incompatible in some other way.

You usually need to weigh the effort and risk of upgrading and the benefits which it provides, such as increased security. It would be nice to know exactly which vulnerabilities you current dependencies contain and how severe they are, right? Turns out there are whole databases of component security vulnerabilities such as the [National Vulnerability Database](https://nvd.nist.gov/).

Example of one such vulnerability item is [CVE-2016-9878](https://web.nvd.nist.gov/view/vuln/detail?vulnId=CVE-2016-9878).

It is, however, not realistic to check manually all your dependencies (and as we already know, an average app has 105 of them), not to mention doing this frequently. There has to be a better way.

OWASP Dependency Check
----------------------

Good news is that there is a way to check your application against the National Vulnerability Database automatically. There is an OWASP project Dependency Check, which provides a set of tools just for that. Such as - Maven plugin, Jenkins plugin, SonarQube plugin and more.

### Build

Dependency check provides integration with several common build tools - [Maven Plugin](http://jeremylong.github.io/DependencyCheck/dependency-check-maven/index.html), [Gradle plugin](http://jeremylong.github.io/DependencyCheck/dependency-check-gradle/index.html) or [Ant task](http://jeremylong.github.io/DependencyCheck/dependency-check-ant/index.html). Alternatively, there is also [Command Line Tool](http://jeremylong.github.io/DependencyCheck/dependency-check-cli/index.html). Common usage scenario would be introducing Maven Dependency Check plugin as a part of your maven build:

```xml
<build>
    <plugins>
        <plugin>
            <groupId>org.owasp</groupId>
            <artifactId>dependency-check-maven</artifactId>
            <version>1.4.5</version>
            <executions>
                <execution>
                    <goals>
                        <goal>check</goal>
                    </goals>
                </execution>
            </executions>
        </plugin>
    </plugins>
</build>
```

Then you can add configuration for the build to fail when the project contains a vulnerability of a certain severity or higher. This uses CVSS -Common Vulnerability Scoring System.

```xml
<configuration>
    <failBuildOnCVSS>6</failBuildOnCVSS>
</configuration>
```

You can also integrate Dependency Check report with the reports of Maven Site\'s plugin:

```xml
<reporting>
    <plugins>
        <plugin>
            <groupId>org.owasp</groupId>
            <artifactId>dependency-check-maven</artifactId>
            <version>1.4.5</version>
            <reportSets>
                <reportSet>
                    <reports>
                        <report>aggregate</report>
                    </reports>
                </reportSet>
            </reportSets>
        </plugin>
    </plugins>
</reporting>
```

An example application using Dependency Check Maven plugin can be found [here](https://github.com/vojtechruz/dependency-check-example). [Here](http://jeremylong.github.io/DependencyCheck/general/SampleReport.html) is the example of a report generated.

### Jenkins Integration

Dependency Check also provides a [plugin](https://wiki.jenkins-ci.org/display/JENKINS/OWASP+Dependency-Check+Plugin) for Jenkins Continuous Integration.

This way you can integrate Dependency check as a part of your Jenkins Job and check generated reports after it is run. You can, for example, schedule nightly check of your vulnerabilities to make sure your application stays secure.

![dependency-check-jenkins](categories.png)

### Sonar Integration

To have a constant overview of your current vulnerable dependencies and their changes over time, you can use [Dependency Check SonarQube plugin](https://github.com/stevespringett/dependency-check-sonar-plugin), which adds a widget to the Sonar dashboard.

![dependency-check-sonar](dashboard-widget.png)

UPDATE: Alternatives
------------
These days OWASP Dependency Check is not the only project focusing on third-party security dependencies. One of the very powerful alternatives is Snyk. In many ways, it is similar to Dependency Check, but now offers more features, better integration and is very actively developed. You can read more in this article:

<div class="linked-post">
<h4 class="front-post-title" style="margin-bottom: 0.3625rem;"><a href="/snyk-detecting-dependencies-with-known-vulnerabilities/" style="box-shadow: none;">Snyk – Detecting dependencies with known vulnerabilities</a></h4>
<small class="front-post-info"><span class="front-post-info-date">22 November, 2017</span><div class="post-tags"><ul><li><a href="/tags/security">#Security</a></li></ul></div></small>
<div><a class="front-post-image" href="/snyk-detecting-dependencies-with-known-vulnerabilities/"><div class=" gatsby-image-wrapper" style="position: relative; overflow: hidden;"><div style="width: 100%; padding-bottom: 49.3421%;"></div><img alt="" src="data:image/jpeg;base64,/9j/2wBDABALDA4MChAODQ4SERATGCgaGBYWGDEjJR0oOjM9PDkzODdASFxOQERXRTc4UG1RV19iZ2hnPk1xeXBkeFxlZ2P/2wBDARESEhgVGC8aGi9jQjhCY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2P/wgARCAAKABQDASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAABAAD/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAH/2gAMAwEAAhADEAAAAWa6pokuj//EABoQAAICAwAAAAAAAAAAAAAAAAECAxMAEBT/2gAIAQEAAQUCjd+i5wFkfEAv1//EABQRAQAAAAAAAAAAAAAAAAAAABD/2gAIAQMBAT8BP//EABQRAQAAAAAAAAAAAAAAAAAAABD/2gAIAQIBAT8BP//EAB0QAAEDBQEAAAAAAAAAAAAAAAABAhEDECEiMUH/2gAIAQEABj8CheJJK0jZvo/F/wD/xAAaEAEBAAMBAQAAAAAAAAAAAAABEQAhQRBx/9oACAEBAAE/IWJrgkID73JGoi47wSgsNz3/2gAMAwEAAgADAAAAEEPP/8QAFBEBAAAAAAAAAAAAAAAAAAAAEP/aAAgBAwEBPxA//8QAFREBAQAAAAAAAAAAAAAAAAAAARD/2gAIAQIBAT8QZ//EABwQAQEAAgIDAAAAAAAAAAAAAAERACEQMUGh0f/aAAgBAQABPxANtUPLXpxdOQixqEKb79YkzYNgLpIdfMCrekLu3EGUGbOP/9k=" style="position: absolute; top: 0px; left: 0px; width: 100%; height: 100%; object-fit: cover; object-position: center center; opacity: 0; transition: opacity 0.5s ease 0.5s;"><picture><source srcset="/static/snyk-logo-9f30fcce36e7c572d7a65887287e0a84-680c3.jpg 45w,
/static/snyk-logo-9f30fcce36e7c572d7a65887287e0a84-0b965.jpg 90w,
/static/snyk-logo-9f30fcce36e7c572d7a65887287e0a84-cc2e6.jpg 180w,
/static/snyk-logo-9f30fcce36e7c572d7a65887287e0a84-feef1.jpg 270w,
/static/snyk-logo-9f30fcce36e7c572d7a65887287e0a84-1ee31.jpg 360w,
/static/snyk-logo-9f30fcce36e7c572d7a65887287e0a84-e8e8f.jpg 540w,
/static/snyk-logo-9f30fcce36e7c572d7a65887287e0a84-e1313.jpg 1520w" sizes="(max-width: 180px) 100vw, 180px"><img alt="" src="/static/snyk-logo-9f30fcce36e7c572d7a65887287e0a84-cc2e6.jpg" style="position: absolute; top: 0px; left: 0px; width: 100%; height: 100%; object-fit: cover; object-position: center center; opacity: 1; transition: opacity 0.5s ease 0s;"></picture><noscript><picture><source srcSet="/static/snyk-logo-9f30fcce36e7c572d7a65887287e0a84-680c3.jpg 45w,
/static/snyk-logo-9f30fcce36e7c572d7a65887287e0a84-0b965.jpg 90w,
/static/snyk-logo-9f30fcce36e7c572d7a65887287e0a84-cc2e6.jpg 180w,
/static/snyk-logo-9f30fcce36e7c572d7a65887287e0a84-feef1.jpg 270w,
/static/snyk-logo-9f30fcce36e7c572d7a65887287e0a84-1ee31.jpg 360w,
/static/snyk-logo-9f30fcce36e7c572d7a65887287e0a84-e8e8f.jpg 540w,
/static/snyk-logo-9f30fcce36e7c572d7a65887287e0a84-e1313.jpg 1520w" sizes="(max-width: 180px) 100vw, 180px" /><img src="/static/snyk-logo-9f30fcce36e7c572d7a65887287e0a84-cc2e6.jpg" alt="" style="position:absolute;top:0;left:0;transition:opacity 0.5s;transition-delay:0.5s;opacity:1;width:100%;height:100%;object-fit:cover;object-position:center"/></picture></noscript></div></a><span class="front-post-excerpt">How to detect and fix security vulnerabilities in your dependencies using Snyk?</span></div>
</div>

Conclusion
----------

It is important to make sure your application does not contain high-risk security vulnerabilities caused by third-party libraries. Dependency check can help you to achieve that automatically as a part of your build or even Continuous Integration process.
