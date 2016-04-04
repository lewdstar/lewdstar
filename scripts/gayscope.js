// ^!horo\s+([a-zA-Z]*)

var http = require('http');
var DOMParser = require('xmldom').DOMParser;

module.exports = function(input, out, extra) {
	var response = "";

	var fetch = function() {
		http.get("http://www.astrology.com/us/offsite/rss/daily-gay.aspx", function(res) {
			res.on("data", function(dat) {
				response+=dat;
			});
			res.on("end", function() {
				var parser = new DOMParser();
				var d = parser.parseFromString(response, "text/xml");

				var f = 0;
				var index = 0;
				var titles = d.getElementsByTagName("title");
				var descr = d.getElementsByTagName("description");
				for (var i = 0; i < titles.length ; i++) {
					index = i;
					
					if( titles.item(i).textContent.split(" ")[0].toLowerCase() == input.regex[1].trim().toLowerCase() ) { f = 1; break; }
				}

				if (f == 1) {
					out( descr.item(index-1).textContent.split("</p>")[0].substring(3) );
				} else {
					out( "What's your sign? ");
				}
			})
		}).on("error", function(e) {
			out("Error: "+e.message);
		});
	}	

	fetch();
}


