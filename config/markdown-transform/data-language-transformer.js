/**
 * Eleventy / Shiki transformer that adds a `data-language` attribute to each
 * highlighted <pre> element based on the detected fenced code block language.
 *
 * Primary purpose:
 * - Allows styling based on the language (e.g. language badges via CSS ::before)
 *
 * Additional benefits:
 * - Enables CSS/JS targeting for specific languages
 * - Provides a consistent fallback for blocks without a detected language
 * - Can be used by other transforms or runtime features (copy buttons, analytics, etc.)
 *
 * Example usage in CSS:
 *   pre[data-language="js"]::before { content: "JavaScript"; }
 */
export const dataLanguageTransformer = {
  name: "data-language",
  pre() {
    // this.options.lang is the detected fence language (e.g., 'js', 'java')
    this.pre.properties ??= {};
    this.pre.properties["data-language"] = this.options.lang || "text";
  }
};
