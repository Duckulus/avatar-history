import { createClient, update } from "@avatar-history/discord";
import cron from "node-cron";
import { logger } from "@avatar-history/logging";

// Safety net: by default Node exits on an unhandled rejection, which restarts
// the whole container (bot and update loop) over a single failed Discord call.
process.on("unhandledRejection", (reason) => {
  logger.error("Unhandled rejection", reason);
});

const main = async () => {
  await createClient();

  cron.schedule("*/30 * * * * *", async () => {
    logger.debug("Updating Data");
    await update();
  });
};

main();
