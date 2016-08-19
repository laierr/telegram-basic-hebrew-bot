'use strict';

const TelegramBot = require('node-telegram-bot-api');
const ntt = require('hebrew-numerals').numberToText;

const getToken = () => {
    try {
        return require('./config.json').token;
    } catch (e) {
        return process.env.TOKEN;
    }
};

const token = getToken();

const bot = new TelegramBot(token, {polling: true});

var users = {};

const greeter = (id, type) => {
  if (type === 'start') {
    bot.sendMessage(id, 'Welcome!\nI\'m the Hebrew Basic Numbers bot.\nIf you want to check your knowlegde say /number. I will give you a number in hebrew, and you should respond with its numerical value — for example, I say "mataim vesheloshesre" and you answer "213". You can try as many times as you want or /giveup to see correct answer.\nIf you want to play it other way around then say /ntt [number] (or just /[number]) and I will convert the number you suggested to text — if you say /ntt 42 (or /42), I will respond \"arbaim veshtaim\". I\'m not so smart and only know numbers from 0 to 999, please consider it!\nAnd if you ever forget how to make me do stuff just type /help.\nI guess that\'s all. Good luck!');
  } else if (type === 'help') {
      bot.sendMessage(id, '/start: welcome message, detailed description of bot abilities\n/number: get some words in hebrew and respond with numbers\n/giveup: give up and see correct answer\n/ntt [number] (or /[number]): check how any number from 0 to 999 sounds in hebrew');
  }
};

const checkMsg = (id, msg) => {
// check if we know this user, creates new entry
  if (!users[id]) {
    users[id] = {'state': 'none'};
  };
// shows help, if we expect command
  if (users[id].state === 'none' && msg[0] != '/') {
    greeter(id, 'help');
    return;
  }
// checking answer, if we expect one
  if (users[id].state === 'numeral' && msg != '/number') {
    numeralCheck(id, msg);
    return;
  };
}

const numeralCheck = (id, msg) => {

  if (users[id].answer === parseInt(msg, 10)) {
    bot.sendMessage(id, 'Correct! Try another /number?');
    users[id].state = 'none';
  } else if (msg === '/giveup') {
    bot.sendMessage(id, 'The answer was: ' + users[id].answer + '. Try another /number?');
    users[id].state = 'none';
  } else {
    bot.sendMessage(id, 'Nope. Try again or /giveup. \n'
    + ntt(users[id].answer));
  };
}

//Every Message Parser
bot.on('message', (msg) => {
  checkMsg(msg.chat.id, msg.text);
});

// /number trigger
bot.onText(/(\/number)/, (msg, match) => {
  const id = msg.chat.id;
  const rnd = Math.floor(Math.random() * 999);

  if(users[id].state === 'numeral') {
    bot.sendMessage(id, 'Still wating for answer for ' + ntt(users[id].answer) + '. Or you want to /giveup?');
  } else {
    users[id].state = 'numeral';
    users[id].answer = rnd;
    bot.sendMessage(id, ntt(users[id].answer));
  }
});
// converts number to text on request
bot.onText(/\/ntt (.+)|\/(\d+)/, (msg, match) => {
  let input = 0;
  //if alternative regex fires, match[1] would be undefined
  match[1] ? input = parseInt(match[1], 10) : input = parseInt(match[2], 10);

  if (typeof input === 'number' && input >= 0 && input < 1000) {
    bot.sendMessage(msg.chat.id, ntt(input));
  } else {
    bot.sendMessage(msg.chat.id, 'Sorry, I only accept numbers in range from 0 to 999.');
  }
});


//Greeting and Help
bot.onText(/\/start/, (msg, match) => {
  greeter(msg.chat.id,'start');
});

bot.onText(/\/help/, (msg, match) => {
  greeter(msg.chat.id,'help');
});

//debug and logging
console.log('Bot is up and running!');

//logs user base
bot.onText(/\/users/, (msg, match) => {
  console.log(users);
});

//dumps raw message data to log
bot.onText(/\/dumpmsg/, (msg, match) => {
  console.log(msg);
});

//logs user input
bot.on('message', (msg) => {
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
// Matches /echo [whatever]
bot.onText(/\/echo (.+)/, (msg, match) => {
  var fromId = msg.chat.id;
  var resp = match[1];
  bot.sendMessage(fromId, resp);
});
