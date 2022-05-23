import { ArgsOf, Client, Discord, On } from "discordx";
import { injectable } from "tsyringe";

@Discord()
@injectable()
export class InteractionCreateEvent {
  constructor(private client: Client) {}

  @On("interactionCreate")
  async onInteractionCreate([
    interaction,
  ]: ArgsOf<"interactionCreate">): Promise<void> {
    this.client.executeInteraction(interaction);
  }
}
