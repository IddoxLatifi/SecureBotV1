// src/commands/delete.js
const { SlashCommandBuilder } = require('discord.js');
const { getHammertime } = require('../utils/time');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('delete')
    .setDescription('Löscht Nachrichten eines bestimmten Members und loggt die Aktion.')
    .addUserOption(option =>
      option.setName('member')
        .setDescription('Der Member, dessen Nachrichten gelöscht werden sollen.')
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName('duration')
        .setDescription('Zeitraum der Nachrichten, die gelöscht werden sollen')
        .setRequired(true)
        .addChoices(
          { name: '1 Stunde', value: '1h' },
          { name: '1 Tag', value: '1d' },
          { name: '1 Woche', value: '1w' },
          { name: 'Alles', value: 'all' }
        )
    )
    .addStringOption(option =>
      option.setName('reason')
        .setDescription('Grund für das Löschen')
        .setRequired(true)
    ),
  async execute(interaction, client, redisClient) {
    const allowedUserIds = [
      process.env.ADMIN_ID,
      ...(process.env.MODERATOR_ID ? process.env.MODERATOR_ID.split(',').map(id => id.trim()) : [])
    ];
    if (!allowedUserIds.includes(interaction.user.id)) {
      return interaction.reply({ content: "Du bist nicht berechtigt, diesen Befehl zu benutzen.", ephemeral: true });
    }
    
    const targetMember = interaction.options.getMember('member');
    const duration = interaction.options.getString('duration');
    const reason = interaction.options.getString('reason');
    
    let cutoffTimestamp;
    if (duration === '1h') {
      cutoffTimestamp = Date.now() - (1 * 60 * 60 * 1000);
    } else if (duration === '1d') {
      cutoffTimestamp = Date.now() - (24 * 60 * 60 * 1000);
    } else if (duration === '1w') {
      cutoffTimestamp = Date.now() - (7 * 24 * 60 * 60 * 1000);
    } else if (duration === 'all') {
      cutoffTimestamp = 0; 
    }
    
    let hammertimeStamp;
    try {
      hammertimeStamp = await getHammertime();
    } catch (err) {
      hammertimeStamp = new Date().toLocaleString('de-DE', { timeZone: 'Europe/Berlin' });
    }
    
    let deletedCount = 0;
    const guild = interaction.guild;
    const channels = guild.channels.cache.filter(ch =>
      ch.isTextBased() && ch.permissionsFor(guild.members.me)?.has("ManageMessages")
    );
    
    for (const channel of channels.values()) {
      try {
        const messages = await channel.messages.fetch({ limit: 100 });
        const userMessages = messages.filter(msg =>
          msg.author.id === targetMember.id && msg.createdTimestamp >= cutoffTimestamp
        );
        if (userMessages.size > 0) {
          const bulkDeleted = await channel.bulkDelete(userMessages, true);
          deletedCount += bulkDeleted.size;
        }
      } catch (err) {
        console.error(`Fehler beim Löschen in Channel ${channel.id}:`, err);
      }
    }
    
    const logEntry = {
      executor: interaction.user.tag,
      executorId: interaction.user.id,
      target: targetMember.user.tag,
      targetId: targetMember.id,
      reason: reason,
      duration: duration,
      timestamp: hammertimeStamp,
      deletedMessages: deletedCount
    };
    
    await redisClient.rPush('bot_activity', JSON.stringify(logEntry));
    
    return interaction.reply({ 
      content: `Nachrichten von ${targetMember.user.tag} wurden gelöscht (Zeitraum: ${duration}, Grund: ${reason}). (${deletedCount} Nachrichten)`, 
      ephemeral: true 
    });
  },
};
