// ^!sick

var http = require('http');
var DOMParser = require('xmldom').DOMParser;

module.exports = function(input, out) {
	var rep = "";

	http.get('http://www.sickipedia.org/feeds/?1262780436.xml', function(res) {
		res.on('data', function(dat) {
			rep += dat;
		});
		res.on('end', function() {
			var parser = new DOMParser();
			var doc = parser.parseFromString(rep, "application/xml");

			var count = doc.getElementsByTagName("item").length;
			var choose = 1 + Math.floor(Math.random()*count);

			var joke = doc.getElementsByTagName("description")[ choose ].firstChild.data.split("<br/>").join('\n');

			out(joke);
			out("(" + doc.getElementsByTagName("link")[ choose ].firstChild.nodeValue + ")");

		});
	});

}