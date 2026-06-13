import { createClient, update } from "@avatar-history/discord";
import cron from "node-cron";
import { logger } from "@avatar-history/logging";

const main = async () => {
  await createClient();

  cron.schedule("*/30 * * * * *", async () => {
    logger.debug("Updating Data");
    await update();
  });
};

main();
