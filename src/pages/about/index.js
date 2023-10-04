import React from "react";
import get from "lodash/get";
import profilePic from "../../components/profile-big.jpg";
import { OutboundLink } from "gatsby-plugin-google-gtag";
import Layout from "../../components/layout";
import { graphql } from "gatsby";

class AboutPage extends React.Component {
  render() {
    const twitterIcon = (
      <svg
        className="about-icon"
        xmlns="https://www.w3.org/2000/svg"
        viewBox="0 0 512 512"
      >
        <path d="M459.37 151.716c.325 4.548.325 9.097.325 13.645 0 138.72-105.583 298.558-298.558 298.558-59.452 0-114.68-17.219-161.137-47.106 8.447.974 16.568 1.299 25.34 1.299 49.055 0 94.213-16.568 130.274-44.832-46.132-.975-84.792-31.188-98.112-72.772 6.498.974 12.995 1.624 19.818 1.624 9.421 0 18.843-1.3 27.614-3.573-48.081-9.747-84.143-51.98-84.143-102.985v-1.299c13.969 7.797 30.214 12.67 47.431 13.319-28.264-18.843-46.781-51.005-46.781-87.391 0-19.492 5.197-37.36 14.294-52.954 51.655 63.675 129.3 105.258 216.365 109.807-1.624-7.797-2.599-15.918-2.599-24.04 0-57.828 46.782-104.934 104.934-104.934 30.213 0 57.502 12.67 76.67 33.137 23.715-4.548 46.456-13.32 66.599-25.34-7.798 24.366-24.366 44.833-46.132 57.827 21.117-2.273 41.584-8.122 60.426-16.243-14.292 20.791-32.161 39.308-52.628 54.253z" />
      </svg>
    );

    const emailIcon = (
      <svg
        className="about-icon"
        xmlns="https://www.w3.org/2000/svg"
        viewBox="0 25 512 400"
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

    const linkedInIcon = (
      <svg
        className="about-icon"
        xmlns="https://www.w3.org/2000/svg"
        viewBox="0 0 448 512"
      >
        <path d="M100.3 480H7.4V180.9h92.9V480zM53.8 140.1C24.1 140.1 0 115.5 0 85.8 0 56.1 24.1 32 53.8 32c29.7 0 53.8 24.1 53.8 53.8 0 29.7-24.1 54.3-53.8 54.3zM448 480h-92.7V334.4c0-34.7-.7-79.2-48.3-79.2-48.3 0-55.7 37.7-55.7 76.7V480h-92.8V180.9h89.1v40.8h1.3c12.4-23.5 42.7-48.3 87.9-48.3 94 0 111.3 61.9 111.3 142.3V480z" />
      </svg>
    );
    const stackOverflowIcon = (
      <svg
        className="about-icon"
        xmlns="https://www.w3.org/2000/svg"
        viewBox="0 0 384 512"
      >
        <path d="M293.7 300l-181.2-84.5 16.7-36.5 181.3 84.7-16.8 36.3zm48-76L188.2 95.7l-25.5 30.8 153.5 128.3 25.5-30.8zm39.6-31.7L262 32l-32 24 119.3 160.3 32-24zM290.7 311L95 269.7 86.8 309l195.7 41 8.2-39zm31.6 129H42.7V320h-40v160h359.5V320h-40v120zm-39.8-80h-200v39.7h200V360z" />
      </svg>
    );

    const githubIcon = (
      <svg
        className="about-icon"
        xmlns="https://www.w3.org/2000/svg"
        viewBox="0 0 496 512"
      >
        <path d="M165.9 397.4c0 2-2.3 3.6-5.2 3.6-3.3.3-5.6-1.3-5.6-3.6 0-2 2.3-3.6 5.2-3.6 3-.3 5.6 1.3 5.6 3.6zm-31.1-4.5c-.7 2 1.3 4.3 4.3 4.9 2.6 1 5.6 0 6.2-2s-1.3-4.3-4.3-5.2c-2.6-.7-5.5.3-6.2 2.3zm44.2-1.7c-2.9.7-4.9 2.6-4.6 4.9.3 2 2.9 3.3 5.9 2.6 2.9-.7 4.9-2.6 4.6-4.6-.3-1.9-3-3.2-5.9-2.9zM244.8 8C106.1 8 0 113.3 0 252c0 110.9 69.8 205.8 169.5 239.2 12.8 2.3 17.3-5.6 17.3-12.1 0-6.2-.3-40.4-.3-61.4 0 0-70 15-84.7-29.8 0 0-11.4-29.1-27.8-36.6 0 0-22.9-15.7 1.6-15.4 0 0 24.9 2 38.6 25.8 21.9 38.6 58.6 27.5 72.9 20.9 2.3-16 8.8-27.1 16-33.7-55.9-6.2-112.3-14.3-112.3-110.5 0-27.5 7.6-41.3 23.6-58.9-2.6-6.5-11.1-33.3 2.6-67.9 20.9-6.5 69 27 69 27 20-5.6 41.5-8.5 62.8-8.5s42.8 2.9 62.8 8.5c0 0 48.1-33.6 69-27 13.7 34.7 5.2 61.4 2.6 67.9 16 17.7 25.8 31.5 25.8 58.9 0 96.5-58.9 104.2-114.8 110.5 9.2 7.9 17 22.9 17 46.4 0 33.7-.3 75.4-.3 83.6 0 6.5 4.6 14.4 17.3 12.1C428.2 457.8 496 362.9 496 252 496 113.3 383.5 8 244.8 8zM97.2 352.9c-1.3 1-1 3.3.7 5.2 1.6 1.6 3.9 2.3 5.2 1 1.3-1 1-3.3-.7-5.2-1.6-1.6-3.9-2.3-5.2-1zm-10.8-8.1c-.7 1.3.3 2.9 2.3 3.9 1.6 1 3.6.7 4.3-.7.7-1.3-.3-2.9-2.3-3.9-2-.6-3.6-.3-4.3.7zm32.4 35.6c-1.6 1.3-1 4.3 1.3 6.2 2.3 2.3 5.2 2.6 6.5 1 1.3-1.3.7-4.3-1.3-6.2-2.2-2.3-5.2-2.6-6.5-1zm-11.4-14.7c-1.6 1-1.6 3.6 0 5.9 1.6 2.3 4.3 3.3 5.6 2.3 1.6-1.3 1.6-3.9 0-6.2-1.4-2.3-4-3.3-5.6-2z" />
      </svg>
    );

    const facebookIcon = (
      <svg
        className="about-icon"
        xmlns="https://www.w3.org/2000/svg"
        viewBox="0 0 264 512"
      >
        <path d="M76.7 512V283H0v-91h76.7v-71.7C76.7 42.4 124.3 0 193.8 0c33.3 0 61.9 2.5 70.2 3.6V85h-48.2c-37.8 0-45.1 18-45.1 44.3V192H256l-11.7 91h-73.6v229" />
      </svg>
    );

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
                {twitterIcon}Follow @vojtechruzicka
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
            <li>
              <OutboundLink href="https://www.facebook.com/vojtechruzickablog">
                {facebookIcon}Facebook page
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
