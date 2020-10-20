module.exports = {
	name: 'unmute',
	description: "Server unmutes everyone in the call. Can only be used if you have Administrator permissions. Also responds to \"rbh u\".",
	execute(message, args, client){
		if(message.member.hasPermission('ADMINISTRATOR')){//checks if the user is an admin
			if (message.member.voice.channel) { //checks if in a channel
			  let channel = message.guild.channels.cache.get(message.member.voice.channel.id); //gets channel id
			  let botRole;
			  try{
			  	botRole = message.guild.roles.cache.find(r => r.name === 'BOT').id;
			  }catch(error){
			  	return message.channel.send('You have not given each bot the role "BOT" and therefore cannot use this command!');
			  }			    
			  for (const [memberID, member] of channel.members) { //loops through people in channel
			    if(!member.roles.cache.has(botRole)){
			    	member.voice.setMute(false); //if they aren't a bot, unmute them
			    }
			  }
			  message.react('👍');
			} else {
			  message.reply('You need to join a voice channel first!');
			}
		}else{
			message.reply('You don\'t have permission to use that command!');
		}
	}
}