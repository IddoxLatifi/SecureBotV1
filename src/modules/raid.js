// src/modules/raid.js

const { EmbedBuilder } = require('discord.js');

let joinTimestamps = [];

const RAID_THRESHOLD_COUNT = 10;
const RAID_THRESHOLD_INTERVAL = 3 * 60 * 1000; 

/**
 * Wird bei jedem Serverbeitritt eines Members aufgerufen.
 * Prüft, ob mehr als 10 Mitglieder in 3 Minuten beigetreten sind.
 * Falls ja, wird das aktuell beitretende Mitglied gekickt,
 * ein Warn-Embed an den Log-Kanal gesendet und der Vorfall in Redis geloggt.
 * Dieser Script wurde von @apt_start_latifi geschrieben und dient der Sicherheit deines Servers
 * zu 100% Kostenlos und unschlagbar in der Leistung!
 *
 * @param {GuildMember} member 
 * @param {Client} client
 * @param {RedisClientType} redisClient 
 */
async function handleMemberJoin(member, client, redisClient) {
  const now = Date.now();

  joinTimestamps.push(now);

  joinTimestamps = joinTimestamps.filter(timestamp => now - timestamp <= RAID_THRESHOLD_INTERVAL);

  if (joinTimestamps.length > RAID_THRESHOLD_COUNT) {
    try {
      await member.kick("Raid-Schutz: Mehr als 10 Mitglieder in 3 Minuten");
    } catch (error) {
      console.error("Fehler beim Kicken des Raid-Mitglieds:", error);
    }

    const embed = new EmbedBuilder()
      .setTitle("Raid-Schutz aktiviert")
      .setDescription(`Member <@${member.id}> wurde gekickt, da mehr als ${RAID_THRESHOLD_COUNT} Mitglieder in 3 Minuten dem Server beigetreten sind.`)
      .setColor(0xff0000) 
      .setTimestamp();

    try {
      const logChannel = await client.channels.fetch(process.env.LOG_CHANNEL_ID);
      if (logChannel) {
        await logChannel.send({ embeds: [embed] });
      }
    } catch (error) {
      console.error("Fehler beim Senden des Raid-Logs:", error);
    }

    try {
      const logMessage = `Raid-Schutz: Member ${member.id} wurde gekickt am ${new Date().toISOString()}`;
      await redisClient.rPush('bot_logs', logMessage);
    } catch (error) {
      console.error("Fehler beim Speichern des Raid-Logs in Redis:", error);
    }
  }
}

module.exports = {
  handleMemberJoin,
};
