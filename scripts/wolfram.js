// ^!\?\s+(.*)

var http = require('http');
var Parser = require('xmldom').DOMParser;

var APP_ID = "723J9K-TE84UXAVAE";
var API_ROOT = "http://api.wolframalpha.com/v2/query?input=";
var MAX_OUT = 4;

module.exports = function(input, out) {
	var query = input.regex[1];

	if( query.trim().length === 0 ) {
		out("What is the question?");
		return;
	}

	var execute = function() {
		var reply = "";

		http.get(API_ROOT + encodeURIComponent(query) + "&appid=" + APP_ID, function(res) {
			res.on('data', function(dat) {
				reply += dat;
			});

			res.on('end', function() {

				var parser = new Parser();
				var d = parser.parseFromString(reply, "application/xml");

				var didyoumeans = d.getElementsByTagName("didyoumean");
				var tips = d.getElementsByTagName("tip");
				var plaintxts = d.getElementsByTagName("plaintext");
				var assums = d.getElementsByTagName("assumption");
			
				if( didyoumeans.length !== 0 ) {
					var meanings = map( didyoumeans, function(el) {
						return el.textContent;
					});

					out("Did you mean: " + meanings.join(" or ") + "?");

				} else if( tips.length !== 0 ) {
					var tpz = map( tips, function(el) {
						return el.getAttribute("text");
					});

					out("Tips: " + tpz.join(", ") + ".");

				} else if( d.getElementsByTagName("queryresult")[0].getAttribute("success") !== "true" ) {

					out("There is no answer to your question. Maybe you should go back looking at shotas.");

				} else if ( assums.length > 0 && plaintxts.length === 0  ) {
					var word = d.getElementsByTagName("assumption")[0].getAttribute("word");
					var assumptions = map( d.getElementsByTagName("value"), function(el) {
						return el.getAttribute("desc");
					});

					out("Can you just be more specific? Is " + word + " " + assumptions.join("or") + "?" );
				} else {

					var count = 0;

					forEach(plaintxts, function(el) {
						if ( count > MAX_OUT ) return;
						if( el.parentNode.parentNode.getAttribute("primary") == "true" ) {
							out(el.textContent.replace(/\n/ig," "));
							count++;
						}
					});
				}

			});

		}).on('error', function(e) {
			out('Something went wrong: ' + e.message );
		})

	}

	execute();
}

function map(array, callback) {
	var ret = [];
	var len = array.length;

	for( var i=0; i < len; i++ ) {
		ret.push(callback(array[i]));
	}
	return ret;
}

function forEach(array, callback) {
	var len = array.length;
	for( var i=0; i < len; i++ ) {
		callback(array[i]);
	}
}