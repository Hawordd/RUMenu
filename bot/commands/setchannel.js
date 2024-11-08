import fs from 'fs';

const CHANNELS_FILE = './bot/files/channels.json';

export function loadChannels() {
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

export function saveChannels(channels) {
    try {
        fs.writeFileSync(CHANNELS_FILE, JSON.stringify(channels, null, 2));
    } catch (error) {
        console.error('Erreur lors de la sauvegarde des canaux dans channels.json', error);
    }
}