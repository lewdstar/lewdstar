
module.exports = function(ins, channels, bot) {
	if( ins[2] !== "v" & ins[3] !== bot.nick) return;

	bot.say(ins[0], ins[1] + ": Fuck you.");
	return;
}