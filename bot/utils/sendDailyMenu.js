import { fetchMenu } from './fetchMenu.js';
import { loadMenus, saveMenu, createMenuEmbed } from '../commands/menu.js';
import { loadChannels } from '../commands/setchannel.js';

export async function sendDailyMenu() {
    const channels = loadChannels();
    const date = new Date().toLocaleDateString();
    const menus = loadMenus();
    let menu = null;

    if (menus[date]) {
        console.log('Menu déjà enregistré pour aujourd\'hui.');
        menu = menus[date];
    } else {
        console.log('Aucun menu trouvé pour aujourd\'hui, récupération...');
        menu = await fetchMenu();
        saveMenu(date, menu);
    }

    const embed = createMenuEmbed(menu);

    for (const guildId in channels) {
        const channelId = channels[guildId];
        const channel = await client.channels.fetch(channelId);
        if (channel) {
            if (menu) {
                await channel.send({ embeds: [embed] });
            } else {
                console.error('Aucun menu trouvé.');
            }
        } else {
            console.error(`Erreur : le canal ${channelId} pour la guilde ${guildId} est introuvable.`);
        }
    }
}