import { Client, GatewayIntentBits, Events, EmbedBuilder } from 'discord.js';
import dotenv from 'dotenv';
import fs from 'fs';
import { fetchMenu } from './fetchMenu.js';

dotenv.config();

const TOKEN = process.env.DISCORD_BOT_TOKEN;
const CHANNELS_FILE = './files/channels.json';

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

// Charger les canaux depuis le fichier JSON
function loadChannels() {
    if (fs.existsSync(CHANNELS_FILE)) {
        return JSON.parse(fs.readFileSync(CHANNELS_FILE));
    } else {
        return {}; // Retourne un objet vide si le fichier n'existe pas
    }
}

// Sauvegarder les canaux dans le fichier JSON
function saveChannels(channels) {
    fs.writeFileSync(CHANNELS_FILE, JSON.stringify(channels, null, 2));
}

client.once(Events.ClientReady, async () => {
    console.log(`Connecté en tant que ${client.user.tag}`);

    try {
        await client.application.commands.set([
            {
                name: 'setchannel',
                description: 'Définit le canal pour envoyer le menu quotidien',
                options: [{ name: 'channel', type: 7, description: 'Le canal à définir', required: true }]
            },
            {
                name: 'menu',
                description: 'Affiche le menu du jour du RU Aubépin'
            }
        ]);
        console.log('Commandes synchronisées.');
    } catch (error) {
        console.error('Erreur lors de la synchronisation des commandes :', error);
    }

    sendDailyMenu();
});

client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const channels = loadChannels();  // Charger les canaux stockés

    if (interaction.commandName === 'setchannel') {
        if (interaction.member.permissions.has("Administrator")) {
            const channel = interaction.options.getChannel('channel');
            const guildId = interaction.guild.id; // ID du serveur

            channels[guildId] = channel.id;  // Associer le canal au serveur

            saveChannels(channels);  // Sauvegarder les changements

            await interaction.reply(`Le canal pour l'envoi du menu a été défini sur : ${channel.toString()}`);
            console.log(`Canal défini pour ${interaction.guild.name} : ${channel.id}`);
        } else {
            await interaction.reply({ content: "Vous n'avez pas la permission de définir le canal.", ephemeral: true });
        }
    }

    if (interaction.commandName === 'menu') {
        await sendMenu(interaction);
    }
});

async function sendDailyMenu() {
    const now = new Date();
    const nextRun = new Date();
    nextRun.setHours(9, 0, 0, 0);
    if (now >= nextRun) nextRun.setDate(nextRun.getDate() + 1);

    setTimeout(async () => {
        try {
            await sendMenu();
        } catch (error) {
            console.error("Erreur lors de l'envoi du menu quotidien :", error);
        }
        setInterval(sendDailyMenu, 24 * 60 * 60 * 1000);  // Relancer l'envoi quotidien toutes les 24 heures
    }, nextRun - now);
}

async function sendMenu(interaction = null) {
    const channels = loadChannels();  // Charger les canaux stockés
    const guildId = interaction ? interaction.guild.id : null;

    // Si un canal est défini pour ce serveur
    const channelId = guildId ? channels[guildId] : null;
    if (!channelId) {
        console.error("Erreur : aucun canal défini pour ce serveur.");
        return;
    }

    const channel = await client.channels.fetch(channelId);
    if (channel) {
        const menu = await fetchMenu();
        const date = new Date();

        const embed = new EmbedBuilder()
            .setTitle(`Menu du RU Aubépin du ${date.toLocaleDateString()}`)
            .setDescription(menu)
            .setColor(0x00ff00)
            .setFooter({ text: 'Source : Crous Nantes' })
            .setImage('https://cellar-c2.services.clever-cloud.com/ma-cantine-egalim-prod/media/0319f531-f193-4eff-b194-2217e6099e2d.jpeg')
            .setTimestamp();

        if (interaction) {
            await interaction.deferReply();  // Allonge le délai d'expiration
            await interaction.editReply({ embeds: [embed] });
        } else {
            await channel.send({ embeds: [embed] });
        }
    } else {
        console.error("Erreur : le canal spécifié est introuvable.");
    }
}

client.login(TOKEN);
