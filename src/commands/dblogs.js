// src/commands/dblog.js
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('dblog')
    .setDescription('Zeigt alle Aktivitäts-Logs aus der Redis-Datenbank an (nur für Admin).'),
  async execute(interaction, client, redisClient) {
    if (interaction.user.id !== process.env.ADMIN_ID) {
      return interaction.reply({
        content: "Du bist nicht berechtigt, diesen Befehl zu benutzen.",
        ephemeral: true
      });
    }
    
    try {
      const rawLogs = await redisClient.lRange('bot_activity', 0, -1);
      if (!rawLogs || rawLogs.length === 0) {
        return interaction.reply({
          content: "Es wurden noch keine Logs gespeichert.",
          ephemeral: true
        });
      }
      
      const logsByExecutor = {};
      for (const raw of rawLogs) {
        let log;
        try {
          log = JSON.parse(raw);
        } catch (err) {
          continue;
        }
        const executorId = log.executorId || "unknown";
        if (executorId === client.user.id) continue;
        
        if (!logsByExecutor[executorId]) {
          logsByExecutor[executorId] = {};
        }
        const action = log.action ? log.action.toLowerCase() : "unbekannt";
        if (!logsByExecutor[executorId][action]) {
          logsByExecutor[executorId][action] = [];
        }
        logsByExecutor[executorId][action].push(log);
      }
      
      const embeds = [];
      const executorIds = Object.keys(logsByExecutor);

      executorIds.forEach((executorId, index) => {
        const isFirst = (index === 0);
        let headerTitle = isFirst 
          ? "Loggs angefragt :"
          : "Hier ist eine Übersicht deiner Moderatoren und ihrer Aktionen.";

        let description = "";
        description += `**Member <@${executorId}>**\n`;

        const actions = logsByExecutor[executorId];
        for (const action in actions) {
          let actionName;
          if (action === "mute") actionName = "Mute";
          else if (action === "delete") actionName = "Delete Message";
          else if (action === "kick") actionName = "Kick";
          else actionName = action.charAt(0).toUpperCase() + action.slice(1);
          
          description += `\n__${actionName}__:\n`;
          for (const log of actions[action]) {
            const reason = log.reason || "kein Grund";
            const timestamp = log.timestamp || "";
            const target = log.target || "List";
            const targetId = log.targetId || "unknown";
            let details = `**Target:** ${target} (<@${targetId}>)\n`;
            details += `**Grund:** ${reason}\n`;
            details += `**Timestamp:** ${timestamp}\n`;
            if (typeof log.deletedMessages !== "undefined") {
              details += `**Gelöschte Nachrichten:** ${log.deletedMessages}\n`;
            }
            details += "\n"; 
            description += details;
          }
        }

        const maxDescLength = 3800;
        if (description.length <= maxDescLength) {
          const embed = new EmbedBuilder()
            .setTitle(headerTitle)
            .setDescription(description)
            .setColor(0x800080)
            .setFooter({ text: "Created by @apt_start_latifi" })
            .setTimestamp();
          embeds.push(embed);
        } else {
          let remaining = description;
          while (remaining.length > 0) {
            let chunk = remaining.slice(0, maxDescLength);
            const lastNewline = chunk.lastIndexOf("\n");
            if (lastNewline > 0) {
              chunk = chunk.slice(0, lastNewline);
            }
            const embed = new EmbedBuilder()
              .setTitle(headerTitle)
              .setDescription(chunk.trim() + "\n… (gekürzt)")
              .setColor(0x800080)
              .setFooter({ text: "Created by @apt_start_latifi" })
              .setTimestamp();
            embeds.push(embed);
            remaining = remaining.slice(chunk.length).trim();
          }
        }
      });
      
      return interaction.reply({ embeds: embeds, ephemeral: true });
    } catch (error) {
      console.error("Fehler beim Abrufen der Logs aus Redis:", error);
      return interaction.reply({ content: "Beim Abrufen der Logs ist ein Fehler aufgetreten.", ephemeral: true });
    }
  },
};
