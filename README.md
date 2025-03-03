# RUMenu Discord Bot

This Discord bot allows you to send menu of Aubepin University Restaurant in specific channel

## Installation

1. **Clone the repository:**
    ```bash
    git clone https://github.com/Hawordd/RUMenu.git
    cd RUMenu
    ```

2. **Install dependencies:**
    Make sure you have [Node.js](https://nodejs.org/) installed. Then run:
    ```bash
    npm install
    ```

3. **Set up environment variables:**
    Copy the `.env.example` file in the root directory, rename it in `.env` and add your Discord bot token:
    ```env
    DISCORD_TOKEN=your-bot-token
    ```

## Launching the Bot

1. **Start the bot:**
    ```bash
    npm start
    ```

2. **Invite the bot to your server:**
    Use the OAuth2 URL Generator in the Discord Developer Portal to generate an invite link with the necessary permissions for your bot.

## Usage

Here is the list of existing commands for the bot : 

1. **/setchannel**
    - **Description:** Sets the channel for daily menu posting.
    - **Usage:** `/setchannel channel:#channel-name`
    - **Example:** `/setchannel channel:#general`

2. **/menu**
    - **Description:** Displays manually the menu of the day from RU Aubépin.
    - **Usage:** `/menu`

3. **/stopmenu**
    - **Description:** Stops the daily menu posting.
    - **Usage:** `/stopmenu`

## Contributing

Feel free to submit issues or pull requests if you have any improvements or bug fixes.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.