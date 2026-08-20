import { EleventyHtmlBasePlugin } from "@11ty/eleventy";

export default function (eleventyConfig) {
  eleventyConfig.addPlugin(EleventyHtmlBasePlugin);

  eleventyConfig.addFilter("json", (value) => JSON.stringify(value, null, 2));

  eleventyConfig.addFilter("dateToIsoDate", (value) => {
    const d = value instanceof Date ? value : new Date(value || Date.now());
    if (Number.isNaN(d.getTime())) return new Date().toISOString().slice(0, 10);
    return d.toISOString().slice(0, 10);
  });

  eleventyConfig.addPassthroughCopy({ "site/assets": "." });
  eleventyConfig.addPassthroughCopy({ "site/js": "js" });
  eleventyConfig.addPassthroughCopy({ "public/googleda15a62353f95d40.html": "googleda15a62353f95d40.html" });
  eleventyConfig.addPassthroughCopy({ "public/zohoverify": "zohoverify" });

  eleventyConfig.addWatchTarget("./site/css/");
  eleventyConfig.addWatchTarget("./site/js/");

  eleventyConfig.ignores.add("site-export/**");

  return {
    dir: {
      input: "site",
      includes: "_includes",
      data: "_data",
      output: "_site",
    },
    htmlTemplateEngine: "njk",
    markdownTemplateEngine: "njk",
    templateFormats: ["html", "njk", "md", "11ty.js"],
  };
}
