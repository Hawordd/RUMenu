import { Client, GatewayIntentBits, Events, EmbedBuilder } from 'discord.js';
import dotenv from 'dotenv';
import fs from 'fs';
import { fetchMenu } from './fetchMenu.js';

dotenv.config();

const TOKEN = process.env.DISCORD_BOT_TOKEN;
const CHANNELS_FILE = './bot/files/channels.json';
const MENUS_FILE = './bot/files/menu.json';

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});


function loadChannels() {
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
}

function loadMenus() {
    if (fs.existsSync(MENUS_FILE)) {
        const fileContent = fs.readFileSync(MENUS_FILE, 'utf-8');
        if (fileContent.trim() === '') {
            return {};
        }
        try {
            return JSON.parse(fileContent);
        } catch (error) {
            console.error('Erreur de parsing dans le fichier menu.json', error);
            return {};
        }
    } else {
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

function saveMenu(date, menu) {
    try {
        const menus = loadMenus();
        menus[date] = menu;
        fs.writeFileSync(MENUS_FILE, JSON.stringify(menus, null, 2));
    } catch (error) {
        console.error('Erreur lors de la sauvegarde du menu dans menu.json', error);
    }
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

    const channels = loadChannels();

    if (interaction.commandName === 'setchannel') {
        if (interaction.member.permissions.has("Administrator")) {
            const channel = interaction.options.getChannel('channel');
            const guildId = interaction.guild.id;

            channels[guildId] = channel.id;

            saveChannels(channels);

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
        setInterval(sendDailyMenu, 24 * 60 * 60 * 1000);
    }, nextRun - now);
}

async function sendMenu(interaction = null) {
    const date = new Date().toLocaleDateString();
    const menus = loadMenus();

    if (menus[date]) {
        console.log('Menu déjà enregistré pour aujourd\'hui.');
        sendMenuToChannel(menus[date], interaction);
    } else {
        console.log('Aucun menu trouvé pour aujourd\'hui, récupération...');
        const menu = await fetchMenu();
        saveMenu(date, menu);
        sendMenuToChannel(menu, interaction);
    }
}

async function sendMenuToChannel(menu, interaction = null) {
    const channels = loadChannels();
    const guildId = interaction ? interaction.guild.id : null;

    const channelId = guildId ? channels[guildId] : null;
    if (!channelId) {
        console.error("Erreur : aucun canal défini pour ce serveur.");
        return;
    }

    const channel = await client.channels.fetch(channelId);
    if (channel) {
        const embed = new EmbedBuilder()
            .setTitle(`Menu du RU Aubépin du ${new Date().toLocaleDateString()}`)
            .setDescription(menu)
            .setColor(0x00ff00)
            .setFooter({ text: 'Source : Crous Nantes' })
            .setImage('https://cellar-c2.services.clever-cloud.com/ma-cantine-egalim-prod/media/0319f531-f193-4eff-b194-2217e6099e2d.jpeg')
            .setTimestamp();

        if (interaction) {
            await interaction.deferReply();
            await interaction.editReply({ embeds: [embed] });
        } else {
            await channel.send({ embeds: [embed] });
        }
    } else {
        console.error("Erreur : le canal spécifié est introuvable.");
    }
}

client.login(TOKEN);
