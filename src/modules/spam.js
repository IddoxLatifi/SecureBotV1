// src/modules/spam.js

const { EmbedBuilder } = require('discord.js');

const userMessageMap = new Map();

const SPAM_THRESHOLD_COUNT = 5;         
const SPAM_THRESHOLD_INTERVAL = 5000;     
const MUTE_DURATION = 7 * 24 * 60 * 60 * 1000; 

/**
 * Prüft bei jeder Nachricht, ob ein User spammt.
 * Falls ja, wird der User gemuted, seine Nachrichten werden gelöscht,
 * und ein Log-Eintrag (sowohl per Embed als auch in Redis) wird erstellt.
 * Dieser Script wurde von @apt_start_latifi geschrieben und dient der Sicherheit deines Servers
 * zu 100% Kostenlos und unschlagbar in der Leistung!
 *
 * @param {Message} message - Die empfangene Nachricht
 * @param {Client} client - Der Discord-Client
 * @param {RedisClientType} redisClient - Der Redis-Client
 */
async function handleMessage(message, client, redisClient) {
  if (message.author.bot) return;

  const userId = message.author.id;
  const now = Date.now();
  
  let timestamps = userMessageMap.get(userId) || [];

  timestamps.push(now);

  timestamps = timestamps.filter(timestamp => now - timestamp <= SPAM_THRESHOLD_INTERVAL);

  userMessageMap.set(userId, timestamps);

  if (timestamps.length > SPAM_THRESHOLD_COUNT) {
    userMessageMap.delete(userId);

    try {
      if (message.member && message.member.moderatable) {
        await message.member.timeout(MUTE_DURATION, "Spam: Mehr als 5 Nachrichten in 5 Sekunden.");
      }
    } catch (err) {
      console.error("Fehler beim Muten:", err);
    }

    try {
      const guild = message.guild;
      const deletePromises = [];
      guild.channels.cache.forEach(channel => {
        if (channel.isTextBased() && channel.permissionsFor(guild.members.me)?.has("ManageMessages")) {
          deletePromises.push(
            channel.messages.fetch({ limit: 100 }).then(messages => {
              const userMessages = messages.filter(msg => msg.author.id === userId);
              if (userMessages.size > 0) {
                return channel.bulkDelete(userMessages, true);
              }
            }).catch(err => console.error(`Fehler beim Löschen in Channel ${channel.id}:`, err))
          );
        }
      });
      await Promise.all(deletePromises);
    } catch (err) {
      console.error("Fehler beim Löschen der Nachrichten:", err);
    }

    const logEmbed = new EmbedBuilder()
    .setTitle("Spam-Aktion")
    .setDescription(`<@${process.env.ADMIN_ID}> – Benutzer <@${userId}> wurde wegen Spam gemuted.`)
    .addFields(
        { name: "Grund", value: "Mehr als 5 Nachrichten in weniger als 5 Sekunden." },
        { name: "Dauer", value: "1 Woche" }
    )
.setColor(0xff0000)
.setFooter({ text: "Created by @apt_start_latifi" })
.setTimestamp();

    try {
      const logChannel = await client.channels.fetch(process.env.LOG_CHANNEL_ID);
      if (logChannel) {
        await logChannel.send({ embeds: [logEmbed] });
      }
    } catch (err) {
      console.error("Fehler beim Senden der Log-Nachricht:", err);
    }

    try {
      const logMessage = `User ${userId} wurde wegen Spam gemuted am ${new Date().toISOString()}`;
      await redisClient.rPush('bot_logs', logMessage);
    } catch (err) {
      console.error("Fehler beim Speichern des Logs in Redis:", err);
    }
  }
}

module.exports = {
  handleMessage,
};
