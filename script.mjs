import { Client, GatewayIntentBits, Events, REST, Routes } from 'discord.js';
import fetch from 'node-fetch';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const cheerio = require('cheerio');

// Charger les variables d'environnement
dotenv.config();
const TOKEN = process.env.DISCORD_BOT_TOKEN;
const CHANNEL_ID = process.env.CHANNEL_ID;

// Initialisation du client Discord
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

// Fonction pour récupérer le menu du jour
async function fetchMenu() {
    try {
        const url = "https://www.crous-nantes.fr/restaurant/resto-u-aubepin/";
        const response = await fetch(url);
        if (response.ok) {
            const body = await response.text();
            const $ = cheerio.load(body);
            const menuSection = $('div.meal');
            return menuSection.length ? menuSection.text().trim() : "Le menu n'est pas disponible pour le moment.";
        } else {
            return "Erreur lors de la récupération du menu.";
        }
    } catch (error) {
        console.error("Erreur lors de la récupération du menu :", error);
        return "Erreur lors de la récupération du menu.";
    }
}

// Événement lors de la connexion du bot
client.once(Events.ClientReady, async () => {
    console.log(`Connecté en tant que ${client.user.tag}`);

    // Enregistrement des commandes (à exécuter lors du déploiement du bot)
    const rest = new REST({ version: '10' }).setToken(TOKEN);
    try {
        console.log('Enregistrement des commandes slash.');
        await rest.put(
            Routes.applicationCommands(client.user.id), // Utilise l'ID du bot après qu'il soit prêt
            {
                body: [
                    {
                        name: 'setchannel',
                        description: 'Définit le canal pour envoyer le menu quotidien',
                        options: [{ name: 'channel', type: 7, description: 'Le canal à définir', required: true }]
                    },
                    {
                        name: 'menu',
                        description: 'Affiche le menu du jour du RU Aubépin'
                    }
                ]
            }
        );
        console.log('Commandes enregistrées.');
    } catch (error) {
        console.error('Erreur lors de l\'enregistrement des commandes :', error);
    }

    sendDailyMenu(); // Lancer l'envoi quotidien du menu
});

// Commande pour définir le canal pour l'envoi quotidien
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
        const menu = await fetchMenu();
        await interaction.reply(`**Menu du RU Aubépin aujourd'hui :**\n\n${menu}`);
    }
});

// Fonction pour envoyer le menu quotidien à l'heure spécifiée
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

// Connexion du bot à Discord
client.login(TOKEN);
