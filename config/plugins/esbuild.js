import esbuild from "esbuild";

export default function registerEsbuildPlugin(eleventyConfig) {
    eleventyConfig.on("eleventy.before", async () => {
      const entryPoints = [
        "src/scripts/reading-progress.js",
        "src/scripts/toc-scrollspy.js",
        "src/scripts/social-share.js",
        "src/scripts/search.js",
      ];

        await esbuild.build({
            entryPoints,
            outdir: "_site/scripts",
            bundle: true,
            minify: process.env.ELEVENTY_RUN_MODE === "build",
            sourcemap: true,
        });
    });

    eleventyConfig.addWatchTarget("./src/scripts/");
}
