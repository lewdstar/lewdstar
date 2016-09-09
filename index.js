process.stdin.setEncoding('utf8');

const Discord   = require('discord.js');
const token 	= 'MjE3MDgwMTM4ODU5NDEzNTA0.CrOZxw.05GAzYdej6eukExXRGQJGaT3Ths';
const fs  		= require('fs');

var bot = new Discord.Client();
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
				if( !pm ) { message.channel.sendMessage(txt) } else {
					message.author.sendMessage(txt);
				}
			}, {
				from: message.channel.toString().substr(1, message.channel.toString().length-2),
				bot: bot
			});

		}
	})
});

bot.on('ready', () => {
	console.log("I'm ready");
	bot.guilds.find('name', 'Shotachan').channels.find('name','general').sendMessage("I'm ready").
	then(() => {
		console.log("Sent to #general that I'm ready.");
	});
})

bot.on('error', (error) => {
	console.log("error:");
	console.log(error);
});

bot.login(token);


console.log("Hello. This bot is running on Node Version: " + process.version);
