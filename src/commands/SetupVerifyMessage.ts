import {
  CommandInteraction,
  MessageActionRow,
  MessageButton,
  MessageEmbed,
} from "discord.js";
import { Discord, Slash } from "discordx";
const Captcha = require("@haileybot/captcha-generator");

@Discord()
export class SetupVerifyMessage {
  @Slash("setup-verify-message", {
    description: "Sends the verify message with the verify button.",
  })
  async setupVerifyMessage(interaction: CommandInteraction) {
    const messageActionRow = new MessageActionRow();
    const button = new MessageButton({
      label: "Verify",
      customId: `verify-${(Math.random() + 1).toString(36).substring(7)}`,
      type: "BUTTON",
      style: "PRIMARY",
    });
    messageActionRow.addComponents(button);

    const embed = new MessageEmbed()
      .setTitle("Verify")
      .setDescription("Click the button to verify.")
      .setColor("WHITE");
    interaction.reply({ embeds: [embed], components: [messageActionRow] });
  }
}
