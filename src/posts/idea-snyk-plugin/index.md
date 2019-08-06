---
title: 'Detecting vulnerable dependencies in IntelliJ IDEA'
date: "2019-06-07T22:12:03.284Z"
tags: ["Security", "IDEA"]
path: '/idea-snyk-plugin'
featuredImage: './idea-snyk-plugin.jpg'
disqusArticleIdentifier: '99027 http://vojtechruzicka.com/?p=99027'
excerpt: 'How to detect third party libraries with security vulnerabilities directly in IntelliJ IDEA.'
---

![IDEA Snyk Plugin](idea-snyk-plugin.jpg)

# Dependencies with security vulnerabilities
Making sure your application is as secure as possible is very important. Having security vulnerabilities can lead to serious consequences if they are exploited. You should always make sure your own code is as safe as possible.

However, the core code of your application, which you write yourself, is only the tip of an iceberg. These days, the vast majority of the deployed code is not what you write yourself, but rather various third-party libraries and frameworks. Even the simplest web applications usually have hundreds of thousands of lines of code, which are brought with third-party dependencies.

It is very hard to make big and complex frameworks secure. Not only are they very complicated, but they also depend on numerous dependencies of their own. It is not a question IF your libraries contain security vulnerabilities, but rather WHEN they are discovered. Once discovered, they are usually fixed quickly, and the next version is released.

The problematic part is that applications are not that fast with adopting new versions with security fixes. It can take months or even years to upgrade. First of all, you have to know there is a new version. Then you have to know whether to upgrade or not. Were there important security fixes or just some minor bugfixes? Is the fix important enough to justify upgrading cost, especially if there were changes breaking the backward compatibility?

## Detecting vulnerabilities automatically
In the past, detecting vulnerable dependencies was difficult. There were public databases of security vulnerabilities, but you had to check them manually. Needless to say that only a minority of developers bothered to check. It was just too much trouble.

