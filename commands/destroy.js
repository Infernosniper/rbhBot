module.exports = {
	name: 'destroy',
	description: '"destroys the target"',
	execute(message, args){
		if(args[0] != '<@!234395307759108106>') return message.reply('I will not harm a yid');
		return message.channel.send(`**I rip the face off of ${args[0]}**`);
	}
}