// !([a-zA-Z]*)\s?(.*)?

module.exports = function(input, out, extra) {
	var what = input.regex[1].toLowerCase();
	var spec = input.regex[2]? input.regex[2].toLowerCase() : undefined;

	if (what == "source") {
		out("Source available on GitHub: " + "http://github.com/potasmic/schbot");
	}
	else if ( what == "help" ) {
		out("Available commands: define, wiki, source, help, sick, gal, cum. PM !help for more.");
		if ( extra.from.substr(0,1) != "#" ) {
			out("cum [keywords] [, keyword2] | [filter] [, filter 2] | [rating above]: Returns a random image from Gelbooru.", true);
			out("gal: returns a random image from the Shotachan Gallery", true);
			out("define [text] : Fetch definition of a word from UrbanDictionary. ", true);
			out("wiki [text] : Fetch summary of Wikipedia article if found. " , true);
			out("source: Returns link to GitHub Repository of this bot.", true);
			out("help: Shows this help message.", true);
			out("sick: Returns a one of the top daily jokes from Sickipedia. ", true);
			out("stfu/unmute: Mute or unmute bot.", true);
		}
	}
	else if ( what == "stfu" && extra.from.substr(0,1) == "#") {
		out("Bot mute state: "+extra.bot.getState());
		extra.bot.mute();
	}
	else if ( what == "unmute" ) {
		extra.bot.unmute();
		out("Bot mute state: "+extra.bot.getState());
	}
}