module.exports = {
	name: 'abarbanel',
	description: 'Come learn the Abarbanel with me!',
	execute(message, args, ytdl, yts, queue, serverQueue, client, animeBabesId){
		const url = ['https://youtu.be/lZtoCWMsWp0']; //youtube link to rbh speaking
		const command = 'play'; //we can't forward the command, because the original command was "abarbanel"
		if(!(message.guild.id === animeBabesId)) return message.reply('Your server cannot use this command!');
		client.commands.get('music').execute(command, message, url, ytdl, yts, queue, serverQueue); //uses the play command from music.js
		
		message.reply('Come child, learn the abarbanel with me.');
		message.channel.send('https://www.sefaria.org/Abarbanel_on_Torah?lang=bi');
	}
}