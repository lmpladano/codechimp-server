import express from "express";
import testRouter from "./routes/testText.js";

const app = express();
const PORT = process.env.PORT || 3000;

const allowedOrigins = (
  process.env.FRONTEND_ORIGIN ||
  "https://codechimp-lmpladano.netlify.app,http://localhost:5173,http://127.0.0.1:5173"
)
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const netlifySiteDomain = process.env.NETLIFY_SITE_DOMAIN || "codechimp-lmpladano.netlify.app";

function isNetlifyPreview(origin: string) {
  try {
    const url = new URL(origin);
    return (
      url.hostname === netlifySiteDomain ||
      url.hostname.endsWith(`--${netlifySiteDomain}`)
    );
  } catch {
    return false;
  }
}

function isAllowedOrigin(origin: string) {
  return allowedOrigins.includes(origin) || isNetlifyPreview(origin);
}

app.use((req, res, next) => {
  const requestOrigin = req.headers.origin;

  if (typeof requestOrigin === "string" && isAllowedOrigin(requestOrigin)) {
    res.setHeader("Access-Control-Allow-Origin", requestOrigin);
  }

  res.setHeader("Vary", "Origin");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }

  next();
});

app.get("/", (req, res) => {
  res.send("Hello");
});

app.use("/txt", testRouter);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
