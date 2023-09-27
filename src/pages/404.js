import * as React from "react";
import Layout from "../components/layout";
import profilePic from "../components/profile-big.jpg";
import { graphql, Link } from "gatsby";
import kebabCase from "lodash/kebabCase";
import SearchBox from "../components/SearchBox";
import get from "lodash/get";

const NotFoundPage = ({
  data: {
    allMarkdownRemark: { group },
  },
}) => (
  <Layout>
    <div>
      <h1>Page Not Found</h1>
      <div className="msg-warn">
        The page you are looking for does not exist. <br />
        You can either try using search or browse all posts by category below.
      </div>

      <div className="search-inline">
        <h4>Search for posts</h4>
        <SearchBox inputClass="search-secondary" />
      </div>

      <h4>All available posts by category</h4>
      <ul>
        {group
          .sort((a, b) => {
            return b.totalCount - a.totalCount;
          })
          .map((tag) => (
            <li key={tag.fieldValue}>
              <Link to={`/tags/${kebabCase(tag.fieldValue)}/`}>
                {tag.fieldValue} ({tag.totalCount})
              </Link>
            </li>
          ))}
      </ul>
    </div>
  </Layout>
);

export function Head({ data }) {
  const siteTitle = get(data, "site.siteMetadata.title");
  const siteDescription = get(data, "site.siteMetadata.description");
  const siteUrl = get(data, "site.siteMetadata.siteUrl");
  const title = `Page Not Found | ${siteTitle}`;

  return (
    <>
      <title>{title}</title>
      <meta name="description" content={siteDescription} />
      <meta name="monetization" content="$ilp.uphold.com/J6E8FdPnGRZb" />
      <html lang="en" />
      <link rel="icon" type="image/png" href="/favicon.png" />

      <meta property="og:title" content={`${title}`} />
      <meta property="og:description" content={siteDescription} />
      <meta property="og:image" content={siteUrl + profilePic} />
      <meta property="og:url" content={siteUrl + "/404/"} />
      <meta property="og:site_name" content={siteTitle} />
      <meta property="og:type" content="website" />
      <meta property="og:locale" content="en_US" />
      <meta property="fb:app_id" content="2072264049710958" />

      <meta name="twitter:creator" content="@vojtechruzicka" />
      <meta name="twitter:site" content="@vojtechruzicka" />
      <meta name="twitter:card" content="summary" />
      <meta name="twitter:title" content={`${title}`} />
      <meta name="twitter:description" content={siteDescription} />
    </>
  );
}

export default NotFoundPage;

export const pageQuery = graphql`
  query NotFoundQuery {
    site {
      siteMetadata {
        title
        description
        siteUrl
      }
    }
    allMarkdownRemark {
      group(field: { frontmatter: { tags: SELECT } }) {
        fieldValue
        totalCount
      }
    }
  }
`;
