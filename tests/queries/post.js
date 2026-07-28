export function getPostTitle($) {
  return $('h1.post-header');
}

export function getPostTitleText($) {
  return $('h1.post-header').text();
}

export function getPostDate($) {
  return $('.post-metadata .date-published');
}

export function getPostDateModified($) {
  return $('.post-metadata .date-modified');
}

export function getPostTopics($) {
  return $('ul.post-topics a.topic-name');
}

export function getPostTopicNames($) {
  return getPostTopics($)
    .map((_, el) => $(el).text().trim())
    .get();
}

export function getPostTopicHrefs($) {
  return getPostTopics($)
    .map((_, el) => $(el).attr('href'))
    .get();
}

export function getPostContent($) {
  return $('article');
}

export function getPostExcerpt($) {
  return $('.post-header-excerpt').text().trim();
}

export function getFeaturedImage($) {
  return $('img.post-header-featured-image');
}
