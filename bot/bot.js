import { Client, GatewayIntentBits, Events, REST, Routes } from 'discord.js';
import fetch from 'node-fetch';
import dotenv from 'dotenv';
import fs from 'fs';
import { createRequire } from 'module';
import { EmbedBuilder } from 'discord.js';
import { fetchMenu } from './fetchMenu.js';
const require = createRequire(import.meta.url);

dotenv.config();
const TOKEN = process.env.DISCORD_BOT_TOKEN;
const CHANNEL_ID = process.env.CHANNEL_ID;

const client = new Client({
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
});

client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isChatInputCommand()) return;

    if (interaction.commandName === 'setchannel') {
        if (interaction.member.permissions.has("Administrator")) {
            const channel = interaction.options.getChannel('channel');
            fs.writeFileSync('.env', `CHANNEL_ID=${channel.id}\n`, { flag: 'a' });
            await interaction.reply(`Le canal pour l'envoi du menu a été défini sur : ${channel.toString()}`);
            console.log(`Canal défini : ${channel.toString()}`);
        } else {
            await interaction.reply({ content: "Vous n'avez pas la permission de définir le canal.", ephemeral: true });
        }
    }

    if (interaction.commandName === 'menu') {
        await sendMenu();
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
        setInterval(sendDailyMenu, 24 * 60 * 60 * 1000); // Relancer l'envoi quotidien toutes les 24 heures
    }, nextRun - now);
}

async function sendMenu() {
    const channel = await client.channels.fetch(CHANNEL_ID);
    if (channel) {
        await interaction.deferReply();
        const menu = await fetchMenu();
        console.log(menu);
        const date = new Date();
        const embed = new EmbedBuilder()
            .setTitle(`Menu du RU Aubépin du ${date.toLocaleDateString()}`)
            .setDescription(menu)
            .setColor(0x00ff00)
            .setFooter({ text: 'Source : Crous Nantes' })
            .setImage('https://cellar-c2.services.clever-cloud.com/ma-cantine-egalim-prod/media/0319f531-f193-4eff-b194-2217e6099e2d.jpeg')
            .setTimestamp();
        await interaction.editReply({ embeds: [embed] });
    } else {
        console.error("Erreur : le canal spécifié est introuvable.");
    }
}

client.login(TOKEN);
