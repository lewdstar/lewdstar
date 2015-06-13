// ^!wiki\s+(.*)
var http = require('https');

module.exports = function( input, out ) {

	var disamb = [];

	var validize = function(text) {
		return encodeURIComponent(text);
	}

	var opensearch = function( query ) {
		var rep = ""; 
		http.get("https://en.wikipedia.org/w/api.php?action=opensearch&search="+validize(query), function(res) {
			res.on('data', function(dat) {
				rep += dat; console.log("Chunk: "+dat);
			});
			res.on('end', function() {
				try {
					var obj = JSON.parse(rep);
				} catch(e) {
					out("Failed: " + e); return;
				}

				if ( obj[1].length > 0 ) {
					if ( /refers? to:\s*$/ig.test(obj[2][0]) ) {
						//Getting possible matches
						var reg = new RegExp( query+ "\\s?\\(.*\\)","ig");

						obj[1].forEach( function(item) {
							if ( reg.test(item) ) disamb.push(item);
						});

						if (disamb.length < 3) disamb.push(obj[1][1], obj[1][2]);

						out("Inquires more specifically, please. Perhaps you want: " + disamb.join(" or ") + "?");

					} else if (obj[2][0] !== "" && !(/^This.{0,10}a redirect/ig.test(obj[2][0])) ) {
						out(obj[2][0] + " <" + obj[3][0] +">");
					} else {
						deepsearch(obj[3][0]);
					}
				} else {
					out("No one knows about "+query+", apparently.");
				}
			})
		}).on('error', function(e) {
			out("HTTP Error: "+e);
		});
	}

	var deepsearch = function(url) {
		var response = "";
		http.get(url+"?action=raw", function(res) {
			res.on('data', function(dat) {
				response += dat;
			});
			res.on('end', function() {
				var link = /\#redirect\s*\[\[(.*)\]\]/ig.exec(response);
				opensearch(link[1]);
			})
		}).on('error', function(e) {
			out("HTTP Error: "+e);
		});
	}

	opensearch(input.regex[1]);
}