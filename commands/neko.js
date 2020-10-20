module.exports = {
	name: 'neko',
	description: 'Oh, look! A neko!',
	async execute(message, args){
		var nekoList = require('../otherFiles/nekoImages.json');
		message.channel.send('Meir stop being a horny muad:');
		message.channel.send(nekoList[Math.floor(Math.random() * nekoList.length)]);
	}
}