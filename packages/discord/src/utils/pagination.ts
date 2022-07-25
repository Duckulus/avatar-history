import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChatInputCommandInteraction,
  EmbedBuilder,
  User,
} from "discord.js";

export class Pagination {
  private interaction: ChatInputCommandInteraction;
  private readonly pages: EmbedBuilder[];
  private index: number;
  private readonly timeout: number;
  private readonly ephermal: boolean;
  private readonly user: User;

  constructor(
    interaction: ChatInputCommandInteraction,
    pages: EmbedBuilder[],
    timeout: number = 60,
    ephermal: boolean = false
  ) {
    this.interaction = interaction;
    this.user = interaction.user;
    this.pages = pages;
    this.index = 0;
    this.timeout = timeout * 1000;
    this.ephermal = ephermal;
  }

  async start() {
    const message = await this.interaction.reply({
      embeds: [this.pages[this.index]],
      components: [
        buildRow(this.index == 0, this.index == this.pages.length - 1),
      ],
      ephemeral: this.ephermal,
    });

    const collector = message.createMessageComponentCollector();

    setTimeout(() => {
      this.interaction.editReply({
        components: [],
      });
      collector.stop("timeout");
    }, this.timeout);
    collector.on("collect", async (interaction) => {
      if (interaction.user.id != this.user.id) {
        await interaction.reply({
          content: "This is not your embed!",
          ephemeral: true,
        });
        return;
      }
      switch (interaction.customId) {
        case "0":
          this.index = 0;
          break;
        case "1":
          if (this.index > 0) this.index--;
          break;
        case "2":
          await interaction.update({
            components: [],
          });
          collector.stop();
          return;
        case "3":
          if (this.index < this.pages.length - 1) this.index++;
          break;
        case "4":
          this.index = this.pages.length - 1;
          break;
      }

      await interaction.update({
        embeds: [this.pages[this.index]],
        components: [
          buildRow(this.index == 0, this.index == this.pages.length - 1),
        ],
      });
    });
  }
}

const buildRow = (previousDisabled: boolean, nextDisabled: boolean) => {
  return new ActionRowBuilder<ButtonBuilder>().addComponents([
    new ButtonBuilder()
      .setCustomId("0")
      .setLabel("⏮️")
      .setStyle(ButtonStyle.Primary)
      .setDisabled(previousDisabled),
    new ButtonBuilder()
      .setCustomId("1")
      .setLabel("◀️")
      .setStyle(ButtonStyle.Primary)
      .setDisabled(previousDisabled),
    new ButtonBuilder()
      .setCustomId("2")
      .setLabel("⏹️")
      .setStyle(ButtonStyle.Danger),
    new ButtonBuilder()
      .setCustomId("3")
      .setLabel("▶️")
      .setStyle(ButtonStyle.Primary)
      .setDisabled(nextDisabled),
    new ButtonBuilder()
      .setCustomId("4")
      .setLabel("⏭️")
      .setStyle(ButtonStyle.Primary)
      .setDisabled(nextDisabled),
  ]);
};
