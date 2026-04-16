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
import Video from "../components/Video";
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
    Video,
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
          <OutboundLink href="https://www.vojtechruzicka.com/feed.xml">
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
        reactionsEnabled="0"
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
