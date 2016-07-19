// !shiba\s*

/**
	@author potasmic
	@via reid.li
	@description Getting random Shiba pic from @shibesbot on Twitter.
**/

var http = require('https');

module.exports = function( inp, out, extra) {
	

	var main  = function() {
		var data = "";
		var links = [];
		http.get('https://mobile.twitter.com/shibbnbot?p=s', function(res) {

			res.on('data', function(dat) {
				data += dat;
			});

			res.on('end', function() {

				data = data.split('\n');
				data.forEach( function(item, index) {
					if( item.trim().substr(0,17) == "href=\"/shibesbot/" ) {
						var result = /href=\"(.*)\"/.exec(item.trim());
						links.push("https://mobile.twitter.com"+result[1]);
					}
				});
				//console.log( links[ Math.round( Math.random() * links.length) ] );
				console.log(Math.round( Math.random() * links.length));
				getPicFromTweet( links[ Math.round( Math.random() * links.length) ] );

			});

		})
		.on('error', function(e) {
			out('Error: ' + e.message);
		});
	}

	var getPicFromTweet = function(url) {
		var data = "";
		var links = [];
		http.get(url, function(res) {
			
			res.on('data', function(dat) {
				data += dat;
			});

			res.on('end', function() {
				data = data.split('\n');
				data.forEach( function(item, index) {
					if( item.trim().substr(0,22) == "<img src=\"https://pbs." ) {
						var result = /src=\"(.*)\"/.exec(item.trim());
						links.push(result[1]);
					}
				});

				try {
					out(links[0].replace(/\:small/ig,':large'));
				} catch(e) {
					out('Error:' + e.message);
				}
			});

		})
		.on('error', function(e) {
			out('Error:' + e.message);
		});
	}
	main();
}