# Raid Based Point System (RBPS)

This is a project that I was thinking on making when I gave up on the Twitch partnership so 2 questions came up: 

1.- Can I replicate a point system from Twitch?
2.- Can it be as less complicated code?

Tackling this 2 questions, the 1st is as my programming professor used to say "yes, if you can think it then it can be made with code" and the 2nd is a depend, it depends on what do you want to do. 

## Making a less complicated code 
The first problem that arose from this dilemma is how can I make a simple point system because a normal point system requires for Twitch to have access into your account and fetch information so it adds special points. As someone who made a web browser game let me tell you that fetching information from each user is a lot of pain, so I came with a thought that I can erase all of that headache with eliminating the user itself, thus this RBPS was born. 

Without a user then the fetching of information is purely local, you don't depend on having a DataBase somewhere over the rainbow and then authenticating keys so that the information is reflected correctly and also you don't need to worry about data leaks so on and so forth but now you can create and evolve this new idea of point system. 

## The 1st stage "Get the points"
The first step of this project is to do a simple back-end server that connects to your Twitch account in order to fetch certain information and in the previous paragraphs I said that we won't be needing of authentication keys and such but remember that if you want to be as interactive as possible you do need to link with an app eventually. So with this idea I will be fetching the current viewer count so that the streamer will have a local `Count` that it will increment per minute but that `Count` will have a `Multiplier` that depending of your viewer count a multiplier function will trigger. That function handles specific milestones that increment your multiplier so that the viewers would be eventually rewarded. 

For now I will develop this `Count` and `Multiplier` and the user will only see strange numbers on the screen but in the future those points would be redeemables for special rewards such as audio bits and control over the YouTube songs. 

## Disclaimer
I want to publicly say (To the 1 soul reading this which is myself) that I'm using AI for the creation of this project but make no mistake, I have some experience in web programming, I'm just new to this facet of the programming and I actually have choice paralysis so if I can't see the way or if there isn't someone to guide me then I won't do it but I do want to become a better programmer and I use Claude as a tool that can tell me what's the next step for me to take. 

It's been very helpful in my ignorance in this part of programming, and also all the design choices I'm the one calling the shots.

# How to set up the widget 
The steps are:
-Clone the repo
-Get the Twitch keys
-Get the YouTube keys
-Set the .env file
-Download the dependencies(npm install)
-Initialize the server(nodemon main.js)
-Open the widget with Live Server
-Bot commands
-Tweak values if you want

## Clone the repo 
Clone the repository using your preferred method. On GitHub page there's a green button that says <>Code, click on it, then you can use the HTTP, SSH or GitHub Desktop option depending on your setup. 

If you're using Git then you can go ahead and use the terminal. Open the terminal on the root folder where you're going to save the project and run:

```
git clone git@github.com:Deuxx2025/Raid-Based-Point-System.git
```

Then you can check if the .git is on the folder or directly check it using git status.

## Get the Twitch keys
Go on your favorite browser and search dev.twitch.tv and sign in using your Twitch account, make sure to have the 2 Factor Authentication.

To have the 2 factor active you'll most likely need an authenticator app such as Authy or Google Authenticator.

Once you're inside go to "Your Console" which is on the top right corner below your profile picture.

Then click on "Register Your Application"

Fill the information: Place the name of the app (however you wanna call it), OAuth Redirect URL: http://localhost, Category: Application Integration.

Once that's done you'll see a section with the name of the app, click on administer and copy paste the client ID and click on "New Secret" to have the Client Secret, save that information on a safe place and also that has easy access such as the notepad because you're going to use that in the next step.

In addition to have a working chat bot you'll need to create a new account, but if you don't want to create a new email you can use this trick, which consists of using your already existing account (IMPORTANT NOTE: this only works if your account uses gmail which lets be honest everyone does), `account+botname@gmail.com`, Make sure to also set up the 2 factor authentication. 

Following this chat bot creation you'll need to have authorization using `tmi` which it's going to be further explained. But for now the oficial `tmi` page is dead, some people have used the page to set up OAuth for different things and the scope has gone nuclear hence the creator pulled the plug, now we need to search for a way to get that OAuth using the Twitch's documentation for developers, copy this url and make sure to be signed in with your bot account: 

```
https://id.twitch.tv/oauth2/authorize?client_id=YOUR_CLIENT_ID&redirect_uri=http://localhost&response_type=token&scope=chat:read+chat:edit
```

Also replace the `YOUR_CLIENT_ID` with the ID you received from the previous step probably you have that information on your notepad (Client ID). It'll ask you for permission, it's essentially saying that an unknown app wants to use your account (the bot account) to write things in chat, once you click on accept it'll redirect you to an unreachable page but the url has the authentication key. 