Fortunately, later, automatic tools became available, which could scan your dependencies and cross-check with vulnerability databases. One example can be [OWASP Dependency Check](https://www.vojtechruzicka.com/detecting-dependencies-known-vulnerabilities/). Later, even more powerful services appeared, most notably Snyk.


<div class="linked-article"><h4 class="front-post-title" style="margin-bottom: 0.375rem;"><a href="/snyk-detecting-dependencies-with-known-vulnerabilities/" style="box-shadow: none;">Snyk – Detecting dependencies with known vulnerabilities</a></h4><small class="front-post-info"><span class="front-post-info-date">22 November, 2017</span><div class="post-tags"><ul><li><a href="/tags/security/">#Security</a></li></ul></div></small><div><a class="front-post-image" href="/snyk-detecting-dependencies-with-known-vulnerabilities/"><div class=" gatsby-image-wrapper" style="position: relative; overflow: hidden;"><div style="width: 100%; padding-bottom: 49.3421%;"></div><img src="data:image/jpeg;base64,/9j/2wBDABALDA4MChAODQ4SERATGCgaGBYWGDEjJR0oOjM9PDkzODdASFxOQERXRTc4UG1RV19iZ2hnPk1xeXBkeFxlZ2P/2wBDARESEhgVGC8aGi9jQjhCY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2P/wgARCAAKABQDASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAABAAD/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAH/2gAMAwEAAhADEAAAAWa6pokuj//EABoQAAICAwAAAAAAAAAAAAAAAAECAxMAEBT/2gAIAQEAAQUCjd+i5wFkfEAv1//EABQRAQAAAAAAAAAAAAAAAAAAABD/2gAIAQMBAT8BP//EABQRAQAAAAAAAAAAAAAAAAAAABD/2gAIAQIBAT8BP//EAB0QAAEDBQEAAAAAAAAAAAAAAAABAhEDECEiMUH/2gAIAQEABj8CheJJK0jZvo/F/wD/xAAaEAEBAAMBAQAAAAAAAAAAAAABEQAhQRBx/9oACAEBAAE/IWJrgkID73JGoi47wSgsNz3/2gAMAwEAAgADAAAAEEPP/8QAFBEBAAAAAAAAAAAAAAAAAAAAEP/aAAgBAwEBPxA//8QAFREBAQAAAAAAAAAAAAAAAAAAARD/2gAIAQIBAT8QZ//EABwQAQEAAgIDAAAAAAAAAAAAAAERACEQMUGh0f/aAAgBAQABPxANtUPLXpxdOQixqEKb79YkzYNgLpIdfMCrekLu3EGUGbOP/9k=" alt="" style="position: absolute; top: 0px; left: 0px; width: 100%; height: 100%; object-fit: cover; object-position: center center; opacity: 0; transition-delay: 500ms;"><picture><img sizes="(max-width: 180px) 100vw, 180px" srcset="/linked/snyk/5e4a3/snyk-logo.jpg 45w,
/linked/snyk/e451c/snyk-logo.jpg 90w,
/linked/snyk/29fd0/snyk-logo.jpg 180w,
/linked/snyk/b3ebb/snyk-logo.jpg 270w,
/linked/snyk/8841e/snyk-logo.jpg 360w,
/linked/snyk/95b54/snyk-logo.jpg 540w,
/linked/snyk/51a58/snyk-logo.jpg 1520w" src="/linked/snyk/29fd0/snyk-logo.jpg" alt="" style="position: absolute; top: 0px; left: 0px; width: 100%; height: 100%; object-fit: cover; object-position: center center; opacity: 1; transition: opacity 500ms ease 0s;"></picture><noscript><picture><img sizes="(max-width: 180px) 100vw, 180px" srcset="/linked/snyk/5e4a3/snyk-logo.jpg 45w,
/linked/snyk/e451c/snyk-logo.jpg 90w,
/linked/snyk/29fd0/snyk-logo.jpg 180w,
/linked/snyk/b3ebb/snyk-logo.jpg 270w,
/linked/snyk/8841e/snyk-logo.jpg 360w,
/linked/snyk/95b54/snyk-logo.jpg 540w,
/linked/snyk/51a58/snyk-logo.jpg 1520w" src="/linked/snyk/29fd0/snyk-logo.jpg" alt="" style="position:absolute;top:0;left:0;opacity:1;width:100%;height:100%;object-fit:cover;object-position:center"/></picture></noscript></div></a><span class="front-post-excerpt">How to detect and fix security vulnerabilities in your dependencies using Snyk?</span></div></div>

It can be integrated with your Continuous Integration to break the build if critical vulnerabilities are found. What's more, it can even monitor your app, and once a new version fixing your vulnerabilities is released, it will automatically create a Pull request with the new version. How cool is that?

## Detection directly in your IDE
Having a check for security vulnerabilities integrated as a part of your CI process is important and necessary, but it comes a bit late in the development pipeline.

It would be much better if you could check locally when adding a new dependency whether there are no security issues. This way, you could discover potential problems much earlier in the process. Snyk offers a CLI tool, which you can use, but for regular checking it can be too cumbersome, and you have to remember to run it every time.

Fortunately, Snyk recently released also IntelliJ IDEA plugin, which monitors your dependencies and can show you security vulnerabilities directly in your IDE.

## Snyk plugin
<div class="msg-info">
The plugin is available for free for both the Community and Ultimate editions.
</div>

The [Snyk Plugin](https://plugins.jetbrains.com/plugin/10972-snyk-vulnerability-scanning) is available directly from the plugin marketplace. You can access it using `Settings → Plugins`.

![IDEA Plugin marketplace](./snyk-marketplace.png)

Once you install it and restart your IDE, a new tab is available:

![Snyk Tab](./snyk-tab.png)

It shows all the dependencies with known security vulnerabilities, which your app uses. You can expand individual dependencies to explore the transitive dependencies, which introduce the vulnerability.

![Snyk Tab Expanded](./snyk-tab-expanded.png)

If there is a new version, which fixes the dependency, Snyk suggests a version to upgrade to, which is very useful. You can click the name of a dependency, and Snyk automatically navigates you to the place, where it is declared in you `pom.xml`.

Finally, you can click the `details` link of each vulnerability, which navigates you to a web page in the Snyk vulnerability database with a detailed description of this particular vulnerability. You can then evaluate yourself how critical it is, what can you do to mitigate it a whether it applies in your case or not.

![Snyk Vulnerability Database Info](./snyk-vulnerability-info.png)

## Maven only
Unfortunately, currently (as of 6/2019), the plugin supports only Maven and not Gradle. If you are using Gradle, you can stick With CLI or CI check, which does support it. However, according to Snyk, Gradle support is planned. Hopefully, it will be available soon. 

## UPDATE: Eclipse support
Since 7/2019 there is an IDE plugin not only for IntelliJ IDEA, but [also for Eclipse](https://snyk.io/blog/fix-open-source-vulnerabilities-directly-from-your-eclipse-ide/).

## Conclusion
Snyk IDEA plugin offers a simple, yet powerful way to detect security vulnerabilities in your dependencies directly in your IDE. This way, you can discover vulnerable libraries early in the development process without the need to wait for Continuous Integration check. This, however, does not mean you should depend only on the plugin. You should still have CI check in place as a safeguard and continuous monitoring, which Snyk offers, to make sure you discover new vulnerabilities and their fixes once they are available.