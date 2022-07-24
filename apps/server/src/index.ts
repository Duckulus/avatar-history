import { updateAvatars } from "@avatar-history/discord";
import cron from "node-cron";

const main = async () => {
  cron.schedule("*/1 * * * *", async () => {
    console.log("Updating Avatars");
    await updateAvatars(1000);
  });
};

main();
