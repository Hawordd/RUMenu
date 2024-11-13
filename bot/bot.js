import { Client, Events, GatewayIntentBits } from 'discord.js';
import { sendMenu } from './commands/menu.js';
import { loadChannels, channelIntegration } from './commands/setchannel.js';
import cron from 'node-cron';
import dotenv from 'dotenv';
import { fetchMenu } from './utils/fetchMenu.js';
import path from 'path';
import { fileURLToPath } from 'url';

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
            }
        ]);
        console.log('Commandes synchronisées.');
    } catch (error) {
        console.error('Erreur lors de la synchronisation des commandes :', error);
    }


    cron.schedule('0 10 * * *', () => {
        sendDailyMenu();
    });

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
    const menus = loadMenus();
    const menu = null;

    if (menus[date]) {
        console.log('Menu déjà enregistré pour aujourd\'hui.');
        menu = menus[date];
    } else {
        console.log('Aucun menu trouvé pour aujourd\'hui, récupération...');
        const menu = await fetchMenu();
        saveMenu(date, menu);
    }

    for (const guildId in channels) {
        const channelId = channels[guildId];
        const channel = await client.channels.fetch(channelId);
        if (channel) {
            if (menu) {
                await channel.send({ content: `Menu du jour :`, files: [menu] });
            } else {
                console.error('Aucun menu trouvé.');
            }
        } else {
            console.error(`Erreur : le canal ${channelId} pour la guilde ${guildId} est introuvable.`);
        }
    }
}

client.login(TOKEN);