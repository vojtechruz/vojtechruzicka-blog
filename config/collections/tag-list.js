// Alphabetically ordered list of unique tags across all posts (excluding drafts)
import { shouldIncludeDraft } from "../draft-utils.js";

export default function registerTagListCollection(eleventyConfig) {
  eleventyConfig.addCollection("tagList", function (collectionApi) {
    const tagsSet = new Set();
    collectionApi.getAll().forEach((item) => {
      if (!shouldIncludeDraft(item.data.draftStatus)) {
        return;
      }

      if ("tags" in item.data) {
        const tags = item.data.tags;
        if (Array.isArray(tags)) {
          tags.forEach((tag) => tagsSet.add(tag));
        }
      }
    });
    return [...tagsSet].sort();
  });
}
