// src/modules/invite.js

const { EmbedBuilder } = require('discord.js');

const MUTE_DURATION = 7 * 24 * 60 * 60 * 1000;
const inviteRegex = /(?:https?:\/\/)?(?:www\.)?(?:discord\.gg|discord\.com\/invite|discordapp\.com\/invite)\/\S+/i;

/**
 * Überwacht Nachrichten und reagiert, falls ein Discord-Invite-Link gesendet wird.
 * Der entsprechende Member wird gemuted, alle seine (jüngeren) Nachrichten werden gelöscht,
 * und ein Log-Eintrag (per Embed und in Redis) wird erstellt.
 * Dieser Script wurde von @apt_start_latifi geschrieben und dient der Sicherheit deines Servers
 * zu 100% Kostenlos und unschlagbar in der Leistung!
 *
 * @param {Message} message 
 * @param {Client} client 
 * @param {RedisClientType} redisClient
 */
async function handleMessage(message, client, redisClient) {
  if (message.author.bot) return;

  if (inviteRegex.test(message.content)) {
    try {
      if (message.member && message.member.moderatable) {
        await message.member.timeout(MUTE_DURATION, "Discord Invite Link gesendet.");
      }
    } catch (err) {
      console.error("Fehler beim Muten (Invite):", err);
    }

    try {
      const guild = message.guild;
      const deletePromises = [];
      guild.channels.cache.forEach(channel => {
        if (channel.isTextBased() && channel.permissionsFor(guild.members.me)?.has("ManageMessages")) {
          deletePromises.push(
            channel.messages.fetch({ limit: 100 }).then(messages => {
              const userMessages = messages.filter(msg => msg.author.id === message.author.id);
              if (userMessages.size > 0) {
                return channel.bulkDelete(userMessages, true);
              }
            }).catch(err => console.error(`Fehler beim Löschen in Channel ${channel.id}:`, err))
          );
        }
      });
      await Promise.all(deletePromises);
    } catch (err) {
      console.error("Fehler beim Löschen der Nachrichten (Invite):", err);
    }

    const embed = new EmbedBuilder()
    .setTitle("Discord Invite Link gesendet!")
    .setDescription(`Der User <@${message.author.id}> hat einen Discord Invite Link gesendet und wurde gemuted.`)
    .addFields(
    { name: "Maßnahme", value: "1 Woche Mute", inline: true },
    { name: "Grund", value: "Versenden von Discord Invite Links", inline: true }
    )
    .setColor(0xff0000)
    .setFooter({ text: "Created by @apt_start_latifi" })
    .setTimestamp();

    try {
      const logChannel = await client.channels.fetch(process.env.LOG_CHANNEL_ID);
      if (logChannel) {
        await logChannel.send({ embeds: [embed] });
      }
    } catch (err) {
      console.error("Fehler beim Senden des Invite-Logs:", err);
    }

    try {
      const logMessage = `Invite Link gesendet: User ${message.author.id} wurde am ${new Date().toISOString()} gemuted.`;
      await redisClient.rPush('bot_logs', logMessage);
    } catch (err) {
      console.error("Fehler beim Speichern des Invite-Logs in Redis:", err);
    }
  }
}

module.exports = {
  handleMessage,
};
