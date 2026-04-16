import React from "react";
import get from "lodash/get";
import profilePic from "../../components/profile-big.jpg";
import { OutboundLink } from "gatsby-plugin-google-gtag";
import Layout from "../../components/layout";
import { graphql } from "gatsby";

class AboutPage extends React.Component {
  render() {

    return (
      <Layout>
        <div className="about-page">
          <h1>About</h1>
          <h2>Stay informed</h2>
          <h4>Get notified about the newest posts</h4>
          <ul>
            <li>
              {rssIcon}
              <OutboundLink href="https://www.vojtechruzicka.com/feed/">
                Subscribe to RSS Feed
              </OutboundLink>
            </li>
            <li>
              <OutboundLink href="https://twitter.com/vojtechruzicka">
                {twitterIcon}Follow @vojtechruzicka on X
              </OutboundLink>
            </li>
            <li>
              {emailIcon}
              <OutboundLink href="https://eepurl.com/bZ0waf">
                Receive new posts by email
              </OutboundLink>
            </li>
          </ul>
          <h2>About me</h2>
          <h4>Contact me</h4>
          <ul>
            <li>
              <OutboundLink href="mailto:vojtech.ruz@gmail.com">
                {emailIcon}vojtech.ruz@gmail.com
              </OutboundLink>
            </li>
          </ul>
          <h4>Additional links</h4>
          <ul>
            <li>
              <OutboundLink href="https://www.linkedin.com/in/vojtechruzicka">
                {linkedInIcon}LinkedIn profile
              </OutboundLink>
            </li>
            <li>
              <OutboundLink href="https://github.com/vojtechruz">
                {githubIcon}GitHub profile
              </OutboundLink>
            </li>
            <li>
              <OutboundLink href="https://stackoverflow.com/users/4560142/vojtech-ruzicka">
                {stackOverflowIcon}Stack Overflow profile
              </OutboundLink>
            </li>
          </ul>
          <h2>Found any issues?</h2>
          This whole blog and its content is available on{" "}
          <OutboundLink href="https://github.com/vojtechruz/vojtechruzicka-blog">
            GitHub
          </OutboundLink>
          . Feel free to create a Pull Request if you find some issues in the
          text or you can just check the code if you are curious about GatsbyJS
          powered blogs.
        </div>
      </Layout>
    );
  }
}
export function Head({ data }) {
  const siteTitle = get(data, "site.siteMetadata.title");
  const siteDescription = get(data, "site.siteMetadata.description");
  const siteUrl = get(data, "site.siteMetadata.siteUrl");
  const title = `About Me | ${siteTitle}`;

  return (
    <>
      <title>{title}</title>
      <meta name="description" content={siteDescription} />
      <html lang="en" />
      <link rel="icon" type="image/png" href="/favicon.png" />

      <meta property="og:title" content={title} />
      <meta property="og:description" content={siteDescription} />
      <meta property="og:image" content={siteUrl + profilePic} />
      <meta property="og:url" content={siteUrl + "/about/"} />
      <meta property="og:site_name" content={siteTitle} />
      <meta property="og:type" content="website" />
      <meta property="og:locale" content="en_US" />
      <meta property="fb:app_id" content="2072264049710958" />

      <meta name="twitter:creator" content="@vojtechruzicka" />
      <meta name="twitter:site" content="@vojtechruzicka" />
      <meta name="twitter:card" content="summary" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={siteDescription} />
    </>
  );
}

export default AboutPage;

export const pageQuery = graphql`
  query AboutQuery {
    site {
      siteMetadata {
        title
        description
        siteUrl
      }
    }
  }
`;
