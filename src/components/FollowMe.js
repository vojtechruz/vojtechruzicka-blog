import React from "react";
import { OutboundLink } from "gatsby-plugin-google-gtag";

class FollowMe extends React.Component {
  render() {
    const twitterIcon = (
      <div className="follow-me-icon twitter" title="Follow me on X">
        <OutboundLink
          aria-label="Twitter link"
          target="blank"
          href="https://twitter.com/vojtechruzicka"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 50 50"
            width="512px"
            height="512px"
          >
            <path d="M 6.9199219 6 L 21.136719 26.726562 L 6.2285156 44 L 9.40625 44 L 22.544922 28.777344 L 32.986328 44 L 43 44 L 28.123047 22.3125 L 42.203125 6 L 39.027344 6 L 26.716797 20.261719 L 16.933594 6 L 6.9199219 6 z" />
          </svg>
        </OutboundLink>
      </div>
    );

    const rssIcon = (
      <div className="follow-me-icon rss" title="Subscribe to my RSS feed">
        <OutboundLink
          aria-label="RSS Feed link"
          target="blank"
          href="https://www.vojtechruzicka.com/feed/"
        >
          <svg xmlns="https://www.w3.org/2000/svg" viewBox="0 0 448 512">
            <path d="M128.081 415.959c0 35.369-28.672 64.041-64.041 64.041S0 451.328 0 415.959s28.672-64.041 64.041-64.041 64.04 28.673 64.04 64.041zm175.66 47.25c-8.354-154.6-132.185-278.587-286.95-286.95C7.656 175.765 0 183.105 0 192.253v48.069c0 8.415 6.49 15.472 14.887 16.018 111.832 7.284 201.473 96.702 208.772 208.772.547 8.397 7.604 14.887 16.018 14.887h48.069c9.149.001 16.489-7.655 15.995-16.79zm144.249.288C439.596 229.677 251.465 40.445 16.503 32.01 7.473 31.686 0 38.981 0 48.016v48.068c0 8.625 6.835 15.645 15.453 15.999 191.179 7.839 344.627 161.316 352.465 352.465.353 8.618 7.373 15.453 15.999 15.453h48.068c9.034-.001 16.329-7.474 16.005-16.504z" />
          </svg>
        </OutboundLink>
      </div>
    );

    const feedlyIcon = (
      <div
        className="follow-me-icon feedly"
        title="Feedly: Subscribe to my RSS feed"
      >
        <OutboundLink
          aria-label="Feedly link"
          target="blank"
          href="https://feedly.com/i/subscription/feed%2Fhttps%3A%2F%2Fwww.vojtechruzicka.com%2Ffeed%2F"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="2500"
            height="2213"
            viewBox="51.622 205.389 487.385 431.346"
          >
            <path
              className="inner"
              fill="#FFF"
              d="M111.615 420.945L297.64 234.92l186.025 186.025L297.64 606.97 111.615 420.945z"
            />
            <path d="M201.837 622.782L64.179 484.193c-16.742-16.742-16.742-53.017 0-68.829l197.187-198.117c15.812-15.812 51.156-15.812 66.969 0L526.45 415.364c16.742 16.742 16.742 53.018 0 68.829L388.792 622.782c-8.371 8.371-21.393 13.952-34.415 13.952H234.392c-12.092 0-24.184-5.581-32.555-13.952zm125.567-53.947c2.791-2.79 2.791-8.371 0-11.161L300.43 530.7c-2.79-2.791-8.37-2.791-11.161 0l-26.974 26.974c-2.79 2.79-2.79 8.371 0 11.161l21.393 20.463h22.323l21.393-20.463zm0-114.405c1.86-1.86 1.86-6.511 0-8.371l-28.834-28.834c-1.859-1.86-6.51-1.86-8.37 0l-83.712 83.711c-2.79 2.791-2.79 9.302 0 12.092l19.533 19.533h22.323l79.06-78.131zm0-113.476c1.86-1.86 2.791-7.441 0-9.301L299.5 303.749c-1.86-1.86-7.44-1.86-10.231 0L148.82 444.198c-1.859 1.86-2.79 7.441-.93 9.301l22.323 21.394h21.393l135.798-133.939z" />
          </svg>
        </OutboundLink>
      </div>
    );

    const facebookIcon = (
      <div className="follow-me-icon facebook" title="Follow me on Facebook">
        <OutboundLink
          target="blank"
          aria-label="Facebook link"
          href="https://www.facebook.com/vojtechruzickablog"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
            <path d="M448 80v352c0 26.5-21.5 48-48 48h-85.3V302.8h60.6l8.7-67.6h-69.3V192c0-19.6 5.4-32.9 33.5-32.9H384V98.7c-6.2-.8-27.4-2.7-52.2-2.7-51.6 0-87 31.5-87 89.4v49.9H184v67.6h60.9V480H48c-26.5 0-48-21.5-48-48V80c0-26.5 21.5-48 48-48h352c26.5 0 48 21.5 48 48z" />
          </svg>
        </OutboundLink>
      </div>
    );

    const linkedInIcon = (
      <div className="follow-me-icon linkedin" title="My LinkedIn profile">
        <OutboundLink
          target="blank"
          aria-label="Linkedin link"
          href="https://www.linkedin.com/in/vojtechruzicka"
        >
          <svg xmlns="https://www.w3.org/2000/svg" viewBox="0 0 448 512">
            <path d="M100.3 480H7.4V180.9h92.9V480zM53.8 140.1C24.1 140.1 0 115.5 0 85.8 0 56.1 24.1 32 53.8 32c29.7 0 53.8 24.1 53.8 53.8 0 29.7-24.1 54.3-53.8 54.3zM448 480h-92.7V334.4c0-34.7-.7-79.2-48.3-79.2-48.3 0-55.7 37.7-55.7 76.7V480h-92.8V180.9h89.1v40.8h1.3c12.4-23.5 42.7-48.3 87.9-48.3 94 0 111.3 61.9 111.3 142.3V480z" />
          </svg>
        </OutboundLink>
      </div>
    );

    const githubIcon = (
      <div className="follow-me-icon github" title="My GitHub profile">
        <OutboundLink
          target="blank"
          aria-label="Github link"
          href="https://github.com/vojtechruz"
        >
          <svg
            className="about-icon"
            xmlns="https://www.w3.org/2000/svg"
            viewBox="0 0 496 512"
          >
            <path d="M165.9 397.4c0 2-2.3 3.6-5.2 3.6-3.3.3-5.6-1.3-5.6-3.6 0-2 2.3-3.6 5.2-3.6 3-.3 5.6 1.3 5.6 3.6zm-31.1-4.5c-.7 2 1.3 4.3 4.3 4.9 2.6 1 5.6 0 6.2-2s-1.3-4.3-4.3-5.2c-2.6-.7-5.5.3-6.2 2.3zm44.2-1.7c-2.9.7-4.9 2.6-4.6 4.9.3 2 2.9 3.3 5.9 2.6 2.9-.7 4.9-2.6 4.6-4.6-.3-1.9-3-3.2-5.9-2.9zM244.8 8C106.1 8 0 113.3 0 252c0 110.9 69.8 205.8 169.5 239.2 12.8 2.3 17.3-5.6 17.3-12.1 0-6.2-.3-40.4-.3-61.4 0 0-70 15-84.7-29.8 0 0-11.4-29.1-27.8-36.6 0 0-22.9-15.7 1.6-15.4 0 0 24.9 2 38.6 25.8 21.9 38.6 58.6 27.5 72.9 20.9 2.3-16 8.8-27.1 16-33.7-55.9-6.2-112.3-14.3-112.3-110.5 0-27.5 7.6-41.3 23.6-58.9-2.6-6.5-11.1-33.3 2.6-67.9 20.9-6.5 69 27 69 27 20-5.6 41.5-8.5 62.8-8.5s42.8 2.9 62.8 8.5c0 0 48.1-33.6 69-27 13.7 34.7 5.2 61.4 2.6 67.9 16 17.7 25.8 31.5 25.8 58.9 0 96.5-58.9 104.2-114.8 110.5 9.2 7.9 17 22.9 17 46.4 0 33.7-.3 75.4-.3 83.6 0 6.5 4.6 14.4 17.3 12.1C428.2 457.8 496 362.9 496 252 496 113.3 383.5 8 244.8 8zM97.2 352.9c-1.3 1-1 3.3.7 5.2 1.6 1.6 3.9 2.3 5.2 1 1.3-1 1-3.3-.7-5.2-1.6-1.6-3.9-2.3-5.2-1zm-10.8-8.1c-.7 1.3.3 2.9 2.3 3.9 1.6 1 3.6.7 4.3-.7.7-1.3-.3-2.9-2.3-3.9-2-.6-3.6-.3-4.3.7zm32.4 35.6c-1.6 1.3-1 4.3 1.3 6.2 2.3 2.3 5.2 2.6 6.5 1 1.3-1.3.7-4.3-1.3-6.2-2.2-2.3-5.2-2.6-6.5-1zm-11.4-14.7c-1.6 1-1.6 3.6 0 5.9 1.6 2.3 4.3 3.3 5.6 2.3 1.6-1.3 1.6-3.9 0-6.2-1.4-2.3-4-3.3-5.6-2z" />
          </svg>
        </OutboundLink>
      </div>
    );

    return (
      <div>
        <div className="lets-connect">
          <h4>Let's connect</h4>
        </div>
        <div className="follow-me">
          {rssIcon}
          {twitterIcon}
          {feedlyIcon}
          {facebookIcon}
          {linkedInIcon}
          {githubIcon}
        </div>
      </div>
    );
  }
}

export default FollowMe;
