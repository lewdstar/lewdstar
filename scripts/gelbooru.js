// ^!cum\:?([\w,\s()-+]*)(\|([\w,\s()]*)\|?(\-?[0-9]+)?)?

var http = require('http');
var DOMParser = require('xmldom').DOMParser;

module.exports = function(input, out, extra) {

//Schbot Help
if( input.regex[0].indexOf(' help') !== -1  ) {  
	out("--Gelbooru: !cum: tags, to, search | tag, to, filter | scores over", true);
	out("      Example: !cum: vocaloid, kagamine len | 1girl, socks | 20", true);
	return;
}

//History Initiation
if ( !(extra.bot.features.gelbooruHistory instanceof Array)  ) extra.bot.features.gelbooruHistory = []; 


	var tags = ["shota"];
	var rejs = ["fem", "girl", "trap"];
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
			//organic
			if( input.regex[3].trim().split(",").indexOf("organic") !== -1 ) {
				rejs = [];
				if ( tags[0] == "inazuma eleven" ) tags.shift();
			}

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

		req.setTimeout(5598, function() {
			out("Took too long. Dismissing."); return;
		})
	}

	var getPic = function() {
		if ( offset > count  || offset > 20)  { out("No pic matches your criteria. (20 rounds of search) (Or you've viewed all imgs in this tag) "); return; }

		var response = "";
		
		var req = http.get("http://gelbooru.com/index.php?page=dapi&s=post&q=index&limit=1&pid="+Math.floor(Math.random()*count)+"&tags="+validizeTags(tags), 
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
					});
					var isViewed = ( extra.bot.features.gelbooruHistory.indexOf(post.getAttribute("file_url").substr(-10)) !== -1 );

					if( parseInt(post.getAttribute("score")) < score_thres || isReject || isViewed ) {
						if( isViewed ) console.log("Have seen this image.");
						getPic();
					} else {
						extra.bot.features.gelbooruHistory.push(post.getAttribute("file_url").substr(-10));
						out(post.getAttribute("file_url") +" <Source: "+ post.getAttribute("source")+"> "+count+" results. Viewed "+extra.bot.features.gelbooruHistory.length+" pics." );
					}

				});
		}).on('error', function(e) {
			console.log(e);
			out('You almost got your eye-candy but something happened: '+e.message);
		});

		req.setTimeout(5598, function() {
			out("Took too long for your pic. Dismissing."); return;
		})

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

