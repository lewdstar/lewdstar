// ^!define\s+(.*) 

var https = require('https');

module.exports = function(input, out) {
	console.log("got it")

	var get = function(term) {
		var response = "";
		https.get({
			host: "mashape-community-urban-dictionary.p.mashape.com",
			path: "/define?term="+encodeURIComponent(term),
			method: 'GET',
			headers: {
				"X-Mashape-Key" : "Zj2tZbiNANmshAv8pMXpGmeyZoTop1PfA7LjsnP0pvzGPGiq7F"
			}
		}, function(res) {
			res.on('data', function(dat) {
				response += dat;
			});

			res.on('end', function() {
				var result = JSON.parse(response);

				if( result.result_type === "no_results") {
					out("No definition found.");
				} else {
					var more = result.list[0].definition.length > 280 ? "..." : "";
					out(result.list[0].definition.substr(0,280) + more + " (" + result.list[0].permalink + ")");
				}

			});

		}).on('error', function(e) {
			out('Woops. '+e.message);
		})
	}

	get(input.regex[1]);
}