var https = require('https');

module.exports = function(input, out, extra) {

	process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'; 

	var nodes = ["shotachan.net", "booru.shotachan.net", "http://booru.shotachan.net/post/index.xml" ,"shotachan.net/forums/forum.php","shotachan.net/gallery/", "shotachan.net/translations/"];
	var names = ["Main Site", "Booru", "Booru API" , "Forum" , "Gallery", "Translations"];

	function check(url, name) { 
		var start = Date.now();
		https.get('https://'+url, function(res) { 
			out(name+": " + res.statusCode + " " + res.statusMessage + " [" + (Date.now()-start) + "ms] ");
		}).on('error', function(e) {
			out(name+": Error: " +e.code+ " [" + (Date.now()-start) + "ms] ");
		});
	}

	nodes.forEach( function(item, i){
		check(item, names[i]);
	});

	process.env.NODE_TLS_REJECT_UNAUTHORIZED = '1'; 
}