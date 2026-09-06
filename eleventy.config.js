const Image = require("@11ty/eleventy-img");

// Served from https://calhounfrommesa.github.io/Shutter-Thoughts/ — a project
// page, so every absolute path needs this prefix. Templates get it via the
// `url` filter; image URLs get it baked into `urlPath` below.
const PATH_PREFIX = "/Shutter-Thoughts/";

// Sizes generated for every photo. The first is what the grid loads;
// the last (null = original size) is what the overlay loads on click.
const WIDTHS = [900, null];

function esc(s) {
  return String(s || "")
    .replace(/&/g, "&amp;").replace(/"/g, "&quot;")
    .replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

async function gallery(photos) {
  if (!photos || !photos.length) return "";
  const cols = Math.min(photos.length, 3);
  const parts = [`<div class="shots n${cols}">`];

  for (let i = 0; i < photos.length; i++) {
    const p = photos[i];
    const meta = await Image(`src/photos/${p.src}`, {
      widths: WIDTHS,
      formats: ["jpeg"],
      outputDir: "_site/img/",
      urlPath: PATH_PREFIX + "img/",
      sharpJpegOptions: { quality: 82, mozjpeg: true },
    });
    const sizes = meta.jpeg;
    const thumb = sizes[0];
    const full = sizes[sizes.length - 1];
    const branch = i === photos.length - 1 ? "&#9492;" : "&#9500;";
    const alt = esc(p.alt || p.cap || "");

    parts.push(`<figure>
  <button type="button" class="ph" style="--ar:${full.width}/${full.height}"
    data-full="${full.url}" data-file="${esc(p.src)}"
    data-dims="${full.width} &times; ${full.height}" data-cap="${esc(p.cap)}">
    <img src="${thumb.url}" width="${thumb.width}" height="${thumb.height}"
         loading="lazy" decoding="async" alt="${alt}">
  </button>${p.cap ? `
  <figcaption><span class="br">${branch}</span> ${esc(p.cap)}</figcaption>` : ""}
</figure>`);
  }

  parts.push("</div>");
  return parts.join("\n");
}

module.exports = function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy({ "src/static": "/" });

  // Dates in front matter are read as written, no timezone shifting.
  eleventyConfig.addFilter("stamp", (d) => new Date(d).toISOString().slice(0, 16).replace("T", " "));
  eleventyConfig.addFilter("day", (d) => new Date(d).toISOString().slice(0, 10));
  eleventyConfig.addFilter("month", (d) => new Date(d).toISOString().slice(0, 7));
  eleventyConfig.addFilter("rfc822", (d) => new Date(d).toUTCString());

  eleventyConfig.addCollection("entries", (c) =>
    c.getFilteredByGlob("src/posts/*.md").sort((a, b) => b.date - a.date)
  );

  eleventyConfig.addAsyncShortcode("gallery", gallery);

  return {
    dir: { input: "src", output: "_site", includes: "_includes" },
    markdownTemplateEngine: "njk",
    pathPrefix: PATH_PREFIX,
  };
};
