// TODO: Publish publicly
/*
groupme-discord-bridge
A bridge bot which will send a message to a GroupMe Group any time a user enters or leaves a Discord channel or starts playing a game.

Copyright (C) 2022 Dennis Sendros
Contact: DSendros (a) gmail (punto) com

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

// Imports -----------------------------------------------------------------------------------------------------------------
const { Discord, Client, GatewayIntentBits, ActivityType } = require('discord.js');
const YAML = require("yamljs");
const request = require("request-promise");
const express = require("express");
const uuidv1 = require("uuid");
const app = express()


const os = require("os");
const fs = require("fs");
const path = require("path");
const process = require("process");

// Config and functions -----------------------------------------------------------------------------------------------------------------
const defaultConfig = {
  discord: {
    username: "my-bot",
    token: "",
    guild: "0",
    channel: "0"
  },
  groupme: {
    botId: "",
    accessToken: ""
  }
};

var config;
var tempDir = path.join(os.tmpdir(), "groupme-discord-bridge");

function sendGroupMeMessage(message, callback) {
  let options = {
    method: 'POST',
    uri: 'https://api.groupme.com/v3/bots/post',
    body: {
      bot_id: config.groupme.botId,
      text: message
    },
    json: true
  };

  request(options).then((res) => {
    callback(res);
  }).catch((err) => {
    console.error(err);
  });
}

const discordClient = new Client({
  intents: [
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildPresences,
  ],
});

app.get('/', function(req, res) {
  res.send('Hello World')
})

app.listen(3000, () => console.log('Server active'));

function getUsernameFromPresence(presence) {
  if (presence !== null && presence.user !== null && presence.user.username !== null) {
    return presence.user.username;
  }
}

function getUserNameFromVoiceState(voiceState) {
  if (voiceState.member !== null && voiceState.member.user !== null && voiceState.member.user.username !== null) {
    return voiceState.member.user.username;
  }
}

function getChannelFromVoiceState(voiceState) {
  if (voiceState.channel !== null) {
    return voiceState.channel.name;
  }
}
// Program Main ----------------------------------------------------------------------------------------------------------------------------
try {
  fs.mkdirSync(tempDir);
} catch (e) {
  // Already exists
}

try {
  config = YAML.load("bridgeBot.yml");
} catch (e) {
  console.error("Could not load bridgeBot.yml, perhaps it doesn't exist? Creating it...");
  fs.writeFileSync("bridgeBot.yml", YAML.stringify(defaultConfig, 4));
  console.error("Configuration file created. Please fill out the fields and then run the bot again.")
  process.exit(1);
}

discordClient.on("ready", () => {
  console.log("Discord Client Ready.");
});

discordClient.on("presenceUpdate", (oldPresence, newPresence) => {

  const user = getUsernameFromPresence(newPresence);
  var oldActivities = null;

  //Next line is useful for debugging.
  //console.log(user, oldPresence, user, newPresence);

  /*
  If OldPresence.activities doesn't exist, set a flag. 
  If it does exist, get an array of games the user was playing.
  Also Get an array of games the user is playing.
  */
  if (oldPresence !== null && oldPresence.activities !== null) {
    if (oldPresence.activities.filter(array => array.type === ActivityType.Playing).length > 0) {
      oldActivities = oldPresence.activities.filter(array => array.type === ActivityType.Playing);
    }
  }
  const newActivities = newPresence.activities.filter(array => array.type === ActivityType.Playing);

  //If the oldActivties array exists and is a different length than the new Activities arra    
  if (oldActivities !== null) {
    /*
    Compare the name of every item in newActivities to every item in oldActivities. 
    If the newActivities item doesn't match any items in oldActivities, print that the user has stopped playing that game.
    */
    var activitiesStoppedDiff = oldActivities.filter(wasPlaying => !newActivities.some(isPlaying => isPlaying.name === wasPlaying.name));
    activitiesStoppedDiff.forEach(stoppedPlaying => sendGroupMeMessage(user + " stopped playing " + stoppedPlaying.name, () => { }));

    /*
    Activities.filter(o => !newActivities.some(n => n.name === o.name)).forEach(o => {
      sendGroupMeMessage(user + " stopped playing " + o.name, () => { });
    });
    */
    /*
    Compare the name of every item in oldActivities to every item in newActivities. 
    If the oldActivities item doesn't match any items in newActivities, print that the user has started playing that game.
    */
    var ActivitiesStartedDiff = newActivities.filter(isPlaying => !oldActivities.some(wasPlaying => wasPlaying.name === isPlaying.name))
    ActivitiesStartedDiff.forEach(startedPlaying => sendGroupMeMessage(user + " started playing " + startedPlaying.name, () => { }));
  }
  else {
    newActivities.forEach(isPlaying => {
      sendGroupMeMessage(user + " started playing " + isPlaying.name, () => { });
    });
  }
});

/*
If a user leaves or joins a channel, announce it to the Groupme. 
*/
discordClient.on('voiceStateUpdate', (oldState, newState) => {
  //Next line useful for debugging.
  //console.log(newState, oldState);

  if (newState.channelId === null) {
    const user = getUserNameFromVoiceState(oldState);
    const channel = getChannelFromVoiceState(oldState);
    sendGroupMeMessage(user + " left " + channel, () => { });
  }
  else if (oldState.channelID == null) {
    const user = getUserNameFromVoiceState(newState);
    const channel = getChannelFromVoiceState(newState);
    sendGroupMeMessage(user + " joined " + channel, () => { });
  }
})

discordClient.login(config.discord.token);