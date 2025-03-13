// src/commands/mute.js
const { SlashCommandBuilder } = require('discord.js');
const { getHammertime } = require('../utils/time');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('mute')
    .setDescription('Mutet einen Member für einen bestimmten Zeitraum.')
    .addUserOption(option =>
      option.setName('member')
        .setDescription('Der Member, der gemutet werden soll.')
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName('time')
        .setDescription('Dauer des Mutes.')
        .setRequired(true)
        .addChoices(
          { name: '10 Minuten', value: '10min' },
          { name: '1 Stunde', value: '1h' },
          { name: '2 Stunden', value: '2h' },
          { name: '4 Stunden', value: '4h' },
          { name: '8 Stunden', value: '8h' },
          { name: '1 Tag', value: '1d' },
          { name: '3 Tage', value: '3d' }
        )
    )
    .addStringOption(option =>
      option.setName('reason')
        .setDescription('Grund für das Muten.')
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
    const timeOption = interaction.options.getString('time');
    const reason = interaction.options.getString('reason');

    let durationMs;
    switch (timeOption) {
      case '10min':
        durationMs = 10 * 60 * 1000;
        break;
      case '1h':
        durationMs = 60 * 60 * 1000;
        break;
      case '2h':
        durationMs = 2 * 60 * 60 * 1000;
        break;
      case '4h':
        durationMs = 4 * 60 * 60 * 1000;
        break;
      case '8h':
        durationMs = 8 * 60 * 60 * 1000;
        break;
      case '1d':
        durationMs = 24 * 60 * 60 * 1000;
        break;
      case '3d':
        durationMs = 3 * 24 * 60 * 60 * 1000;
        break;
      default:
        return interaction.reply({ content: "Ungültige Zeitangabe.", ephemeral: true });
    }

    try {
      await targetMember.timeout(durationMs, reason);
    } catch (error) {
      console.error(`Fehler beim Muten von ${targetMember.user.tag}:`, error);
      return interaction.reply({ content: "Das Muting konnte nicht durchgeführt werden.", ephemeral: true });
    }

    let currentTime;
    try {
      currentTime = await getHammertime();
    } catch (error) {
      currentTime = new Date().toLocaleString('de-DE', { timeZone: 'Europe/Berlin' });
    }

    const logEntry = {
      executor: interaction.user.tag,
      executorId: interaction.user.id,
      target: targetMember.user.tag,
      targetId: targetMember.id,
      duration: timeOption,
      reason: reason,
      timestamp: currentTime
    };

    try {
      await redisClient.rPush('bot_activity', JSON.stringify(logEntry));
    } catch (error) {
      console.error("Fehler beim Speichern des Log-Eintrags in Redis:", error);
    }

    return interaction.reply({ content: `**${targetMember.user.tag}** wurde für ${timeOption} gemutet. Grund: ${reason}`, ephemeral: true });
  },
};
