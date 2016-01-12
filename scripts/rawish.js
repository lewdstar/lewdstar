var md5 = require('md5');

module.exports = function(input, chans, bot) {
	var raw = input[0];
		if ( !(bot.features.config.admins instanceof Array) ) { 
			bot.features.config.admins = ["shotacat","aspect", "TRG", "Kiggy", "uid24615", "Kenpari", "sid115038", "DJTweak","shadoukun"]; 
		}
	var admins = bot.features.config.admins;
	var authkeys = ["098f6bcd4621d373cade4e832627b4f6"];
	var forbidden = ["pipe", "config"];

	//heyitsme
	if (raw.command =="PRIVMSG" && raw.args[1].substr(0,10) == "$ heyitsme" ) {
		if( authkeys.indexOf(md5(raw.args[1].trim().split(" ")[2])) !== -1 ) {
			if( raw.args[0].substr(0,1) == "#" ) {
				bot.say(raw.args[0], "Are you stupid?");
			} else {
				admins.push(raw.user);
				bot.say(raw.nick, "You are now authenticated.");
			}
		} else {
			bot.say(raw.args[0], "No.");
		}
	}

	//le flush stuffs
	if( raw.command == "PRIVMSG" && raw.args[1].substr(0,7) == "$ flush" ) {
		var what = raw.args[1].split(" ")[2];
		try {
			if ( forbidden.indexOf(what) == -1 && bot.features[what] ) {
				delete bot.features[what];
				bot.say(raw.args[0], "Flushed storage for " + what);
			} else {
				var featureList = Object.keys(bot.features);

				if(forbidden.indexOf(what) !== -1) throw Error("You're trying to flush an internal feature's storage. Please don't.");
				if(!bot.features[what]) throw Error("Doesn't exist. Existing features: " + featureList);
			}
		} catch (e) {
			bot.say(raw.args[0], "No storage exist for: "+what+". Error message: " + e.message);
		}
	}
	
	//le krill
	if( raw.command == "PRIVMSG" && raw.args[1].trim().substr(0,6) == "$ kill" && admins.indexOf(raw.user) !== -1 ) {
		if( raw.args[1].trim().split(" ")[2] !== bot.nick ) { bot.say(raw.args[0], "Not me."); return; }
		bot.disconnect("Kill requested by " + raw.user, function() {
			process.exit("bye");
		})
	}

	//le auth
	if( raw.command == "PRIVMSG" && raw.args[1].trim() == "$ auth" && admins.indexOf(raw.user) !== -1 ) { 
		bot.say("NickServ","GHOST "+ bot.features.config.config.register.username +" "+ bot.features.config.config.register.password);
		bot.send("NICK", bot.features.config.config.register.username);
		bot.say("NickServ","IDENTIFY " + bot.features.config.config.register.password );
	}

	//le part
	if( raw.command == "PRIVMSG" && raw.args[1].trim() == "$ part "+ bot.nick && admins.indexOf(raw.user) !== -1 ) {
		bot.part(raw.args[0],"Parting requested by " + raw.user);
	}

	//le join
	if( raw.command == "PRIVMSG" && raw.args[1].substr(0,8) == "$ invite") {
		bot.join(raw.args[1].split(" ")[2] , function() {
			bot.say(raw.args[1].split(" ")[2], "Hello. I have been summoned by " + raw.user +". "+bot.nick+ " is ready!");
		});
	}

	//le say
	if( raw.command == "PRIVMSG" && raw.args[1].substr(0,5) == "$ say" && admins.indexOf(raw.user) !== -1 ) {
		bot.say(raw.args[1].split(" ")[2], raw.args[1].split(" ").slice(3).join(" "));
	}

	//le pipe (experimental and dangerous) 
	if ( !(bot.features.pipes instanceof Array)  ) bot.features.pipes = []; 

	if( raw.command == "PRIVMSG" && raw.args[1].substr(0,6) == "$ pipe" && admins.indexOf(raw.user) !== -1 ) {
		if( raw.args[1].split(" ").length < 4 ) { bot.say(raw.args[0], "Insufficient params."); return; }
		var source = raw.args[1].split(" ")[2].trim();
		var target = raw.args[1].split(" ")[3].trim();

		if(source == bot.nick || target == bot.nick) { bot.say(raw.args[0], "Please don't."); return; }
		bot.features.pipes.push( {src: source, targ: target} );
		bot.say(raw.args[0], "Pipe initiated from: " +  source + " --> " + target);

		//--- New Channel listener or nah?
		if( bot.features.pipes.length === 1 && bot.features.pipesEnabled !== true ) { bot.features.pipesEnabled = true;
			bot.addListener("raw", function(rawmsg) {
				if( rawmsg.command !== "PRIVMSG" ) return;
				bot.features.pipes.forEach( function(pipe) { 
					if( rawmsg.args[1].substr(0,1) == "$" || rawmsg.command !== "PRIVMSG" ) return;
					if( pipe.src == rawmsg.args[0] ) bot.say( pipe.targ,  rawmsg.args[1]);
					if( pipe.src == rawmsg.nick && rawmsg.args[0] == bot.nick ) bot.say( pipe.targ,  rawmsg.args[1]);
				});
			});
		} 
	}

	//le unpipe 
	if( raw.command == "PRIVMSG" && raw.args[1].substr(0,8) == "$ unpipe" && admins.indexOf(raw.user) !== -1 ) {
		if( raw.args[1].split(" ").length < 4 ) { bot.say(raw.args[0], "Insufficient params."); return; }
		var source = raw.args[1].split(" ")[2].trim();
		var target = raw.args[1].split(" ")[3].trim();
		var removed = 0;
		bot.features.pipes.forEach( function(pipe, index) {
			if( pipe.src == source && pipe.targ == target ) {
				bot.features.pipes.splice(index,1); removed++;
			}
		});
		var plural = removed > 1? "s": "";
		if( removed > 0 ) bot.say(raw.args[0], "Found "+removed+" occurence"+plural+". Pipe has been dismantled.");
		if( removed == 0 ) bot.say(raw.args[0], "Did not found any pipe with such configuration.");
	}	
}