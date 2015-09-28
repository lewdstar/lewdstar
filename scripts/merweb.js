//  ^!d\s+([a-zA-Z]*)

var http = require('http');
var DOMParser = require('xmldom').DOMParser;


module.exports = function(input, out) {

	var get = function(query) {
		var res = "";

		http.get("http://www.dictionaryapi.com/api/v1/references/collegiate/xml/"+encodeURIComponent(query)+"?key=a36fcb0e-e78a-41c6-8647-ba5561b06578", function(rep) {
			rep.on("data", function(dat) {
				res += dat;
			});

			rep.on("end", function() {
				var parser = new DOMParser();
				var doc = parser.parseFromString(res, "application/xml");

				try {
					var suggestions = doc.getElementsByTagName("suggestion");
					var pr = doc.getElementsByTagName("pr");
					var wordtype = doc.getElementsByTagName("fl");
					var def = doc.getElementsByTagName("dt");
				} catch(e) {
					out('whoops ' + e);
				}
				
				if( pr[0] ) {

					var defs = "";

					forEach(def, function(de, index) { 
						if ( index > 3 ) return;
						defs += " | " + de.textContent;
					});

					out( query + " (" + wordtype[0].textContent + ") /" + pr[0].textContent + "/" + " " + defs );
					out( "More at: " + "http://www.merriam-webster.com/dictionary/"+query);

				} else if (suggestions.length > 0 ) {
					var sugs = "";
					forEach( suggestions, function(s,index) { if ( index > 4 ) return;
						sugs += s.textContent +", ";
					});

					out("Word not found. Suggestions: " + sugs + "..." );
				} else {
					out("Word not found.");
				}

			});
		})
	}

	get(input.regex[1]);

}

function forEach(array, callback) {
	for( var i=0; i < array.length; i++ ) {
		callback(array[i], i);
	}
}