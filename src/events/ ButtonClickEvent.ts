import Captcha = require("@haileybot/captcha-generator");
import {
  ButtonInteraction,
  GuildMemberRoleManager,
  MessageActionRow,
  MessageAttachment,
  MessageButton,
  MessageEmbed,
  Modal,
  ModalActionRowComponent,
  TextInputComponent,
} from "discord.js";
import { ButtonComponent, Discord } from "discordx";
import { exit } from "process";
import { inject, injectable } from "tsyringe";

import { InjectionTokens } from "../DI/InjectionTokens";
import logger from "../utils/Logger";

@injectable()
@Discord()
export class ButtonClickEvent {
  constructor(
    @inject(InjectionTokens.CaptchaValues)
    private captchaValues: Map<string, string>
  ) {}

  @ButtonComponent(/verify-*/)
  async verify(interaction: ButtonInteraction) {
    const { VERIFIED_ROLE_ID, UNVERIFIED_ROLE_ID } = process.env;
    if (!VERIFIED_ROLE_ID || !UNVERIFIED_ROLE_ID) {
      logger.error(
        "Please set VERIFIED_ROLE_ID and UNVERIFIED_ROLE_ID in .env"
      );
      exit(1);
    }

    const accountAge =
      (new Date().getTime() - interaction.user.createdAt.getTime()) /
      (1000 * 3600 * 24);
    if (accountAge < 7) {
      let captcha = new Captcha();
      const attachement = new MessageAttachment(
        captcha.JPEGStream,
        "captcha.jpeg"
      );
      interaction.user.send({ files: [attachement] });
      this.captchaValues.set(interaction.user.id, captcha.value);
      const embed = new MessageEmbed()
        .setTitle("Verify")
        .setDescription(
          "Click thhe button below to open the modal where you can write your answer."
        )
        .setColor("WHITE");
      const messageActionRow = new MessageActionRow();
      const button = new MessageButton({
        customId: `modal-${(Math.random() + 1).toString(36).substring(7)}`,
        type: "BUTTON",
        style: "PRIMARY",
        label: "Open modal",
      });
      messageActionRow.addComponents(button);
      interaction.user.send({
        embeds: [embed],
        components: [messageActionRow],
      });
      interaction.reply({
        content: "I send you a captcha in DM!",
        ephemeral: true,
      });
    } else {
      if (
        (interaction.member!.roles as GuildMemberRoleManager).cache.has(
          UNVERIFIED_ROLE_ID
        )
      )
        (interaction.member!.roles as GuildMemberRoleManager).remove(
          UNVERIFIED_ROLE_ID
        );
      if (
        !(interaction.member!.roles as GuildMemberRoleManager).cache.has(
          VERIFIED_ROLE_ID
        )
      )
        (interaction.member!.roles as GuildMemberRoleManager).add(
          VERIFIED_ROLE_ID
        );
      return interaction.reply({
        content: "Succesfully verified! You were given the verified role.",
        ephemeral: true,
      });
    }
  }
  @ButtonComponent(/modal-*/)
  async showModal(interaction: ButtonInteraction) {
    if (!this.captchaValues.has(interaction.user.id))
      return interaction.reply({
        content:
          "There is currently no active captcha. (Your captcha may have timed out.) Please generate a new one by pressing verify the button.",
        ephemeral: true,
      });
    const modal = new Modal()
      .setCustomId(`input-${(Math.random() + 1).toString(36).substring(7)}`)
      .setTitle("Verification")
      .addComponents(
        new MessageActionRow<ModalActionRowComponent>().addComponents(
          new TextInputComponent()
            .setLabel("Answer")
            .setCustomId("answer")
            .setStyle("SHORT")
        )
      );
    await interaction.showModal(modal);
  }
}
