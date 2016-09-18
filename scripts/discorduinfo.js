
module.exports = function(inp, out, ext) {
	if(inp.msg.channel.type !== "text") {
		out("You're in a DM.");
		return;
	}

	if(inp.regex[1] == undefined) {
		var user = inp.msg.channel.members.find('id', inp.msg.author.id);
		spill(user,out);
		return;
	} else {
		var mem2 = inp.msg.channel.members.find(mem => mem.user.username == inp.regex[1]);
		if(!mem2) { out("can't find em"); return;}
		spill(mem2,out);
	}
}

function spill(user,out) {
	var u = user.user;
		var perms = permission(user.permissions.raw);
		out(`**Things can do:** ${perms[0].join(", ")}\n\n**Things can't do:** ${perms[1].join(", ")}`);
		//Creation
		out(`**Roles:** ${user.roles.array().slice(1).map(x => "["+x.name+"]").join(" ")}`);
		out(`Joined Shotachan Discord on: \`${user.joinDate}\``);
		out(`Created account on: \`${u.creationDate}\``)
		out(`Is ${u.status}. Is ${ (u.bot)? "a": "not a" } bot.`);
		if (u.game == null) {
			out(`Is not playing anything.`);
		} else {
			out(`Is playing ${u.game.name}. ${(u.game.type == 1)? "Streaming at: " +u.game.url : ""}`)
		}
}

function permission(raw) {
	var perms = [
		["Invite", "Kick", "Ban", "Admin"],
		["Manage Chans", "Manage Guilds","",""],
		["","","Read Msgs","Send Msgs"],
		["TTS", "Del. Msgs", "Links", "Files"],
		["Read History","@-everyone", "External Emojis",""],
		["Connect","Speak", "Mute","Deafen"],
		["Move Members","VAD","Self /nick","Change others' nicks"],
		["Manage Roles","","",""]
	];
	var clean = [];
	var nope = [];
	for(var i = 0; i < 32; ++i) {
		if(perms[Math.floor(i/4)][i%4] == "") continue;
		if(raw >> i & 0x1 == 1) { clean.push(perms[Math.floor(i/4)][i%4]); }
		else { nope.push( perms[Math.floor(i/4)][i%4] ) }
	}
	return [clean, nope];
}