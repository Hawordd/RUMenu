import { loadChannels, saveChannels } from './setchannel.js';
import { PermissionsBitField } from 'discord.js';

export async function stopMenu(interaction) {
    try {
        if (!interaction.member || !interaction.member.permissions) {
            console.error("Les permissions du membre ne sont pas disponibles.");
            await interaction.reply({ content: "Erreur interne : permissions non disponibles.", ephemeral: true });
            return;
        }
        if (interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            const guildId = interaction.guild.id;
            const channels = loadChannels();

            if (channels[guildId]) {
                delete channels[guildId];
                saveChannels(channels);
                await interaction.reply(`L'envoi du menu a été désactivé pour ce serveur.`);
                console.log(`Canal supprimé pour ${interaction.guild.name}`);
            } else {
                await interaction.reply({ content: "Aucun canal n'est défini pour ce serveur.", ephemeral: true });
            }
        } else {
            await interaction.reply({ content: "Vous n'avez pas la permission d'exécuter cette commande.", ephemeral: true });
        }
    } catch (error) {
        console.error("Erreur dans stopMenu:", error);
    }
}