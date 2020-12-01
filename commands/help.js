module.exports = {
	name: 'help',
	description: "Lists all commands and their descriptions.",
	execute(message, args, Discord){
		const fs = require('fs');
		fs.readdir("./commands/", (err, files) => {
		    let jsfiles = files.filter(f => f.split(".").pop() === "js");

		    var nameList = '';
		    var descList = '';

		    const embed = new Discord.MessageEmbed();
		    embed.setTitle('Help With Commands');
		    embed.setColor('#d92800');
		    embed.setFooter('RBH is your eternal creator, never forget it.');
		    embed.setTimestamp();

			let result = jsfiles.forEach((f, i) => {
		    	let props = require(`./${f}`);
		    	embed.addField(`${props.name.charAt(0).toUpperCase()}${props.name.substring(1)}`, props.description);
		    });		

			message.react('👍');
		    return message.author.send(embed);		     
		});
	}
}