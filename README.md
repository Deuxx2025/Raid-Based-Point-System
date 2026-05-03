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
-Set the .env file
-Download the dependencies(npm install)
-Initialize the server(nodemon main.js)
-Open the widget with Live Server
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

Then click on "Register Your Application

Fill the information: Place the name of the app (however you wanna call it), OAuth Redirect URL: http://localhost, Category: Application Integration.

Once that's done you'll see a section with the name of the app, click on administer and copy paste the client ID and click on "New Secret" to have the Client Secret, save that information on a safe place and also that has easy access such as the notepad because you're going to use that in the next step.

## Set the .env file
Here's where the client ID and secret is used, this is a very delicate file that anyone who has access to it can hijack your account, that's why the .gitignore that I set up in the repo doesn't track it. But at the same time it's important to have it so that you can prove to the API that your application is legit. 

You'll need 3 global variables and paste the values after the = sign: 

```
TWITCH_CLIENT_ID=
TWITCH_CLIENT_SECRET=
TWITCH_USERNAME=
```


## Download the dependencies (npm install)
First of all you need to run a command on the CMD of the IDE you're using. 

```
npm init -y
```

This command lets you create the package.json which is vital for the Node.js server and also the `-y` flag lets you skip towards the end because essentially it'll ask you to name the server, put signature, add a description, basically things that you don't need to worry. 

Once you have that then you need to add these 3 packages like this: 

```
npm install express dotenv axios
```
Express is your back-end server, dotenv is what gives you access to the .env information and axios makes request to the Twitch API. Also a file called package-lock.json will be created with this installs, this is a place where your dependencies lives 

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

## Tweak values if you want
We've reached the end part of this little guide, it's been wild working on this project, but essentially this project is as much mine (as author) that is yours as well, please feel free to tweak values here and there because your needs are not the same as my needs. 

There are 2 functions that manages the point system, the `viewerMultiplier` and the `tick`. The `viewerMultiplier` only holds the formula, that is 1 plus the natural logarithm of the current viewers multiplied by 0.5. This formula was shown to me by the AI not going to lie, this means that if you have little viewers the points will be small but the more you gain in viewers it grows larger but there is a point that once you reach a certain point it "normalizes" itself and the gain is not that big, basically this solves the power creep that big audiences brings because if there is 1000 people the exponent is so big that all milestones are reachable within seconds. 

The `tick` is where the points are calculated and this is the main point if you want to tweak some values, for example you can change the rate in which the formula is added, you can make it larger for the audience to gain more points faster. I also added a comment over it. 

I'm very excited for this project and stay tuned for the next update.