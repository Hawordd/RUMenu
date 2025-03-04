import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { fetchMenu } from '../utils/fetchMenu.js';
import { EmbedBuilder } from 'discord.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MENU_FILE = path.resolve(__dirname, '../files/menu.json');

export async function sendMenu(interaction = null) {
    const date = new Date().toISOString().split('T')[0];
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

export async function sendDailyMenu(menu, channel) {
    const date = new Date().toISOString().split('T')[0];
    const menus = loadMenus();

    if (menus[date]) {
        console.log('Menu déjà enregistré pour aujourd\'hui.');
        sendMenuToChannel(menus[date], channel);
    } else {
        console.log('Aucun menu trouvé pour aujourd\'hui, envoi du menu fourni...');
        saveMenu(date, menu);
        sendMenuToChannel(menu, channel);
    }
}

async function sendMenuToChannel(menu, interaction = null) {
    const embed = createMenuEmbed(menu);

    if (interaction) {
        try {
            await interaction.deferReply();
            await interaction.editReply({ embeds: [embed] });
        } catch (error) {
            if (error.code === 10062) {
                console.error('Interaction inconnue ou expirée.');
            } else {
                console.error('Erreur lors de la réponse à l\'interaction :', error);
            }
        }
    } else {
        console.error('Aucune interaction fournie. Le menu ne sera pas envoyé.');
    }
}

export function saveMenu(date, menu) {
    try {
        const menus = loadMenus();
        menus[date] = menu;

        const dir = path.dirname(MENU_FILE);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }

        fs.writeFileSync(MENU_FILE, JSON.stringify(menus, null, 2));
        console.log('Menu sauvegardé avec succès.');
    } catch (error) {
        console.error('Erreur lors de la sauvegarde du menu dans menu.json', error);
    }
}

export function loadMenus() {
    if (fs.existsSync(MENU_FILE)) {
        const fileContent = fs.readFileSync(MENU_FILE, 'utf-8');
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

export function createMenuEmbed(menu) {
    return new EmbedBuilder()
        .setTitle(`Menu du RU Aubépin du ${new Date().toLocaleDateString()}`)
        .setDescription(menu)
        .setColor(0x00ff00)
        .setFooter({ text: 'Source : Crous Nantes' })
        .setImage('https://cellar-c2.services.clever-cloud.com/ma-cantine-egalim-prod/media/0319f531-f193-4eff-b194-2217e6099e2d.jpeg')
        .setTimestamp();
}