const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

let serverProcess = null;

function loadExistingSettings() {
    if (!fs.existsSync('.env')) return;

    const env = fs.readFileSync('.env', 'utf8');
    const lines = env.split('\n');

    lines.forEach(line => {
        const [key, value] = line.split('=');
        const inputMap = {
            'TWITCH_CLIENT_ID': 'twitch-client-id',
            'TWITCH_CLIENT_SECRET': 'twitch-client-secret',
            'TWITCH_USERNAME': 'twitch-username',
            'TWITCH_BOT_USERNAME': 'twitch-bot-username',
            'TWITCH_BOT_TOKEN': 'twitch-bot-token',
            'YOUTUBE_CLIENT_ID': 'youtube-client-id',
            'YOUTUBE_CLIENT_SECRET': 'youtube-client-secret',
            'YOUTUBE_REFRESH_TOKEN': 'youtube-refresh-token'
        };

        if (inputMap[key]) {
            document.getElementById(inputMap[key]).value = value || '';
        }
    });
}

function saveSettings() {
    const env = `TWITCH_CLIENT_ID=${document.getElementById('twitch-client-id').value}
    TWITCH_CLIENT_SECRET=${document.getElementById('twitch-client-secret').value}
    TWITCH_USERNAME=${document.getElementById('twitch-username').value}
    TWITCH_BOT_USERNAME=${document.getElementById('twitch-bot-username').value}
    TWITCH_BOT_TOKEN=${document.getElementById('twitch-bot-token').value}
    YOUTUBE_CLIENT_ID=${document.getElementById('youtube-client-id').value}
    YOUTUBE_CLIENT_SECRET=${document.getElementById('youtube-client-secret').value}
    YOUTUBE_REDIRECT_URI=http://localhost:3000/auth/callback
    YOUTUBE_REFRESH_TOKEN=${document.getElementById('youtube-refresh-token').value}`

    fs.writeFileSync('.env', env);
}

function startServer() {
    if (serverProcess) {
        serverProcess.kill();
    }

    serverProcess = spawn('node', ['main.js'], { stdio: 'inherit' });
}

loadExistingSettings();