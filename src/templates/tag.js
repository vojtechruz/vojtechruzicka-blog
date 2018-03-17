import React from "react";
import PropTypes from "prop-types";

// Components
import Link from "gatsby-link";
import {Helmet} from "react-helmet";

const Tag = ({ pathContext, data }) => {
    const { tag } = pathContext;
    const { edges, totalCount } = data.allMarkdownRemark;
    const siteTitle = data.site.siteMetadata.title;
    const siteDescription = data.site.siteMetadata.description;
    const tagHeader = `${totalCount} post${
        totalCount === 1 ? "" : "s"
        } tagged with "${tag}"`;

    return (
        <div>
            <Helmet title={`${tag} | ${siteTitle}`}>
                <meta name="description" content={siteDescription} />
            </Helmet>
            <h1>{tag}</h1>
            <ul className='tag-links'>
                <li><Link to="/tags">All tags</Link></li>
                <li><Link to="/archives">Archives</Link></li>
            </ul>
            <div className="tag-count">{tagHeader}</div>
            <ul>
                {edges.map(({ node }) => {
                    const { path, title } = node.frontmatter;
                    return (
                        <li key={path}>
                            <Link to={path}>{title}</Link>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
};

Tag.propTypes = {
    pathContext: PropTypes.shape({
        tag: PropTypes.string.isRequired,
    }),
    data: PropTypes.shape({
        allMarkdownRemark: PropTypes.shape({
            totalCount: PropTypes.number.isRequired,
            edges: PropTypes.arrayOf(
                PropTypes.shape({
                    node: PropTypes.shape({
                        frontmatter: PropTypes.shape({
                            path: PropTypes.string.isRequired,
                            title: PropTypes.string.isRequired,
                        }),
                    }),
                }).isRequired
            ),
        }),
    }),
};

export default Tag;

export const pageQuery = graphql`
  query TagPage($tag: String) {
    site {
      siteMetadata {
        title
        description
      }
    }
    allMarkdownRemark(
      limit: 2000
      sort: { fields: [frontmatter___date], order: DESC }
      filter: { frontmatter: { tags: { in: [$tag] } } }
    ) {
      totalCount
      edges {
        node {
          frontmatter {
            title
            path
          }
        }
      }
    }
  }
`;