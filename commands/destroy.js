module.exports = {
	name: 'destroy',
	description: '"destroys the target"',
	execute(message, args){
		var destructions = ['I rip the face off of', 'i re-circumcise', 'I suck the tallis off of', 'I clap the cheeks of'];
		if(args[0] === '<@!234395307759108106>') return message.channel.send(`**${destructions[Math.floor(Math.random() * destructions.length)]} ${args[0]}**`);
		if(args[0] === '<@!234825957494489088>') return message.channel.send(`**${destructions[Math.floor(Math.random() * destructions.length)]} ${args[0]}**`);
		return message.reply('I will not harm a yid!');
	}
}