import React from 'react'
import Helmet from 'react-helmet'
import get from 'lodash/get'
import Disqus from 'disqus-react';
import Bio from '../components/Bio'
import { rhythm, scale } from '../utils/typography'
import Tags from "../components/Tags";
import Img from 'gatsby-image'
import Link from "gatsby-link";
import {
    FacebookShareButton,
    GooglePlusShareButton,
    LinkedinShareButton,
    TwitterShareButton,
    RedditShareButton,
    TumblrShareButton,
    EmailShareButton, FacebookIcon, GooglePlusIcon, TwitterIcon, RedditIcon, LinkedinIcon, TumblrIcon, EmailIcon,
} from 'react-share';

class BlogPostTemplate extends React.Component {
  render() {
    const post = this.props.data.markdownRemark
    const siteTitle = get(this.props, 'data.site.siteMetadata.title')
    const siteUrl = get(this.props, 'data.site.siteMetadata.siteUrl')
      const shareIconSize = 64;

      const disqusShortname = 'vojtechruzicka';
      const disqusConfig = {
          url: "http://vojtechruzicka.com"+post.frontmatter.path,
          identifier: post.frontmatter.path,
          title: post.frontmatter.title,
      };
      let disqus = null;
      if(typeof window !== 'undefined') {
          disqus = <Disqus.DiscussionEmbed shortname={disqusShortname} config={disqusConfig}/>
      }
       const relatedPosts = this.props.pathContext.related;
      let similarPosts = null;
      if(relatedPosts && relatedPosts.length > 0) {
          similarPosts = (<div className="similar-posts">
              <hr/>
              <p><strong>Similar posts:</strong></p>
              <ul>
                  {
                      relatedPosts.map((post, index) => {
                          console.log(JSON.stringify(post.node.frontmatter))
                          return <li key={post.node.frontmatter.path}><Link to={post.node.frontmatter.path}>{post.node.frontmatter.title}</Link></li>;
                      })
                  }
              </ul>
          </div>)
      }

    return (
      <div>
          <Helmet title={`${post.frontmatter.title} | ${siteTitle}`}>
              <meta property="og:type" content="summary_large_image" />
              <meta property="og:title" content={post.frontmatter.title} />
              <meta property="og:description" content={post.excerpt} />
              <meta property="og:image" content={siteUrl + post.frontmatter.featuredImage.childImageSharp.sizes.originalImg} />

              <meta name="twitter:creator" content="@vojtechruzicka" />
              <meta name="twitter:site" content="@vojtechruzicka" />
          </Helmet>
        <h1>{post.frontmatter.title}</h1>
        <p
          style={{
            ...scale(-1 / 5),
            display: 'block',
            marginBottom: rhythm(1),
            marginTop: rhythm(-1),
          }}
        >
          {post.frontmatter.date}
        </p>
        <Img sizes={post.frontmatter.featuredImage.childImageSharp.sizes} />
        <div dangerouslySetInnerHTML={{ __html: post.html }} />
        <hr
          style={{
            marginBottom: rhythm(1),
          }}
        />
        <span>Tagged with: </span>
        <Tags tags={post.frontmatter.tags} />
        <Bio />
        <hr/>
        <div>
            <p><strong>Did you like this post?</strong></p>
            <p>Get notifications about new posts:</p>
            <p>And share it:</p>
            <div>
                <FacebookShareButton url={siteUrl + this.props.pathContext.slug}>
                    <FacebookIcon round size={shareIconSize} />
                </FacebookShareButton>
                <GooglePlusShareButton url={siteUrl + this.props.pathContext.slug}>
                    <GooglePlusIcon round size={shareIconSize} />
                </GooglePlusShareButton>
                <TwitterShareButton url={siteUrl + this.props.pathContext.slug}>
                    <TwitterIcon round size={shareIconSize}/>
                </TwitterShareButton>
                <LinkedinShareButton url={siteUrl + this.props.pathContext.slug}>
                    <LinkedinIcon round size={shareIconSize}/>
                </LinkedinShareButton>
                <RedditShareButton url={siteUrl + this.props.pathContext.slug}>
                    <RedditIcon round size={shareIconSize}/>
                </RedditShareButton>
                <TumblrShareButton url={siteUrl + this.props.pathContext.slug}>
                    <TumblrIcon round size={shareIconSize}/>
                </TumblrShareButton>
                <EmailShareButton url={siteUrl + this.props.pathContext.slug}>
                    <EmailIcon round size={shareIconSize}/>
                </EmailShareButton>
            </div>
        </div>
        {similarPosts}
        <hr/>
        {disqus}
      </div>
    )
  }
}

export default BlogPostTemplate

export const pageQuery = graphql`
  query BlogPostBySlug($slug: String!) {
    site {
      siteMetadata {
        title
        author
        siteUrl
      }
    }
    markdownRemark(fields: { slug: { eq: $slug } }) {
      id
      html
      excerpt
      frontmatter {
        title
        date(formatString: "MMMM DD, YYYY")
        tags
        featuredImage {
            childImageSharp {
                sizes(maxWidth: 1000) {
                    ...GatsbyImageSharpSizes_tracedSVG
                    originalImg
                }
            }
        }
      }
    }
  }
`
