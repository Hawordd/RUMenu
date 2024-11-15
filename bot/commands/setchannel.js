import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { PermissionsBitField } from 'discord.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CHANNELS_FILE = path.resolve(__dirname, '../files/channels.json');

export async function setChannel(interaction, channels) {
    try {
        if (!interaction.member || !interaction.member.permissions) {
            console.error("Les permissions du membre ne sont pas disponibles.");
            await interaction.reply({ content: "Erreur interne : permissions non disponibles.", ephemeral: true });
            return;
        }
        if (interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            const channel = interaction.options.getChannel('channel');
            if (!channel) {
                await interaction.reply({ content: "Veuillez spécifier un canal valide.", ephemeral: true });
                return;
            }

            const guildId = interaction.guild.id;
            channels[guildId] = channel.id;

            saveChannels(channels);

            await interaction.reply(`Le canal pour l'envoi du menu a été défini sur : ${channel.toString()}`);
            console.log(`Canal défini pour ${interaction.guild.name} : ${channel.id}`);
        } else {
            await interaction.reply({ content: "Vous n'avez pas la permission de définir le canal.", ephemeral: true });
        }
    } catch (error) {
        console.error("Erreur dans setChannel:", error);
    }
}

export function saveChannels(channels) {
    try {
        const dir = path.dirname(CHANNELS_FILE);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }

        fs.writeFileSync(CHANNELS_FILE, JSON.stringify(channels, null, 2));
        console.log('Canaux sauvegardés avec succès.');
    } catch (error) {
        console.error('Erreur lors de la sauvegarde des canaux dans channels.json', error);
    }
}

export function loadChannels() {
    try {
        if (fs.existsSync(CHANNELS_FILE)) {
            const fileContent = fs.readFileSync(CHANNELS_FILE, 'utf-8');
            if (fileContent.trim() === '') {
                return {};
            }
            try {
                return JSON.parse(fileContent);
            } catch (error) {
                console.error('Erreur de parsing dans le fichier channels.json', error);
                return {};
            }
        } else {
            return {};
        }
    } catch (error) {
        console.error('Erreur lors du chargement des canaux depuis channels.json', error);
        return {};
    }
}

export async function channelIntegration(interaction, channels) {
    setChannel(interaction, channels);
}