---
title: 'Migration to GatsbyJS and JAM stack from WordPress'
date: ""
tags: ['Blogging']
path: '/gatsby-migration'
featuredImage: './'
disqusArticleIdentifier: 'gatsby-migration'
excerpt: 'How and Why I migrated from WordPress to static JAM Stack static site build with Gatsby JS.'
---

![jam stack](./)

How and Why I migrated from WordPress to static JAM Stack static site build with Gatsby JS.

#Before
When I started my blog back in 2016, I wanted to focus as much as possible on creating content rather than
creating the blog infrastructure. Of course, there was a siren's call to build everything from scratch or spend weeks
researching all the possible platforms. It would be no doubt a lot of fun. But I resisted as I wanted to start as soon as possible. 
Because back then, I wanted to start my blog for a few years already and I wanted to reduce the barrier of entry as much as possible.
I knew the most critical part is to build a habit of writing regularly and then I can polish my blog later.

So WordPress was obvious choice for me because it is widespread, with a lot of resources and plugins available. And it worked well. More or less. There were issues though. Most notable one was performance. WordPress is sluggish. Especially once you add some plugins.
The results of a [Lighthouse audit](https://www.vojtechruzicka.com/chrome-audit-lighthouse/) were disappointing:

TODO lighthouse workpress image

Especially the performace. With such long page load times, many users just leave before the page fully loads. Especially when on mobile and low quality connections. Another issue is security. With majority of web powered by WordPress, it is target of automated attacks all the time. That means constant fear of losing your precious content. And it's internal database storing all the content was pretty much black box for me. And of course, there const involved. As I din't want to manage my installation, keep it updated and in good shape, I paid for hosted solution. Last but not least, Wordpress is build with PHP, which I am not familar with and it is something I am not eager to learn. That means that any customizations or tweaks are out of question for me.

##JAM Stack
Long story short, I decided to get rid of my WordPress and replace it with much more lightweight solution. There was a brief moment where I considered using Medium instead, but I decided I value control of my own content more. After listening to a very inspiring lightning talk by [Ladislav Prskavec](https://twitter.com/abtris/) about JAM Stack, I decided its time to give it a try. 

TODO
    what is it
    why is it useful
    security
    speed
    CDN
    SEO - google favors speed

##GatsbyJS
Alright, JAM Stack is a way to go, no doubt about that. Which of the static site generator to use though? A good place to start is site called [StaticGen](https://www.staticgen.com/), which contains a nice list of many Static Site Generators. You can filter by language and templating used. And sort by popularity. That's a good way to determine what generators are currently widely used, which is important because it determines community site, resources and plugins available. Currently there is 214 generators and the number is constantly growing. So which one should I choose?

TODO
    What is it
    REact
    PWA
    Responsive images
    Graphql
    sources and transformers
        
##Pitfalls
I personally think Gatsby is great. I had a lot of fun using it so far and I've learnt a lot in the process. It offers you a lot of freedom and flexibility. However, it is not as mature as some of the competitors. This is improving quickly as it is under rapid development. However, I did encounter some bug complicating my development. On the other hand the community was really helpful and supportive. Some of the features, which I would consider standard was not yet available or sufficient such as tags and categories support, pagination or Open Graph metadata. I would also like to see AsciiDoc support instead of markdown. One of the biggest problems was probably lack of visual themes. For a long time, there was not any offical themes directory. In Feb 2018 (Gatsby Manor was launched)[https://www.gatsbyjs.org/blog/2018-02-09-announcing-gatsby-manor-themes-for-gatsbyjs/] and now it contains just SIX themes, which are all just ports of (HTML5 UP themes)[https://html5up.net/]. However, with the current development rate I am sure more and more plugins will be available out of the box in the near future.
    
##Results    
Overall I am really happy with Gatsby and the migration from WordPress. I no longer fear my WordPress will get compromised. Everything is now on github and under version control. No longer need of database backups and rolbacks are now easy in case of something goes wrong. Not to mention the possibility of developing new features safely in branches and deploying and testing them separately from the 'production' environment. And no more fees for hosted WordPress. And writing in markdown is also more convenient for me as I don't focus on html or visuals when writing but rather on the content.

My blog is now deployed on Netlify CDN, which means user will be served fast no matter what their geograhic location is. The performace gain of switching to static is huge. That means not only less visitors leaving the blog because of the slow loading times, but also better page ranking on Google as it favors faster sites. It also favors sites served over HTTPS, which my site now supports thanks to Netlify's (one click setup)[https://www.netlify.com/docs/ssl/] and (Let's Encrypt)[https://letsencrypt.org/]. Now let's go back to the Lighthouse audit score and compare new Gatsby site to the good old WordPress:

TODO image wordpress lighthouse score
TODO image new gatsby lighthouse score

Long story short - Gatsby is great. You should give it a try, especially if you are front-end developer. And keep watching its development as I am sure we can look forward to even more awesomeness in the future. 

To learn more about Gatsby Check (this curated list)[https://github.com/prayasht/awesome-gatsby] of Gatsby-related resources.