import { Command } from "../commandType";
import { ApplicationCommandOptionType } from "discord-api-types/v10";
import { getAvatars } from "@avatar-history/db";
import { cdn } from "../../utils/cdn";

export const AvatarsCommand: Command = {
  name: "avatars",
  description: "Shows all Avatars of a User",
  options: [
    {
      name: "user",
      description: "The User",
      type: ApplicationCommandOptionType.User,
      required: false,
    },
  ],
  execute: async (interaction, _) => {
    const user = interaction.options.getUser("user");
    const userId = user ? user.id : interaction.user.id;
    const avatars = (await getAvatars())
      .filter((avatar) => avatar.userId == userId)
      .map((avatar) => {
        return cdn(avatar.id, userId);
      })
      .join(" ");
    await interaction.reply({
      content: avatars,
      ephemeral: true,
    });
  },
};
