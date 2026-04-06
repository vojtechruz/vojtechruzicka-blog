export function getPostTitle($) {
  return $('h1.post-title');
}

export function getPostTitleText($) {
  return $('h1.post-title').text();
}

export function getPostDate($) {
  return $('time.post-date, .post-date time');
}

export function getPostTags($) {
  return $('ul.post-tags a.tag-name');
}

export function getPostTagNames($) {
  return getPostTags($)
    .map((_, el) => $(el).text().trim())
    .get();
}

export function getPostTagHrefs($) {
  return getPostTags($)
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
