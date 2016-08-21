process.stdin.setEncoding('utf8');

const Discord   = require('discord.js');
const fs  		= require('fs');

var bot = new Discord.Client();

bot.loginWithToken('MjE2ODA0MjE3ODYyNDg4MDY1.CpuzVw.9FtcJtASmr9YIqRQIHBvu9X_IM8', (err) => {
	console.log('Login Error:', err);
});

bot.features = {}; // Reserved spaces for modules.

try {
	var configuration = JSON.parse(fs.readFileSync(process.argv[1+process.argv.indexOf("-e")]).toString());
	bot.features.config = configuration;
	if( (configuration.messageListeners == undefined) && (configuration.customListeners == undefined) ) { throw Error("No listeners given."); }
} catch(e) {
	console.log("Corrupted or invalid JSON file.");
	console.log(e);
	process.exit();
}

bot.on('message', (message) => {
	if(message.author.username == bot.user.username) return;

	bot.features.config.messageListeners.forEach( listener => {
		var regex = new RegExp(listener.regex);
		if(  regex.test(message.content) ) { 

			var processor = require(listener.script);

			processor({
				from: message.channel,
				regex: regex.exec(message.content)
			}, (txt, pm) => {
				if( !pm ) { bot.sendMessage(message.channel, txt) } else {
					bot.sendMessage(message.authro, txt);
				}
			}, {
				from: message.channel.toString().substr(1, message.channel.toString().length-2),
				bot: bot
			});

		}
	})
});
