module.exports = {
  siteMetadata: {
    title: 'Vojtech Ruzicka\'s Programming Blog',
    author: 'Vojtech Ruzicka',
    description: 'Vojtech Ruzicka\'s Programming Blog.',
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
                                  custom_elements: [{ "content:encoded": edge.node.html }],
                              });
                          });
                      },
                      query: `
            {
              allMarkdownRemark(
                limit: 1000,
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
          resolve: `gatsby-plugin-favicon`,
          options: {
              logo: "./src/favicon.png",
              injectHTML: true,
              icons: {
                  android: true,
                  appleIcon: true,
                  appleStartup: true,
                  coast: false,
                  favicons: true,
                  firefox: true,
                  twitter: false,
                  yandex: false,
                  windows: false
              }
          }
      }
  ],
}
