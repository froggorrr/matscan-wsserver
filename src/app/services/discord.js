import { Client } from "discord.js-selfbot-v13";
import parseTransaction from "../../utils/embedParser.js";
import { configDotenv } from "dotenv";
import logger from "../../utils/logger.js";
import chalk from "chalk";
import { insertTransactions, insertUser } from "../models/insert.js";
import { updateUsers } from "../models/update.js";

// Load environment variables
configDotenv();
const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
const GUILD_ID = process.env.GUILD_ID;
const CHANNEL_ID = process.env.CHANNEL_ID;

const client = new Client();

const startDiscordServices = (io, PORT) => {
  client.on("ready", async () => {
    try {
      const guild = await client.guilds.fetch(GUILD_ID);
      const channel = await guild.channels.fetch(CHANNEL_ID);

      logStartupInfo(guild.name, channel.name, client.user.username, PORT);
    } catch (error) {
      logger.error(`Error during bot initialization: ${error.message}`);
    }
  });

  client.on("messageCreate", async (message) => {
    if (!isValidMessage(message)) return;
  
    try {
      const embed = message.embeds[0];
      const parsed = parseTransaction(embed);
    
      console.log(await insertTransactions(parsed));
      logger.info(`Processed transaction: ${parsed.txid}`);
      io.emit("new_transaction", parsed);
  
      if (parsed.receiver !== "system") {
        // Insert or update both receiver and sender if receiver is not 'system'
        await insertUser(parsed.receiver, parsed.receiverBalance);
        await insertUser(parsed.sender, parsed.senderBalance);
      } else {
        // If receiver is 'system', insert/update only the sender
        await insertUser(parsed.receiver, parsed.receiverBalance);
      }
  
    } catch (error) {
      logger.error(`Error processing message: ${error.message}`);
    }
  });
  

  client.login(DISCORD_TOKEN).catch((err) => {
    logger.error("❌ Failed to login to Discord:", err.message);
  });
};

function isValidMessage(message) {
  return (
    message.guild &&
    message.channel &&
    message.guild.id === GUILD_ID &&
    message.channel.id === CHANNEL_ID &&
    message.embeds.length > 0 &&
    message.embeds[0].description
  );
}

function logStartupInfo(guildName, channelName, botUsername, port) {
  console.log(chalk.cyanBright(`-----------------------------------------`));
  console.log(chalk.yellowBright(`Bot Listener:`), chalk.magenta(botUsername));
  console.log(chalk.yellowBright(`Bot Status:`), chalk.greenBright(`Online`));
  console.log(chalk.yellowBright(`Running On Port:`), chalk.greenBright(port));
  console.log(chalk.yellowBright(`Channel Name:`), chalk.magenta(channelName));
  console.log(chalk.yellowBright(`Guild Name:`), chalk.blueBright(guildName));
  console.log(chalk.cyanBright(`-----------------------------------------`));
}

export { startDiscordServices, client };
