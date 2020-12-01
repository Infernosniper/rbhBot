const disc = require('discord.js');
const fs = require('fs');

module.exports = {
	name: 'zoom',
	description: 'lists zoom links for teachers',
	execute(message, args){
		if(args.length === 0) return teacherList(message);
		else return grabTeacher(message, args);
	}
}

function teacherList(message){
	fs.readFile('../RBHbot/otherFiles/teachers.json', 'utf8', function readFileCallback(err, data){
		const embed = new disc.MessageEmbed();
		embed.setTitle('Teachers + Zoom Links');
		embed.setColor('#d92800');
		embed.setFooter('RBH is your eternal creator, never forget it.');
		embed.setTimestamp();

		obj = JSON.parse(data); //now it an object

		for(var i = 0; i < obj.length; i++){
			embed.addField(`${obj[i].initials.toUpperCase()} - ${obj[i].name}`, `https://zoom.us/j/${obj[i].id}`);
		}
		message.channel.send(embed);
	});
}

function grabTeacher(message, args){
	fs.readFile('../RBHbot/otherFiles/teachers.json', 'utf8', function readFileCallback(err, data){
		const embed = new disc.MessageEmbed();
		embed.setColor('#d92800');
		embed.setFooter('RBH is your eternal creator, never forget it.');
		embed.setTimestamp();

		obj = JSON.parse(data);

		for(var i = 0; i < obj.length; i++){
			if(obj[i].initials === args[0].toLowerCase()){
				embed.setTitle(`Link for ${obj[i].initials.toUpperCase()}'s (${obj[i].name}) Zoom`)
				if(args[0] === 'rbh') embed.setDescription('Be sure you are ready for your life to end before clicking this link. You\'ve been warned...');
				embed.setURL(`https://zoom.us/j/${obj[i].id}`);
				return message.channel.send(embed);
			}
		}
		return message.reply('That is not the name of a teacher on the list. Check "rbh zoom" to see a list of teachers!');		
	});
}