import React from "react";
import PropTypes from "prop-types";
import profilePic from "../components/profile-big.jpg";
import { Link } from "gatsby";
import { Helmet } from "react-helmet";
import Layout from "../components/layout"
import { graphql } from "gatsby";

const Tag = ({ pageContext, data }) => {
  const { tag } = pageContext;
  const { edges, totalCount } = data.allMarkdownRemark;
  const siteTitle = data.site.siteMetadata.title;
  const siteDescription = data.site.siteMetadata.description;
  const siteUrl = data.site.siteMetadata.siteUrl;
  const tagHeader = `${totalCount} post${
    totalCount === 1 ? "" : "s"
  } tagged with #${tag}`;
  const title = `${tag} | ${siteTitle}`;

  return (
    <Layout>
      <Helmet title={title}>
        <meta name="description" content={siteDescription} />
        <meta name="monetization" content="$ilp.uphold.com/J6E8FdPnGRZb" />

        <meta property="og:title" content={title} />
        <meta property="og:description" content={siteDescription} />
        <meta property="og:image" content={siteUrl + profilePic} />
        <meta property="og:url" content={siteUrl + "/tags/" + tag} />
        <meta property="og:site_name" content={siteTitle} />
        <meta property="og:type" content="website" />
        <meta property="og:locale" content="en_US" />
        <meta property="fb:app_id" content="2072264049710958" />

        <meta name="twitter:creator" content="@vojtechruzicka" />
        <meta name="twitter:site" content="@vojtechruzicka" />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={siteDescription} />
      </Helmet>
      <h1>#{tag}</h1>
      <ul className="tag-links">
        <li>
          <Link to="/archives/">Browse All Tags</Link>
        </li>
      </ul>
      <h4 className="tag-count">{tagHeader}</h4>
      <ul>
        {edges.map(({ node }) => {
          let { path, title } = node.frontmatter;

          if(!path.endsWith("/")) {
              path = path + "/"
          }

          return (
            <li key={path}>
              <Link to={path}>{title}</Link>
            </li>
          );
        })}
      </ul>
    </Layout>
  );
};

Tag.propTypes = {
    pageContext: PropTypes.shape({
    tag: PropTypes.string.isRequired
  }),
  data: PropTypes.shape({
    allMarkdownRemark: PropTypes.shape({
      totalCount: PropTypes.number.isRequired,
      edges: PropTypes.arrayOf(
        PropTypes.shape({
          node: PropTypes.shape({
            frontmatter: PropTypes.shape({
              path: PropTypes.string.isRequired,
              title: PropTypes.string.isRequired
            })
          })
        }).isRequired
      )
    })
  })
};

export default Tag;

export const pageQuery = graphql`
  query TagPage($tag: String) {
    site {
      siteMetadata {
        title
        description
        siteUrl
      }
    }
    allMarkdownRemark(
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
