import { Client, GatewayIntentBits, Events, EmbedBuilder } from 'discord.js';
import dotenv from 'dotenv';
import { sendMenu } from './commands/menu.js';
import { loadChannels, setChannel, channelIntegration } from './commands/setchannel.js';

dotenv.config();

const TOKEN = process.env.DISCORD_BOT_TOKEN;

export const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

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

    const channels = loadChannels();

    if (interaction.commandName === 'setchannel') {
        await channelIntegration(interaction, channels);
        //await setChannel(interaction, channels);
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
        setInterval(sendDailyMenu, 24 * 60 * 60 * 1000);
    }, nextRun - now);
}

client.login(TOKEN);
