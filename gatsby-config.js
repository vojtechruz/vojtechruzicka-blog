module.exports = {
    siteMetadata: {
        title: 'Vojtech Ruzicka\'s Programming Blog',
        author: 'Vojtech Ruzicka',
        description: 'Blog about Full-stack Software Development. Clean code, Design patterns, Java, Spring, Javascript, Angular, React and more.',
        siteUrl: 'https://www.vojtechruzicka.com',
    },
    pathPrefix: '/',
    plugins: [
        {
            resolve: `gatsby-source-filesystem`,
            options: {
                path: `${__dirname}/src/pages`,
                name: 'pages',
            },
        },
        {
            resolve: `gatsby-source-filesystem`,
            options: {
                path: `${__dirname}/src/posts`,
                name: 'posts',
            },
        },
        {
            resolve: `gatsby-transformer-remark`,
            options: {
                plugins: [
                    {
                        resolve: 'gatsby-remark-code-buttons',
                        options:
                            {
                                toasterText: 'Copied to clipboard.',
                                tooltipText: `Copy to clipboard`,
                            }
                    },
                    {
                        resolve: "@weknow/gatsby-remark-codepen",
                        options: {
                            theme: "dark",
                            height: 400,
                            defaultTab: "result"
                        }
                    },
                    {
                        resolve: `gatsby-remark-images`,
                        options: {
                            maxWidth: 700,
                            backgroundColor: "transparent",
                            showCaptions: false,
                            withWebp: true,
                            withAvif: false
                        },
                    },
                    `gatsby-transformer-json`,
                    {
                        resolve: `gatsby-source-filesystem`,
                        options: {
                            path: `./src/data/`,
                        },
                    },
                    {
                        resolve: `gatsby-remark-responsive-iframe`,
                        options: {
                            wrapperStyle: `margin-bottom: 1.0725rem`,
                        },
                    },
                    'gatsby-remark-prismjs',
                    'gatsby-remark-copy-linked-files',
                    'gatsby-remark-autolink-headers',
                ],
            },
        },
        {
            resolve: `gatsby-plugin-sharp`,
            options: {
                defaults: {
                    formats: [`auto`, `webp`, `avif`],
                    placeholder: `blurred`,
                }
            }
        },
        `gatsby-transformer-sharp`,
        "gatsby-plugin-image",
        {
            resolve: `gatsby-plugin-google-gtag`,
            options: {
                // You can add multiple tracking ids and a pageview event will be fired for all of them.
                trackingIds: [
                    "UA-76533683-1", // Google Analytics 3
                    "G-5SJ6ERGH23", // Google Analytics 4
                ],
                // This object gets passed directly to the gtag config command
                // This config will be shared across all trackingIds
                gtagConfig: {
                    anonymize_ip: true,
                    cookie_expires: 0,
                },
                // This object is used for configuration specific to this plugin
                pluginConfig: {
                    // Puts tracking script in the head instead of the body
                    head: false,
                },
            },
        },
        {
            resolve: `gatsby-plugin-feed`,
            options: {
                query: `
                {
                  site {
                    siteMetadata {
                      title
                      description
                      siteUrl
                      site_url: siteUrl
                    }
                  }
                }
              `,
                setup: ({
                            query: {
                                site: {siteMetadata},
                                ...rest
                            },
                        }) => {
                    return {
                        ...siteMetadata,
                        ...rest,
                        custom_namespaces: {
                            "webfeeds": "http://webfeeds.org/rss/1.0"
                        },
                    }
                },
                feeds: [
                    {
                        serialize: ({query: {site, allMarkdownRemark}}) => {
                            return allMarkdownRemark.edges.filter(edge => edge.node.frontmatter.hidden !== 'true').map(edge => {
                                return Object.assign({}, edge.node.frontmatter, {
                                    description: edge.node.frontmatter.excerpt,
                                    url: site.siteMetadata.siteUrl + edge.node.fields.slug,
                                    guid: site.siteMetadata.siteUrl + edge.node.fields.slug,
                                    custom_elements: [
                                        {"content:encoded": edge.node.html},
                                        {"webfeeds:logo": site.siteMetadata.siteUrl + "/favicon.svg"},
                                        {"webfeeds:icon": site.siteMetadata.siteUrl + "/favicon.svg"},
                                        {"webfeeds:accentColor": "007acc"},
                                        {"webfeeds:analytics": "UA-76533683-1"},
                                        {
                                            "webfeeds:cover":
                                                {
                                                    _attr: {
                                                        image: site.siteMetadata.siteUrl + edge.node.frontmatter.featuredImage.childImageSharp.fluid.originalImg
                                                    }
                                                },
                                        }
                                    ],
                                });
                            });
                        },
                        query: `
                        {
                          allMarkdownRemark(
                            sort: { order: DESC, fields: [frontmatter___date] },
                          ) {
                            edges {
                              node {
                                html
                                fields { slug }
                                frontmatter {
                                  excerpt
                                  title
                                  date
                                  hidden
                                  featuredImage {
                                    childImageSharp {
                                        fluid(maxWidth: 1000) {
                                            originalImg
                                        }
                                    }
                                  }
                                }
                              }
                            }
                          }
                        }
          `,
                        output: "/feed",
                        title: "Vojtech Ruzicka\'s Programming Blog",
                    },
                ],
            },
        },
        `gatsby-plugin-sass`,
        {
            resolve: 'gatsby-plugin-typography',
            options: {
                pathToConfigModule: 'src/utils/typography',
            },
        },
        {
            resolve: `gatsby-plugin-manifest`,
            options: {
                name: "Vojtech Ruzicka's Programming Blog",
                short_name: "VR Blog",
                start_url: "https://www.vojtechruzicka.com",
                background_color: "#fff",
                theme_color: "#007acc",
                display: "minimal-ui",
                icons: [
                    {
                        src: `/favicons/favicon.png`,
                        sizes: `64x64`,
                        type: `image/png`,
                    },
                    {
                        src: `/favicons/640x640.png`,
                        sizes: `640x640`,
                        type: `image/png`,
                    }
                ],
            },
        },
        {
            resolve: `gatsby-plugin-canonical-urls`,
            options: {
                siteUrl: `https://www.vojtechruzicka.com`,
            },
        },
        {
            resolve: `gatsby-plugin-sitemap`,
            options: {
                excludes: [`/pages/*`]
            }
        },
        `gatsby-plugin-offline`,
        `gatsby-plugin-netlify`
    ],
}
