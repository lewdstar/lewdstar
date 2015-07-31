// ^!cum\:?([\w,\s()-+]*)(\|([\w,\s()]*)\|?(\-?[0-9]+)?)?

var http = require('http');
var DOMParser = require('xmldom').DOMParser;

module.exports = function(input, out) {

//Schbot Help
if( input.regex[0].indexOf(' help') !== -1  ) {  
	out("--Gelbooru: !cum: tags, to, search | tag, to, filter | scores over", true);
	out("      Example: !cum: vocaloid, kagamine len | 1girl, socks | 20", true);
	return;
}


	var tags = ["shota"];
	var rejs = [];
	var score_thres = 0;
	var count = 0;
	var offset =0;
	var out = out;
	
	var main = function() {
		//Fill tags
		for ( var i=0; i < input.regex[1].trim().split(',').length; i++ ) {
			tags.push( input.regex[1].trim().split(',')[i].trim() );
		}
		//Throwback
		if( tags.length < 3 && tags[1] === "" ) {
			tags.push("inazuma eleven");
		}
		//Fill rejections
		if( input.regex[3] ) {
			for ( var i=0; i < input.regex[3].trim().split(',').length; i++ ) {
				rejs.push( input.regex[3].trim().split(',')[i].trim() );
			}
		}
		//Score threshold
		score_thres = input.regex[4] || 0;
	
		console.log("Searching for: ", tags.join(", "));
		console.log("Rejecting: ", rejs.join(", "));
		console.log("Score over: ", score_thres);

		getCount(tags);
	}

	var getCount = function(tags) {
		var response = "";
		var req = http.get("http://gelbooru.com/index.php?page=dapi&s=post&q=index&limit=0&tags="+validizeTags(tags), function(res) {
			res.on('data', function(data) {
				response += data;
			});
			res.on('end', function() {
				var parser = new DOMParser();
				var doc    = parser.parseFromString(response,"application/xml");

				try {
					count = doc.getElementsByTagName("posts")[0].getAttribute("count");
				} catch(e) {
					out("Something went wrong: " + e);
					var reason = doc.getElementsByTagName("response")[0].getAttribute("reason") 
					if ( reason !== undefined ) out("Gelbooru says: "+reason);
					return;
				}

				if( count > 0 ) {
					getPic(count);
				} else {
					out("No pr0n fur ye dik!");
				}
			});
		}).on('error', function(e){
			console.log(e); 
			out('Something wrong happened: '+e.message);
		});

		req.setTimeout(3000, function() {
			out("Took too long. Dismissing.")
		})
	}

	var getPic = function() {
		if ( offset > count  || offset > 20)  { out("No pic matches your criteria. (20 rounds of search)"); return; }

		var response = "";
		
		http.get("http://gelbooru.com/index.php?page=dapi&s=post&q=index&limit=1&pid="+Math.floor(Math.random()*count)+"&tags="+validizeTags(tags), 
			function(res) {
				res.on('data', function(data) {
					response += data;
				});
				res.on('end', function() {
					var parser = new DOMParser();
					var doc    = parser.parseFromString(response,"application/xml");

						post = doc.getElementsByTagName("post")[0];

					var isReject =	rejs.some(function(rej){
						return post.getAttribute("tags").indexOf(rej) !== -1;
					})

					if( parseInt(post.getAttribute("score")) < score_thres || isReject ) {
						getPic();
					} else {
						out(post.getAttribute("file_url") +" <Source: "+ post.getAttribute("source")+"> "+count+" results." );
					}
				});
		}).on('error', function(e) {
			console.log(e);
			out('You almost got your eye-candy but something happened: '+e.message);
		});

		offset++;
		console.log("Searched ",offset,"of ",count);
	}

	main();
}


//Utils
Array.prototype.inArray = function(q) {
	return this.some(function(i) { return i === q});
}

var validizeTags = function(tags) {
	var spaced = tags.map( function(str) { return str.trim().replace(/\s/ig,'_') }).map( function(str) { return str.replace(/\+/ig,'%2b') });
	return spaced.join('+');
}

