import fs from 'fs';

const CHANNELS_FILE = './bot/files/channels.json';

export function setChannel(interaction, channels) {
    try {
        if (!interaction.member || !interaction.member.permissions) {
            console.error("Les permissions du membre ne sont pas disponibles.");
            interaction.reply({ content: "Erreur interne : permissions non disponibles.", ephemeral: true });
            return;
        }
        if (interaction.member.permissions.has("Administrator")) {
            const channel = interaction.options.getChannel('channel');
            if (!channel) {
                interaction.reply({ content: "Veuillez spécifier un canal valide.", ephemeral: true });
                return;
            }

            const guildId = interaction.guild.id;
            channels[guildId] = channel.id;

            saveChannels(channels);

            interaction.reply(`Le canal pour l'envoi du menu a été défini sur : ${channel.toString()}`);
            console.log(`Canal défini pour ${interaction.guild.name} : ${channel.id}`);
        } else {
            interaction.reply({ content: "Vous n'avez pas la permission de définir le canal.", ephemeral: true });
        }
    } catch (error) {
        console.error("Erreur dans setChannel:", error);
    }
}

export function channelIntegration(interaction, channels) {
    try {
        if (interaction.member.permissions.has("Administrator")) {
            const guildId = interaction.guild.id;
            if (guildId === '1169939146341625866') {
                setChannel(interaction, channels);
            } else {
                interaction.reply({ content: "Fonction en cours d'implémentation", ephemeral: true });
            }
        } else {
            interaction.reply({ content: "Vous n'avez pas la permission de définir le canal.", ephemeral: true });
        }
    } catch (error) {
        console.error("Erreur dans channelIntegration:", error);
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
        console.error("Erreur dans loadChannels:", error);
        return {};
    }
}

function saveChannels(channels) {
    try {
        fs.writeFileSync(CHANNELS_FILE, JSON.stringify(channels, null, 2));
    } catch (error) {
        console.error('Erreur lors de la sauvegarde des canaux dans channels.json', error);
    }
}
