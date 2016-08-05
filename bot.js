'use strict';

const TelegramBot = require('node-telegram-bot-api');
const config = require('./config.json');
const numeral = require('hebrew-numerals');

const token = config.token;
const ntt = numeral.numberToText;

const bot = new TelegramBot(token, {polling: true});

var users = {};

const greeter = (id) => {
  bot.sendMessage(id, 'שלום\nAvaliable commands:\n/start or /help - This message\n/number - gives you number in hebrew, wating for numeric input');
}
const checkMsg = (id, msg) => {
  if (!users[id]) {
    users[id] = {'state': 'none'};
    console.log('New user!');
    return;
  };

  if (users[id]['state'] === 'none' && msg[0] != '/') {
    greeter(id);
    return;
  }

  if (users[id]['state'] === 'numeral' && msg != '/number') {
    numeralCheck(id, msg);
  };
}

const numeralCheck = (id,msg) => {

  if (users[id]['answer'] === parseInt(msg, 10)) {
    bot.sendMessage(id, 'Correct! Try another /number' + '?');
    users[id]['state'] = 'none';
  } else if (msg === '/giveup') {
    bot.sendMessage(id, 'The answer was: ' + users[id]['answer'] + '. Try another /number' + '?');
    users[id]['state'] = 'none';
  } else {
    bot.sendMessage(id, 'Nope. Try again or /giveup \n'
    + ntt(users[id]['answer']));
  };
}

//debug and logging
console.log('Bot is up and running!');

//Every Messege Parser
bot.on('message', (msg) => {
  checkMsg(msg.from.id, msg.text);

  var type = '';
  if (msg.text) {
    type = msg.text;
  } else if (msg.sticker) {
    type = 'stiker: ' + msg.sticker.emoji;
  } else {
    type = 'something else';
  };
  console.log(
    'From: ' + msg.from.username + ' (id: ' + msg.from.id + ') \nMessage (' + msg.message_id + '): ' + type + '\n'
  );

});
/*
bot.onText(/\/(\w+)/, (msg, match) => {
  console.log("Universal trigger fired on command: " + match[0]);
});*/

//Greeting and Help
bot.onText(/\/start|\/help/, (msg, match) => {
  greeter(msg.from.id);
});

// Matches /echo [whatever]
bot.onText(/\/echo (.+)/, (msg, match) => {
  var fromId = msg.from.id;
  var resp = match[1];
  bot.sendMessage(fromId, resp);
});
bot.onText(/\/users/, (msg, match) => {
  console.log(users);
});

bot.onText(/(\/number)/, (msg, match) => {
  const id = msg.from.id;
  const rnd = Math.floor(Math.random() * 999);

  if(users[id]['state'] === 'numeral') {
    bot.sendMessage(id, 'Still wating for answer for ' + ntt(users[id]['answer']) + '. or you want to /giveup?');
  } else {
    users[id]['state'] = 'numeral';
    users[id]['answer'] = rnd;
    bot.sendMessage(id, ntt(users[id]['answer']))
  }
});
