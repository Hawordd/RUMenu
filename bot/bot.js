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
            fs.writeFileSync(CHANNEL_ID, channel.id);
            await interaction.reply(`Le canal pour l'envoi du menu a été défini sur : ${channel.toString()}`);
            console.log(`Canal défini : ${channel.toString()}`);
        } else {
            await interaction.reply({ content: "Vous n'avez pas la permission de définir le canal.", ephemeral: true });
        }
    }

    if (interaction.commandName === 'menu') {
        await interaction.deferReply();
        const menu = await fetchMenu();
        console.log(menu);
        const date = new Date();
        const embed = new EmbedBuilder()
            .setTitle(`Menu du RU Aubépin du ${date.toLocaleDateString()}`)
            .setDescription(menu)
            .setColor(0xff0000)
            .setFooter({ text: 'Source : Crous Nantes' })
            .setTimestamp();
        await interaction.editReply({ embeds: [embed] });
    }
});



async function sendDailyMenu() {
    const now = new Date();
    const nextRun = new Date();
    nextRun.setHours(9, 0, 0, 0);
    if (now >= nextRun) nextRun.setDate(nextRun.getDate() + 1);

    setTimeout(async () => {
        try {
            const channelId = fs.readFileSync(CHANNEL_ID, 'utf8').trim();
            const channel = await client.channels.fetch(channelId);
            if (channel) {
                const menu = await fetchMenu();
                await channel.send(`**Menu du RU Aubépin aujourd'hui :**\n\n${menu}`);
            } else {
                console.error("Erreur : le canal spécifié est introuvable.");
            }
        } catch (error) {
            console.error("Erreur lors de l'envoi du menu quotidien :", error);
        }
        setInterval(sendDailyMenu, 24 * 60 * 60 * 1000); // Relancer l'envoi quotidien toutes les 24 heures
    }, nextRun - now);
}

client.login(TOKEN);
