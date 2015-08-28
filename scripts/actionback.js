// action

module.exports = function(input, channels, bot) {
	//              1    2   3   4
	//input --> { from, to, text, raw }
	console.log(input);
	var recog = /([a-zA-Z0-9\s]+)\s((f|F)uccboi)([\'a-zA-Z0-9\s]*)/; 

	if( recog.test(input[2]) && channels.indexOf(input[1]) !== -1  ) {
		var parts = recog.exec(input[2]);
		setTimeout( function() {
			bot.action(input[1], parts[1] + " " + input[0]  + parts[4]);
		},1500);
	}
}