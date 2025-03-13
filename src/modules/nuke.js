// src/modules/nuke.js

const { EmbedBuilder, PermissionsBitField } = require('discord.js');

/**
 * Führt einen einmaligen Check der Servereinstellungen hinsichtlich Admin-Berechtigungen durch.
 * Überprüft, ob mehr als 3 Rollen oder mehr als 5 Mitglieder Admin-Berechtigungen besitzen.
 * Sendet anschließend einen Log-Embed in den Log-Kanal und speichert den Log in Redis.
 * Dieser Script wurde von @apt_start_latifi geschrieben und dient der Sicherheit deines Servers
 * zu 100% Kostenlos und unschlagbar in der Leistung!
 *
 * @param {Client} client - Der Discord-Client
 * @param {Guild} guild - Der Server, der überprüft werden soll
 * @param {RedisClientType} redisClient - Der Redis-Client
 */
async function checkNukeSettings(client, guild, redisClient) {
  try {
    const adminPermission = PermissionsBitField.Flags.Administrator;

    const rolesWithAdmin = guild.roles.cache.filter(role => role.permissions.has(adminPermission));
    const rolesCount = rolesWithAdmin.size;

    const members = await guild.members.fetch();
    const adminMembers = new Set();
    members.forEach(member => {
      if (member.permissions.has(adminPermission)) {
        adminMembers.add(member.id);
      }
    });
    const adminCount = adminMembers.size;

    let embed;
    if (rolesCount > 3 || adminCount > 5) {
      embed = new EmbedBuilder()
        .setTitle("Kritische Server-Einstellungen erkannt!")
        .setDescription(
          "Es wurden zu viele Admin-Berechtigungen gefunden. Dies erhöht das Risiko eines Nukes.\n\n" +
          "**Sicherheitsmaßnahmen:**\n" +
          "- Admin-Rechte minimal vergeben\n" +
          "- Rollenhierarchie beachten\n" +
          "- Nur vertrauenswürdige Personen und Bots einladen\n" +
          "- Regelmäßig Server-Einstellungen überprüfen\n\n" +
          "Weitere Informationen:\n" +
          "[Discord Sicherheit](https://support.discord.com/hc/de)\n" +
          "[Server-Schutz Tipps](https://www.discordtips.com)"
        )
        .addFields(
          { name: "Admin-Rollen", value: `${rolesCount}`, inline: true },
          { name: "Admin-Mitglieder", value: `${adminCount}`, inline: true }
        )
        .setColor(0xff0000)
        .setFooter({ text: "Created by @apt_start_latifi" })
        .setTimestamp();
    } else {
      embed = new EmbedBuilder()
        .setTitle("Server-Check: Alles in Ordnung")
        .setDescription("Die Admin-Einstellungen deines Servers sind sicher.")
        .addFields(
          { name: "Admin-Rollen", value: `${rolesCount}`, inline: true },
          { name: "Admin-Mitglieder", value: `${adminCount}`, inline: true }
        )
        .setColor(0x00ff00) 
        .setFooter({ text: "Created by @apt_start_latifi" })
        .setTimestamp();
    }

    try {
      const logChannel = await client.channels.fetch(process.env.LOG_CHANNEL_ID);
      if (logChannel) {
        await logChannel.send({ embeds: [embed] });
      }
    } catch (error) {
      console.error("Fehler beim Senden des Nuke-Logs:", error);
    }

    try {
      const logMessage = `Nuke-Check (${new Date().toISOString()}): ${rolesCount} Admin-Rollen, ${adminCount} Admin-Mitglieder.`;
      await redisClient.rPush('bot_logs', logMessage);
    } catch (error) {
      console.error("Fehler beim Speichern des Nuke-Logs in Redis:", error);
    }

    return { rolesCount, adminCount };
  } catch (error) {
    console.error("Fehler bei der Überprüfung der Nuke-Einstellungen:", error);
  }
}

module.exports = {
  checkNukeSettings,
};
