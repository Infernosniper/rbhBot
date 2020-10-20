module.exports = {
	name: 'kitzur',
	description: "Creates a link to Kitzur Shulchan Aruch from Sefaria. Alternatively, \"rbh kitzur <chapter_number>\" will create a link to that specific chapter.",
	execute(message, args, animeBabesId, Discord){
		if(!(message.guild.id === animeBabesId)) return message.reply('Your server cannot use this command!');

		const embed = new Discord.MessageEmbed()
		embed.setTitle(`Kitzur Shulchan Aruch${args.length === 0 ? `` : `: Chapter ${args[0]}`}`);
		embed.setURL(`https://www.sefaria.org/Kitzur_Shulchan_Arukh${args.length === 0 ? `` : `.${args[0]}`}?lang=bi`);
		embed.setDescription('WOW, Eitan and Dave want to learn kitzur? That\'s a miracle beyond even my power.');
		embed.setColor('#d92800');
		embed.setFooter('RBH is your eternal creator, never forget it');
		embed.setTimestamp();
		
		message.channel.send(embed);
	}
}