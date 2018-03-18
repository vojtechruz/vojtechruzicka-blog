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
        excerpt_separator: `<!--more-->`,
        plugins: [
          {
            resolve: `gatsby-remark-images`,
            options: {
              maxWidth: 590,
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
        ],
      },
    },
    `gatsby-transformer-sharp`,
    `gatsby-plugin-sharp`,
    {
      resolve: `gatsby-plugin-google-analytics`,
      options: {
        trackingId: `UA-76533683-1`,
        anonymize: true,
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
              feeds: [
                  {
                      serialize: ({ query: { site, allMarkdownRemark } }) => {
                          return allMarkdownRemark.edges.map(edge => {
                              return Object.assign({}, edge.node.frontmatter, {
                                  description: edge.node.excerpt,
                                  url: site.siteMetadata.siteUrl + edge.node.fields.slug,
                                  guid: site.siteMetadata.siteUrl + edge.node.fields.slug,
                                  custom_namespaces: {
                                      "webfeeds": "http://webfeeds.org/rss/1.0"
                                  },
                                  custom_elements: [
                                      { "content:encoded": "<img class='webfeedsFeaturedVisual' src='"+site.siteMetadata.siteUrl + edge.node.frontmatter.featuredImage.childImageSharp.sizes.originalImg+"' >"+edge.node.html},
                                      {"webfeeds:logo": site.siteMetadata.siteUrl+"/favicon.svg"},
                                      {"webfeeds:icon": site.siteMetadata.siteUrl+"/favicon.svg"},
                                      {"webfeeds:accentColor": "007acc"},
                                      {"webfeeds:analytics": "UA-76533683-1"},
                                      {"webfeeds:cover":
                                              {_attr: {
                                                image: site.siteMetadata.siteUrl + edge.node.frontmatter.featuredImage.childImageSharp.sizes.originalImg
                                               }},
                                      }
                                  ],
                              });
                          });
                      },
                      query: `
            {
              allMarkdownRemark(
                limit: 10,
                sort: { order: DESC, fields: [frontmatter___date] },
              ) {
                edges {
                  node {
                    excerpt
                    html
                    fields { slug }
                    frontmatter {
                      title
                      date
                      featuredImage {
                        childImageSharp {
                            sizes(maxWidth: 1000) {
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
                  },
              ],
          },
      },
    `gatsby-plugin-offline`,
    `gatsby-plugin-react-helmet`,
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
              start_url: "/",
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
  ],
}
