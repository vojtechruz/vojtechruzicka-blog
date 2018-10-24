const _ = require('lodash')
const Promise = require('bluebird')
const path = require('path')
const { createFilePath } = require('gatsby-source-filesystem')

exports.createPages = ({ graphql, actions }) => {
  const { createPage } = actions

  return new Promise((resolve, reject) => {
    const pageSize = 8;
    const blogPost = path.resolve('./src/templates/blog-post.js');
    const tagTemplate = path.resolve("./src/templates/tag.js");
    const paginatedPosts = path.resolve("./src/templates/paginated-posts.js");
    resolve(
      graphql(
        `
          {
            allMarkdownRemark(sort: { fields: [frontmatter___date], order: DESC }, limit: 1000) {
              edges {
                node {
                  fields {
                    slug
                  }
                  frontmatter {
                    title
                    tags
                    date
                    path
                  }
                }
              }
            }
          }
        `
      ).then(result => {
        if (result.errors) {
          console.log(result.errors)
          reject(result.errors)
        }

        // Create blog posts pages.
        const posts = result.data.allMarkdownRemark.edges;

          // Tag pages:
          let tags = [];
          // Iterate through each post, putting all found tags into `tags`
          posts.forEach(edge => {
              if (_.get(edge, "node.frontmatter.tags")) {
                  tags = tags.concat(edge.node.frontmatter.tags);
              }
          });
          // Eliminate duplicate tags
          tags = _.uniq(tags);

          // Make tag pages
          tags.forEach(tag => {
              createPage({
                  path: `/tags/${_.kebabCase(tag)}/`,
                  component: tagTemplate,
                  context: {
                      tag,
                  },
              });
          });

        posts.forEach(post => {
          let related = posts.filter((p) => {
              if(p.node.fields.slug === post.node.fields.slug) {
                  return false;
              }

              var filteredTags = post.node.frontmatter.tags.filter((tag) => {
                  if(p.node.frontmatter.tags.indexOf(tag) !== -1) {
                      return true;
                  }
                  return false;
              });
              if(filteredTags && filteredTags.length > 0) {
                  return true;
              }

              return false;
          });

          related = _.shuffle(related).slice(0,6);

          createPage({
            path: post.node.fields.slug,
            component: blogPost,
            context: {
              slug: post.node.fields.slug,
              related
            },
          })
        })

         // pagination
        const chunkedPosts = _.chunk(posts, pageSize);
        chunkedPosts.forEach((chunk, index) => {
            let path = "/";
            if(index > 0) {
                path = `/pages/${index+1}/`
            }
                createPage({
                    path: path,
                    component: paginatedPosts,
                    context:
                        {
                            pageSize: pageSize,
                            pageSkip: index*pageSize,
                            pagesTotal: Math.ceil(posts.length / pageSize),
                            currentPage: index+1
                        }
                    ,
                })
        })
      })
    )
  })
}

exports.onCreateNode = ({ node, actions, getNode }) => {
  const { createNodeField } = actions

  if (node.internal.type === `MarkdownRemark`) {
    const value = createFilePath({ node, getNode })
    createNodeField({
      name: `slug`,
      node,
      value,
    })
  }
}
