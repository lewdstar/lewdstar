//https://shotachan.net/archives/ws.php?format=json&method=pwg.categories.getImages&per_page=1&order=random
// ^!gal

var str = require('querystring');
var https = require('https');

module.exports = function(input, out) { 
	var res = "";
	var cookie = "";

	var login = function() { 
		var credentials = str.stringify({
			"username": "schbot",
			"password": "potasmic"
		});

		var post_options = {
			host : "shotachan.net",
			port : 443,
			path : "/archives/ws.php?format=json&method=pwg.session.login",
			method : "POST",
			headers : {
				"Content-Type" : "application/x-www-form-urlencoded",
				"Content-Length" : credentials.length
			}
		};

		var req = https.request(post_options, function(res) {
			cookie = res.headers['set-cookie'][1];
			res.on('data', function() { 
				getImg();
			});
		});
		req.on('error', function(e) {
			console.log(e); out("Something wrong happened. Sorry.")
		});

		req.write(credentials);
		req.end();
	}


	var getImg = function() { 
		https.get({
			host : "shotachan.net",
			path : '/archives/ws.php?format=json&method=pwg.categories.getImages&recursive=true&per_page=1&order=random',
			headers: {
				Cookie : cookie
			}
		}, function(r) {
			r.on("data", function(dat) {
				res += dat;
			});
			r.on('end', function(){ 
				var reply = JSON.parse(res);
				out(reply.result.images[0].page_url);
			});
		});
	}

	login();
	return;
}