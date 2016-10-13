// ^!s\:?([\w,.:\s()-+]*)(\|([\w,\s()]*)\|?(\-?[0-9]+)?)?

var http = require('http');
var DOMParser = require('xmldom').DOMParser;

module.exports = function(input, out, extra) {

//Schbot Help
if( input.regex[0].indexOf(' help') !== -1  ) {  
	out("--shota: !shota tags, to, search | tag, to, filter | scores over", true);
	out("      Example: !shota vocaloid, kagamine len | 1girl, socks | 20", true);
	return;
}


//History Initiation
if ( !(extra.bot.features.stcHistory instanceof Array)  ) extra.bot.features.stcHistory = []; 

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
		http.get("http://booru.shotachan.net/post/index.xml?tags="+validizeTags(tags), function(res) {
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
					return;
				} 

				if( count > 0 ) {
					getPic(count);
				} else {
					out("Can't find any shota.");
				}
			});
		}).on('error', function(e){
			console.log(e); 
			out('Something wrong happened: '+e.message);
		});
	}

	var getPic = function() {
		if ( offset > count  || offset > 24)  { out("`No images found or all have been seen.`"); return; }

		var response = "";
		
		http.get("http://booru.shotachan.net/post/index.xml?limit=1&page="+Math.floor(Math.random()*count)+"&tags="+validizeTags(tags), 
			function(res) {
				res.on('data', function(data) {
					response += data;
				});
				res.on('end', function() {
					var parser = new DOMParser();
					var doc    = parser.parseFromString(response,"application/xml");

						post = doc.getElementsByTagName("post")[0];

					if( post == undefined ) {
						out("`Something went wrong and I didn't even bother fixing it correctly.`"); return;
					}

					var isReject =	rejs.some(function(rej){
						return post.getAttribute("tags").indexOf(rej) !== -1;
					});

					var isViewed = ( extra.bot.features.stcHistory.indexOf(post.getAttribute("file_url").substr(-10)) !== -1 );

					if( parseInt(post.getAttribute("score")) < score_thres || isReject || isViewed) {
						getPic();
					} else {
						extra.bot.features.stcHistory.push(post.getAttribute("file_url").substr(-10));
						out(post.getAttribute("file_url")+" // Viewed "+extra.bot.features.stcHistory.length+" // "+count+" results // Source: <"+ post.getAttribute("source")+">");
					}

				});
		}).on('error', function(e) {
			console.log(e);
			out('You almost got your eye-candy but something happened: `'+e.message+'`');
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

