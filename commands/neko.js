module.exports = {
	name: 'neko',
	description: 'Oh, look! A neko!',
	async execute(message, args, Discord){
		var nekoList = require('../otherFiles/nekoImages.json');

		const embed = new Discord.MessageEmbed();
		embed.setTitle('Meir Stop Being a Horny Teen');
		embed.setFooter('RBH is your eternal creator, never forget it.');
		embed.setTimestamp();
		embed.setImage(nekoList[Math.floor(Math.random() * nekoList.length)]);
		embed.setColor('#d92800');

		message.channel.send(embed);
	}
}