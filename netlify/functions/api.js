const serverless = require("serverless-http");
const app = require("../../app");

// Netlify redirect sends /api/foo → /.netlify/functions/api/foo
// Normalize so Express routes under /api/* still match.
const handler = serverless(app);

module.exports.handler = async (event, context) => {
  if (event.path && event.path.startsWith("/.netlify/functions/api")) {
    event.path = event.path.replace("/.netlify/functions/api", "/api") || "/api";
  }
  if (event.rawPath && event.rawPath.startsWith("/.netlify/functions/api")) {
    event.rawPath =
      event.rawPath.replace("/.netlify/functions/api", "/api") || "/api";
  }
  return handler(event, context);
};
