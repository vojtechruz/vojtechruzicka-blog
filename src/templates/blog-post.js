import React from "react";
import get from "lodash/get";
import Bio from "../components/Bio";
import { rhythm, scale } from "../utils/typography";
import Tags from "../components/Tags";
import { Link } from "gatsby";
import {
  FacebookShareButton,
  LinkedinShareButton,
  TwitterShareButton,
  RedditShareButton,
  TumblrShareButton,
  EmailShareButton,
  FacebookIcon,
  RedditIcon,
  LinkedinIcon,
  TumblrIcon,
  EmailIcon,
  XIcon,
} from "react-share";
import { OutboundLink } from "gatsby-plugin-google-gtag";
import Layout from "../components/layout";
import { graphql } from "gatsby";
import profilePic from "../components/profile-big.jpg";
import Giscus from "@giscus/react";
import Warning from "../components/Warning";
import Info from "../components/Info";
import PostLink from "../components/PostLink";
import PostHeader from "../components/PostHeader";
import CodePen from "../components/CodePen";
import YouTubeVideo from "../components/YouTubeVideo";
import SeriesTableOfContents from "../components/SeriesTableOfContents";
import { MDXProvider } from "@mdx-js/react";

function BlogPostTemplate(props) {
  const post = props.data.mdx;
  const body = props.children;
  const siteUrl = get(props, "data.site.siteMetadata.siteUrl");
  const shareIconSize = 32;
  const authors = get(props, "data.allAuthorsJson.edges").map(
    (edge) => edge.node,
  );
  let author;

  if (post.frontmatter.author) {
    author = authors.find((author) => {
      return author.name === post.frontmatter.author;
    });
  } else {
    author = authors[0];
  }

  const relatedPosts = props.pageContext.related;
  let similarPosts = null;
  if (relatedPosts && relatedPosts.length > 0) {
    similarPosts = (
      <div className="similar-posts">
        <hr />
        <div className="similar-posts-label">Similar posts:</div>
        <ul>
          {relatedPosts.map((post) => {
            let path = post.node.frontmatter.path;
            if (!path.endsWith("/")) {
              path = path + "/";
            }

            return (
              <li key={path}>
                <Link to={path}>{post.node.frontmatter.title}</Link>
              </li>
            );
          })}
        </ul>
      </div>
    );
  }

  let toc;
  if (props.pageContext.seriesInfo.series) {
    toc = (
      <SeriesTableOfContents
        seriesInfo={props.pageContext.seriesInfo}
      ></SeriesTableOfContents>
    );
  }

  const twitterIcon = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 50 50"
      className="about-icon"
    >
      <path d="M 6.9199219 6 L 21.136719 26.726562 L 6.2285156 44 L 9.40625 44 L 22.544922 28.777344 L 32.986328 44 L 43 44 L 28.123047 22.3125 L 42.203125 6 L 39.027344 6 L 26.716797 20.261719 L 16.933594 6 L 6.9199219 6 z" />
    </svg>
  );

  const emailIcon = (
    <svg
      className="about-icon"
      xmlns="https://www.w3.org/2000/svg"
      viewBox="0 0 512 512"
    >
      <path d="M502.3 190.8c3.9-3.1 9.7-.2 9.7 4.7V400c0 26.5-21.5 48-48 48H48c-26.5 0-48-21.5-48-48V195.6c0-5 5.7-7.8 9.7-4.7 22.4 17.4 52.1 39.5 154.1 113.6 21.1 15.4 56.7 47.8 92.2 47.6 35.7.3 72-32.8 92.3-47.6 102-74.1 131.6-96.3 154-113.7zM256 320c23.2.4 56.6-29.2 73.4-41.4 132.7-96.3 142.8-104.7 173.4-128.7 5.8-4.5 9.2-11.5 9.2-18.9v-19c0-26.5-21.5-48-48-48H48C21.5 64 0 85.5 0 112v19c0 7.4 3.4 14.3 9.2 18.9 30.6 23.9 40.7 32.4 173.4 128.7 16.8 12.2 50.2 41.8 73.4 41.4z" />
    </svg>
  );

  const rssIcon = (
    <svg
      className="about-icon"
      xmlns="https://www.w3.org/2000/svg"
      viewBox="0 0 448 512"
    >
      <path d="M128.081 415.959c0 35.369-28.672 64.041-64.041 64.041S0 451.328 0 415.959s28.672-64.041 64.041-64.041 64.04 28.673 64.04 64.041zm175.66 47.25c-8.354-154.6-132.185-278.587-286.95-286.95C7.656 175.765 0 183.105 0 192.253v48.069c0 8.415 6.49 15.472 14.887 16.018 111.832 7.284 201.473 96.702 208.772 208.772.547 8.397 7.604 14.887 16.018 14.887h48.069c9.149.001 16.489-7.655 15.995-16.79zm144.249.288C439.596 229.677 251.465 40.445 16.503 32.01 7.473 31.686 0 38.981 0 48.016v48.068c0 8.625 6.835 15.645 15.453 15.999 191.179 7.839 344.627 161.316 352.465 352.465.353 8.618 7.373 15.453 15.999 15.453h48.068c9.034-.001 16.329-7.474 16.005-16.504z" />
    </svg>
  );

  let dateModified = post.frontmatter.dateModified;
  if (!dateModified) {
    dateModified = post.frontmatter.date;
  }

  let lastUpdated;
  if (
    post.frontmatter.dateModified &&
    post.frontmatter.dateModified !== post.frontmatter.date
  ) {
    lastUpdated = <div>Last Updated: {dateModified}</div>;
  }

  const shortcodes = {
    Warning,
    Info,
    PostLink,
    PostHeader,
    SeriesTableOfContents,
    CodePen,
    YouTubeVideo,
  };

  return (
    <Layout>
      {/*This class marks contents searchable by algolia docs search*/}
      <div className="docSearch-content">
        <h1>{post.frontmatter.title}</h1>
        <div
          style={{
            ...scale(-1 / 5),
            display: "block",
            marginBottom: rhythm(1),
            marginTop: rhythm(-1),
          }}
        >
          <span className="date-published">{post.frontmatter.date}</span>
          <Tags tags={post.frontmatter.tags} />
          {lastUpdated}
        </div>

        {/*Feature image needs to be part of the article otherwise sites such as pocket and feedly wont load proper image*/}
        <div id="article-content">
          <MDXProvider components={shortcodes}>{body}</MDXProvider>
          {toc}
        </div>
      </div>
      <hr
        style={{
          marginBottom: rhythm(1),
        }}
      />
      <div className="bottom-post-tags">
        <span>Tagged with: </span>
        <Tags tags={post.frontmatter.tags} />
      </div>
      <Bio author={author} />
      <hr />
      <div className="social">
        <p className="notification-link">
          Get notifications about new posts on{" "}
          <OutboundLink href="https://www.vojtechruzicka.com/feed/">
            {rssIcon}RSS,
          </OutboundLink>{" "}
          <OutboundLink href="https://twitter.com/vojtechruzicka">
            {twitterIcon}X
          </OutboundLink>{" "}
          or{" "}
          <OutboundLink href="https://eepurl.com/bZ0waf">
            {emailIcon}Email
          </OutboundLink>
          .
        </p>
        <div className="share-label">Share this post:</div>
        <div className="share-icons">
          <span title="Share this post on X">
            <TwitterShareButton
              url={siteUrl + post.frontmatter.path}
              aria-label="X share button"
            >
              <XIcon round size={shareIconSize} />
            </TwitterShareButton>
          </span>
          <span title="Share this post on Facebook">
            <FacebookShareButton
              url={siteUrl + post.frontmatter.path}
              aria-label="Facebook share button"
            >
              <FacebookIcon round size={shareIconSize} />
            </FacebookShareButton>
          </span>
          <span title="Share this post on LinkedIn">
            <LinkedinShareButton
              url={siteUrl + post.frontmatter.path}
              aria-label="LinkedIn share button"
            >
              <LinkedinIcon round size={shareIconSize} />
            </LinkedinShareButton>
          </span>
          <span title="Share this post on Reddit">
            <RedditShareButton
              url={siteUrl + post.frontmatter.path}
              aria-label="Reddit share button"
            >
              <RedditIcon round size={shareIconSize} />
            </RedditShareButton>
          </span>
          <span title="Share this post on Tumblr">
            <TumblrShareButton
              url={siteUrl + post.frontmatter.path}
              aria-label="Tumblr share button"
            >
              <TumblrIcon round size={shareIconSize} />
            </TumblrShareButton>
          </span>
          <span title="Share this post via Email">
            <EmailShareButton
              url={siteUrl + post.frontmatter.path}
              aria-label="Email share button"
            >
              <EmailIcon round size={shareIconSize} />
            </EmailShareButton>
          </span>
        </div>
      </div>
      {similarPosts}
      <hr />
      <Giscus
        src="https://giscus.app/client.js"
        repo="vojtechruz/vojtechruzicka-blog"
        repoId="MDEwOlJlcG9zaXRvcnkxMjIyMzQ4MTY="
        category="Announcements"
        categoryId="DIC_kwDOB0knwM4CZvj3"
        mapping="pathname"
        strict="1"
        reactionsEnabled="1"
        emitMetadata="0"
        inputPosition="top"
        theme="preferred_color_scheme"
        lang="en"
        loading="lazy"
        crossOrigin="anonymous"
        async
      ></Giscus>
    </Layout>
  );
}

