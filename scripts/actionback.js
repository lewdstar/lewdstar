// action

module.exports = function(input, out, extra) {
	//input --> { from, to, text, raw }
	var recog = /([a-zA-Z0-9\s]+)\s((k|K)ariya|(p|P)oti(skh)?)([\'a-zA-Z0-9\s]*)/; 

	if( recog.test(input[2]) && input[1] == extra.channel ) {
		var parts = recog.exec(input[2]);
		setTimeout( function() {
			extra.client.action(input[1], parts[1] + " " + input[0]  + parts[6]);
		},1500);
	}
}