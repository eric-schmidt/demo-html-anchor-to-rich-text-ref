# Demo - HTML Anchor to Rich Text References

This repo provides a simplified example for how one can leverage [Turndown](https://github.com/mixmark-io/turndown) and [rich-text-from-markdown](https://github.com/contentful/rich-text/tree/master/packages/rich-text-from-markdown) to intercept anchor links and turn them into inline entry references within Contentful Rich Text.

## Instructions

1. Copy the `.env.example` file and rename it to `.env`.
2. Populate the `CONTENTFUL_SPACE_ID`, `CONTENTFUL_ENVIRONMENT_ID`, and `CONTENTFUL_CMA_TOKEN` with those from your Contentful Space.
3. Add a content type to your space with a Content Type ID of `test`.
4. Run `node src/index.js`, which will run the script that analyzes an HTML string, creates a referenceable entry, and then returns valid Rich Text JSON that includes and inline entry reference.
