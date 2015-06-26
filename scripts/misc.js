// !([a-zA-Z]*)\s?(.*)?

module.exports = function(input, out, extra) {
	var what = input.regex[1].toLowerCase();
	var spec = input.regex[2]? input.regex[2] : "";

	if (what == "source") {
		out("Source available on GitHub: " + "http://github.com/ptskh/schbot");
	}
	else if ( what == "help" ) {
		out("Available commands: define, wiki, source, help, sick, gal, cum, stfu, unmute, roll, choose. PM !help for more.");
		if ( extra.from.substr(0,1) != "#" ) {
			out("cum [keywords] [, keyword2] | [filter] [, filter 2] | [rating above]: Returns a random image from Gelbooru.", true);
			out("gal: returns a random image from the Shotachan Gallery", true);
			out("define [text] : Fetch definition of a word from UrbanDictionary. ", true);
			out("wiki [text] : Fetch summary of Wikipedia article if found. " , true);
			out("source: Returns link to GitHub Repository of this bot.", true);
			out("help: Shows this help message.", true);
			out("sick: Returns a one of the top daily jokes from Sickipedia. ", true);
			out("stfu/unmute: Mute or unmute bot.", true);
			out("roll [max]: Roll a random number from 1 to [max]", true);
			out("choose [item1, item2, item3]: choose a random item.", true);
		}
	}
	else if ( what == "stfu" && extra.from.substr(0,1) == "#") {
		out("Bot mute state: "+ !extra.bot.getState());
		extra.bot.mute();
	}
	else if ( what == "unmute" ) {
		extra.bot.unmute();
		out("Bot mute state: "+extra.bot.getState());
	}
	else if ( what == "roll" ) {
		spec = (spec == "")? 100 : spec;
		out( Math.round( 1 + (Math.random() * (parseInt(spec)-1) )  ));
	}
	else if ( what == "choose") {
		if ( spec == "" ) {
			out("Nothing to choose from. Can I choose you?");
			return;
		}

		try {
			var stuffs = spec.trim().split(",");
			out( stuffs [ Math.round( Math.random() * stuffs.length ) ].trim() );
		} catch(e) {
			out("Something wrong: " + e.message);
			out("String I received: "+spec);
		}
	}
}