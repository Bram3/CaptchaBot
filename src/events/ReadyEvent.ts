import { Client, Discord, Once } from "discordx";
import { injectable } from "tsyringe";
import logger from "../utils/Logger";

@Discord()
@injectable()
export class ReadyEvent {
  constructor(private client: Client) {}

  @Once("ready")
  async onReady(): Promise<void> {
    await this.client.initApplicationCommands({
      guild: { log: false },
    });
    await this.client.initApplicationPermissions(true);
    logger.info(
      `Logged in as: ${this.client.user?.tag} (id: ${this.client.user?.id})`
    );
  }
}
