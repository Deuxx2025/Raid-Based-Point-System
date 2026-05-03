const dotenv = require('dotenv');
dotenv.config();
const express = require('express');
const axios = require('axios');

let pointsPool = 0;
let intervalID;

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

async function getViewerCount() {
    return 5 
}

async function viewerMultiplier(){
    const viewers = await getViewerCount();
    return 1 + Math.log(viewers) * 0.5;
}

async function tick(){
    const multiplier = await viewerMultiplier();
    //change this at your will, it can be `pointsPool += yourVariable * multiplier`
    pointsPool += multiplier;
    console.log(`Points: ${pointsPool} | Multiplier: ${multiplier}`);
}

function startInterval (){
    if (intervalID){
    clearInterval(intervalID);
    }
    intervalID = setInterval(tick, 60000)
}
startInterval()