module.exports = {
	name: 'abarbanel',
	description: 'Come learn the Abarbanel with me!',
	execute(message, args, queue, serverQueue, client, animeBabesId, Discord){
		const url = ['https://youtu.be/lZtoCWMsWp0']; //youtube link to rbh speaking
		const command = 'play'; //we can't forward the command, because the original command was "abarbanel"
		if(!(message.guild.id === animeBabesId)) return message.reply('Your server cannot use this command!');
		client.commands.get('music').execute(command, message, url, queue, serverQueue, Discord); //uses the play command from music.js
		
		const embed = new Discord.MessageEmbed();
		embed.setTitle('Come child, learn the Abarbanel with me')
		embed.setDescription('https://www.sefaria.org/Abarbanel_on_Torah?lang=bi');
		embed.setFooter('RBH is your eternal creator, never forget it.');
		embed.setTimestamp();
		embed.setColor('#d92800');

		message.channel.send(embed);
	}
}