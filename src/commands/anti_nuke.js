// src/commands/anti_nuke.js
const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('anti_nuke')
    .setDescription('Überprüft die Servereinstellungen auf kritische Admin- und Invite-Rechte.'),
    
  async execute(interaction, client, redisClient) {
    const guild = interaction.guild;
    if (!guild) {
      return interaction.reply({ content: "Dieser Befehl kann nur in einem Server ausgeführt werden.", ephemeral: true });
    }
    
    const adminMembersCount = guild.members.cache.filter(member =>
      member.permissions.has(PermissionsBitField.Flags.Administrator)
    ).size;
    
    const riskyRoles = guild.roles.cache.filter(role =>
      !role.permissions.has(PermissionsBitField.Flags.Administrator) &&
      role.permissions.has(PermissionsBitField.Flags.ManageGuild)
    );
    
    if (adminMembersCount > 5 || riskyRoles.size > 0) {
      let description = "";
      if (adminMembersCount > 5) {
        description += `Es haben **${adminMembersCount}** Mitglieder Administratorrechte. Das ist kritisch, da zu viele Admins das Risiko erhöhen.\n\n`;
      }
      if (riskyRoles.size > 0) {
        description += `Die folgenden Rollen besitzen "Manage Server" Rechte, obwohl sie keine Administratoren sind:\n`;
        description += riskyRoles.map(role => `${role.name} (<@&${role.id}>)`).join("\n");
        description += `\n\nDies ermöglicht es möglicherweise, dass Nicht-Administratoren Bots einladen können.`;
      }
      
      const warnEmbed = new EmbedBuilder()
        .setTitle("Anti-Nuke Überprüfung")
        .setDescription(description)
        .setColor(0xff0000) 
        .setFooter({ text: "Created by @apt_start_latifi" })
        .setTimestamp();
        
      return interaction.reply({ embeds: [warnEmbed], ephemeral: true });
    } else {
      const okEmbed = new EmbedBuilder()
        .setTitle("Anti-Nuke Überprüfung")
        .setDescription(`Alles in Ordnung. Es haben **${adminMembersCount}** Mitglieder Administratorrechte und es gibt keine riskanten Rollen.`)
        .setColor(0x00ff00) 
        .setFooter({ text: "Created by @apt_start_latifi" })
        .setTimestamp();
        
      return interaction.reply({ embeds: [okEmbed], ephemeral: true });
    }
  },
};
