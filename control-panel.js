const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const { ipcRenderer } = require('electron');

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
            'YOUTUBE_REFRESH_TOKEN': 'youtube-refresh-token',
            'YOUTUBE_STREAM_PLAYLIST': 'youtube-playlist-id',
            'YOUTUBE_REDEEMABLE_PLAYLIST': 'youtube-redeemable-id'
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
YOUTUBE_REFRESH_TOKEN=${document.getElementById('youtube-refresh-token').value}
YOUTUBE_STREAM_PLAYLIST=${document.getElementById('youtube-playlist-id').value}
YOUTUBE_REDEEMABLE_PLAYLIST=${document.getElementById('youtube-redeemable-id').value}`

    fs.writeFileSync('.env', env);
}

function connectWebSocket() {
    const socket = new WebSocket('ws://localhost:8080');

    socket.onerror = () => {
        setTimeout(connectWebSocket, 1000);
    }

    socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        console.log('Control panel received:', data)

        if (data.type === 'auth-required') {
            document.getElementById('reauth-section').style.display = 'block';
            document.getElementById('reauth-btn').onclick = () => {
                ipcRenderer.send('open-auth-url', data.authUrl);
            };   
        }
    };
}

function startServer() {
    if (serverProcess) {
        serverProcess.kill();
    }

    serverProcess = spawn('node', ['main.js'], { stdio: 'inherit' });
    setTimeout(connectWebSocket(), 2000)
}

loadExistingSettings();