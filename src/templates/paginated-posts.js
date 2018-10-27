import React from "react";
import { Link } from "gatsby";
import get from "lodash/get";
import Helmet from "react-helmet";
import Img from "gatsby-image";

import { rhythm } from "../utils/typography";
import Tags from "../components/Tags";
import profilePic from "../components/profile-big.jpg";
import Layout from "../components/layout"
import { graphql } from "gatsby";

class BlogIndex extends React.Component {
  render() {
    const siteTitle = get(this, "props.data.site.siteMetadata.title");
    const siteDescription = get(
      this,
      "props.data.site.siteMetadata.description"
    );
    const siteUrl = get(this, "props.data.site.siteMetadata.siteUrl");
    const posts = get(this, "props.data.allMarkdownRemark.edges");
    const pagesTotal = get(this, "props.pageContext.pagesTotal");
    const currentPage = get(this, "props.pageContext.currentPage");

    let nextPage;
    let prevPage;

    if (currentPage > 1) {
      let path = "/";
      if (currentPage > 2) {
        path = "/pages/" + (currentPage - 1);
      }
      prevPage = <Link to={path}>« Previous page</Link>;
    }

    if (currentPage < pagesTotal) {
      nextPage = <Link to={"/pages/" + (currentPage + 1)}>Next page »</Link>;
    }
    let pagesLinks = [];
    for (var i = 1; i <= pagesTotal; i++) {
      if (i === currentPage) {
        pagesLinks.push(
          <span className="current-page" key={"pg" + i}>
            {i}
          </span>
        );
      } else {
        if (i === 1) {
          pagesLinks.push(
            <Link to="/" key={"pg" + i}>
              {i}
            </Link>
          );
        } else {
          pagesLinks.push(
            <Link to={"/pages/" + i} key={"pg" + i}>
              {i}
            </Link>
          );
        }
      }
    }

    return (
      <Layout>
        <Helmet title={siteTitle}>
          <meta name="description" content={siteDescription} />

          <meta property="og:title" content={siteTitle} />
          <meta property="og:description" content={siteDescription} />
          <meta property="og:image" content={siteUrl + profilePic} />
          <meta property="og:url" content={siteUrl} />
          <meta property="og:site_name" content={siteTitle} />
          <meta property="og:type" content="website" />
          <meta property="fb:app_id" content="2072264049710958" />

          <meta name="twitter:creator" content="@vojtechruzicka" />
          <meta name="twitter:site" content="@vojtechruzicka" />
          <meta name="twitter:card" content="summary" />
          <meta name="twitter:title" content={siteTitle} />
          <meta name="twitter:description" content={siteDescription} />
        </Helmet>
        {posts.map(({ node }) => {
          const title = get(node, "frontmatter.title") || node.fields.slug;
          return (
            <div key={node.fields.slug}>
              <h4
                className="front-post-title"
                style={{
                  marginBottom: rhythm(1 / 4)
                }}
              >
                <Link style={{ boxShadow: "none" }} to={node.fields.slug}>
                  {title}
                </Link>
              </h4>
              <small className="front-post-info">
                <span className="front-post-info-date">
                  {node.frontmatter.date}
                </span>
                <Tags tags={node.frontmatter.tags} />
              </small>
              <div>
                <Link to={node.fields.slug} className="front-post-image">
                  <Img fluid={node.frontmatter.featuredImage.childImageSharp.fluid} />
                </Link>
                <span
                  className="front-post-excerpt"
                  dangerouslySetInnerHTML={{ __html: node.frontmatter.excerpt }}
                />
              </div>
              <hr className="front-post-separator" />
            </div>
          );
        })}
        <div className="pagination">
          {prevPage}
          {pagesLinks}
          {nextPage}
        </div>
      </Layout>
    );
  }
}

export default BlogIndex;

export const pageQuery = graphql`
  query IndexQuery($pageSize: Int, $pageSkip: Int) {
    site {
      siteMetadata {
        title
        description
        siteUrl
      }
    }
    allMarkdownRemark(
      limit: $pageSize
      skip: $pageSkip
      sort: { fields: [frontmatter___date], order: DESC }
    ) {
      edges {
        node {
          fields {
            slug
          }
          frontmatter {
            excerpt
            date(formatString: "DD MMMM, YYYY")
            title
            tags
            featuredImage {
              childImageSharp {
                fluid(maxWidth: 180) {
                  ...GatsbyImageSharpFluid
                }
              }
            }
          }
        }
      }
    }
  }
`;
