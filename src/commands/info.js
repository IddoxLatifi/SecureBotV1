// src/commands/info.js
const { SlashCommandBuilder, EmbedBuilder, AttachmentBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('info')
    .setDescription('Displays detailed information about a user.')
    .addUserOption(option =>
      option.setName('target')
        .setDescription('The user whose info you want to display')
        .setRequired(false)
    ),
  
  /**
   * Führt den /info-Befehl aus. 
   * Dieser Script wurde von @apt_start_latifi geschrieben und dient der Sicherheit deines Servers
   * zu 100% Kostenlos und unschlagbar in der Leistung!
   * 
   * @param {ChatInputCommandInteraction} interaction 
   * @param {Client} client 
   * @param {RedisClientType} redisClient 
   */
  async execute(interaction, client, redisClient) {
    const user = interaction.options.getUser('target') || interaction.user;
    const member = interaction.guild?.members?.cache?.get(user.id);

    await interaction.deferReply({ ephemeral: true });

    try {
      const activities = member?.presence?.activities || [];
      const activityString = activities.length > 0
        ? activities.map(a => `${a.type}: ${a.name}`).join('\n')
        : 'None';

      const bannerUrl = user.bannerURL({ size: 1024 }) || 'No banner';

      let roleMentions = 'None';
      if (member) {
        const roles = member.roles.cache
          .filter(r => r.id !== interaction.guild.id) 
          .sort((a, b) => b.position - a.position)
          .map(r => r.toString());
        const topRoles = roles.slice(0, 2);
        roleMentions = topRoles.join(', ') || 'None';
      }

      const embed = new EmbedBuilder()
        .setTitle(`${user.username}'s Info`)
        .setDescription("Here is the detailed information about the user.")
        .setColor(0x0000ff)
        .setThumbnail(user.displayAvatarURL({ size: 1024 }))
        .addFields(
          {
            name: 'User Info',
            value: `👤 User: ${user}\n` +
                   `🔤 Username: ${user.username}\n` +
                   `🤖 Bot: ${user.bot ? 'Yes' : 'No'}\n` +
                   `🖼️ Avatar: [Link](${user.displayAvatarURL({ size: 1024 })})\n` +
                   `🎨 Banner: ${bannerUrl === 'No banner' ? 'No banner' : `[Link](${bannerUrl})`}\n` +
                   `💻 Status: ${member?.presence?.status || 'offline'}`,
            inline: false
          },
          {
            name: 'Member Info',
            value: member
              ? `📅 Joined Server: <t:${Math.floor(member.joinedAt?.getTime() / 1000)}:R>\n` +
                `🏷️ Display Name: ${member.displayName}\n` +
                `🔝 Top Roles: ${roleMentions}\n` +
                `📆 Joined Discord: <t:${Math.floor(user.createdAt?.getTime() / 1000)}:R>\n`
              : 'No member info (User not in this server)',
            inline: false
          },
          {
            name: 'Activities',
            value: `🥦 Activity: ${activityString}`,
            inline: true
          }
        )
        .setFooter({ text: `Requested by ${interaction.user.username} | Created by @apt_start_latifi`, iconURL: interaction.user.displayAvatarURL() })
        .setTimestamp();

      await interaction.followUp({
        embeds: [embed],
      });

    } catch (error) {
      console.error("Error executing /info command:", error);
      await interaction.followUp({ content: 'There was an error processing this command.', ephemeral: true });
    }
  }
};
