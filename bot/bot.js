import { Client, Events, GatewayIntentBits } from 'discord.js';
import { sendMenu } from './commands/menu.js';
import { loadChannels, channelIntegration } from './commands/setchannel.js';
import cron from 'node-cron';
import dotenv from 'dotenv';
import { fetchMenu } from './fetchMenu.js';

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

dotenv.config();

const TOKEN = process.env.DISCORD_BOT_TOKEN;

client.once(Events.ClientReady, async () => {
    console.log(`Connecté en tant que ${client.user.tag}`);

    try {
        await client.application.commands.set([
            {
                name: 'setchannel',
                description: 'EN DEVELOPPEMENT - Définit le canal pour envoyer le menu quotidien',
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

    cron.schedule('0 10 * * *', () => {
        sendDailyMenu();
    });

    sendDailyMenu();
});

client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const channels = loadChannels();

    if (interaction.commandName === 'setchannel') {
        await channelIntegration(interaction, channels);
    }

    if (interaction.commandName === 'menu') {
        await sendMenu(interaction);
    }
});

async function sendDailyMenu() {
    const channels = loadChannels();
    const date = new Date().toLocaleDateString();
    const menu = await fetchMenu();

    for (const guildId in channels) {
        const channelId = channels[guildId];
        const channel = await client.channels.fetch(channelId);
        if (channel) {
            sendDailyMenu(menu, channel);
        } else {
            console.error(`Erreur : le canal ${channelId} pour la guilde ${guildId} est introuvable.`);
        }
    }
}

client.login(TOKEN);