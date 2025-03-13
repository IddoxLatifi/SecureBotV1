// src/bot.js

require('dotenv').config();
const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const redis = require('redis');
const fs = require('node:fs');
const path = require('node:path');

const redisClient = redis.createClient({
  url: process.env.REDIS_URL || 'redis://redis:6379'
});
redisClient.connect().catch(console.error);

const ping = require('./modules/ping.js');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

client.commands = new Map();
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
  const command = require(path.join(commandsPath, file));
  client.commands.set(command.data.name, command);
}


async function getHammertime() {
  try {
    const response = await fetch('https://hammertime.cyou/de');
    if (!response.ok) {
      throw new Error(`HTTP-Fehler: ${response.status}`);
    }
    const text = await response.text();
    if (text.length > 100) {
      throw new Error("Response text zu lang – vermutlich HTML");
    }
    return text.trim();
  } catch (error) {
    console.error("Fehler beim Abrufen von Hammertime:", error);
    return new Date().toLocaleString('de-DE', { timeZone: 'Europe/Berlin' });
  }
}


async function sendLogEmbed(title, description, color = 0x800080) {
  const embed = new EmbedBuilder()
    .setTitle(title)
    .setDescription(description)
    .setColor(color)
    .setFooter({ text: "Created by @apt_start_latifi" })
    .setTimestamp();

  try {
    const logChannel = await client.channels.fetch(process.env.LOG_CHANNEL_ID);
    if (logChannel) {
      await logChannel.send({ embeds: [embed] });
    }
  } catch (error) {
    console.error("Fehler beim Senden des Log-Embeds:", error);
  }
}


async function logActivity(message) {
  try {
    await redisClient.rPush('bot_activity', message);
    const logChannel = await client.channels.fetch(process.env.LOG_CHANNEL_ID);
    if (logChannel) {
      await logChannel.send(message);
    }
  } catch (error) {
    console.error('Logging error:', error);
  }
}

const interfaceModule = require('./interface/interface.js');
const spam = require('./modules/spam.js');
const raid = require('./modules/raid.js');
const invite = require('./modules/invite.js');
const greif = require('./modules/greif.js');
const nuke = require('./modules/nuke.js');

client.once('ready', async () => {
  console.log(`Logged in as ${client.user.tag}`);
  const currentTime = await getHammertime();
  await sendLogEmbed(
    "Discord Security Bot is Online",
    `Join for Help: [Discord](https://discord.gg/KcuMUUAP5T)\n${currentTime}\nThis bot created by @apt_start_latifi`,
    0x800080
  );
  interfaceModule.init(client);
});

client.on('guildMemberAdd', async (member) => {
  await raid.handleMemberJoin(member, client, redisClient);
  await greif.handleBotJoin(member, client, redisClient);
});

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;
  await spam.handleMessage(message, client, redisClient);
  await invite.handleMessage(message, client, redisClient);
});

client.on('messageDelete', async (message) => {
    await ping.handleMessageDelete(message, client, redisClient);
  });
client.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand()) return;
  const command = client.commands.get(interaction.commandName);
  if (!command) return;
  try {
    await command.execute(interaction, client, redisClient);
  } catch (error) {
    console.error("Fehler beim Ausführen des Befehls:", error);
    await interaction.reply({ content: 'Beim Ausführen des Befehls ist ein Fehler aufgetreten.', ephemeral: true });
  }
});

client.on('error', async (error) => {
  console.error('Discord client error:', error);
});

client.login(process.env.BOT_TOKEN);

/**
 * Dieser Script wurde von @apt_start_latifi geschrieben und dient der Sicherheit deines Servers
 * zu 100% Kostenlos und unschlagbar in der Leistung!
 *
 */