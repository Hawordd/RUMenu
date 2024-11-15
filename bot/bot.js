import { Client, Events, GatewayIntentBits } from 'discord.js';
import { sendMenu } from './commands/menu.js';
import { loadChannels, channelIntegration } from './commands/setchannel.js';
import cron from 'node-cron';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { sendDailyMenu } from './utils/sendDailyMenu.js';
import { stopMenu } from './commands/stopmenu.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

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
            },
            {
                name: 'stopmenu',
                description: 'Arrête l\'envoi du menu quotidien'
            }
        ]);
        console.log('Commandes synchronisées.');
    } catch (error) {
        console.error('Erreur lors de la synchronisation des commandes :', error);
    }

    cron.schedule('0 11 * * *', () => {
        console.log("Envoi du menu quotidien à " + new Date());
        sendDailyMenu();
    });

});

client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isChatInputCommand()) return;

    if (interaction.commandName === 'setchannel') {
        const channels = loadChannels();
        await channelIntegration(interaction, channels);
    }

    if (interaction.commandName === 'menu') {
        await sendMenu(interaction);
    }

    if (interaction.commandName === 'stopmenu') {
        await stopMenu(interaction);
    }
});

client.login(TOKEN);