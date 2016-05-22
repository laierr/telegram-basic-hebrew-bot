'use strict';

const TelegramBot = require('node-telegram-bot-api');
const config = require('./config.json')

const token = config.token;

// Setup polling way
const bot = new TelegramBot(token, {polling: true});

console.log('Bot is running!');

// Matches /echo [whatever]
bot.onText(/\/echo (.+)/, function (msg, match) {
  var fromId = msg.from.id;
  var resp = match[1];
  bot.sendMessage(fromId, resp + " lol " + test.token);
});



bot.onText(/.*/, function (msg, match) {
  console.log('From: ' + msg.from.username + ' (id: ' + msg.from.id + ') \nMessage: ' + msg.text);
  bot.sendMessage(msg.from.id, 'I\'m sorry, ' + msg.from.first_name + '. I\'m afraid I can\'t do that.');
});
