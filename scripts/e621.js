// ^!fur\:?([\w,\s()-+]*)(\|([\w,\s()]*)\|?(\-?[0-9]+)?)?

var http = require('https');
var DOMParser = require('xmldom').DOMParser;

module.exports = function(input, out, extra) {

//Schbot Help
if( input.regex[0].indexOf(' help') !== -1  ) {  
	out("--e621: !fur tags, to, search | tag, to, filter | scores over", true);
	out("      Example: !fur vocaloid, kagamine len | 1girl, socks | 20", true);
	return;
}


//History Initiation
if ( !(extra.bot.features.furHistory instanceof Array)  ) extra.bot.features.furHistory = []; 

	var tags = [];
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
		http.get("https://e621.net/post/index.xml?tags="+validizeTags(tags), function(res) {
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
					if ( reason !== undefined ) out("e621 says: "+reason);
					return;
				}

				if( count > 0 ) {
					getPic(count);
				} else {
					out("No Yiffing!");
				}
			});
		}).on('error', function(e){
			console.log(e); 
			out('Something wrong happened: '+e.message);
		});
	}

	var getPic = function() {
		if ( offset > count  || offset > 24)  { out("I tried to look f-fur-pr0n, I failed. (25 rounds) (or you have seen all imgs w DEEZ TAGS)"); return; }

		var response = "";
		
		http.get("https://e621.net/post/index.xml?limit=1&page="+Math.floor(Math.random()*count)+"&tags="+validizeTags(tags), 
			function(res) {
				res.on('data', function(data) {
					response += data;
				});
				res.on('end', function() {
					var parser = new DOMParser();
					var doc    = parser.parseFromString(response,"application/xml");

						post = doc.getElementsByTagName("post")[0];

					if( post == undefined ) {
						out("Knot a chance! <Something went wrong and I didn't even bother fixing it correctly.>"); return;
					}

					var isReject =	rejs.some(function(rej){
						return post.getAttribute("tags").indexOf(rej) !== -1;
					});

					var isViewed = ( extra.bot.features.furHistory.indexOf(post.getAttribute("file_url").substr(-10)) !== -1 );

					if( parseInt(post.getAttribute("score")) < score_thres || isReject || isViewed) {
						getPic();
					} else {
						extra.bot.features.furHistory.push(post.getAttribute("file_url").substr(-10));
						out(post.getAttribute("file_url") +" <Source: "+ post.getAttribute("source")+"> "+count+" results. Viewed " + extra.bot.features.furHistory.length + "pics." );
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

