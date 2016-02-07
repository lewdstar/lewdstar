// ^!todo\s+([a-z]{3})\s+(.*)+(\s+(.*)?)?
var md5 = require('md5');
var http = require('http');

var exp = new RegExp("^!todo\\s+([a-z]{3})\\s*(.*)?");

module.exports = function(input, chans, bot) { 
	var raw = input[0];

	function out(t) {
		if( raw.args[0].substr(0,1) == "#" ) {
			bot.say(raw.args[0], t);
		} else {
			bot.say(raw.nick, t);
		}
	}

	
	var methods = ["add", "mod", "del", "get"];

	//Match regex?
	if( exp.test(raw.args[1]) == false  ) {
		return; 
	} else {
		var regex = exp.exec(raw.args[1]);
	}

	var username = md5( raw.user + raw.host );

	function getTodo(username) {
		var response = "";
		http.get("http://inacal.pmsinfirm.org/todo/getTodo.php?u="+username, function(res) {

			res.on('data', function(dat) { response+=dat; } );
			res.on('end', function() {
				var rep = JSON.parse(response);
				if( !rep.error ) {
					rep.data.forEach( function(tod) {
						out("<"+tod.id+"> " + tod.txt );
						return;
					})
				} else {
					out(rep.text); return;
				}
			});

		}).on('error', function(error) {
			out("Error: "+ error.message);
		});
	}

	function modTodo(username, id, txt) {
		if ( txt == undefined || txt.length < 3 ) {
			out("String is too short."); return;
		}
		
		var response = "";
		http.get("http://inacal.pmsinfirm.org/todo/updateTodo.php?u="+username+"&id="+parseInt(id)+"&txt="+encodeURIComponent(txt), function(res) {

			res.on('data', function(dat) { response+=dat; } );
			res.on('end', function() {
				var rep = JSON.parse(response);
			
					out(rep.text); return;
			
			});

		}).on('error', function(error) {
			out("Error: "+ error.message);
		});
	}

	function delTodo(username, id) {
		var response = "";
		http.get("http://inacal.pmsinfirm.org/todo/deleteTodo.php?u="+username+"&id="+parseInt(id), function(res) {

			res.on('data', function(dat) { response+=dat; } );
			res.on('end', function() {
				var rep = JSON.parse(response);

					out(rep.text); return;
			});

		}).on('error', function(error) {
			out("Error: "+ error.message);
		});
	}

	function addTodo(username, txt) {
		if ( txt == undefined || txt.length < 3 ) {
			out("String is too short."); return;
		}

		var response = "";
		http.get("http://inacal.pmsinfirm.org/todo/addTodo.php?u="+username+"&txt="+encodeURIComponent(txt), function(res) {

			res.on('data', function(dat) { response+=dat; } );
			res.on('end', function() {
				var rep = JSON.parse(response);
				if( !rep.error ) {
						out("<"+rep.id+"> " + rep.text );
						return;
				} else {
					out(rep.text);
					return;
				}
			});

		}).on('error', function(error) {
			out("Error: "+ error.message);
		});
	}

	

	switch(regex[1]) {
		case 'get':
			getTodo(username); break;
		case 'mod' :
			var third_arg = regex[2].split(" ");
			third_arg.shift();
			modTodo(username, regex[2].split(" ")[0],third_arg.join(" ")); break;
		case 'del' :
			delTodo(username, regex[2].split(" ")[0]); break;
		case 'add' :
			addTodo(username, regex[2]); break;
		default:
			out("Unrecognized Method.");
	}

}