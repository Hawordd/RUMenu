import fetch from 'node-fetch';
import * as cheerio from 'cheerio';

export async function fetchMenu() {
    try {
        const url = 'https://www.crous-nantes.fr/restaurant/resto-u-aubepin/';
        const response = await fetch(url);

        if (response.ok) {
            const body = await response.text();
            const content = cheerio.load(body);

            const menuSections = content('.menu');
            let allMenus = {};

            if (menuSection.length) {
                const menuText = menuSection.html().trim();
                const formattedMenu = formatMenu(menuText);

                return formattedMenu;
            } else {
                return 'Le menu n\'est pas disponible pour le moment.';
            }
        } else {
            return 'Erreur lors de la récupération du menu.';
        }
    } catch (error) {
        console.error('Erreur lors de la récupération du menu :', error);
        return 'Erreur lors de la récupération du menu.';
    }
}

export function formatMenu(htmlContent) {
    const $ = cheerio.load(htmlContent);

    let formattedMenu = '';

    $('li:has(ul)').each((index, element) => {
        const poleName = $(element).contents().first().text().trim();

        const dishes = $(element).find('ul li').map((i, el) => $(el).text().trim()).get();

        formattedMenu += `**${poleName}**\n`;
        dishes.forEach(dish => {
            formattedMenu += `- ${dish}\n`;
        });
        formattedMenu += '\n';
    });

    return formattedMenu;
}



