export function getMetaDescription($) {
  return $('meta[name="description"]');
}

export function getMetaDescriptionContent($) {
  return $('meta[name="description"]').attr('content');
}

export function getCanonicalUrl($) {
  return $('link[rel="canonical"]').attr('href');
}

export function getOgTitle($) {
  return $('meta[property="og:title"]').attr('content');
}

export function getOgDescription($) {
  return $('meta[property="og:description"]').attr('content');
}

export function getOgImage($) {
  return $('meta[property="og:image"]').attr('content');
}

export function getOgUrl($) {
  return $('meta[property="og:url"]').attr('content');
}

export function getOgImageWidth($) {
  return $('meta[property="og:image:width"]').attr('content');
}

export function getOgImageHeight($) {
  return $('meta[property="og:image:height"]').attr('content');
}

export function getOgImageAlt($) {
  return $('meta[property="og:image:alt"]').attr('content');
}

export function getTwitterImage($) {
  return $('meta[name="twitter:image"]').attr('content');
}

export function getTwitterImageAlt($) {
  return $('meta[name="twitter:image:alt"]').attr('content');
}

export function getTwitterTitle($) {
  return $('meta[name="twitter:title"]').attr('content');
}

export function getFediverseCreator($) {
  return $('meta[name="fediverse:creator"]').attr('content');
}

export function getOgType($) {
  return $('meta[property="og:type"]').attr('content');
}

export function getTwitterCard($) {
  return $('meta[name="twitter:card"]').attr('content');
}

export function getTwitterDescription($) {
  return $('meta[name="twitter:description"]').attr('content');
}

export function getTwitterSite($) {
  return $('meta[name="twitter:site"]').attr('content');
}

export function getTwitterCreator($) {
  return $('meta[name="twitter:creator"]').attr('content');
}

export function getPageTitle($) {
  return $('title').text();
}

/** Scoped to <head> on purpose — a robots meta anywhere else is ignored by crawlers. */
export function getRobotsMeta($) {
  return $('head meta[name="robots"]').attr('content');
}
