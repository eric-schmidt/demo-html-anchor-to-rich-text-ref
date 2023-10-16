import { parse } from "node-html-parser";
import TurndownService from "turndown";
import { richTextFromMarkdown } from "@contentful/rich-text-from-markdown";
import { environment } from "./cmaEnvironment.js";

// Init turndown for converting HTML into Markdown.
const turndownService = new TurndownService();

// Create Contentful Rich Text data from HTML.
const createRichText = async (data) => {
  if (!data) {
    return null;
  }

  // First, add rule to turn anchor tags into something richTextFromMarkdown will not recognize
  // so that we can then operate on it further and create entry links during migration.
  turndownService.addRule("a", {
    filter: ["a"],
    // TODO: Add some logic to filter out external anchor links, as we only want internal links.
    // E.g. if node._attrsByQName.href.data !== current domain then do not proceed.
    replacement: (content, node) =>
      // A single, self-closing custom tag is used here so that we can get href and child text
      // all in one go when parsing later on. Otherwise, the logic might get overly complex.
      `<anchor-to-reference url="${node._attrsByQName.href.data}" innerText="${content}" />`,
  });

  // Create Markdown for later processing into Rich Text.
  const markdown = await turndownService.turndown(data);

  // Convert Markdown to Rich Text.
  const richText = await richTextFromMarkdown(markdown, async (node) => {
    // TODO: Process unsupported node types here.
    // E.g. hooking into the preserver <anchor-to-reference> nodes to create entry links.

    if (node.type === "html") {
      // Pass node to node-html-parser for easier HTML traversal.
      const element = parse(node.value).firstChild;

      // Make sure we only operate on the custom anchor-to-reference tag.
      if (element.tagName === "ANCHOR-TO-REFERENCE") {
        // Create entry via Content Management API (assumes a content type "test" exists).
        // TODO: It would probably be good to add additonal checks for existing entries.
        const entry = await environment.createEntry("test", {
          fields: {
            title: {
              "en-US": element.attributes.innerText,
            },
            slug: {
              "en-US": element.attributes.url,
            },
          },
        });

        // NOTE: Inline embedded entries do not allow specifying link text. This is instead derived
        // from the entry itself. If this is not ideal than a hyperlink should be used.
        return createEmbeddedEntryInline(entry.sys.id);
      }
    }
  });

  // Log out Rich Text JSON for review.
  console.dir(richText, { depth: 10 });

  return richText;
};

// Utility function for returning a properly-formatted Contentful Rich Text inline reference.
const createEmbeddedEntryInline = (id) => {
  return {
    nodeType: "embedded-entry-inline",
    content: [],
    data: {
      target: {
        sys: {
          id,
          type: "Link",
          linkType: "Entry",
        },
      },
    },
  };
};

(async function () {
  // TODO: In practice, this would be sent as `field` data when creating an entry.
  createRichText(
    '<p>hello world hello world <a href="/hello-world">test</a></p>'
  );
})();
