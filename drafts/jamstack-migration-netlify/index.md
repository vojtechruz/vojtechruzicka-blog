---
title: 'Migration to JAM stack and Netlify from WordPress'
date: "2018-05-21T22:12:03.284Z"
tags: ['Blogging']
path: '/jamstack-migration-netlify'
featuredImage: './jamstack-migration-netlify.jpg'
disqusArticleIdentifier: '99003 http://vojtechruzicka.com/?p=99003'
excerpt: 'How and Why I migrated from WordPress to static JAM Stack site deployed on Netlify.'
---

![Migration to JAM Stack - Netlify](./jamstack-migration-netlify.jpg)

## JAM Stack Migration - Part 2
Recently I managed to finally get rid of WordPress and migrate my blog to JAM Stack, built with a static site generator called Gatsby JS. I described what JAM Stack is, how I migrated and how great Gatsby is in my previous post - [Migration to GatsbyJS and JAM stack from WordPress](https://www.vojtechruzicka.com/gatsby-migration/). 

This second post describes build and deployment process and how much it is better than the original WordPress setup or traditional GitHub Pages.

## GitHub Pages?
Leaving WordPress saved me some expenses, but the next question was where to deploy instead. The first obvious option was [GitHub Pages](https://pages.github.com/). It is a free service provided by Github, which nicely integrates with your GitHub repository. If you are using Jekyll as a static site generator, it offers some nice integration out of the box. 

While GitHub pages are good and will do the job, there is one service, which is in my opinion much better and offers much more while keeping the simplicity. It's called Netlify. [This blog post](https://www.netlify.com/github-pages-vs-netlify/) provides a nice comparison of GitHub Pages and Netlify. 

## Netlify to the rescue
Alright, Netlify has many nice features, let's dig a bit deeper.

### Simple Setup - Continous Deployment
What I love about Netlify is its simplicity. It can take under a minute to set up continuous deployment from your git repository.

1. You create a Netlify account by authenticating using you GitHub, GitLab or BitBucket accounts.

___

2. You select which git provider (GitHub, GitLab, BitBucket) you want to use.

 ![Select your Git Provider](./netlify-deploy-1.png)
___

3. Then a repository you want to deploy to Netlify.

 ![Select your Git Repository](./netlify-deploy-2.png)
___

4. You select a build command (eg. `gatsby build`) and the default branch to build from. Netlify is usually able to prefill this for you by detecting your static code generator from your repo's code.

 ![Select your deployment options](./netlify-deploy-3.png)
___

That's all the setup needed to get up and running. Now Netlify builds your code and publishes it. In some cases it is all you need. From now on, every time you push a new changes to the branch configured above, Netlify will build a new version of your pages using the command provided. Then deploys this new version and invalidates all the caches. It still keeps the older versions so you can quickly switch to them when anything goes wrong.

If you have a custom domain, you can easily use your own domain name instead of `yoursite.netlify.com`. After this you can also add HTTPS with just a one click (see below).

### Content Delivery Network
One of weaknesess of my previous WordPress setup was performance. The problem was two fold. First - having a PHP backend generating and serving my content is way slower than just serving a static HTML page. Static site generators such as GatsbyJs or Jekyll solve this issue. The second problem still remains. If you have just one central server distributing your static pages, the latency decreases with the distance of your clients from the central server. Having someone connecting from the other end of the world will cause a serious performance hit. What's more, you have a single point of failure, if your central server goes down, your content is not served.

Content Delivery Network (CDN) solves this issue. CND offest many nodes distributed in various geographic locations. When you are requesting a resource from a CDN, you'll be served from the node which is geographically closest. Moreover, if one of the nodes goes down, it the trafiic will be redirected to the next one. Since your static site is not changing until the next build, it is easy to scale and distribute your whole site over a CDN. And Netlify does this out of the box, utilizing [multiple inteligent ultra fast CDNs](https://www.netlify.com/blog/2016/04/15/make-your-site-faster-with-netlifys-intelligent-cdn/) based on multiple providers. That means a huge performance and reliability gain over the original WordPress solution. What's more Netlify's logic layer on top of the CDN allows instant cache invalidations, rollbacks or custom redirect, rewrite or proxy rules.

### One click HTTPS
Having a secure HTTPS connection enabled on a site like a blog, where no sensitive data is transfer may seem a bit pointless. However, there are several good reasons to use HTTPS anyway. 

First of all, sites using HTTPS get a [ranking boost](https://webmasters.googleblog.com/2014/08/https-as-ranking-signal.html) in search results on Google. That means your site will be displayed above the similiar sites not using HTTPS, which can bring a lot of traffic. Moreover, Google Chrome is going to show "Not Secure" on all the pages not using HTTPS [soon enough](https://blog.chromium.org/2018/05/evolving-chromes-security-indicators.html), which can scare off your visitors. When running over HTTP you also risk public networks injecting content and advertisments into your pages, which can ruin user experience and lead to losing of users.

If you want to use [HTTP/2](https://developers.google.com/web/fundamentals/performance/http2/) and enjoy its benefits such as increased performace, you need to migrate to HTTPS anyway.

The bottom line is, you seriously should consider switching to HTTPS if you are not using it already. And with Netlify, this is super simple - just one click away. And it's free - Netlify utilizes [Let's Encrypt](https://letsencrypt.org/) - a free, automated, and open Certificate Authority. 

### Deploy preview per branch
By default Netlify deploys only changes in one configured branch. However, you can configure it to extend this behavior to multiple branches or even all of them. In such case, whenever you make changes in such branch, netlify will build and deploy your pages, but not on your main domain. Instead, it will create a custom domain just for your branch, where you can check how your site works before going public. Or share it with other to gather feedback on your new version, perform testing and so on. It is very useful as you can test your site in production-like environment before actually publishing it. No more "It works on my machine" excuses.

![Branch Deploys](./netlify-branch-deploys.png)

### A/B testing and private betas
[Split Testing](https://www.netlify.com/docs/split-testing) is one of the cool features, which are so simple to set up on Netlify but hard otherwise. You can configure multiple branches in your repository and set that certain percentage of users will be redirected to builds of certain branches.

![Split Testing](./netlify-split-testing.png)

It can be very useful. You can use analytics to peform A/B testing and determine which version of your site is more effective. You roll new changes just to a fraction of your users, make sure everything is ok and only then publish the new version globally. You can even do [private betas](https://www.netlify.com/blog/2018/03/02/how-to-use-split-tests-to-give-users-access-to-private-features).

### Integration with a CMS


### And much more
Features above make Netlify such a great and powerful tool, yet easy to use. Netlify, however, offers much more. These, more advanced, features were not needed for my simple use case of personal blog, but they can be valuable in other cases.

Netlify provides support for effortles form submission integration without the need to provide your own backend. Another cool feature is identity management. Netlify provides you easy integration of processes such as registration, login or account recovery. And even enable authenticated user to call third-party services.

You can define redirects, which can be useful when migrating from an existing solution with different content structure as I did. You are able to even define custom HTTP headers to be returned. When using single page applications, you can turn on pre rendering of your content for search engine crawlers. Your app then looks just like orinary HTML site instead of SPA, which can be beneficial for SEO.

The last but not least is a poweful integration of AWS Lambda functions. Everything is managed through Netlify so you are shielded from coordinating deployment of your app and server side functions. No need to worry about service discovery or API gateway configuration. How cool is that.

## Conclusion
Migrating to a static site generator such as GatsbyJs is a first (and very important) step. Then, however, you need to figure out how and where to build and deploy your site. Netlify is very easy to use, yet powerful solution offering great performance and user experience. And for most scenarios (such as my blog) it's completely free.