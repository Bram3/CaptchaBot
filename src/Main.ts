import "reflect-metadata";
import { config } from "dotenv";
import logger from "./utils/Logger";
import { Client, DIService } from "discordx";
import { Intents } from "discord.js";
import { importx } from "@discordx/importer";
import { container, inject, singleton } from "tsyringe";
import { InjectionTokens } from "./DI/InjectionTokens";
config();

@singleton()
export class Main {
  constructor(@inject(InjectionTokens.Token) private token: string) {}

  public async start() {
    const client = new Client({
      botGuilds: [(client) => client.guilds.cache.map((guild) => guild.id)],
      intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.GUILD_MEMBERS,
      ],
    });

    await importx(`${__dirname}/{commands,events}/**/*.{ts,js}`);

    container.registerInstance(Client, client);
    container.registerInstance(
      InjectionTokens.CaptchaValues,
      new Map<string, string>()
    );

    logger.info("Connecting...");
    await client.login(this.token);
  }
}

const { TOKEN } = process.env;
if (!TOKEN) {
  logger.error("Token not found! Please set your token in the .env file.");
  process.exit();
}

DIService.container = container;
container.registerInstance(InjectionTokens.Token, TOKEN);
(async (): Promise<void> => {
  await container.resolve(Main).start();
})();
