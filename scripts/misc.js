// !([a-zA-Z]*)

module.exports = function(input, out) {
	var what = input.regex[1].toLowerCase();

	if (what == "source") {
		out("Source available on GitHub: " + "http://github.com/potasmic/schbot");
	}
	else if ( what == "help" ) {
		out("Available commands: cum, gal, sick, define, wiki.");
	}
}