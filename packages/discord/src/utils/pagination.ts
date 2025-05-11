import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  CommandInteraction,
  EmbedBuilder,
  User,
} from "discord.js";

export class Pagination {
  private interaction: CommandInteraction;
  private readonly pages: EmbedBuilder[];
  private index: number;
  private readonly timeout: number;
  private readonly ephermal: boolean;
  private readonly user: User;

  constructor(
    interaction: CommandInteraction,
    pages: EmbedBuilder[],
    timeout: number = 180,
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
      components: [this.row()],
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
        case PaginationButton.FIRST:
          this.index = 0;
          break;
        case PaginationButton.PREVIOUS:
          if (this.index > 0) this.index--;
          break;
        case PaginationButton.STOP:
          await interaction.update({
            components: [],
          });
          collector.stop();
          return;
        case PaginationButton.NEXT:
          if (this.index < this.pages.length - 1) this.index++;
          break;
        case PaginationButton.LAST:
          this.index = this.pages.length - 1;
          break;
      }

      await interaction.update({
        embeds: [this.pages[this.index]],
        components: [this.row()],
      });
    });
  }

  row() {
    const previousDisabled = this.index <= 0;
    const nextDisabled = this.index >= this.pages.length - 1;
    return new ActionRowBuilder<ButtonBuilder>().addComponents([
      new ButtonBuilder()
        .setCustomId(PaginationButton.FIRST)
        .setLabel("⏮️")
        .setStyle(ButtonStyle.Primary)
        .setDisabled(previousDisabled),
      new ButtonBuilder()
        .setCustomId(PaginationButton.PREVIOUS)
        .setLabel("◀️")
        .setStyle(ButtonStyle.Primary)
        .setDisabled(previousDisabled),
      new ButtonBuilder()
        .setCustomId(PaginationButton.STOP)
        .setLabel("⏹️")
        .setStyle(ButtonStyle.Danger),
      new ButtonBuilder()
        .setCustomId(PaginationButton.NEXT)
        .setLabel("▶️")
        .setStyle(ButtonStyle.Primary)
        .setDisabled(nextDisabled),
      new ButtonBuilder()
        .setCustomId(PaginationButton.LAST)
        .setLabel("⏭️")
        .setStyle(ButtonStyle.Primary)
        .setDisabled(nextDisabled),
    ]);
  }
}

enum PaginationButton {
  FIRST = "0",
  PREVIOUS = "1",
  STOP = "2",
  NEXT = "3",
  LAST = "4",
}
