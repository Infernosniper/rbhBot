const cron = require('cron');
const moment = require('moment');
const countDown = require('countdown');
const UTC = 4;
module.exports = {
	name: 'countdown',
	description: 'The current countdown timers that I am running.',
	execute(Discord, animeBabesID, geulaID, client, message, args){
		let channel = client.guilds.cache.get(animeBabesID).channels.cache.get(geulaID);

		if(!message){
			let scheduledMessage = new cron.CronJob('20 8 * * *', () => {
				channel.send(`@everyone Countdown until you are all out of my life forever: ${countDown(new Date(2021,6,2,8 + UTC,20)).toString()}`);
			})

			let gameDay = new cron.CronJob('0 * * * *', () => {
				channel.send(`**Game Day Countdown**: ${countDown(new Date(2020,9,21,14 + UTC,55)).toString()}❗❗❗❗❗`);
			})

			scheduledMessage.start();
			gameDay.start();
			return console.log('CronJobs started!');

		}else{
			const embed = new Discord.MessageEmbed();
			embed.setTitle('Countdowns Active');
			embed.setColor('#d92800');
			embed.setFooter('RBH is your eternal creator, never forget it.');
			embed.setTimestamp();
			embed.addFields(
				{name: 'Until you are all out of my life forever', value: countDown(new Date(2021,6,2,8 + UTC,20)).toString()},
				{name: 'Until Game Day', value: countDown(new Date(2020,9,21,14 + UTC,55)).toString()},
			);

			return channel.send(embed);
		}
	}
}