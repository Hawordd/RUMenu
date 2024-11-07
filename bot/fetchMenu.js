import fetch from 'node-fetch';
import * as cheerio from 'cheerio';

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

function formatMenu(menuText) {
    let formattedMenu = menuText.replace(/<li>/g, '\n');
    formattedMenu = formattedMenu.replace(/<ul>/g, '\n');
    formattedMenu = formattedMenu.replace(/<\/?li>/g, '');
    formattedMenu = formattedMenu.replace(/<\/?ul>/g, '');

    return formattedMenu;
}


