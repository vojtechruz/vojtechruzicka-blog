---
title: 'Adding search to your static JAMStack site'
date: "2018-03-25T22:12:03.284Z"
tags: ['JAMStack']
path: '/jamstack-search-algolia'
featuredImage: './search.jpg'
disqusArticleIdentifier: '99007 http://vojtechruzicka.com/?p=99007'
excerpt: 'How to add search option to your static JAMStack Site using Algolia Search and Algolia DocSearch.'
---

![Search](search.jpg)

## Searching static sites
Few months ago I finally managed to migrate my blog from WodrPress to a static site build with GatsbyJS and deployed on [Netlify](https://www.vojtechruzicka.com/jamstack-migration-netlify/).

<div class="linked-post"><h4 class="front-post-title" style="margin-bottom: 0.375rem;"><a href="/gatsby-migration/" style="box-shadow: none;">Migration to GatsbyJS and JAM stack from WordPress</a></h4><small class="front-post-info"><span class="front-post-info-date">25 March, 2018</span><div class="post-tags"><ul><li><a href="/tags/blogging"><!-- react-text: 292 -->#<!-- /react-text --><!-- react-text: 293 -->Blogging<!-- /react-text --></a></li><li><a href="/tags/jam-stack"><!-- react-text: 296 -->#<!-- /react-text --><!-- react-text: 297 -->JAMStack<!-- /react-text --></a></li></ul></div></small><div><a class="front-post-image" href="/gatsby-migration/"><div class=" gatsby-image-outer-wrapper" style="position: relative;"><div class=" gatsby-image-wrapper" style="position: relative; overflow: hidden;"><div style="width: 100%; padding-bottom: 66.6667%;"></div><img alt="" src="data:image/jpeg;base64,/9j/2wBDABALDA4MChAODQ4SERATGCgaGBYWGDEjJR0oOjM9PDkzODdASFxOQERXRTc4UG1RV19iZ2hnPk1xeXBkeFxlZ2P/2wBDARESEhgVGC8aGi9jQjhCY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2P/wgARCAANABQDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAABAD/xAAVAQEBAAAAAAAAAAAAAAAAAAACBP/aAAwDAQACEAMQAAABK1R50KdE/wD/xAAcEAEAAgEFAAAAAAAAAAAAAAACAAEEAxESExT/2gAIAQEAAQUCBPJ9cuzv59OLFNqsYVP/xAAXEQADAQAAAAAAAAAAAAAAAAAAAQIS/9oACAEDAQE/AVBhn//EABURAQEAAAAAAAAAAAAAAAAAABBx/9oACAECAQE/Aaf/xAAZEAADAQEBAAAAAAAAAAAAAAAAAREhEjH/2gAIAQEABj8CjQnlH4Yoy9M3Wf/EABsQAQACAgMAAAAAAAAAAAAAAAEAETFRIZHB/9oACAEBAAE/ISUbe2Cw9nkUyZRs5NlwIRRuBZ7mf//aAAwDAQACAAMAAAAQhD//xAAWEQEBAQAAAAAAAAAAAAAAAAAAUWH/2gAIAQMBAT8Qo2f/xAAZEQACAwEAAAAAAAAAAAAAAAAAAREhMUH/2gAIAQIBAT8QTnRS6f/EAB8QAQEAAgEEAwAAAAAAAAAAAAERACExQVFxgbHB8P/aAAgBAQABPxBWjRCxeqp8ZHuqI/j7xwRU7MQlBYUx8OsiEA4d9+MkDVVkX0Z//9k=" style="position: absolute; top: 0px; left: 0px; transition: opacity 0.5s 0.25s; width: 100%; height: 100%; object-fit: cover; object-position: center center; opacity: 0;"><img alt="" srcset="/static/jam-6d0ca080a3f6e8043ca2f2f8f7c54a8f-3c244.jpg 45w,
/static/jam-6d0ca080a3f6e8043ca2f2f8f7c54a8f-f58d6.jpg 90w,
/static/jam-6d0ca080a3f6e8043ca2f2f8f7c54a8f-f7f9a.jpg 180w,
/static/jam-6d0ca080a3f6e8043ca2f2f8f7c54a8f-870e7.jpg 270w,
/static/jam-6d0ca080a3f6e8043ca2f2f8f7c54a8f-dbc85.jpg 360w,
/static/jam-6d0ca080a3f6e8043ca2f2f8f7c54a8f-ac624.jpg 540w,
/static/jam-6d0ca080a3f6e8043ca2f2f8f7c54a8f-ab68c.jpg 900w" src="/static/jam-6d0ca080a3f6e8043ca2f2f8f7c54a8f-f7f9a.jpg" sizes="(max-width: 180px) 100vw, 180px" style="position: absolute; top: 0px; left: 0px; transition: opacity 0.5s; width: 100%; height: 100%; object-fit: cover; object-position: center center; opacity: 1;"><noscript><img src="/static/jam-6d0ca080a3f6e8043ca2f2f8f7c54a8f-f7f9a.jpg" srcset="/static/jam-6d0ca080a3f6e8043ca2f2f8f7c54a8f-3c244.jpg 45w,
/static/jam-6d0ca080a3f6e8043ca2f2f8f7c54a8f-f58d6.jpg 90w,
/static/jam-6d0ca080a3f6e8043ca2f2f8f7c54a8f-f7f9a.jpg 180w,
/static/jam-6d0ca080a3f6e8043ca2f2f8f7c54a8f-870e7.jpg 270w,
/static/jam-6d0ca080a3f6e8043ca2f2f8f7c54a8f-dbc85.jpg 360w,
/static/jam-6d0ca080a3f6e8043ca2f2f8f7c54a8f-ac624.jpg 540w,
/static/jam-6d0ca080a3f6e8043ca2f2f8f7c54a8f-ab68c.jpg 900w" alt="" sizes="(max-width: 180px) 100vw, 180px" style="position:absolute;top:0;left:0;transition:opacity 0.5s;transition-delay:0.5s;opacity:1;width:100%;height:100%;object-fit:cover;object-position:center"/></noscript></div></div></a><span class="front-post-excerpt">How and Why I migrated from WordPress to static JAM Stack site built with Gatsby JS.</span></div></div>

I was very impress with the results of the migration, especially performance-wise. I was able to migrate all the functionality, except site-wide search.

With server generating your pages, search is easy. WordPress offers search option out of the box. With static sites with no dynamic backend, this gets more tricky. 

## Client-side search
One option to enable search for your application is to use full client-side search with libraries such as [js-search](https://github.com/bvaughn/js-search). The idea is simple. When you build your static site using your favorite static site generator, you also generate a search index of your pages. That basically means generating a lot of JSON with the contents of your site and then distributing this along with your static files. The search is lightning-fast because everything happends on the client. The problem is that this solution may not be good for full-text search. Bringing this much data to the client just for search can mean a significant performance hit. Especially if your site has a lot of content. And just a fraction of users is likely to use the search option. The rest just download useless junk. You sacrifice one of the greatest advantages of going static - performance just for adding search option.
 
## Good old Google Custom Search
Alright, so for full-text search it may not be such a good idea to donwload the whole search index to the client. Since our static site does not have a dedicated backend, we need to use third-party to handle the search.

The first obvious choice is to use Google search. [Google Custom Search](https://cse.google.com) to be precise.

The advantage is it doesn't need to download the whole search index, you just use Google to search your site only. There are some disadvantages though. First one is that Google will inject ads to your search results. The second one is that even though you can customize look and feel of the search results page to some degree, it is still obvious that you utilize Google. The results page will likely not fit very well the look and feel of your page and arguably it will not look very well integrated and professional. Especially with the ads. Like you didn't care enough to provide custom search as other sites do.

TODO image of google custom search

If you don't care about the downsides much, this can be very easy and quick way to add search for your static site. If you don't like it, there are still alternatives.

## Algolia DocSearch
    on your own infrastructure
Algolia Search
Conclusion        
