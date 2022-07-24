import { createClient, updateAvatars } from "@avatar-history/discord";
import cron from "node-cron";

const main = async () => {
  await createClient();

  cron.schedule("*/10 * * * * *", async () => {
    console.log("Updating Avatars");
    await updateAvatars(1000);
  });
};

main();
