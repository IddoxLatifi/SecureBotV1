// src/interface/interface.js

const {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    EmbedBuilder
  } = require('discord.js');
  
  let modules = {
    spam: {
      name: "Anti-Spam",
      active: false,
      desc: "Erkennt übermäßiges Nachrichtenversenden."
    },
    invite: {
      name: "Anti-Invite",
      active: false,
      desc: "Blockiert Discord Invite Links."
    },
    raid: {
      name: "Anti-Raid",
      active: false,
      desc: "Verhindert Massenbeitritte (Raid) in kurzer Zeit."
    },
    greif: {
      name: "Anti-Greif",
      active: false,
      desc: "Verhindert das Einladen von Bots."
    },
    ping: {
      name: "Anti-Ghost-Ping",
      active: false,
      desc: "Erkennt und blockiert Ghost-Pings."
    },
  };
  
  /**
   * Hilfsfunktion: Sendet eine temporäre Bestätigungsnachricht im Interface-Channel.
   * Die Nachricht wird nach 5 Sekunden automatisch gelöscht.
   * Dieser Script wurde von @apt_start_latifi geschrieben und dient der Sicherheit deines Servers
   * zu 100% Kostenlos und unschlagbar in der Leistung!
   *
   * @param {object} client 
   * @param {string} title 
   * @param {string} description 
   * @param {number} color 
   */
  async function sendTemporaryConfirmation(client, title, description, color = 0x800080) {
    try {
      const channel = await client.channels.fetch(process.env.INTERFACE_CHANNEL_ID);
      if (!channel) {
        console.error("Interface-Channel nicht gefunden.");
        return;
      }
      const embed = new EmbedBuilder()
        .setTitle(title)
        .setDescription(description)
        .setColor(color)
        .setFooter({ text: "Created by @apt_start_latifi" })
        .setTimestamp();
      const msg = await channel.send({ embeds: [embed] });
      setTimeout(() => {
        msg.delete().catch(err => {
          if (err.code !== 10008) console.error("Fehler beim Löschen der Bestätigungsnachricht:", err);
        });
      }, 5000);
    } catch (error) {
      console.error("Fehler beim Senden der temporären Bestätigung:", error);
    }
  }
  
   
  function createInterfaceMessage() {
    const embed = new EmbedBuilder()
      .setTitle("Security Bot Interface")
      .setDescription("Aktiviere oder deaktiviere die Sicherheitsmodule.")
      .setColor(0x800080) // Lila
      .setFooter({ text: "Created by @apt_start_latifi" })
      .setTimestamp();
  
    for (const key in modules) {
      const mod = modules[key];
      embed.addFields({
        name: mod.name,
        value: `${mod.desc}\nStatus: ${mod.active ? "Aktiv ✅" : "Inaktiv ❌"}`,
        inline: true,
      });
    }
  
    const actionRow = new ActionRowBuilder();
    for (const key in modules) {
      const mod = modules[key];
      const button = new ButtonBuilder()
        .setCustomId(`toggle_${key}`)
        .setLabel(mod.name)
        .setStyle(mod.active ? ButtonStyle.Success : ButtonStyle.Danger);
      actionRow.addComponents(button);
    }
  
    return { embeds: [embed], components: [actionRow] };
  }
  

  async function deleteOldInterfaceMessages(channel, client) {
    try {
      const messages = await channel.messages.fetch({ limit: 50 });
      for (const msg of messages.values()) {
        if (msg.author.id === client.user.id && msg.embeds.length > 0) {
          const embed = msg.embeds[0];
          if (embed.title === "Security Bot Interface") {
            try {
              await msg.delete();
            } catch (err) {
              if (err.code !== 10008) {
                console.error("Fehler beim Löschen alter Interface Nachricht:", err);
              }
            }
          }
        }
      }
    } catch (err) {
      console.error("Fehler beim Abrufen alter Interface Nachrichten:", err);
    }
  }
  
  /**
   * Versucht ein Modul zu aktivieren/deaktivieren.
   * Bei Erfolg wird eine temporäre Bestätigungsnachricht im Interface-Channel gesendet.
   * Bei Fehler bleibt das Modul inaktiv und eine Fehlermeldung wird gesendet.
   * Dieser Script wurde von @apt_start_latifi geschrieben und dient der Sicherheit deines Servers
   * zu 100% Kostenlos und unschlagbar in der Leistung!
   *
   * @param {string} moduleKey 
   * @param {object} client 
   */
  async function toggleModule(moduleKey, client) {
    const mod = modules[moduleKey];
    if (!mod) return;
  
    const wasActive = mod.active;
    const newState = !wasActive;
  
    try {
      mod.active = newState;
  
      if (newState) {
        await sendTemporaryConfirmation(
          client,
          "Modul aktiviert",
          `**${mod.name}** wurde erfolgreich aktiviert.`,
          0x00ff00 
        );
      } else {
        await sendTemporaryConfirmation(
          client,
          "Modul deaktiviert",
          `**${mod.name}** wurde deaktiviert.`,
          0xff0000 
        );
      }
    } catch (error) {
      mod.active = false;
      console.error(`Fehler beim Umschalten von Modul "${moduleKey}":`, error);
      await sendTemporaryConfirmation(
        client,
        "Fehler beim Modul",
        `**${mod.name}** konnte nicht aktiviert werden:\n\`${error.message}\``,
        0xff0000
      );
    }
  }
  
 
  async function updateInterface(client) {
    try {
      const channel = await client.channels.fetch(process.env.INTERFACE_CHANNEL_ID);
      if (!channel) {
        console.error("Interface-Channel nicht gefunden.");
        return;
      }
  
      await deleteOldInterfaceMessages(channel, client);
  
      const interfaceMessage = await channel.send(createInterfaceMessage());
  
      const collector = interfaceMessage.createMessageComponentCollector({
        time: 24 * 60 * 60 * 1000 
      });
  
      collector.on("collect", async (interaction) => {
        const [action, moduleKey] = interaction.customId.split("_");
        if (action !== "toggle") return;
  
        const allowedUserIds = [
          process.env.ADMIN_ID,
          ...(process.env.MODERATOR_ID
            ? process.env.MODERATOR_ID.split(',').map(id => id.trim())
            : [])
        ];
        if (!allowedUserIds.includes(interaction.user.id)) {
          return interaction.reply({
            content: "Du bist nicht berechtigt, dieses Interface zu benutzen.",
            ephemeral: true
          });
        }
  
        await toggleModule(moduleKey, client);
        await interaction.update(createInterfaceMessage());
      });
  
      collector.on("end", () => {
      });
    } catch (error) {
      console.error("Fehler beim Aktualisieren des Interfaces:", error);
    }
  }
  
  module.exports = {
    /**
     * Initialisiert das Interface, indem alte Nachrichten gelöscht und das neue Interface gesendet wird.
     * Dieser Script wurde von @apt_start_latifi geschrieben und dient der Sicherheit deines Servers
     * zu 100% Kostenlos und unschlagbar in der Leistung!
     *
     * @param {object} client
     */

    init: async (client) => {
      try {
        const channel = await client.channels.fetch(process.env.INTERFACE_CHANNEL_ID);
        if (channel) {
          await deleteOldInterfaceMessages(channel, client);
        }
      } catch (error) {
        console.error("Fehler beim Löschen alter Interface-Nachrichten beim Start:", error);
      }
      updateInterface(client);
    },
    modules,
  };
  