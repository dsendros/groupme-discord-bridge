# groupme-discord-bridge
A bridge bot which will send a message to a GroupMe Group any time a user enters or leaves a Discord channel or starts playing a game. 

## Requirements
- NodeJS installed.

### Limitations
The program can only bridge a single GroupMe Group and a single Discord Channel together. 

## Setting up
First you can clone this repository (or download it) and then run ```npm install``` to fetch dependencies.

Now you can run ```node index.js```. It should error out saying you don't have a config file, and it will create a skeleton one for you, which should look something like this:
```yaml
discord:
    username: my-bot
    token: ""
    guild: '0'
    channel: '0'
groupme:
    botId: ""
    accessToken: ""
```

Next you will need to create a Discord bot account on the Discord developers page. You can use this [handy guide](https://discordpy.readthedocs.io/en/stable/discord.html). You will need to enable *Presence Intent* and *Server Members Intent* under the *Privileged Gateways Intents* section. You do not need to enable other *Bot Permissions*. Once you've added the Discord bot to your Guild you'll need to copy the "Token" and put them in the ```bridgeBot.yml``` config file. It goes to the "token" field under "discord" in the YAML file. Also fill in the "username" field with the Discord bot's username.
```
discord:
    username: "YOUR DISCORD BOT's USERNAME HERE"
    token: "YOUR DISCORD TOKEN HERE"
    guild: '0'
    channel: '0'
groupme:
    botId: ""
    accessToken: ""
```

Now you will need the Guild and Channel IDs for the Discord side. In Discord, you'll need to enable Developer mode (you can find this option under *User Settings* (cog in bottom left) > *Advanced*. Right click on the Discord Guild (or server as it is called in the client) and click *Copy ID*. You can paste that in the "guild" field in ```bridgeBot.yml```. Do the same for the voice channel by right clicking on the voice channel and clicking *Copy ID*. Paste that in the "channel" field.
```
discord:
    username: "YOUR DISCORD BOT's USERNAME HERE"
    token: "YOUR DISCORD TOKEN HERE"
    guild: 'THE GUILD ID YOU COPIED'
    channel: 'THE CHANNEL ID YOU COPIED'
groupme:
    botId: ""
    accessToken: ""
```

Finally we need to set up the GroupMe bot. Head over to https://dev.groupme.com/ and sign in with your GroupMe account. Go to the *Bots* and click on the *Create a Bot* button. Select which GroupMe group you want the bot to be in, and give it a Name and an Avatar URL (a URL to a picture) if you chose to do so.

Once you've created the GroupMe bot, copy its *Bot ID* and paste it in ```bridgeBot.yml``` in the "botId" field. You'll also need to copy your GroupMe access token, which can be found by clicking on *Access Token* in the top right of the GroupMe developers site. 

```
discord:
    username: "YOUR DISCORD BOT's USERNAME HERE"
    token: "YOUR DISCORD TOKEN HERE"
    guild: 'THE GUILD ID YOU COPIED'
    channel: 'THE CHANNEL ID YOU COPIED'
groupme:
    botId: "THE GROUPME BOT's ID"
    accessToken: "YOUR GROUPME ACCESS TOKEN"
```

Now you should be all set! Save the config file and give the bridge a run by running ```node index.js```.