The unreachable part is because we set the localhost at the beginning, normal behavior don't worry but do copy the part that is in between the `access_token=` and the `&scope` like this: 

```
http://localhost/#access_token=xxxxxxxxxxxxxx&scope=chat%3Aread+chat%3Aedit&token_type=bearer
```

Now with that information you're ready to set the .env.

## Get the YouTube keys

First you need to enter to this link, this will lead you to Google Cloud and you need to login with your normal google account: 

```
https://console.cloud.google.com
```

The next step is to create a `new project`, on the top left corner next to the Google Cloud logo there is an option called `select a project`. A small window will emerge and on its top right corner the `new project` option will appear. Then just fill the project name, I called it by the acronym RBPS, create it and don't worry if you don't know what to put in the `Parent resource` leave it as it is. 

On the top part you'll find a search bar, use it to search the YouTube DATA API v3, then hit enable, it will enable the API for your project and now you'll have 2 thing on your `Notifications`, the `creation of the project` and the `enable youtube service`, on the left side select `Credentials` and then `Create credentials`, select the OAuth client ID, to create a google OAuth you'll need to set up a management of screens, since you're not working for google the only option is to make it public, name the project, put email to contact and then hit create, it will let you in the page to create the OAuth. On the metrics part the is a lone option called create OAuth client. 

Inside that page select the `web application` type, fill out the name of the application, then you'll see 2 sections, the `Authorize JavaScript origins` and the `Authorize redirects URL`, you'll need to fill some URLs in this section.

For the `Authorized JavaScript origins` put: 

```
http://localhost
```

And in `Authorized redirects URL`: 

```
http://localhost:3000/auth/callback
```

Once you hit create an important window will appear, there you'll have the `client secret` but the good thing is that the browser will let you download the thing as JSON, the majority of the things you can access it late but not the `client secret` so I recommend that you download it and save it somewhere accessible (not on the project folder unless you want to put it on the .gitignore).

There's an option called `Audience` on the left side of the page, click on it, scroll down until you see `test users` and add users and put the Google/YouTube account (email). 

Now for the last part I put a little part on the code that safeguards the project because you'll have a global variable called `YOUTUBE_REFRESH_TOKEN` (See `Set the .env file`) that is undefined so it'll crash everything, but it should send you a link on the terminal, once you enter access your YouTube account for the first time will send you to a page that said `CANNOT GET auth/callback` but just restart the server, and do the process one more time and check the terminal copy that key and paste it in the .env file.

## Set the .env file
Here's where the client ID, client secret and bot OAuth key is used, this is a very delicate file that anyone who has access to it can hijack your account, that's why the .gitignore that I set up in the repo doesn't track it. But at the same time it's important to have it so that you can prove to the API that your application is legit. 

You'll need the following global variables and paste the values after the = sign, open up the Google Cloud JSON, fill the information, the bot variable has a slight difference, you need to add the `oauth:` before the actual key as it follows: 

```
TWITCH_CLIENT_ID=
TWITCH_CLIENT_SECRET=
TWITCH_USERNAME=
TWITCH_BOT_USERNAME=
TWITCH_BOT_TOKEN=oauth:
YOUTUBE_CLIENT_ID=
YOUTUBE_CLIENT_SECRET=
YOUTUBE_REDIRECT_URI=
YOUTUBE_REFRESH_TOKEN=
```


## Download the dependencies (npm install)
First of all you need to run a command on the CMD of the IDE you're using. 

```
npm init -y
```

This command lets you create the package.json which is vital for the Node.js server and also the `-y` flag lets you skip towards the end because essentially it'll ask you to name the server, put signature, add a description, basically things that you don't need to worry. 

Once you have that then you need to add these following packages like this: 

```
npm install express dotenv axios tmi.js googleapis
```
`Express` is your back-end server, `dotenv` is what gives you access to the .env information, `axios` makes request to the Twitch API, `tmi.js` is the one responsible to make the bot write things in chat and also to have commands in chat and `googleapis` is the one responsible to communicate to Google Cloud for OAuth. Also a file called package-lock.json will be created with this installs, this is a place where your dependencies lives 

Now you're missing some quality of life improvements and a thing that I missed: 

```
npm install --save-dev nodemon 
npm install ws
```

The nodemon is something that will make coding a bit easier because now you don't need to keep running the server every time you change something but the server will reset itself if you change something, you only run it once and if you want to shut down the server is with the keys `CTRL + C`. Also the --save-dev flags marks nodemon as a developer tool, meaning that it's only needed while you're coding and not when the server is actually running. The ws stands for WebSocket, it's where you'll connect your app (this widget) to the WebSocket server.

