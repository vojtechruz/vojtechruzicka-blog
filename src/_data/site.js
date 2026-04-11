export default {
  title: "Vojtech Ruzicka's Programming Blog",
  description:
    "Blog about Full-stack Software Development. Clean code, Design patterns, Java, Spring, Javascript, Angular, React and more.",
  url: "https://www.vojtechruzicka.com",
  author: "Vojtech Ruzicka",

  sameAs: [
    "https://github.com/vojtechruz",
    "https://www.linkedin.com/in/vojtechruzicka/",
    "https://bsky.app/profile/vojtechruzicka.com",
    "https://www.facebook.com/vojtechruzickablog",
    "https://twitter.com/vojtechruzicka",
  ],

  person: {
    name: "Vojtech Ruzicka",
    birthDate: "1986.07.27",
    image: "/images/vojtech.jpg",        // TODO
    url: "https://www.vojtechruzicka.com/about/",
    jobTitle: "Full-Stack Software Developer",
    sameAs: [                            // overrides/extends site.sameAs for Person
      "https://github.com/vojtechruz",
      "https://www.linkedin.com/in/vojtechruzicka/",
      "https://bsky.app/profile/vojtechruzicka.com",
      "https://www.facebook.com/vojtechruzickablog",
      "https://twitter.com/vojtechruzicka",
    ],
    email: "vojtech.ruz@gmail.com",
  },

  defaultShareImage: "/images/default-share.png",//TODO
  twitter: "@vojtechruzicka",
  maxRelatedPosts: 5,
  lang: "en",
  giscus: {
    repo: "vojtechruz/vojtechruzicka-blog",
    repoId: "MDEwOlJlcG9zaXRvcnkxMjIyMzQ4MTY=",
    category: "Gisqus Comments",
    categoryId: "DIC_kwDOB0knwM4CZvj3",
    theme: (process.env.ELEVENTY_RUN_MODE === "serve")
      ? "https://posts-arcade-sender-volvo.trycloudflare.com/styles/giscus-theme.css"
      : "https://www.vojtechruzicka.com/styles/giscus-theme.css"
  },
  social: [
    {
      name: "RSS",
      url: "https://www.vojtechruzicka.com/feed/",
      icon: "icons/rss.njk",
      title: "Subscribe to RSS feed",
    },
    {
      name: "Mastodon",
      url: "https://mastodon.social/@vojtechruzicka",
      icon: "icons/mastodon.njk",
      title: "View my Mastodon profile",
      rel: "me",
    },
    {
      name: "LinkedIn",
      url: "https://www.linkedin.com/in/vojtechruzicka",
      icon: "icons/linkedin.njk",
      title: "View my LinkedIn profile",
    },
    {
      name: "GitHub",
      url: "https://github.com/vojtechruz",
      icon: "icons/github.njk",
      title: "View my GitHub profile",
    },
  ],
};
