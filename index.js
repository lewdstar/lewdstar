process.stdin.setEncoding('utf8');
//node index.js -n nick -s server -p port -e exec.txt [-help] [-i]
/**
	Definition for exec.txt:

	Content:
	#channelName ^!regexMatch:(.*) ./processing_script.js
	#otherChan   ^!foo:([a-zA-Z]*) ./foobar
	PRIVATE 	 (.*) 			   ./parse_everything

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

var port = process.argv.indexOf('-p') > 0 ? process.argv[process.argv.indexOf('-p')+1] : "6667";
var exec = process.argv.indexOf('-e') > 0 ? process.argv[process.argv.indexOf('-e')+1] : "test.txt";
var nick = process.argv.indexOf('-n') > 0 ? process.argv[process.argv.indexOf('-n')+1] : "defaultBotName";
var info = process.argv.indexOf('-i') > 0 ? true : false ;
var serv = process.argv.indexOf('-s') > 0 ? process.argv[process.argv.indexOf('-s')+1] : "irc.rizon.net";

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

var config = fs.readFileSync(exec);
var channels = [], regexs =[], procs = [], raw = [];
var mute_state = false;

config.toString().split(os.EOL).forEach( function(line) { 
		channels.push( line.split(' ')[0] );
		  regexs.push( line.split(' ')[1] );
		   procs.push( line.split(' ')[2] );

	if ( line.split(' ')[3] !== undefined ) {
		raw.push( true );
	} else {
		raw.push( false );
	}

});

global.client = new irc.Client(serv, nick, {port: port, channels: channels, certExpired: true, realName: "PotIRCl Instance"});

client.addListener('error', function(error) {
	if(error.args[2] !== "PRIVATE" && error.rawCommand === 403) console.log(error);
});

//Utils
function mute() {
	mute_state = true;
}
function unmute() {
	mute_state = false;
}
function getState() {
	return mute_state;
}

function listen(channel, regex, module) {
	var proc   = require( module );

	if ( channel !== "PRIVATE" ) { 

			client.addListener("message"+channel, function(from, msg) {
				var message = {};
				    message.regex = regex.exec(msg);
				    message.from  = from;
				
				if ( regex.test(msg) ) {
					//Callback
					
						proc(message, function(txt, pm) {
							if( mute_state !== true ) {
								if(!pm) {
									client.say(channel, txt);
								} else {
									client.say(from, txt);
								}
							}
						},
						{
							from: channel,
							client: client,
							bot: {
								mute: mute,
								unmute: unmute,
								getState: getState
							}
						});
					
				}

			});

		} else {

			client.addListener("pm", function(from, msg) {
				var message = {};
				    message.regex = regex.exec(msg);
					message.from  = from;

				if ( regex.test(msg) ) {
					//Callback
					proc(message, function(txt) {
							client.say(from, txt);
						}, 
						{
							from: from,
							client: client,
							bot: {
								mute: mute,
								unmute: unmute,
								getState: getState
							}
						});
					
				}
			});
		}
}

function everything( channel, eve, module ) {
	var proc = require( module );

	client.addListener(eve, function() {
		var args = arguments;
		proc( args, function( txt ) {
			client.say( channel, txt);
		},
		{
			channel: channel,
			client: client,
			bot: {
				mute: mute,
				unmute: unmute,
				getState: getState
			}
		});
	});
}


regexs.forEach( function(item, i) {
		
		//Node on *nix has some problems with EOL splitting.
	    if(procs[i] === undefined ) return;	
		

		console.log("Binding: "+color(channels[i].split(","),"yellow")+" with "+color(regexs[i],"cyan")+" through "+color(procs[i], "magenta"));

		channels[i].split(",").forEach( function(channel, j) {
			if( raw[i] !== true ) {
				listen( channel.trim(), new RegExp(regexs[i]), procs[i]);
			} else {
				everything( channel.trim(), regexs[i], procs[i] );
			}
		});
		
});