## Initialize the server (nodemon main.js)
Open the terminal in your project root folder and run: 

```
nodemon main.js
```

Now the server is live with all the code inside, but to break it down it has the requires of the packages, and setting some variables, it sets the port of the server and the WebSocket. It has async functions to fetch the Twitch token, and a place holder for the viewer count. 

It has some logic to make the point system to work and it sends that information as JSON to communicate with the front end. And it sets the intervals so that the code runs itself, it also has a safeguard to see if there is an interval, clears it, and it runs a fresh one.

## Open the widget with Live Server
Install the Live Server extension in Visual Studio Code. Once installed, right click the `widget.html` and select 'Open with Live Server'. This will open in your web browser at `localhost:5500` where you can see it running live. Also this 5500 port overrides some safety features that might not let you check your project completely.

## Bot commands
If you use the command `!menu` (inside of the Twitch chat, you can enter by going to `www.twitch.tv/yourchannel.chat`) you can see all actions, right now `!soundbits` and `nextsong` commands are fully implemented, if you use it, the chat bot will tell you all the available sounds and the command `!play` to actually play the sound, then for `!nextsong` you need to use the command `!queue` to add a song to play. `!endstream` is coming next. 

This is an example of the command flow:

```
!menu 
!soundbits (10 points) play a sound | !nextsong (150 points) choose next song...
!soundbits 
Available sounds: sound1 | sound2 | sound3... | use !play soundname to play
!play sound1
*Plays sound1*
!play 1sound
Sound not found, please use !soundbits to see available sounds
!nextsong 
Songs (beginnig of the list - end of the list) 1.song 1 name | 2.song 2 name... | !nextsong 2 for the next page | use !queue [number] to queue a song
!queue 1
name of the song added to queue 
```

There are also safeguards like when the user doesn't have the points or if there's a typo the bot will respond, please feel free to check the code.

While working on the YouTube code I came accross a peculiarity of the API that there are some videos that are not embeddable, that means that you can't play them through this widget, you need to be careful with that, in my case I have 2 playlist, a `!nextsong` playlist and a `fallback` playlist, my `fallback` playlist is my liked videos playlist I curated that list only to hold my favorite songs and that when you're calling the API is `LL` on the `playlistId` but if you want to set a specific playlist just keep in mind that the playlist can't be `private` but `unlisted` or `public` then you go into your search bar when you selected your playlist and get the Id, it looks like this: 

```
https://www.youtube.com/watch?v=videoCode&list=yourPlaylistId
OR
https://www.youtube.com/watch?v=videoCode&list=youPlaylistId&index=2
```

In my code you have 2 playlist going on but one will always sound no matter what and the other one is triggered by the command, you can find these as `getPlaylist` and `getRedeemablePlaylist` but if you just want to have 50 songs to play just replace the `playlistId` as I mentioned earlier and keep the `getRedeemablePlaylist` function, the other is for 100 songs. Make sure that the redeemable songs can be played, please in the `tick` function multiply the `pointsPool` by 50 and on the `startInterval` replace the 60k microseconds to 1k microseconds (basically from 1 minute to 1 second) just to get the redeemable ammount and test it quickly. Other than that I have an error handler that skip the songs that can't be played. 

One last important thing, in order to avoid the copyright infringement I decided to add /sounds to the .gitignore file because most likely the sounds that I'll use have a no redistribution clause so for you to use the feature please create a `sounds` folder at the root of the project and then add a sound that you want, make sure that the name convention don't have spaces, I personally use the following `metal-pipe.mp3` | `screaming-bird.mp3`.

## Tweak values if you want
We've reached the end part of this little guide, it's been wild working on this project, but essentially this project is as much mine (as author) that is yours as well, please feel free to tweak values here and there because your needs are not the same as my needs. 

There are 2 functions that manages the point system, the `viewerMultiplier` and the `tick`. The `viewerMultiplier` only holds the formula, that is 1 plus the natural logarithm of the current viewers multiplied by 0.5. This formula was shown to me by the AI not going to lie, this means that if you have little viewers the points will be small but the more you gain in viewers it grows larger but there is a point that once you reach a certain point it "normalizes" itself and the gain is not that big, basically this solves the power creep that big audiences brings because if there is 1000 people the exponent is so big that all milestones are reachable within seconds. 

The `tick` is where the points are calculated and this is the main point if you want to tweak some values, for example you can change the rate in which the formula is added, you can make it larger for the audience to gain more points faster. I also added a comment over it. 

I'm very excited for this project and stay tuned for the next update.