
module.exports = function(ins, channels, bot) {
	if( ins[2] !== "v" ) return;

	bot.say(ins[0], ins[1] + ": Fuck you.");
	return;
}