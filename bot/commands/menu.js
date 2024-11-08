import fs from 'fs';
import { fetchMenu } from '../fetchMenu.js';
import { EmbedBuilder } from 'discord.js';

const MENU_FILE = './bot/files/menu.json';

export async function sendMenu(interaction = null) {
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
        console.log("Aucune interaction fournie. Le menu ne sera pas envoyé.");
    }
}

function saveMenu(date, menu) {
    try {
        const menus = loadMenus();
        menus[date] = menu;
        fs.writeFileSync(MENU_FILE, JSON.stringify(menus, null, 2));
    } catch (error) {
        console.error('Erreur lors de la sauvegarde du menu dans menu.json', error);
    }
}

function loadMenus() {
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