import React from 'react'
import Link from 'gatsby-link'
import get from 'lodash/get'
import Helmet from 'react-helmet'
import Img from 'gatsby-image'

import { rhythm } from '../utils/typography'
import Tags from "../components/Tags";

class BlogIndex extends React.Component {
  render() {
    const siteTitle = get(this, 'props.data.site.siteMetadata.title')
    const posts = get(this, 'props.data.allMarkdownRemark.edges')

    return (
      <div>
        <Helmet title={siteTitle} />
        {posts.map(({ node }) => {
          const title = get(node, 'frontmatter.title') || node.fields.slug
          return (
            <div key={node.fields.slug}>
                <h4 className="front-post-title"
                    style={{
                        marginBottom: rhythm(1 / 4),
                    }}>
                    <Link style={{ boxShadow: 'none' }} to={node.fields.slug}>
                        {title}
                    </Link>
                </h4>
                <small className="front-post-info">
                    <span className="front-post-info-date">{node.frontmatter.date}</span>
                    <Tags tags={node.frontmatter.tags} />
                    </small>
                <div>
                    <span className="front-post-image"><Img sizes={node.frontmatter.featuredImage.childImageSharp.sizes} />
                    </span>
                  <span className="front-post-excerpt" dangerouslySetInnerHTML={{ __html: node.excerpt }} />
                </div>
                <hr className="front-post-separator"/>
            </div>
          )
        })}
      </div>
    )
  }
}

export default BlogIndex

export const pageQuery = graphql`
  query IndexQuery($pageSlugs: [String]) {
    site {
      siteMetadata {
        title
      }
    }
    allMarkdownRemark(
        sort: { fields: [frontmatter___date], order: DESC }
        filter: { fields: {slug: {in: $pageSlugs} } }
    ) {
      edges {
        node {
          excerpt
          fields {
            slug
          }
          frontmatter {
            date(formatString: "DD MMMM, YYYY")
            title
            tags
            featuredImage {
                childImageSharp{
                    sizes(maxWidth: 200) {
                        ...GatsbyImageSharpSizes_tracedSVG
                    }
                }
            }
          }
        }
      }
    }
  }
`
