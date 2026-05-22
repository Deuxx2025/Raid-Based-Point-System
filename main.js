//#region requires & tokens
const dotenv = require('dotenv');
dotenv.config();
const express = require('express');
const axios = require('axios');
const app = express();
const WebSocket = require('ws');
const PORT = 3000;
const wss = new WebSocket.Server({port: 8080});
const tmi = require('tmi.js');
const fs = require('fs');
const { google } = require('googleapis');
const { oauth2 } = require('googleapis/build/src/apis/oauth2');
const { title } = require('process');
const oauth2Client = new google.auth.OAuth2(
    process.env.YOUTUBE_CLIENT_ID,
    process.env.YOUTUBE_CLIENT_SECRET,
    process.env.YOUTUBE_REDIRECT_URI
);
const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline', 
    scope: ['https://www.googleapis.com/auth/youtube.readonly']
});
//console.log('Authorize your YouTube account by visiting: ', authUrl);
const client = new tmi.Client({
    identity: {
        username: process.env.TWITCH_BOT_USERNAME,
        password: process.env.TWITCH_BOT_TOKEN
    },
    channels: [process.env.TWITCH_USERNAME]
});
const redemptions = [
    { name : 'soundbits', cost : 10, description : 'Play a sound bit' },
    { name : 'skins', cost : 50, description : 'Change the avatar skin' },
    { name : 'nextsong', cost : 150, description : 'Queue a song - use !nextsong to browse' },
    { name : 'endstream', cost : 100000, description : 'Kill the stream' }
];
//#endregion

//#region Variables
const RECENT_BUFFER = 15;
const MENU_COOLDOWN = 15000;
let currentSkin = 'Zuko-Haruki'
let pointsPool = 0;
let lastMenuCall = 0;
let intervalID;
let twitchToken;
let availableSounds = [];
let availableSkins = [];
let streamPlaylist = [];
let redeemablePlaylist = [];
let songQueue = [];
let recentlyPlayed = [];
//#endregion

//#region Setting server
fs.readdir('sounds/sound-board', (err, files) => {
    if (err) {
        console.log(err);
        return;
    }
    else
    {
        availableSounds = files 
            .filter(file => file.endsWith('.mp3'))
            .map(file => file.replace('.mp3', ''));
        console.log('Sounds loaded', availableSounds);
    }
});

