module.exports = {
	name: 'join',
	description: "RBH will join the voice channel you are currently in, and creepily watch you in silence.",
	execute(message, args, serverQueue){
		if(message.member.voice.channel){ //if the user is in a channel
			if(serverQueue) serverQueue.voiceChannel = message.member.voice.channel;
			message.member.voice.channel.join();
			return message.channel.send('Joined!');
		}else{
			message.reply('You must be in a voice channel to use that command!');
		}
	}
}