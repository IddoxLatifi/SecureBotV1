// src/modules/greif.js

const { EmbedBuilder, AuditLogEvent } = require('discord.js');

/**
 * Wird bei jedem Beitritt eines neuen Mitglieds aufgerufen.
 * Falls das beitretende Mitglied ein Bot ist, wird versucht,
 * den Einladenden (über die Audit-Logs) zu ermitteln. Anschließend
 * werden sowohl der Bot als auch der Einladende permanent gebannt,
 * es sei denn, der Einladende ist die ADMIN_ID.
 * Dieser Script wurde von @apt_start_latifi geschrieben und dient der Sicherheit deines Servers
 * zu 100% Kostenlos und unschlagbar in der Leistung!
 *
 * @param {GuildMember} member
 * @param {Client} client 
 * @param {RedisClientType} redisClient 
 */
async function handleBotJoin(member, client, redisClient) {
  if (!member.user.bot) return;

  const guild = member.guild;
  
  try {
    const fetchedLogs = await guild.fetchAuditLogs({
      limit: 1,
      type: AuditLogEvent.BotAdd,
    });
    const auditEntry = fetchedLogs.entries.first();

    let inviter = null;
    if (
      auditEntry &&
      auditEntry.target.id === member.id &&
      (Date.now() - auditEntry.createdTimestamp < 5000)
    ) {
      inviter = auditEntry.executor;
    }

    if (inviter && inviter.id === process.env.ADMIN_ID) {
      console.log(`Bot ${member.id} wurde von der ADMIN_ID eingeladen – keine Maßnahmen erforderlich.`);
      return;
    }

    const embed = new EmbedBuilder()
      .setTitle("Bot Einladung erkannt!")
      .setDescription(`Ein Bot (<@${member.id}>) wurde eingeladen.`)
      .addFields(
        { name: "Maßnahme", value: "Dauerhafte Bannung von Bot und Einladendem Mitglied", inline: false }
      )
      .setColor(0xff0000)
      .setTimestamp();

    const logChannel = await client.channels.fetch(process.env.LOG_CHANNEL_ID);
    if (logChannel) {
      await logChannel.send({ embeds: [embed] });
    }

    const logMessage = `Bot-Einladung erkannt: Bot ${member.id} und Einladender ${inviter ? inviter.id : "unbekannt"} wurden am ${new Date().toISOString()} permanent gebannt.`;
    await redisClient.rPush('bot_logs', logMessage);

    await member.ban({ reason: "Bots dürfen nicht eingeladen werden." });

    if (inviter) {
      const inviterMember = await guild.members.fetch(inviter.id);
      if (inviterMember) {
        await guild.members.ban(inviter.id, { reason: "Einladung eines Bots ist nicht erlaubt." });
      }
    }
  } catch (error) {
    console.error("Fehler in greif.js beim Verarbeiten eines Bot-Join-Events:", error);
  }
}

module.exports = {
  handleBotJoin,
};