fs.readdir('assets/skins', (err, files) => {
    if (err) {
        console.log(err);
        return;
    }
    else
    {
        availableSkins = files 
            .filter(file => file.endsWith('.png'))
            .map(file => file.replace('.png', ''));
        console.log('Skins loaded', availableSkins);
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

wss.on('connection', (ws) => {
    console.log('Widget Connected');
    console.log('Playlist length on connection:', streamPlaylist.length);

    ws.on('message', (message) => {
        const data = JSON.parse(message);
        if (data.songEnded) {
            if (data.failedVideoId) {
                streamPlaylist = streamPlaylist.filter(
                    item => item.snippet.resourceId.videoId !== data.failedVideoId
                );
                console.log(`Removed failed video. Playlist now: ${streamPlaylist.length} songs`);
            }
            const nextSong = getNextSong();
            if (nextSong) playSong(nextSong); 
        }
    });
});

if (!process.env.YOUTUBE_REFRESH_TOKEN) {
    console.log('Authorize your YouTube account by visiting:', authUrl);
}

app.get('/auth/callback', async (req, res) =>{
    const { code } = req.query;
    const { tokens } = await oauth2Client.getToken(code);
    console.log('Refresh token', tokens.refresh_token);
    res.send('Authorization successful! Check your terminal for the refresh token')
});

oauth2Client.setCredentials({
    refresh_token: process.env.YOUTUBE_REFRESH_TOKEN
});
//#endregion

//#region Bot command
client.on('message', (channel, tag, message, self) => {
    if (self) return;

    if (message.toLowerCase() === '!menu') {
        const now = Date.now()
        const menuMessage = redemptions
            .map(r => `!${r.name} (${r.cost}) - ${r.description}`)
            .join(' | ');
        
        if (now - lastMenuCall < MENU_COOLDOWN) {
            client.say(channel, '!Menu is on cooldown');
            return;
        }

        lastMenuCall = now

        client.say(channel, `RBPS Menu: ${menuMessage}`);
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
        client.say(channel, `Available sounds: ${availableSounds.join(' | ')} | use !play soundname to play`)
    }

    if (message.toLowerCase() === '!skins') {
        client.say(channel, `Available skins: ${availableSkins.join(' | ')} | use !swap skinname to change`)
    }

    if (message.toLowerCase().startsWith('!nextsong')) {
        const page = parseInt(message.split(' ')[1]) || 1;
        const start = (page - 1) * 10;
        const end = start + 10;
        const pageSongs = redeemablePlaylist.slice(start, end);

        const songList = pageSongs 
            .map((song, index) => {
                const titleParts = song.snippet.title.split(' - ');
                const title = (titleParts[1] || titleParts[0]).substring(0, 25)
                return `${start + index + 1}.${title}`;
            })
            .join(' | ');
        client.say(channel, `Songs (${start + 1}-${Math.min(end, redeemablePlaylist.length)}): ${songList} | !nextsong ${page + 1} for more | use !queue [number] to queue a song`)
    }

    /*
    depricated command, view only as reference
    if (message.toLowerCase() === '!test soundbit') {
        const isStreamer = tag.username === process.env.TWITCH_USERNAME.toLowerCase();
        if (!isStreamer) return;
        wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify({sound: 'soundbit'}));
            }
        });
    }
    */

    if (message.toLowerCase().startsWith('!play')) {
        const soundName = message.split(' ')[1];
        const soundExists = fs.existsSync(`./sounds/sound-board/${soundName}.mp3`);
        const redemption = redemptions.find(r => r.name === 'soundbits')
        const streamer = isStreamer(tag)

        if (!soundExists) {
            client.say(channel, 'Sound not found, please type !soundbits to see available sounds');
            return
        }

        if (!streamer && pointsPool < redemption.cost) {
            client.say(channel, 'Not enough points, current pool: ' + Math.floor(pointsPool));
            return;
        }

        if (!streamer){
            pointsPool -= redemption.cost;
        }
        
        client.say(channel, streamer
            ? `All to the kings contempt; Jester performed ${soundName}`
            : `Playing ${soundName}, current pool: ` + Math.floor(pointsPool));

        wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify({
                    type: 'sound',
                    sound: soundName,
                    message: 'Sound incoming',
                    ...((!streamer) && {
                        spendSound: 'sfx/spend-sound',
                        spent: redemption.cost
                    })
                }));
            }
        });
    }

    if (message.toLowerCase().startsWith('!swap')) {
        const skinName = message.split(' ')[1];
        const skinExists = fs.existsSync(`./assets/skins/${skinName}.png`);
        const redemption = redemptions.find(r => r.name === 'skins')
        const streamer = isStreamer(tag)

        if (!skinExists) {
            client.say(channel, 'Skin not found, please type !skins to see available skins');
            return;
        }

        if (skinName === currentSkin) {
            client.say(channel, `${skinName} is already active`);
            return;
        }

        if (!streamer && pointsPool < redemption.cost) {
            client.say(channel, 'Not enough points, current pool: ' + Math.floor(pointsPool));
            return;
        }

        if (!streamer){
            pointsPool -= redemption.cost;
        }
        
        currentSkin = skinName; 
        client.say(channel, streamer
            ? `All to the kings contempt; clothes changed`
            : `Swapping  ${skinName}, current pool: ` + Math.floor(pointsPool));

        wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify({
                    type: 'skin',
                    skin: skinName,
                    message: 'Looking fine',
                    ...((!streamer) && {
                        spendSound: 'sfx/spend-sound',
                        spent: redemption.cost
                    })
                }));
            }
        });
    }

    if (message.toLowerCase().startsWith('!queue')) {
        const songNumber = parseInt(message.split(' ')[1]);
        const redemption = redemptions.find(r => r.name === 'nextsong')
        const streamer = isStreamer(tag)

        if (!songNumber || songNumber < 1 || songNumber > redeemablePlaylist.length) {
            client.say(channel, 'Invalid song number, use !nextsong to see available songs.');
            return;
        }

        if (!streamer && pointsPool < redemption.cost) {
            client.say(channel, 'Not enough points, current pool: ' + Math.floor(pointsPool));
            return;
        }

        const song = redeemablePlaylist[songNumber - 1];

        if (!streamer) {
            pointsPool -= redemption.cost;
        }
    
        songQueue.push(song);

        const titleParts = song.snippet.title.split(' - ');
        const title = (titleParts[1] || titleParts[0]).substring(0, 25)
        client.say(channel, streamer
            ? `All to the kings contempt; the bard is going to play ${title}`
            : `${title} added to queue, pool remaining: ` + Math.floor(pointsPool)
        );

        wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({
                type: 'song',
                message: `${title} queued!`,
                ...((!streamer) && {
                    spendSound: 'sfx/spend-sound',
                    spent: redemption.cost
                })
            }))};
        });
   
    }
});
//#endregion

