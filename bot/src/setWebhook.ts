import { setWebhook } from "./bot";

const publicUrl = process.argv[2];

if (!publicUrl) {
  console.error("Usage: tsx src/setWebhook.ts https://your-bot-domain.example.com");
  process.exit(1);
}

setWebhook(publicUrl)
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
