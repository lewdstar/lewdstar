
module.exports = function(input, out, extra) {
	var bot = extra.bot;

	//le flush stuffs
	if( input.regex.input.substr(0,7) == "$ flush" ) {
		var what = input.regex.input.split(" ")[2];
		try {
			if ( bot.features[what] ) {
				delete bot.features[what];
				out("Flushed storage for " + what);
			} else {
				var featureList = Object.keys(bot.features);
				if(!bot.features[what]) throw Error("Doesn't exist. Existing features: " + featureList);
			}
		} catch (e) {
			out("No storage exist for: "+what+". Error message: " + e.message);
		}
	}

}