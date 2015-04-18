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
var channels = [], regexs =[], procs = [];

config.toString().split(os.EOL).forEach( function(line) { 
		channels.push( line.split(' ')[0] );
		  regexs.push( line.split(' ')[1] );
		   procs.push( line.split(' ')[2] );
});

global.client = new irc.Client(serv, nick, {port: port, channels: channels, certExpired: true, realName: "PotIRCl Instance"});

client.addListener('error', function(error) {
	if(error.args[2] !== "PRIVATE" && error.rawCommand === 403) console.log(error);
});

for ( i=0; i< regexs.length; i++) {
		
		var index  = i;
		var regexp = new RegExp(regexs[i]);
		//Node on *nix has some problems with EOL splitting.
	    if(procs[index] === undefined || channels[index] === undefined ) return;	
		var proc   = require(procs[index]);

console.log("Binding: "+color(channels[index],"yellow")+" with "+color(regexs[i],"cyan")+" through "+color(procs[index], "magenta"));
//This is stupid because PRIVATE and non-private are almost the same

		if ( channels[index] !== "PRIVATE" ) { 

			client.addListener("message"+channels[index], function(from, msg) {
				var message = {};
				    message.regex = regexp.exec(msg);
				    message.from  = from;
				
				if ( regexp.test(msg) ) {
					
					//Callback
					
						proc(message, function(txt, pm) {
							if(!pm) {
								client.say(channels[index], txt);
							} else {
								client.say(from, txt);
							}
						},
						{
							from: channels[index],
							client: client
						});
					
				}

			});

		} else {

			client.addListener("pm", function(from, msg) {
				var message = {};
				    message.regex = regexp.exec(msg);
					message.from  = from;

				if ( regexp.test(msg) ) {
					//Callback
					proc(message, function(txt) {
							client.say(from, txt);
						}, 
						{
							from: from,
							client: client
						});
					
				}
			});
		}
}

