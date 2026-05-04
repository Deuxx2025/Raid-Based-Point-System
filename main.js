const dotenv = require('dotenv');
dotenv.config();
const express = require('express');
const axios = require('axios');
const app = express();
const WebSocket = require('ws');
const PORT = 3000;
const wss = new WebSocket.Server({port: 8080});

let pointsPool = 0;
let intervalID;
let twitchToken;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

wss.on('connection', (ws)=> {
    console.log('Widget Connexted');
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
    startInterval()
}
startServer()