export function Head({ data, pageContext }) {
  const siteTitle = get(data, "site.siteMetadata.title");
  const siteUrl = get(data, "site.siteMetadata.siteUrl");
  const post = data.mdx;
  const title = `${post.frontmatter.title} | ${siteTitle}`;
  let url = "https://www.vojtechruzicka.com" + post.frontmatter.path;
  if (!url.endsWith("/")) {
    url = url + "/";
  }

  let dateModified = post.frontmatter.dateModified;
  if (!dateModified) {
    dateModified = post.frontmatter.date;
  }

  const schemaOrgJSONLD = [
    {
      "@context": "http://schema.org",
      "@type": "BlogPosting",
      url: siteUrl + post.frontmatter.path,
      image:
        siteUrl + post.frontmatter.featuredImage.childImageSharp.original.src,
      datePublished: post.frontmatter.date,
      dateCreated: post.frontmatter.date,
      dateModified: dateModified,
      headline: post.frontmatter.title,
      description: post.frontmatter.excerpt,
      mainEntityOfPage: siteUrl + post.frontmatter.path,
      author: {
        "@type": "Person",
        name: "Vojtech Ruzicka",
        email: "vojtech.ruz@gmail.com",
        image: profilePic,
        jobTitle: "Full-Stack Software Developer",
        birthDate: "1986.07.27",
        url: "https://www.vojtechruzicka.com/",
        birthPlace: "Czech Republic, Prague",
        sameAs: [
          "https://www.facebook.com/vojtechruzickablog",
          "https://www.linkedin.com/in/vojtechruzicka",
          "https://twitter.com/vojtechruzicka",
        ],
      },
      publisher: {
        "@type": "Person",
        name: "Vojtech Ruzicka",
        email: "vojtech.ruz@gmail.com",
        image: profilePic,
        birthDate: "1986.07.27",
        url: "https://www.vojtechruzicka.com/",
        birthPlace: "Czech Republic, Prague",
        sameAs: [
          "https://www.facebook.com/vojtechruzickablog",
          "https://www.linkedin.com/in/vojtechruzicka",
          "https://twitter.com/vojtechruzicka",
        ],
      },
    },
  ];

  return (
    <>
      <title>{title}</title>
      <meta name="description" content={post.frontmatter.excerpt} />
      <html lang="en" />
      <link rel="icon" type="image/png" href="/favicon.png" />
      <meta property="og:title" content={post.frontmatter.title} />
      <meta property="og:description" content={post.frontmatter.excerpt} />
      <meta
        property="og:image"
        content={
          siteUrl + post.frontmatter.featuredImage.childImageSharp.original.src
        }
      />
      <meta property="og:url" content={url} />
      <meta property="og:site_name" content={siteTitle} />
      <meta property="og:type" content="article" />
      <meta property="og:locale" content="en_US" />
      <meta property="fb:app_id" content="2072264049710958" />

      <meta name="twitter:creator" content="@vojtechruzicka" />
      <meta name="twitter:site" content="@vojtechruzicka" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={post.frontmatter.title} />
      <meta name="twitter:description" content={post.frontmatter.excerpt} />
      <meta
        name="twitter:image"
        content={
          siteUrl + post.frontmatter.featuredImage.childImageSharp.original.src
        }
      />

      <script type="application/ld+json">
        {JSON.stringify(schemaOrgJSONLD)}
      </script>
    </>
  );
}

export default BlogPostTemplate;

export const pageQuery = graphql`
  query BlogPostBySlug($slug: String!) {
    site {
      siteMetadata {
        title
        author
        siteUrl
      }
    }
    allAuthorsJson {
      edges {
        node {
          name
          avatar
          homepage
          bio
        }
      }
    }
    mdx(frontmatter: { path: { eq: $slug } }) {
      id
      frontmatter {
        excerpt
        title
        date(formatString: "MMM DD, YYYY")
        dateModified(formatString: "MMM DD, YYYY")
        tags
        featuredImage {
          childImageSharp {
            gatsbyImageData(layout: CONSTRAINED, formats: [AUTO, WEBP, AVIF])
            original {
              src
            }
          }
        }
        path
        author
      }
    }
  }
`;
