const fs = require('fs');

module.exports = {
	name: 'circ',
	description: 'Returns the Circaversery for any member of anime babes hatorah. "rbh circ <@user>"',
	execute(message, args, Discord){
		fs.readFile('../RBHbot/otherFiles/birthdays.json', 'utf8', function readFileCallback(err, data){
			const embed = new Discord.MessageEmbed();
			embed.setColor('#d92800');
			embed.setFooter('RBH is your eternal creator, never forget it.');
			embed.setTimestamp();

			obj = JSON.parse(data);

			for(var i = 0; i < obj.length; i++){
				if(obj[i].tag === args[0]) {
					let monthCirc = obj[i].circ.substring(0,2);
					let dayCirc = obj[i].circ.substring(2,4);

					let month = obj[i].birthday.substring(0,2);
					let day = obj[i].birthday.substring(2,4);

					embed.setTitle(`${obj[i].name}'s Circaversery is ${monthCirc}/${dayCirc}`);
					embed.setDescription(`And their birthday is ${month}/${day}, if you want that for some reason...`)
					return message.channel.send(embed);
				}
			}
			return message.reply('That birthday is not in the system or that is not a valid user!');
		});
	}
}