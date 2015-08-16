
module.exports = function(ins, channels, bot) {
	if( ins[2] !== "v" ) return;

	bot.say(ins[0], "Thanks, " + ins[1] + "! You're very generous.");
	return;
}