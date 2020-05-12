---
title: 'Netlify build plugins: 3x faster GatsbyJS build'
date: "2020-05-17T22:12:03.284Z"
tags: ["JAMStack"]
path: '/gatsby-build-netlify-plugins'
featuredImage: 'gatsby-build-netlify-plugins.jpg'
disqusArticleIdentifier: 'TODO http://vojtechruzicka.com/?p=TODO'
excerpt: 'Make your GatsbyJS builds 3x faster on Netlify using build plugins.'
---

![3x faster GatsbyJS build with netlify plugins](gatsby-build-netlify-plugins.jpg)

## Netlify build plugins
Netlify build plugins allow you to run custom plugins as a part of your Nelify build process.

## Enabling plugins
Netlify build plugins are not enabled by default. This feature is still in beta (as of 5/2020). You can, however, explicitly enable beta build plugin support. Just click on the link `Build plugins` in the main navigation.

[NEtlify build plugins link](netlify-enabling-build-plugins.png)

Now simply click `Enable the beta` button:

[Netlify build plugins enable button](netlify-enabling-build-plugins-2.png)

Now you need to select which repositories should be enabled for plugins. Note that for sites to be available for plugins, they need to be based on the `Xenial` image. New sites should be based on this by default, but for older sites, you might need to explicitly change the image. You can find this configuration under your [site settings](https://docs.netlify.com/configure-builds/get-started/#build-image-selection):

```
Settings -> Build & Deploy -> Build image selection
```

[Netlify build image configuration](netlify-build-image-selection.png)

After selecting repositories, you can see the list of available plugins.

## Configuration
Plugins are not enabled and configured directly from the Netlify UI. Instead, you enable and configure your build plugins in `netlify.toml` configuration file, which should be located inside of your project on the root level.

The configuration for [netlify-plugin-gatsby-cache](https://github.com/jlengstorf/netlify-plugin-gatsby-cache) can be as simple as this:

```
[build]
  publish = "public"

[[plugins]]
package = "netlify-plugin-gatsby-cache"
```

If you have plugins enabled for your site and this configuration file present, Netlify will automatically trigger any build plugins defined in your file with the provided settings.

## Gatsby cache plugin
This blog uses GatsbyJS as a static site generator. Originally, the build would take quite a lot of time. This is usually not a problem with GatsbyJS - only the original build takes long, but the subsequent builds are much faster due to Gatsby cache. Netlify does not preserve this cache by default, so each build is long.

Even if the deployment time is not critical for you application, it can help a lot to improved it. That's because after running out of build minutes, you have to pay for more. And the free plan only currently offers 300 build minutes.

Fortunately, there is Netlify build plugin called [netlify-plugin-gatsby-cache](https://github.com/jlengstorf/netlify-plugin-gatsby-cache), which fixes this and makes the subsequent builds much faster.

My current build is as follows:
- 4087 image thumbnails (various sizes)
- 119 GraphQL queries
- 92 articles

Without the plugin the [build takes](https://app.netlify.com/sites/vojtechruzicka/deploys/5ea34fc56c47bb0006f3e03a) **13m 20s**. With the plugin [it takes](https://app.netlify.com/sites/vojtechruzicka/deploys/5ea35478f6337a0007874256) **3m 44s**. That is 3.57x faster!

The time can vary as it depends on the size of your site and the changes that you made.

The official docs also [provide examples of time reduction](https://github.com/jlengstorf/netlify-plugin-gatsby-cache#how-much-of-a-difference-does-this-plugin-make-in-build-times):
 
<table>
<thead>
<tr>
<th></th>
<th>No Cache</th>
<th>Cache</th>
<th>Savings</th>
</tr>
</thead>
<tbody>
<tr>
<td><ul>231 GraphQL queries</li><li>1,871 images</li><li>224 pages</li></ul></td>
<td>293207ms (<a href="https://app.netlify.com/sites/lengstorf/deploys/5dceed27d58a580008daaccc" rel="nofollow">build log</a>)</td>
<td>72835ms (<a href="https://app.netlify.com/sites/lengstorf/deploys/5dcef2463da4810008d48aaa" rel="nofollow">build log</a>)</td>
<td>75%</td>
</tr>
<tr>
<td><ul><li>5 GraphQL queries</li><li> No image processing</li><li> 32 pages</li></ul></td>
<td>22072ms (<a href="https://app.netlify.com/sites/build-plugin-test/deploys/5dceed49e746a200091c76fe" rel="nofollow">build log</a>)</td>
<td>15543ms (<a href="https://app.netlify.com/sites/build-plugin-test/deploys/5dceedbfad95d0000bcd46d1" rel="nofollow">build log</a>)</td>
<td>30%</td>
</tr>
</tbody>
</table>

## More plugins
There are currently 20 plugins available, featured in the Netlify site. Here are some of the interesting ones:

- [netlify-plugin-a11y](https://github.com/sw-yx/netlify-plugin-a11y): Validate your site with pa11y and fail the build if there are accessibility problems.
- [netlify-build-plugin-speedcurve](https://github.com/tkadlec/netlify-build-plugin-speedcurve): Test your performance using SpeedCurve after each deploy.
- [netlify-plugin-checklinks](https://github.com/munter/netlify-plugin-checklinks): Check your site for broken links.
- [netlify-plugin-inline-source](https://github.com/Tom-Bonnike/netlify-plugin-inline-source): Inline some of your assets to reduce amount of HTTP request and increase performance.
- [netlify-plugin-sitemap](https://github.com/netlify-labs/netlify-plugin-sitemap): Automatically generate sitemap of your site.
- [netlify-plugin-rss](https://github.com/sw-yx/netlify-plugin-rss): Generate RSS feed for your site.

## Additional resources
 - [Build plugins documentation](https://docs.netlify.com/configure-builds/build-plugins/)
 - [How to build your own build plugin](https://www.netlify.com/blog/2019/10/16/creating-and-using-your-first-netlify-build-plugin/)





