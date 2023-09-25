import React from "react";
import {Link} from "gatsby";
import get from "lodash/get";
import {GatsbyImage} from "gatsby-plugin-image";

import {rhythm} from "../utils/typography";
import Tags from "../components/Tags";
import profilePic from "../components/profile-big.jpg";
import Layout from "../components/layout"
import {graphql} from "gatsby";

class BlogIndex extends React.Component {
    render() {
        const posts = get(this, "props.data.allMarkdownRemark.edges").filter(post => post.node.frontmatter.hidden !== 'true');
        const pagesTotal = get(this, "props.pageContext.pagesTotal");
        const currentPage = get(this, "props.pageContext.currentPage");

        let nextPage;
        let prevPage;
        let topPagination;

        if (currentPage > 1) {
            let prevPagePath = "/";
            if (currentPage > 2) {
                prevPagePath = `/pages/${currentPage - 1}/`;
            }
            prevPage = <Link to={prevPagePath}>« Previous page</Link>;
        }

        if (currentPage < pagesTotal) {
            const nextPagePath = `/pages/${currentPage + 1}/`;
            nextPage = <Link to={nextPagePath}>Next page »</Link>;
        }
        let pagesLinks = [];
        for (let i = 1; i <= pagesTotal; i++) {
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
                        <Link to={`/pages/${i}/`} key={"pg" + i}>
                            {i}
                        </Link>
                    );
                }
            }
        }

        let bottomPagination = (<div className="pagination">
            {prevPage}
            {pagesLinks}
            {nextPage}
        </div>);
        if (currentPage > 1) {
            topPagination = <div className="top-pagination pagination">
                {prevPage}
                {pagesLinks}
                {nextPage}
            </div>;
        }

        return (
            <Layout>
                {topPagination}
                {posts.map(({node}) => {
                    const title = get(node, "frontmatter.title") || node.fields.slug;
                    return (
                        <div className="linked-article" key={node.fields.slug}>
                            <h4
                                className="front-post-title"
                                style={{
                                    marginBottom: rhythm(1 / 4)
                                }}
                            >
                                <Link style={{boxShadow: "none"}} to={node.fields.slug}>
                                    {title}
                                </Link>
                            </h4>
                            <small className="front-post-info">
                <span className="front-post-info-date">
                  {node.frontmatter.date}
                </span>
                                <Tags tags={node.frontmatter.tags}/>
                            </small>
                            <div>
                                <Link to={node.fields.slug} className="front-post-image">
                                    <GatsbyImage image={node.frontmatter.featuredImage.childImageSharp.gatsbyImageData}
                                                 title={node.frontmatter.title} alt={node.frontmatter.title}/>
                                </Link>
                                <span
                                    className="front-post-excerpt"
                                    dangerouslySetInnerHTML={{__html: node.frontmatter.excerpt}}
                                />
                            </div>
                        </div>
                    );
                })}
                {bottomPagination}
            </Layout>
        );
    }
}


export function Head({data, pageContext}) {
    const siteTitle = get(data, "site.siteMetadata.title");
    const siteDescription = get(data, "site.siteMetadata.description");
    const siteUrl = get(data, "site.siteMetadata.siteUrl");
    const currentPage = pageContext.currentPage;
    const pagesTotal = pageContext.pagesTotal;
    let nextPageHeaderLink;
    let prevPageHeaderLink;

    if (currentPage > 1) {
        const prevPagePath = `/pages/${currentPage - 1}/`;
        prevPageHeaderLink = <link rel="prev" href={siteUrl + prevPagePath}/>
    }

    if (currentPage < pagesTotal) {
        const nextPagePath = `/pages/${currentPage + 1}/`;
        nextPageHeaderLink = <link rel="next" href={siteUrl + nextPagePath}/>
    }

    return (
        <>
            <title>{siteTitle}</title>
            <meta name="description" content={siteDescription}/>
            <meta name="monetization" content="$ilp.uphold.com/J6E8FdPnGRZb"/>
            <html lang="en" />
            <link rel="icon" type="image/png" href="/favicon.png" />

            <meta property="og:title" content={siteTitle}/>
            <meta property="og:description" content={siteDescription}/>
            <meta property="og:image" content={siteUrl + profilePic}/>
            <meta property="og:url" content={siteUrl}/>
            <meta property="og:site_name" content={siteTitle}/>
            <meta property="og:type" content="website"/>
            <meta property="og:locale" content="en_US"/>
            <meta property="fb:app_id" content="2072264049710958"/>

            <meta name="twitter:creator" content="@vojtechruzicka"/>
            <meta name="twitter:site" content="@vojtechruzicka"/>
            <meta name="twitter:card" content="summary"/>
            <meta name="twitter:title" content={siteTitle}/>
            <meta name="twitter:description" content={siteDescription}/>
            {prevPageHeaderLink}
            {nextPageHeaderLink}
        </>
    )
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
            hidden
            featuredImage {
              childImageSharp {
                gatsbyImageData(layout: CONSTRAINED, width:217)
              }
            }
          }
        }
      }
    }
  }
`;
