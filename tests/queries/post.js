export function getPostTitle($) {
  return $('h1.post-title');
}

export function getPostTitleText($) {
  return $('h1.post-title').text();
}

export function getPostDate($) {
  return $('time.post-date, .post-date time');
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
  return $('article, .post-content');
}

export function getPostExcerpt($) {
  return $('meta[name="description"]').attr('content');
}

export function getFeaturedImage($) {
  return $('img.post-featured-image, .post-featured-image img');
}
