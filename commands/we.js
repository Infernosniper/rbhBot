module.exports = {
	name: 'we',
	description: "We want Moshiach now!",
	execute(message, args, animeBabesId){
		if(!(message.guild.id === animeBabesId)) return message.reply('Your server cannot use this command!');
		message.channel.send('want Moshiach now!');

	}
}