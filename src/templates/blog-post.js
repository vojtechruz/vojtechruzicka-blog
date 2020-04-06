import React from "react";
import Helmet from "react-helmet";
import get from "lodash/get";
import Disqus from "disqus-react";
import Bio from "../components/Bio";
import {rhythm, scale} from "../utils/typography";
import Tags from "../components/Tags";
import {Link} from "gatsby";
import {
    FacebookShareButton,
    LinkedinShareButton,
    TwitterShareButton,
    RedditShareButton,
    TumblrShareButton,
    EmailShareButton,
    FacebookIcon,
    TwitterIcon,
    RedditIcon,
    LinkedinIcon,
    TumblrIcon,
    EmailIcon
} from "react-share";
import {OutboundLink} from "gatsby-plugin-google-analytics";
import Layout from "../components/layout"
import {graphql} from "gatsby";
import profilePic from "../components/profile-big.jpg";

class BlogPostTemplate extends React.Component {
    render() {
        const post = this.props.data.markdownRemark;
        const siteTitle = get(this.props, "data.site.siteMetadata.title");
        const siteUrl = get(this.props, "data.site.siteMetadata.siteUrl");
        const shareIconSize = 32;
        const authors = get(this.props, "data.allAuthorsJson.edges").map(edge => edge.node);
        let author;

        if(post.frontmatter.author) {
            author = authors.find(author => {
                return author.name === post.frontmatter.author;
            });
        } else {
            author = authors[0];
        }

        const disqusShortname = "vojtech-ruzickas-programming-blog";
        let url = "https://www.vojtechruzicka.com" + post.frontmatter.path;
        if (!url.endsWith("/")) {
            url = url + "/";
        }
        let disqusArticleIdentifier;
        if (post.frontmatter.disqusArticleIdentifier) {
            disqusArticleIdentifier = post.frontmatter.disqusArticleIdentifier;
        } else {
            disqusArticleIdentifier = post.frontmatter.path;
        }
        const disqusConfig = {
            url: url,
            identifier: disqusArticleIdentifier,
            title: post.frontmatter.title
        };
        let disqus = null;
        if (typeof window !== "undefined") {
            disqus = (
                <Disqus.DiscussionEmbed
                    shortname={disqusShortname}
                    config={disqusConfig}
                />
            );
        }
        const relatedPosts = this.props.pageContext.related;
        let similarPosts = null;
        if (relatedPosts && relatedPosts.length > 0) {
            similarPosts = (
                <div className="similar-posts">
                    <hr/>
                    <p>
                        <strong>Similar posts:</strong>
                    </p>
                    <ul>
                        {relatedPosts.map((post, index) => {
                            let path = post.node.frontmatter.path;
                            if (!path.endsWith("/")) {
                                path = path + "/";
                            }

                            return (
                                <li key={path}>
                                    <Link to={path}>
                                        {post.node.frontmatter.title}
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            );
        }

        const twitterIcon = (
            <svg
                className="about-icon"
                xmlns="https://www.w3.org/2000/svg"
                viewBox="0 0 512 512"
            >
                <path
                    d="M459.37 151.716c.325 4.548.325 9.097.325 13.645 0 138.72-105.583 298.558-298.558 298.558-59.452 0-114.68-17.219-161.137-47.106 8.447.974 16.568 1.299 25.34 1.299 49.055 0 94.213-16.568 130.274-44.832-46.132-.975-84.792-31.188-98.112-72.772 6.498.974 12.995 1.624 19.818 1.624 9.421 0 18.843-1.3 27.614-3.573-48.081-9.747-84.143-51.98-84.143-102.985v-1.299c13.969 7.797 30.214 12.67 47.431 13.319-28.264-18.843-46.781-51.005-46.781-87.391 0-19.492 5.197-37.36 14.294-52.954 51.655 63.675 129.3 105.258 216.365 109.807-1.624-7.797-2.599-15.918-2.599-24.04 0-57.828 46.782-104.934 104.934-104.934 30.213 0 57.502 12.67 76.67 33.137 23.715-4.548 46.456-13.32 66.599-25.34-7.798 24.366-24.366 44.833-46.132 57.827 21.117-2.273 41.584-8.122 60.426-16.243-14.292 20.791-32.161 39.308-52.628 54.253z"/>
            </svg>
        );

        const emailIcon = (
            <svg
                className="about-icon"
                xmlns="https://www.w3.org/2000/svg"
                viewBox="0 0 512 512"
            >
                <path
                    d="M502.3 190.8c3.9-3.1 9.7-.2 9.7 4.7V400c0 26.5-21.5 48-48 48H48c-26.5 0-48-21.5-48-48V195.6c0-5 5.7-7.8 9.7-4.7 22.4 17.4 52.1 39.5 154.1 113.6 21.1 15.4 56.7 47.8 92.2 47.6 35.7.3 72-32.8 92.3-47.6 102-74.1 131.6-96.3 154-113.7zM256 320c23.2.4 56.6-29.2 73.4-41.4 132.7-96.3 142.8-104.7 173.4-128.7 5.8-4.5 9.2-11.5 9.2-18.9v-19c0-26.5-21.5-48-48-48H48C21.5 64 0 85.5 0 112v19c0 7.4 3.4 14.3 9.2 18.9 30.6 23.9 40.7 32.4 173.4 128.7 16.8 12.2 50.2 41.8 73.4 41.4z"/>
            </svg>
        );

        const rssIcon = (
            <svg
                className="about-icon"
                xmlns="https://www.w3.org/2000/svg"
                viewBox="0 0 448 512"
            >
                <path
                    d="M128.081 415.959c0 35.369-28.672 64.041-64.041 64.041S0 451.328 0 415.959s28.672-64.041 64.041-64.041 64.04 28.673 64.04 64.041zm175.66 47.25c-8.354-154.6-132.185-278.587-286.95-286.95C7.656 175.765 0 183.105 0 192.253v48.069c0 8.415 6.49 15.472 14.887 16.018 111.832 7.284 201.473 96.702 208.772 208.772.547 8.397 7.604 14.887 16.018 14.887h48.069c9.149.001 16.489-7.655 15.995-16.79zm144.249.288C439.596 229.677 251.465 40.445 16.503 32.01 7.473 31.686 0 38.981 0 48.016v48.068c0 8.625 6.835 15.645 15.453 15.999 191.179 7.839 344.627 161.316 352.465 352.465.353 8.618 7.373 15.453 15.999 15.453h48.068c9.034-.001 16.329-7.474 16.005-16.504z"/>
            </svg>
        );

        let dateModified = post.frontmatter.dateModified;
        if (!dateModified) {
            dateModified = post.frontmatter.date;
        }

        const schemaOrgJSONLD = [
            {
                "@context": "http://schema.org",
                "@type": "BlogPosting",
                "url": siteUrl + this.props.pageContext.slug,
                "image": siteUrl + post.frontmatter.featuredImage.childImageSharp.fluid.originalImg,
                "datePublished": post.frontmatter.date,
                "dateCreated": post.frontmatter.date,
                "dateModified": dateModified,
                "headline": post.frontmatter.title,
                "description": post.frontmatter.excerpt,
                "mainEntityOfPage": siteUrl + this.props.pageContext.slug,
                "author": {
                    "@type": "Person",
                    "name": "Vojtech Ruzicka",
                    "email": "vojtech.ruz@gmail.com",
                    "image": profilePic,
                    "jobTitle": "Full-Stack Software Developer",
                    "birthDate": "1986.07.27",
                    "url": "https://www.vojtechruzicka.com/",
                    "birthPlace": "Czech Republic, Prague",
                    "sameAs": [
                        "https://www.facebook.com/vojtechruzickablog",
                        "https://www.linkedin.com/in/vojtechruzicka",
                        "https://twitter.com/vojtechruzicka"
                    ]
                },
                "publisher": {
                    "@type": "Person",
                    "name": "Vojtech Ruzicka",
                    "email": "vojtech.ruz@gmail.com",
                    "image": profilePic,
                    "birthDate": "1986.07.27",
                    "url": "https://www.vojtechruzicka.com/",
                    "birthPlace": "Czech Republic, Prague",
                    "sameAs": [
                        "https://www.facebook.com/vojtechruzickablog",
                        "https://www.linkedin.com/in/vojtechruzicka",
                        "https://twitter.com/vojtechruzicka"
                    ]
                },
            }
        ];

        let lastUpdated;
        if (post.frontmatter.dateModified) {
            lastUpdated = (<div>Last Updated: {dateModified}</div>);
        }

        return (
            <Layout>
                <Helmet title={`${post.frontmatter.title} | ${siteTitle}`}>
                    <meta name="description" content={post.frontmatter.excerpt}/>

                    <meta property="og:title" content={post.frontmatter.title}/>
                    <meta property="og:description" content={post.frontmatter.excerpt}/>
                    <meta
                        property="og:image"
                        content={
                            siteUrl +
                            post.frontmatter.featuredImage.childImageSharp.fluid.originalImg
                        }
                    />
                    <meta property="og:url" content={url}/>
                    <meta property="og:site_name" content={siteTitle}/>
                    <meta property="og:type" content="article"/>
                    <meta property="og:locale" content="en_US"/>
                    <meta property="fb:app_id" content="2072264049710958"/>

                    <meta name="twitter:creator" content="@vojtechruzicka"/>
                    <meta name="twitter:site" content="@vojtechruzicka"/>
                    <meta name="twitter:card" content="summary_large_image"/>
                    <meta name="twitter:title" content={post.frontmatter.title}/>
                    <meta name="twitter:description" content={post.frontmatter.excerpt}/>
                    <meta
                        name="twitter:image"
                        content={
                            siteUrl +
                            post.frontmatter.featuredImage.childImageSharp.fluid.originalImg
                        }
                    />

                    <script type="application/ld+json">
                        {JSON.stringify(schemaOrgJSONLD)}
                    </script>
                </Helmet>
                {/*This class marks contents searchable by algolia docs search*/}
                <div className="docSearch-content">
                    <h1>{post.frontmatter.title}</h1>
                    <div
                        style={{
                            ...scale(-1 / 5),
                            display: "block",
                            marginBottom: rhythm(1),
                            marginTop: rhythm(-1)
                        }}
                    >
                        <span className="date-published">{post.frontmatter.date}</span>
                        <Tags tags={post.frontmatter.tags}/>
                        {lastUpdated}
                    </div>


                    {/*<div className="toc">*/}
                    {/*    <h4>Contents</h4>*/}
                    {/*    <div className="toc-list" dangerouslySetInnerHTML={{__html: post.tableOfContents}}/>*/}
                    {/*</div>*/}

                    {/*Feature image needs to be part of the article otherwise sites such as pocket and feedly wont load proper image*/}
                    <div id="article-content" dangerouslySetInnerHTML={{__html: post.html}}/>

                </div>
                <hr
                    style={{
                        marginBottom: rhythm(1)
                    }}
                />
                <div className="bottom-post-tags">
                    <span>Tagged with: </span>
                    <Tags tags={post.frontmatter.tags}/>
                </div>
                <Bio author={author}/>
                <hr/>
                <div class="social">
                    <p>
                        <strong>
                            Get notifications about new posts on{" "}
                            <OutboundLink href="https://twitter.com/vojtechruzicka">
                                {twitterIcon}Twitter
                            </OutboundLink>,{" "}
                            <OutboundLink href="https://www.vojtechruzicka.com/feed/">
                                {rssIcon}RSS
                            </OutboundLink>{" "}
                            or{" "}
                            <OutboundLink href="https://eepurl.com/bZ0waf">
                                {emailIcon}Email
                            </OutboundLink>.
                        </strong>
                    </p>
                    <div className="share-icons">
                        <FacebookShareButton
                            url={siteUrl + this.props.pageContext.slug}
                            additionalProps={{"aria-label": "Facebook share button"}}
                        >
                            <FacebookIcon round size={shareIconSize}/>
                        </FacebookShareButton>
                        <TwitterShareButton
                            url={siteUrl + this.props.pageContext.slug}
                            additionalProps={{"aria-label": "Twitter share button"}}
                        >
                            <TwitterIcon round size={shareIconSize}/>
                        </TwitterShareButton>
                        <LinkedinShareButton
                            url={siteUrl + this.props.pageContext.slug}
                            additionalProps={{"aria-label": "LinkedIn share button"}}
                        >
                            <LinkedinIcon round size={shareIconSize}/>
                        </LinkedinShareButton>
                        <RedditShareButton
                            url={siteUrl + this.props.pageContext.slug}
                            additionalProps={{"aria-label": "Reddit share button"}}
                        >
                            <RedditIcon round size={shareIconSize}/>
                        </RedditShareButton>
                        <TumblrShareButton
                            url={siteUrl + this.props.pageContext.slug}
                            additionalProps={{"aria-label": "Tumblr share button"}}
                        >
                            <TumblrIcon round size={shareIconSize}/>
                        </TumblrShareButton>
                        <EmailShareButton
                            url={siteUrl + this.props.pageContext.slug}
                            additionalProps={{"aria-label": "Share by email button"}}
                        >
                            <EmailIcon round size={shareIconSize}/>
                        </EmailShareButton>
                    </div>
                </div>
                {similarPosts}
                <hr/>
                {/*TODO temporalily removing ocmments until better alternative to disqus is found*/}
                {/*{disqus}*/}
            </Layout>
        );
    }
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
    markdownRemark(fields: { slug: { eq: $slug } }) {
      id
      html
      tableOfContents(
        pathToSlugField: "frontmatter.path"
        maxDepth: 3
      )
      frontmatter {
        excerpt
        title
        date(formatString: "MMM DD, YYYY")
        dateModified(formatString: "MMM DD, YYYY")
        tags
        featuredImage {
          childImageSharp {
            fluid(maxWidth: 1000) {
              ...GatsbyImageSharpFluid_tracedSVG
              originalImg
            }
          }
        }
        disqusArticleIdentifier
        path
        author
      }
    }
  }
`;
