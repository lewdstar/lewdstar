

module.exports = function(input, chans, bot) {
	var raw = input[0];
	var admins = ["shotacat","aspect", "TRG", "Kiggy", "uid24615", "Kenpari", "Jamie"];
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
}