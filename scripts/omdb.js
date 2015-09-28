// ^!imdb\s+([a-zA-Z0-9\s]*)

var http = require('http');

module.exports = function( input, out) {
	var season = "", episode = "";

	if ( /season\s[0-9]+/i.test(input.regex[0]) == true ) {
		season = "&Season=" + encodeURIComponent((/season\s([0-9]+)/i).exec(input.regex[0])[1]);
	}
	if ( season && /episode\s[0-9]+/i.test(input.regex[0]) == true ) {
		episode = "&Episode=" + encodeURIComponent((/episode\s([0-9]+)/i).exec(input.regex[0])[1]);
	}

	var title = input.regex[1].replace(/season\s[0-9]+/i,"").replace(/episode\s[0-9]+/i,"").trim();

	var res = "";

	http.get("http://www.omdbapi.com/?t=" + encodeURIComponent(title)+ season + episode, function(rep) {

		rep.on("data", function(dat) {
			res += dat;
		});

		rep.on("end", function() {
			var info = JSON.parse(res);
			console.log(title, season, episode);
			if( info.Response !== "False" ) {
				var msg = "";
				msg += info.Title;
				msg += " (" + info.Year + ")";
				msg += " [Rated " + info.Rated + "]";
				msg += " [IMDb Rating: " + info.imdbRating + "]";
				msg += " (" + info.Runtime + ")";
				msg += " " + info.Plot;
				msg += "\n http://imdb.com/title/"+ info.imdbID;
				out(msg);
			} else {
				out( info.Error );
			}
		})

	} ).on('error', function(e) {
		out('error: ' + e);
	})

}