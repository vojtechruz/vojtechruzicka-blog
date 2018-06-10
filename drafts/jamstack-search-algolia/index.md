---
title: 'Adding search to your static JAMStack site'
date: "2018-03-25T22:12:03.284Z"
tags: ['JAMStack']
path: '/jamstack-search-algolia'
featuredImage: './search.jpg'
disqusArticleIdentifier: '99007 http://vojtechruzicka.com/?p=99007'
excerpt: ''
---

![Search](search.jpg)

## Searching static sites
Few months ago I finally managed to migrate my blog from WodrPress to a static site build with GatsbyJS and deployed on [Netlify](https://www.vojtechruzicka.com/jamstack-migration-netlify/).

TODO link to gatsby article

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

## Algolia DocsSearch
    on your own infrastructure
Algolia Search
Conclusion        
