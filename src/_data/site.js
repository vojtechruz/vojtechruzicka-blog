import { isLocalDevelopment, isPreview } from '../../config/env-utils.js';

const getGiscusTheme = () => {
  if (isLocalDevelopment()) {
    return 'https://posts-arcade-sender-volvo.trycloudflare.com/styles/giscus-theme.css';
  }
  if (isPreview()) {
    // Return absolute URL for previews too, as Giscus might require it
    // CF_PAGES_URL is provided by Cloudflare Pages
    const baseUrl = process.env.CF_PAGES_URL || '';
    if (baseUrl) {
      return `${baseUrl}/styles/giscus-theme.css`;
    }
    return '/styles/giscus-theme.css';
  }
  return 'https://www.vojtechruzicka.com/styles/giscus-theme.css';
};

export default {
  title: "Vojtech Ruzicka's Programming Blog",
  description:
    'Blog about Full-stack Software Development. Clean code, Design patterns, Java, Spring, Javascript, Angular, React and more.',
  url: 'https://www.vojtechruzicka.com',
  author: 'Vojtech Ruzicka',

  sameAs: [
    'https://github.com/vojtechruz',
    'https://www.linkedin.com/in/vojtechruzicka/',
    'https://bsky.app/profile/vojtechruzicka.com',
    'https://twitter.com/vojtechruzicka',
  ],

  person: {
    name: 'Vojtech Ruzicka',
    birthDate: '1986.07.27',
    image: '/images/vojtech.jpg', // TODO
    url: 'https://www.vojtechruzicka.com/about/',
    jobTitle: 'Full-Stack Software Developer',
    sameAs: [
      // overrides/extends site.sameAs for Person
      'https://github.com/vojtechruz',
      'https://www.linkedin.com/in/vojtechruzicka/',
      'https://bsky.app/profile/vojtechruzicka.com',
      'https://twitter.com/vojtechruzicka',
    ],
    email: 'vojtech.ruz@gmail.com',
  },

  plausible: {
    domain: 'vojtechruzicka.com',
    scriptUrl: 'https://plausible.io/js/script.js',
  },

  defaultShareImage: '/images/default-share.png', //TODO
  twitter: '@vojtechruzicka',
  maxRelatedPosts: 5,
  lang: 'en',
  giscus: {
    repo: 'vojtechruz/vojtechruzicka-blog',
    repoId: 'MDEwOlJlcG9zaXRvcnkxMjIyMzQ4MTY=',
    category: 'Gisqus Comments',
    categoryId: 'DIC_kwDOB0knwM4CZvj3',
    theme: getGiscusTheme(),
  },
  social: [
    {
      name: 'RSS',
      url: 'https://www.vojtechruzicka.com/feed/',
      icon: 'icons/rss.njk',
      title: 'Subscribe to RSS feed',
    },
    {
      name: 'Mastodon',
      url: 'https://mastodon.social/@vojtechruzicka',
      icon: 'icons/mastodon.njk',
      title: 'View my Mastodon profile',
      rel: 'me',
    },
    {
      name: 'LinkedIn',
      url: 'https://www.linkedin.com/in/vojtechruzicka',
      icon: 'icons/linkedin.njk',
      title: 'View my LinkedIn profile',
    },
    {
      name: 'GitHub',
      url: 'https://github.com/vojtechruz',
      icon: 'icons/github.njk',
      title: 'View my GitHub profile',
    },
  ],
};
