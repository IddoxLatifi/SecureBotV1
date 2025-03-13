// src/modules/ping.js
const { EmbedBuilder } = require('discord.js');

module.exports = {
  /**
   * Überwacht gelöschte Nachrichten und prüft, ob darin mindestens eine Discord‑Erwähnung enthalten ist.
   * Falls ja, wird in dem gleichen Channel eine Embed-Nachricht gepostet,
   * die anzeigt, dass ein Ghostping erkannt wurde, und zusätzlich ein Log-Embed an den LOG_CHANNEL_ID gesendet.
   * Dieser Script wurde von @apt_start_latifi geschrieben und dient der Sicherheit deines Servers
   * zu 100% Kostenlos und unschlagbar in der Leistung!
   * 
   * @param {Message} message 
   * @param {Client} client 
   * @param {RedisClient} redisClient 
   */
  
  async handleMessageDelete(message, client, redisClient) {
    try {
      if (!message || message.author.bot || !message.content) return;
      
      const mentionRegex = /<@!?(\d+)>/g;
      const matches = message.content.match(mentionRegex);
      if (!matches) return; 
      
      const ghostEmbed = new EmbedBuilder()
        .setTitle("Ghostping detected")
        .setColor(0xff0000)
        .setTimestamp()
        .setFooter({ text: "Created by @apt_start_latifi" });
      
      let desc = "";
      for (const mention of matches) {
        desc += `User ${message.author} pinged ${mention} with follow text:\n> ${message.content}\n\n`;
      }
      ghostEmbed.setDescription(desc);
      
      await message.channel.send({ embeds: [ghostEmbed] });
      
      const logEmbed = new EmbedBuilder()
        .setTitle("Ghostping Log")
        .setDescription(`User ${message.author} ghostpinged ${matches.join(", ")} in <#${message.channel.id}>.\nDeleted message:\n> ${message.content}`)
        .setColor(0xff0000)
        .setTimestamp()
        .setFooter({ text: "Created by @apt_start_latifi" });
      
      const logChannel = await client.channels.fetch(process.env.LOG_CHANNEL_ID);
      if (logChannel) {
        await logChannel.send({ embeds: [logEmbed] });
      }
      
      const logEntry = {
        type: "ghostping",
        executor: message.author.tag,
        executorId: message.author.id,
        targets: matches,
        channelId: message.channel.id,
        content: message.content,
        timestamp: new Date().toISOString()
      };
      await redisClient.rPush("bot_activity", JSON.stringify(logEntry));
      
    } catch (error) {
      console.error("Fehler beim Verarbeiten des Ghostpings:", error);
    }
  }
};
