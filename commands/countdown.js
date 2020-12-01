const cron = require('cron');
const countDown = require('countdown');
const fs = require('fs');

const disc = require('discord.js');


module.exports = {
	name: 'countdown',
	description: 'See and create countdown timers. "rbh countdown" will display a list of the current active countdowns. "rbh countdown create YYYY MM DD HH MM <title>" will create a new countdown. Please be sure to follow the specific format and spacing or the countdown will not be created. "rbh countdown delete <countdown_title>" will delete the countdown with the entered title. Countdowns can only be deleted by admins.',
	execute(client, animeBabesID, geulaID, command, message, args){
		let channel = client.guilds.cache.get(animeBabesID).channels.cache.get(geulaID);

		if(args && args[0] === 'create'){
			args.splice(0,1);
			if(args.length <= 4) return message.channel.send('There are not enough arguements to create a countdown! Needs "YYYY MM DD HH MM <Title>".');
			if(isNaN(args[0]) || isNaN(args[1]) || isNaN(args[2]) || isNaN(args[3]) || isNaN(args[4])) return message.channel.send('One of your date arguements is not a number!');

			fs.readFile('../RBHbot/otherFiles/countdownList.json', 'utf8', function readFileCallback(err, data){
				obj = JSON.parse(data); //now it an object
				obj.push(args);
				json = JSON.stringify(obj); //convert it back to json
				fs.writeFile('../RBHbot/otherFiles/countdownList.json', json, 'utf8', () => removeOldCountdowns(message)); // write it back 
			});			
		}else if(args && args[0] === 'delete'){
			if(!message.member.hasPermission('ADMINISTRATOR')) return message.reply('Only admins can delete countdowns!');
			args.splice(0,1);
			fs.readFile('../RBHbot/otherFiles/countdownList.json', 'utf8', function readFileCallback(err, data){
				obj = JSON.parse(data);
				for(var i = 0; i < obj.length; i++){
					if(obj[i].slice(5, obj[i].length).join(' ') === args.join(' ')) {
						obj.splice(i,1);
						json = JSON.stringify(obj);
						return fs.writeFile('../RBHbot/otherFiles/countdownList.json', json, 'utf8', () => createEmbed(message, obj));
					}
				}
				return message.reply('That is not a name of an active countdown!');
			});
		}else{
			return removeOldCountdowns(message);
		}
	}
}

async function createEmbed(message, obj){
	const embed = new disc.MessageEmbed();
	embed.setTitle('Countdowns Active');
	embed.setColor('#d92800');
	embed.setFooter('RBH is your eternal creator, never forget it.');
	embed.setTimestamp();
	for(var i = 0; i < obj.length; i++){
		embed.addField(obj[i].slice(5, obj[i].length).join(' '), countDown(new Date(obj[i][0],obj[i][1] - 1,obj[i][2],obj[i][3],obj[i][4])).toString());
	}
	message.channel.send(embed);
}


function removeOldCountdowns(message){
	fs.readFile('../RBHbot/otherFiles/countdownList.json', 'utf8', function readFileCallback(err, data){
		obj = JSON.parse(data); //now it an object
		for(var i = 0; i < obj.length; i++){
			if(new Date(obj[i][0],obj[i][1] - 1,obj[i][2],obj[i][3],obj[i][4]) < Date.now())	obj.splice(i,1); 
		}
		json = JSON.stringify(obj); //convert it back to json
		fs.writeFile('../RBHbot/otherFiles/countdownList.json', json, 'utf8', () => createEmbed(message, obj)); // write it back
	});		
}