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