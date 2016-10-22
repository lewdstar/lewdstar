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

var mainGuild = null;

bot.on('message', processMessage);

bot.on('messageUpdate', (a,b) => processMessage(b));

function processMessage(message) {
	if(message.author.username == bot.user.username) return;

	bot.features.config.messageListeners.forEach( listener => {
		var regex = new RegExp(listener.regex);
		if(  regex.test(message.content) ) { 

			var processor = require(listener.script);

			processor({
				from: message.channel,
				guild: mainGuild,
				msg: message,
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
	});
}

bot.on('ready', () => {
	console.log("is ready");
	mainGuild = bot.guilds.find('name', 'Shotachan');
	var chan = mainGuild.channels.find('name','general');
	var owner = mainGuild.members.find('id','216799559714603008').user;
	if( owner.status == "online" ) {
		if(owner.game !== null) {
			chan.sendMessage(`Tell @${owner.username}#${owner.discriminator} to quit playing ${owner.game.name} and fix me.`);
		}
	} else {
		chan.sendMessage("Owner of the bot is offline. If I just died from a command. Please tell me.")
	}
})

bot.on('error', (error) => {
	console.log("error:");
	console.log(error);
});

bot.login(token);


console.log("Hello. This bot is running on Node Version: " + process.version);
