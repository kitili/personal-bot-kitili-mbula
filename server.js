const app = require("./app");

const PORT = Number(process.env.PORT) || 3000;

if (!process.env.APP_USERNAME || !process.env.APP_PASSWORD) {
  console.warn(
    "Warning: APP_USERNAME / APP_PASSWORD not set. Login will reject everyone until you set them in .env (local) or host env vars."
  );
}

app.listen(PORT, () => {
  console.log(`Personal bot listening on http://localhost:${PORT}`);
});
