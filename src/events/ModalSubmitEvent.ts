import { ArgsOf, Discord, On } from "discordx";
import { exit } from "process";
import { inject, injectable } from "tsyringe";

import { InjectionTokens } from "../DI/InjectionTokens";
import logger from "../utils/Logger";

@Discord()
@injectable()
export class ModalSubmitEvent {
  constructor(
    @inject(InjectionTokens.CaptchaValues)
    private captchaValues: Map<string, string>
  ) {}

  @On("interactionCreate")
  async onModalSubmit([
    interaction,
  ]: ArgsOf<"interactionCreate">): Promise<void> {
    if (!interaction.isModalSubmit()) return;
    if (!new RegExp(/input-*/).test(interaction.customId)) return;
    const actionRow = interaction.components.find(
      (c) => c.type === "ACTION_ROW"
    );
    if (!actionRow) return;
    if (!this.captchaValues.has(interaction.user.id))
      return interaction.reply({
        content:
          "There is currently no active captcha. (Your captcha may have timed out.) Please generate a new one by pressing verify the button.",
      });
    if (
      actionRow.components[0].value.toUpperCase() !==
      this.captchaValues.get(interaction.user.id)
    )
      return interaction.reply({
        content: `Your answer is incorrect! (The answer was: ${this.captchaValues.get(
          interaction.user.id
        )}) Please generate a new one by pressing verify the button.`,
      });
    interaction.reply(
      "Your answer is correct! You have been given the verified role."
    );

    const { GUILD_ID, VERIFIED_ROLE_ID, UNVERIFIED_ROLE_ID } = process.env;
    if (!GUILD_ID) {
      logger.error(
        "GUILD_ID not found! Please set your GUILD_ID in the .env file."
      );
      exit(1);
    }

    const guild = await interaction.client.guilds.fetch(GUILD_ID);
    if (!guild) {
      logger.error(
        "GUILD_ID is not correct found! Please correct the GUILD_ID in the .env file."
      );
      exit(1);
    }
    if (!VERIFIED_ROLE_ID || !UNVERIFIED_ROLE_ID) {
      logger.error(
        "Please set VERIFIED_ROLE_ID and UNVERIFIED_ROLE_ID in .env"
      );
      exit(1);
    }
    const member = await guild.members.fetch(interaction.user.id);
    if (!member) return;
    const verifiedRole = await guild.roles.fetch(VERIFIED_ROLE_ID);
    const unverifiedRole = await guild.roles.fetch(UNVERIFIED_ROLE_ID);
    if (!verifiedRole || !unverifiedRole) {
      logger.error(
        "Please correct VERIFIED_ROLE_ID and UNVERIFIED_ROLE_ID in .env"
      );
      exit(1);
    }
    if (member.roles.cache.has(UNVERIFIED_ROLE_ID)) {
      member.roles.remove(UNVERIFIED_ROLE_ID);
    }
    if (!member.roles.cache.has(VERIFIED_ROLE_ID)) {
      member.roles.add(VERIFIED_ROLE_ID);
    }
  }
}
