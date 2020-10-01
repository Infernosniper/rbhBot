module.exports = {
	name: 'kitzur',
	description: "Creates a link to Kitzur Shulchan Aruch from Sefaria. Alternatively, \"rbh kitzur <chapter_number>\" will create a link to that specific chapter.",
	execute(message, args, animeBabesId){
		if(!(message.guild.id === animeBabesId)) return message.reply('Your server cannot use this command!');
		message.channel.send('Wow, eitan wants to learn kitzur? I\'m shocked.');
		if(args.length === 0){ //if it doesn't have an arg for a chapter
			message.channel.send('https://www.sefaria.org/Kitzur_Shulchan_Arukh?lang=bi');
		}else{
			message.channel.send('https://www.sefaria.org/Kitzur_Shulchan_Arukh.' + args + '?lang=bi');			
		}
	}
}