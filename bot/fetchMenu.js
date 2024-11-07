import fetch from 'node-fetch';
import * as cheerio from 'cheerio';
import { EmbedBuilder } from 'discord.js';

export async function fetchMenu() {
    try {
        const url = 'https://www.crous-nantes.fr/restaurant/resto-u-aubepin/';
        const response = await fetch(url);

        if (response.ok) {
            const body = await response.text();
            const $ = cheerio.load(body);

            // Récupération de la balise <ul class="meal_foodies">
            const menuSection = $('ul.meal_foodies');

            if (menuSection.length) {
                const menuText = menuSection.html().trim(); // Extraire le texte de la balise
                const formattedMenu = formatMenu(menuText); // Formatter le menu

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

    // Parcourir uniquement les pôles principaux en sélectionnant les `li` qui contiennent une `ul`
    $('li:has(ul)').each((index, element) => {
        const poleName = $(element).contents().first().text().trim();  // Nom du pôle principal

        // Récupère chaque plat dans la sous-liste `ul li`
        const dishes = $(element).find('ul li').map((i, el) => $(el).text().trim()).get();

        // Ajouter le pôle et ses plats formatés
        formattedMenu += `**${poleName}**\n`;
        dishes.forEach(dish => {
            formattedMenu += `- ${dish}\n`;
        });
        formattedMenu += '\n';
    });

    return formattedMenu;
}



