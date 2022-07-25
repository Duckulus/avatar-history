import { createClient, updateAvatars } from "@avatar-history/discord";
import cron from "node-cron";
import { logger } from "@avatar-history/logging";

const main = async () => {
  await createClient();

  cron.schedule("*/10 * * * * *", async () => {
    logger.debug("Updating Avatars");
    await updateAvatars(1000);
  });
};

main();
