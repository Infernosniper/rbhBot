module.exports = {
	name: 'mute',
	description: "Server mutes everyone in the voice channel you are in. You must have Administrator permissions to use this command. Also responds to \"rbh m\"",
	execute(message, args){
		if(message.member.hasPermission('ADMINISTRATOR')){//checks if the user has admin perms	
			if (message.member.voice.channel) { //checks if the user is in a voice channel
			  let channel = message.guild.channels.cache.get(message.member.voice.channel.id); //gets the id of the channel
			  for (const [memberID, member] of channel.members) { //loops through each person in the channel
			  	if(!member.roles.cache.has(member.guild.roles.cache.find(r => r.name === 'BOT').id)){
			  		member.voice.setMute(true); //if they are not a bot, mute them
			  	}	
			  }
			  message.reply('All users in the call have been muted!');
			} else {
			  message.reply('You need to join a voice channel first!');
			}
		}else{
			message.reply('You don\'t have permission to use that command!');
		}
	}
}