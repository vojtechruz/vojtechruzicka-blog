import { isLocalDevelopment, isPreview } from '../../config/env-utils.js';
import { versionedAssetUrl } from '../../config/utils/asset-version.js';

const getGiscusTheme = () => {
  // /styles/* is long-cached as immutable, so the theme URL carries a content hash too
  const themePath = versionedAssetUrl('/styles/giscus-theme.css');
  if (isLocalDevelopment()) {
    return `https://posts-arcade-sender-volvo.trycloudflare.com${themePath}`;
  }
  if (isPreview()) {
    // Return absolute URL for previews too, as Giscus might require it
    // CF_PAGES_URL is provided by Cloudflare Pages
    const baseUrl = process.env.CF_PAGES_URL || '';
    if (baseUrl) {
      return `${baseUrl}${themePath}`;
    }
    return themePath;
  }
  return `https://www.vojtechruzicka.com${themePath}`;
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
    'https://mastodon.social/@vojtechruzicka',
    'https://twitter.com/vojtechruzicka',
  ],

  person: {
    name: 'Vojtech Ruzicka',
    birthDate: '1986.07.27',
    image: '/vojtech.jpg',
    url: 'https://www.vojtechruzicka.com/about/',
    jobTitle: 'Full-Stack Software Developer',
    sameAs: [
      // overrides/extends site.sameAs for Person
      'https://github.com/vojtechruz',
      'https://www.linkedin.com/in/vojtechruzicka/',
      'https://bsky.app/profile/vojtechruzicka.com',
      'https://mastodon.social/@vojtechruzicka',
      'https://twitter.com/vojtechruzicka',
    ],
    email: 'vojtech.ruz@gmail.com',
  },

  // Plausible serves a per-site script whose filename encodes the site, so preview deploys load
  // a different script than production and preview traffic stays out of the production stats.
  // These IDs come from the Plausible dashboard — the generic /js/script.js is deliberately unused.
  plausible: {
    scriptUrl: 'https://plausible.io/js/pa-xtcFmLVm-99urf6LDF4kZ.js',
    previewScriptUrl: 'https://plausible.io/js/pa-8BjKElQFX2XyqZAcaSGoy.js',
  },

  defaultShareImage: '/default-share.jpg',
  // Dimensions of the file in src/static - kept here so og:image:width/height can be emitted
  // without reading the image at build time. Update if the asset is replaced.
  defaultShareImageWidth: 1200,
  defaultShareImageHeight: 630,
  defaultShareImageAlt: 'Source code on a screen',
  twitter: '@vojtechruzicka',
  // Mastodon 4.3+ author attribution on link preview cards. Requires vojtechruzicka.com to be
  // allowlisted under Mastodon > Preferences > Public profile > Verification > Author attribution,
  // plus the rel="me" link back to the profile (already in the footer).
  fediverseCreator: '@vojtechruzicka@mastodon.social',
  maxRelatedPosts: 5,
  lang: 'en',
  giscus: {
    repo: 'vojtechruz/vojtechruzicka-blog',
    repoId: 'MDEwOlJlcG9zaXRvcnkxMjIyMzQ4MTY=',
    category: 'Giscus Comments',
    categoryId: 'DIC_kwDOB0knwM4CZvj3',
    theme: getGiscusTheme(),
  },
  social: [
    {
      name: 'RSS',
      // Relative on purpose - keeps the link inside the current environment
      // (preview deploys link to the preview feed, production to production)
      url: '/feed.xml',
      icon: 'icons/rss.njk',
      title: 'Subscribe to RSS feed',
    },
    {
      name: 'GitHub',
      url: 'https://github.com/vojtechruz',
      icon: 'icons/github.njk',
      title: 'View my GitHub profile',
    },
    {
      name: 'Bluesky',
      url: 'https://bsky.app/profile/vojtechruzicka.com',
      icon: 'icons/bluesky.njk',
      title: 'Follow me on Bluesky',
    },
    {
      name: 'X',
      url: 'https://x.com/vojtechruzicka',
      icon: 'icons/x.njk',
      title: 'Follow me on X',
    },
    {
      name: 'Mastodon',
      url: 'https://mastodon.social/@vojtechruzicka',
      icon: 'icons/mastodon.njk',
      title: 'Follow me on Mastodon',
      rel: 'me',
    },
    {
      name: 'LinkedIn',
      url: 'https://www.linkedin.com/in/vojtechruzicka',
      icon: 'icons/linkedin.njk',
      title: 'Follow me on LinkedIn',
    },
  ],
};
