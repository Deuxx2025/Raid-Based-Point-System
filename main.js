const dotenv = require('dotenv');
dotenv.config();
const express = require('express');
const axios = require('axios');
const app = express();
const WebSocket = require('ws');
const PORT = 3000;
const wss = new WebSocket.Server({port: 8080});
const tmi = require('tmi.js')
const fs = require('fs')
const client = new tmi.Client({
    identity: {
        username: process.env.TWITCH_BOT_USERNAME,
        password: process.env.TWITCH_BOT_TOKEN
    },
    channels: [process.env.TWITCH_USERNAME]
});
const redemptions = [
    { name : 'soundbits', cost : 10, description : 'Play a sound bit' },
    { name : 'nextsong', cost : 150, description : 'Play a song on YouTube' },
    { name : 'endstream', cost : 100000, description : 'Kill the stream' }
];

let pointsPool = 0;
let intervalID;
let twitchToken;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

wss.on('connection', (ws)=> {
    console.log('Widget Connexted');
});

client.on('message', (channel, tag, message, self) => {
    if (self) return;

    if (message.toLowerCase() === '!menu') {
        const menuMessage = redemptions
            .map(r => `! ${r.name} (${r.cost}) - ${r.description}`)
            .join(' | ');
        client.say(channel, `RBPS Menu: ${menuMessage}`)
    }

    /*
    !redeem system removed, kept for reference
    Probably have a similar safeguards for other instances
    if (message.startsWith('!redeem')) {
        const command = message.split(' ')[1];
        const found = redemptions.find(r => r.name === command);

        if (!found) {
            client.say(message, `Unknown redemption. Type !menu to see available options.`);
        }

        if (found && found.name !== 'soundbit') {
            client.say(channel, 'This redemption is not available yet, stay tunned!');
            return;
        }
    }
    */

    if (message.toLowerCase() === '!soundbits') {
        const sounds = fs.readFileSync('./sounds')
            .filter(file => file.endsWith('mp3'))
            .map(file => file.replace('.mp3', ''))
            .join(' | ')
        client.say(channel, `Available sounds: ${sounds} | use '!play soundname' to play`)
    }

    if (message.toLowerCase() === '!test soundbit') {
        const isStreamer = tag.username === process.env.TWITCH_USERNAME.toLowerCase();
        if (!isStreamer) return;
        wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify({sound: 'soundbit'}));
            }
        });
    }

    if (message.toLowerCase() === '!redeem soundbit') {
        const redemption = redemptions.find(r => r.name === 'soundbit');
        if (pointsPool < redemption.cost) {
            client.say(channel, 'Not enough points, current pool: ' + Math.floor(pointsPool));
            return;
        }
        pointsPool -= redemption.cost;
        client.say(channel, 'Sound bit redeemed, current pool: ' + Math.floor(pointsPool));

        wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify({sound: 'soundbit'}));
            }
        });
    }
});

async function getTwitchToken() {
    const response = await axios.post('https://id.twitch.tv/oauth2/token', null, {
        params: {
            client_id: process.env.TWITCH_CLIENT_ID,
            client_secret: process.env.TWITCH_CLIENT_SECRET,
            grant_type: 'client_credentials'
        }
    });
    return response.data.access_token; 
}

async function getViewerCount(token) {
    const response = await axios.get('https://api.twitch.tv/helix/streams', {
        params: {
            user_login: process.env.TWITCH_USERNAME
        }, 
        headers: {
            'Client-ID': process.env.TWITCH_CLIENT_ID,
            'Authorization': `Bearer ${token}`
        }
    });

    const stream = response.data.data[0]
    return stream ? stream.viewer_count : 0
}

async function viewerMultiplier() {
    const viewers = await getViewerCount(twitchToken);
    if (viewers === 0) return 1
    return 1 + Math.log(viewers) * 0.5;
}

async function tick() {
    const previousPool = pointsPool
    const multiplier = await viewerMultiplier();
    //change this at your will, it can be `pointsPool += yourVariable * multiplier`
    pointsPool += multiplier;
    const gained = Math.floor(pointsPool) - Math.floor(previousPool);

    const data = JSON.stringify({
        points: Math.floor(pointsPool), 
        multiplier: Math.floor(multiplier),
        gained: gained
    });

    wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(data);
        }
    })
    console.log(`Points: ${Math.floor(pointsPool)} | Multiplier: ${Math.floor(multiplier)}`);
}

function startInterval () {
    if (intervalID){
    clearInterval(intervalID);
    }
    intervalID = setInterval(tick, 60000)
}

async function startServer() {
    twitchToken = await getTwitchToken();
    console.log('Twitch token acquired');
    await client.connect();
    console.log('Bot connected to chat')
    startInterval()
}
startServer()