import dotenv from "dotenv";
import contentful from "contentful-management";

// Init dotenv.
dotenv.config();

// Init Contentful client/environment.
export const environment = await new contentful.createClient({
  accessToken: process.env.CONTENTFUL_CMA_TOKEN,
  timeout: 999999,
})
  .getSpace(process.env.CONTENTFUL_SPACE_ID)
  .then((space) => space.getEnvironment(process.env.CONTENTFUL_ENVIRONMENT_ID))
  .then((env) => {
    return env;
  });
