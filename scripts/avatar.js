
module.exports = function(inp, out, extra) {
	if(inp.regex[1] == undefined) {
		out( inp.msg.author.avatarURL );
		return;
	} else {
		var mem = inp.guild.members.find('nickname', inp.regex[1]);
		if(mem) {
			out(mem.user.avatarURL);
			return;
		}
		var mem2 = inp.guild.members.find(mem => mem.user.username == inp.regex[1]);
		if(mem2) {
			out(mem2.user.avatarURL);
		} else {
			out("Can't find any user with that username or nickname");
		}
	}
}