//#region Getters
async function getPlaylist() {
    const youtube = google.youtube({ version: 'v3', auth: oauth2Client});
    let allItems = [];
    let nextPageToken = null;

    while (allItems.length < 200) {
        const response = await youtube.playlistItems.list({
            part: 'snippet',
            playlistId: 'LL',
            maxResults: 50,
            pageToken: nextPageToken || undefined
        });

        allItems = [...allItems, ...response.data.items];
        nextPageToken = response.data.nextPageToken;

        if (!nextPageToken) break;
    }

    allItems = allItems.slice(0, 200);
    allItems = allItems.filter(item => item.snippet && item.snippet.resourceId);
    console.log('Playlist loaded:', allItems.length, 'songs');
    return allItems;
}

async function getRedeemablePlaylist() {
    const youtube = google.youtube({ version: 'v3', auth: oauth2Client});
    const response = await youtube.playlistItems.list({
        part: 'snippet',
        playlistId: 'PLgQm9vyJY2HKijIDLTGMq_9l4iLgKPeQj',
        maxResults: 50
    });

    redeemablePlaylist = response.data.items;
    return redeemablePlaylist;
}

function getNextSong() {

    if (songQueue.length > 0) {
        return songQueue.shift();
    }

    let randomIndex;
    do {
        randomIndex = Math.floor(Math.random() * streamPlaylist.length);
    } while (recentlyPlayed.includes(randomIndex));
    
    recentlyPlayed.push(randomIndex);

    if (recentlyPlayed.length > RECENT_BUFFER) { 
        recentlyPlayed.shift();
    }

    return streamPlaylist[randomIndex]
}

async function getTwitchToken() {
    const response = await axios.post('https://id.twitch.tv/oauth2/token', null, {
        params: {
            client_id: process.env.TWITCH_CLIENT_ID,
            client_secret: process.env.TWITCH_CLIENT_SECRET,
            grant_type: 'client_credentials'
        }
    });
    return response.data.access_token; 
};

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
};

function getMilestoneSound(previous, current) {
    if (Math.floor(current / 50) > Math.floor(previous / 50)) return 'sfx/large-coin-sound.wav';
    if (Math.floor(current / 10) > Math.floor(previous / 10)) return 'sfx/medium-coin-sound.ogg';
    if(current < 10) return 'sfx/small-coin-sound.wav';
    return null;
}
//#endregion

//#region Functions
function playSong(song) {
    wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({
                type: 'song',
                videoId: song.snippet.resourceId.videoId,
                title: song.snippet.title
            }))
        }
    })
}

function isStreamer(tag) {
    return tag.username === process.env.TWITCH_USERNAME.toLowerCase()
}

async function viewerMultiplier() {
    const viewers = await getViewerCount(twitchToken);
    if (viewers === 0) return 1
    return 1 + Math.log(viewers) * 0.5;
};

async function tick() {
    const previousPool = pointsPool
    const multiplier = await viewerMultiplier();
    //change this at your will, it can be `pointsPool += yourVariable * multiplier`
    pointsPool += multiplier;
    const gained = Math.floor(pointsPool) - Math.floor(previousPool);
    const sound = getMilestoneSound(previousPool, pointsPool);

    const data = JSON.stringify({
        type: 'points',
        points: Math.floor(pointsPool), 
        multiplier: Math.floor(multiplier),
        gained: gained, 
        milestone: sound
    });

    wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(data);
        }
    });
    console.log(`Points: ${Math.floor(pointsPool)} | Multiplier: ${Math.floor(multiplier)}`);
};
//#endregion

//#region Interval
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
    streamPlaylist = await getPlaylist();
    redeemablePlaylist = await getRedeemablePlaylist();
    startInterval()

    const firstSong = getNextSong();
    if (firstSong) playSong(firstSong);
};
startServer()
//#endregion