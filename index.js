process.stdin.setEncoding('utf8');
//node index.js -n nick -s server -p port -e exec.json [-h] [-i]
/**
	Definition for exec.txt:

	Content:
	{	messageListeners: [
			{
				script: "./scripts/cappy.js",
				channels: ["#test", "#debug"],
				regex: "^!test:(.*)",
				private: false
			},
			{
				script: "./scripts/anotherScript",
				channels: [],
				regex: "^PMOnly",
				private: true
			}
		],
		customListeners: [{
			event: "action",
			script: "./scripts/wow.js",
			autostart: true
		}]
	
	}
**/

/**
	Definition for processing scripts:

	//Simple CAPLOCKSPINATOR!

	module.exports = function(input, callback) {
		callback( input[from]+ " said: ");
		callback( input[1].toUpperCase() );
		callback( "Hi privately!", true);
	}

**/
var irc = require('irc');
var os  = require('os');
var fs  = require('fs');
var color = require('ansi-color').set;

var port = process.argv.indexOf('-p') > 0 ? process.argv[process.argv.indexOf('-p')+1] : "6697";
var exec = process.argv.indexOf('-e') > 0 ? process.argv[process.argv.indexOf('-e')+1] : null;
var nick = process.argv.indexOf('-n') > 0 ? process.argv[process.argv.indexOf('-n')+1] : "Fuccboi";
var serv = process.argv.indexOf('-s') > 0 ? process.argv[process.argv.indexOf('-s')+1] : null;

if (exec == null) {
	console.log(color("No executing file was given. Exiting...", "red"));
	return;
} 
if (serv == null) {
	console.log(color("No server was given. Exiting...", "red"));
}


if ( process.argv.indexOf('-h') !== -1 ) {
	var txt = '\n';
	txt += color('      PotIRCl Bot.      ','black+green_bg');
	txt += '\n      ------------ \n';
	txt += 'Executing Syntax: node index.js -n nick -s irc.server.net -p 6667 -e exec.txt \n';
	txt += '\nOptions: \n';
	txt += '    -n      Nick for the bot. \n';
	txt += '    -s      IRC network server address. \n';
	txt += '    -p      Port\n';
	txt += '    -e      Executing file (See doc for more) \n';
	txt += '    -i      Just a bonus paramater.\n';
	console.log(txt);
	return;
}

var bot = new irc.Client(serv, nick, {
	realName: "Savid Euneva",
	userName: "Fuccboi",
	autoConnect: true,
	port: port,
	secure: true,
	autoRejoin: true,
	selfSigned: true,
	certExpired: true,
	floodProtection: true,
	floodProtectionDelay: 350
});

try {
	var configuration = JSON.parse(fs.readFileSync(exec).toString());
	if( (configuration.messageListeners == undefined) && (configuration.customListeners == undefined) ) { throw Error("No listeners given."); }
	if( !(configuration.config.negations instanceof Array) ) { throw Error("Negation list is not an array. You can leave it blank, FYI."); }
	if( !(configuration.config.quitMessage instanceof Array) ) { throw Error("No Quit message? You can leave it black, FYI."); }

} catch(e) {
	console.log(color("Corrupted or invalid JSON file.", "red"));
	console.log(e);
	process.exit();
}

bot.addListener('error', function(e) {
	console.log(color("Error: ", "red"));
	console.log(e);
});


//Connected
bot.addListener('registered', function(msg) {
	//NS
	console.log("-   " + color("Authing: ", "cyan_bg") + "NickServ");
	(function auth(z) { 
		setTimeout(auth, 3000);
		if (bot.nick == nick && z !== 1) return;
		bot.say("NickServ","GHOST Fuccboi shotacat");
		bot.send ("NICK", nick);
		bot.say("NickServ","IDENTIFY shotacat");
	})(1);

	//join channels and listen
	initMessageListeners();
});

var joinedChannels = [];

function initMessageListeners(callback) {
	//Join channels
	configuration.messageListeners.forEach( function(listener) {
		if( listener.channels.length > 0 ) {
			listener.channels.forEach( function(channel) {
				if( joinedChannels.indexOf(channel) == -1 && configuration.config.negations.indexOf(channel) == -1 ) {
					console.log("--  " + color("Joining: ", "green_bg") + channel);
					bot.join(channel);
					joinedChannels.push(channel);
				}
			})
		}
	});

	//Attach Message Listeners
	configuration.messageListeners.forEach( function(listener) {
		console.log("--- " + color("Binding: ", "yellow_bg") + listener.script + " with " + color(listener.regex,"green") + " in:");

		var processor = require(listener.script);

		//Private?
		if(listener.private == true) {
			bot.addListener("pm", function(from, message) {

				var input = 
					{
						from: from,
						regex: (new RegExp(listener.regex)).exec(message)
					};
				var extra = 
					{
						from: from,
						client: bot
					};

				if( (new RegExp(listener.regex)).test(message) ) {
					processor(input, function(txt) {
						bot.say(from, txt);
					}, extra);
				}

			});
		}
		
		//Channel.
		listener.channels.forEach(function(channel) {
			//Negation channels
			if( configuration.config.negations.indexOf(channel) !== -1 ) return;

			//Logging
			console.log("    +--> " + color(channel,"yellow"));

			bot.addListener("message"+channel, function( from, message ) {

				var input = 
					{ 
						from: from,
					 	regex: (new RegExp(listener.regex)).exec(message)
					};
				var extra = 
					{
						from: channel,
						client: bot
					};

				if( (new RegExp(listener.regex)).test(message) ) {

					processor(input, function(txt, pm) {
						if(!pm) {
							bot.say(channel, txt);
						} else {
							bot.say(from, txt);
						}
					}, extra);

				}

			});
		});

	});

	//Attach RAW Custom Listeners
	configuration.customListeners.forEach( function(listener) {
		console.log("----"+color("Binding: ", "magenta_bg") + listener.script + " with event " + color(listener.event, "green"));

		var processor = require(listener.script);

		bot.addListener(listener.event, function() {
			processor(arguments, listener.channels, bot);
		});
	});

	if (callback instanceof Function) callback();
} 

//Handling exits
function properKill() {
	var bye = configuration.config.quitMessage[Math.floor(configuration.config.quitMessage.length*Math.random())];

	bot.disconnect(bye, function() {
		process.exit("Bye");
	});
}


process.on('SIGINT', properKill);
process.on('SIGTERM', properKill);
