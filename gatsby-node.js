const _ = require("lodash");
const path = require("path");
const { createFilePath } = require("gatsby-source-filesystem");

exports.createSchemaCustomization = ({ actions: { createTypes } }) => {
  createTypes(`
    type Mdx implements Node {
      frontmatter: MdxFrontmatter
    }

type MdxFrontmatter {
      tags: [String]
      hidden: String
      author: String
      excerpt: String!
      links: [String]
    }
  `);
};

exports.createPages = ({ graphql, actions }) => {
  const { createPage } = actions;

  return new Promise((resolve, reject) => {
    const pageSize = 10;
    const blogPost = path.resolve("./src/templates/blog-post.js");
    const tagTemplate = path.resolve("./src/templates/tag.js");
    const paginatedPosts = path.resolve("./src/templates/paginated-posts.js");
    resolve(
      graphql(`
        {
          allMdx(sort: { frontmatter: { date: DESC } }) {
            edges {
              node {
                fields {
                  slug
                }
                frontmatter {
                  title
                  tags
                  date(formatString: "MMM DD, YYYY")
                  path
                  links
                  excerpt
                  featuredImage {
                    childImageSharp {
                      gatsbyImageData(
                        layout: CONSTRAINED
                        formats: [AUTO, WEBP, AVIF]
                      )
                      original {
                        src
                      }
                    }
                  }
                }
                internal {
                  contentFilePath
                }
              }
            }
          }
        }
      `).then((result) => {
        if (result.errors) {
          console.log(result.errors);
          reject(result.errors);
        }

        // Create blog posts pages.
        const posts = result.data.allMdx.edges;

        // Tag pages:
        let tags = [];
        // Iterate through each post, putting all found tags into `tags`
        posts.forEach((edge) => {
          if (_.get(edge, "node.frontmatter.tags")) {
            tags = tags.concat(edge.node.frontmatter.tags);
          }
        });
        // Eliminate duplicate tags
        tags = _.uniq(tags);

        // Make tag pages
        tags.forEach((tag) => {
          createPage({
            path: `/tags/${_.kebabCase(tag)}/`,
            component: tagTemplate,
            context: {
              tag,
            },
          });
        });

        posts.forEach((post) => {
          let related = posts.filter((p) => {
            if (p.node.fields.slug === post.node.fields.slug) {
              return false;
            }

            let filteredTags = post.node.frontmatter.tags.filter((tag) => {
              if (p.node.frontmatter.tags.indexOf(tag) !== -1) {
                return true;
              }
              return false;
            });
            if (filteredTags && filteredTags.length > 0) {
              return true;
            }

            return false;
          });

          related = _.shuffle(related).slice(0, 6);
          let links;
          if (!post.node.frontmatter.links) {
            links = {};
          } else {
            links = {};
            post.node.frontmatter.links.forEach((link) => {
              links[link] = posts.find(
                (post) => post.node.frontmatter.path === link,
              ).node;
            });
          }

          createPage({
            path: post.node.fields.slug,
            component: `${blogPost}?__contentFilePath=${post.node.internal.contentFilePath}`,
            context: {
              slug: post.node.fields.slug,
              related,
              links,
            },
          });
        });

        // pagination
        const chunkedPosts = _.chunk(posts, pageSize);
        chunkedPosts.forEach((chunk, index) => {
          let path = "/";
          if (index > 0) {
            path = `/pages/${index + 1}/`;
          }
          createPage({
            path: path,
            component: paginatedPosts,
            context: {
              pageSize: pageSize,
              pageSkip: index * pageSize,
              pagesTotal: Math.ceil(posts.length / pageSize),
              currentPage: index + 1,
            },
          });
        });
      }),
    );
  });
};

exports.onCreateNode = ({ node, actions, getNode }) => {
  const { createNodeField } = actions;

  if (node.internal.type === `Mdx`) {
    const value = createFilePath({ node, getNode });
    createNodeField({
      name: `slug`,
      node,
      value,
    });
  }
};
