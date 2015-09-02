

module.exports = function(input, chans, bot) {
	var raw = input[0];
	var admins = ["shotacat","aspect", "TRG", "Kiggy", "uid24615", "Kenpari", "Jamie", "DJTweak"];

	//le krill
	if( raw.command == "PRIVMSG" && raw.args[1] == "$ kill "+ bot.nick && admins.indexOf(raw.user) !== -1 ) {
		bot.disconnect("Kill requested by " + raw.user, function() {
			process.exit("bye");
		})
	}

	//le part
	if( raw.command == "PRIVMSG" && raw.args[1] == "$ part "+ bot.nick && admins.indexOf(raw.user) !== -1 ) {
		bot.part(raw.args[0],"Parting requested by " + raw.user);
	}

	//le join
	if( raw.command == "PRIVMSG" && raw.args[1].substr(0,8) == "$ invite") {
		bot.join(raw.args[1].split(" ")[2] , function() {
			bot.say(raw.args[1].split(" ")[2], "Hello. I have been summoned by " + raw.user +". "+bot.nick+ " is ready to rock & roll!");
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

		if(source == bot.nick || target == bot.nick) { bot.say(raw.args[0], bot.color("dark_red", "Please don't.")); return; }
		bot.features.pipes.push( {src: source, targ: target} );
		bot.say(raw.args[0], "Pipe initiated from: " +  source + " --> " + target);

		//--- New Channel listener or nah?
		if( bot.features.pipes.length === 1 && bot.features.pipesEnabled !== true ) { bot.features.pipesEnabled = true;
			bot.addListener("raw", function(rawmsg) {
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