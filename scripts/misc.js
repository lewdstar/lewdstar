// !([a-zA-Z]*)\s?(.*)?

module.exports = function(input, out, extra) {
	var what = input.regex[1].toLowerCase();
	var spec = input.regex[2]? input.regex[2] : "";

	if (what == "source") {
		out("Git Clone this Repo: " + " https://bitbucket.org/contxtl/schbot/");
	}
	else if ( what == "help" ) {
		out("Available commands: $, ?, shota, fur, define, ud, wiki, source, help, cum, omdb, roll, choose, shiba, genkey, imdb. PM !help for more.");
		if ( extra.from.substr(0,1) != "#" ) {
			out("? [query]: Queries to Wolfram|Alpha. ", true)
			out("cum [keywords] [, keyword2] | [filter] [, filter 2] | [rating above]: Returns a random image from Gelbooru.", true);
			out("fur : same syntax as above for e621", true);
			out("ud [text] : Fetch definition of a word from UrbanDictionary. ", true);
			out("define [text] : Fetch definition of a word from Merriam-Webster Dictionary. ", true);
			out("wiki [text] : Fetch summary of Wikipedia article if found. " , true);
			out("source: Returns link to Repository of this bot.", true);
			out("help: Shows this help message.", true);
			out("roll [max]: Roll a random number from 1 to [max]", true);
			out("choose [item1, item2, item3]: choose a random item.", true);
			out("$ [cmd]: admin commands", true);
		}
	}
	else if ( what == "roll" ) {
		spec = (spec == "")? 100 : spec;
		out( Math.floor( 1 + (Math.random() * parseInt(spec))));
	}
	else if ( what == "genkey") {
		var params = spec.split(" ");
		var chars = (params.indexOf("-t") !== -1)? params[params.indexOf("-t")+1] : "abcdefghijklmnopqrstuvwyxzABCDEFGHIJKLMNOPQRSTUVWYXZ0123456789!#$%&_-+`~";
		var len = (params.indexOf("-l") !== -1)? params[params.indexOf("-l")+1] : 32;
		var key = "";
		for ( var i = 0; i < len; i ++) {
			key += chars.substr(Math.floor(Math.random()*chars.length),1);
		}
		out(key);

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
	else if( what =="hansen" ) {
		out("http://ih0.redbubble.net/image.74198864.0413/flat,1000x1000,075,f.jpg");
	}
}