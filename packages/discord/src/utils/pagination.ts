import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  CommandInteraction,
  ComponentType,
  ContainerBuilder,
  MessageFlags,
} from "discord.js";

// Accent color of the website
export const ACCENT_COLOR = 0x8c84e0;

/**
 * Renders a page as a components v2 container. `nav` is the row of paging
 * buttons, which the renderer should place at the bottom of its container.
 * It is undefined when there is only one page or the buttons have expired.
 */
export type PageRenderer = (
  page: number,
  nav: ActionRowBuilder<ButtonBuilder> | undefined
) => ContainerBuilder;

enum PaginationButton {
  FIRST = "page:first",
  PREVIOUS = "page:previous",
  NEXT = "page:next",
  LAST = "page:last",
}

export class Pagination {
  private index = 0;

  constructor(
    private readonly interaction: CommandInteraction,
    private readonly pageCount: number,
    private readonly render: PageRenderer,
    private readonly timeoutSeconds = 300,
    private readonly ephemeral = false
  ) {}

  async start() {
    const response = await this.interaction.reply({
      components: [this.page()],
      flags: this.ephemeral
        ? [MessageFlags.IsComponentsV2, MessageFlags.Ephemeral]
        : [MessageFlags.IsComponentsV2],
    });
    if (this.pageCount <= 1) return;

    const collector = response.createMessageComponentCollector({
      componentType: ComponentType.Button,
      time: this.timeoutSeconds * 1000,
    });

    collector.on("collect", async (button) => {
      if (button.user.id != this.interaction.user.id) {
        await button.reply({
          content: "Run the command yourself to browse this list.",
          flags: MessageFlags.Ephemeral,
        });
        return;
      }
      switch (button.customId) {
        case PaginationButton.FIRST:
          this.index = 0;
          break;
        case PaginationButton.PREVIOUS:
          this.index = Math.max(0, this.index - 1);
          break;
        case PaginationButton.NEXT:
          this.index = Math.min(this.pageCount - 1, this.index + 1);
          break;
        case PaginationButton.LAST:
          this.index = this.pageCount - 1;
          break;
      }
      await button.update({ components: [this.page()] });
    });

    // remove the buttons once they stop working
    collector.on("end", () => {
      this.interaction
        .editReply({ components: [this.render(this.index, undefined)] })
        .catch(() => {});
    });
  }

  private page() {
    return this.render(this.index, this.pageCount > 1 ? this.nav() : undefined);
  }

  private nav() {
    const atStart = this.index <= 0;
    const atEnd = this.index >= this.pageCount - 1;
    const button = (id: PaginationButton, emoji: string, disabled: boolean) =>
      new ButtonBuilder()
        .setCustomId(id)
        .setEmoji(emoji)
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(disabled);
    return new ActionRowBuilder<ButtonBuilder>().addComponents(
      button(PaginationButton.FIRST, "⏮️", atStart),
      button(PaginationButton.PREVIOUS, "◀️", atStart),
      new ButtonBuilder()
        .setCustomId("page:indicator")
        .setLabel(`${this.index + 1} / ${this.pageCount}`)
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(true),
      button(PaginationButton.NEXT, "▶️", atEnd),
      button(PaginationButton.LAST, "⏭️", atEnd)
    );
  }
}
