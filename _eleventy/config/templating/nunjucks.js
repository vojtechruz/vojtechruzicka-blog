export default function configureNunjucks(eleventyConfig) {
  eleventyConfig.setNunjucksEnvironmentOptions({
    trimBlocks: true, // removes the newline after {% ... %}
    lstripBlocks: true, // strips leading spaces before {% ... %}
  });
}
