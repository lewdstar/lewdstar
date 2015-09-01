

module.exports = function(input, chans, bot) {
	var raw = input[0];
	var admins = ["shotacat","aspect", "TRG", "Kiggy", "uid24615"];
	//le krill
	if( raw.command == "PRIVMSG" && raw.args[1] == "$ kill "+ bot.nick && admins.indexOf(raw.user) !== -1 ) {
		bot.disconnect("Kill requested by " + raw.user, function() {
			process.exit("bye");
		})
	}
	//le part
	if( raw.command == "PRIVMSG" && raw.args[1] == "$ part" && admins.indexOf(raw.user) !== -1 ) {
		bot.part(raw.args[0],"Parting requested by " + raw.user);
	}
	//le join
	if( raw.command == "PRIVMSG" && raw.args[1].substr(0,8) == "$ invite" && admins.indexOf(raw.user) !== -1 ) {
		bot.join(raw.args[1].split(" ")[2] , function() {
			bot.notice(raw.args[1].split(" ")[2], "Hello. I have been summoned by " + raw.user);
		});
	}
}