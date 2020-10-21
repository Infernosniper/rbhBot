require('dotenv').config();
const Discord = require('discord.js'); //discord.js requirement
const fs = require('fs'); //file search
const client = new Discord.Client(); //this is the bot
const prefix = 'rbh'; //prefix for search commands
const queue = new Map();

require('moment-countdown');

const animeBabesID = '323526804872757248';
const geulaID = '474336985306234890';
const gatsbyServerID = '701653446050447461';

client.commands = new Discord.Collection(); //collection of commands
const commandFiles = fs.readdirSync('./commands/').filter(file => file.endsWith('.js')); //finding the files in the commands folder

for(const file of commandFiles){ //goes through the commands folder and finds them all
	const command = require(`./commands/${file}`);
	client.commands.set(command.name, command);
}

client.once('ready', () => { //when rbh is ready, say so and set his activity
	console.log('RBH is online!')
	client.user.setActivity('rbh help');
	client.commands.get('countdown').execute(Discord, animeBabesID, geulaID, client);
});

client.on('message', async message => { //when a message is delivered, create the args and find which command is called
	if(message.content.startsWith('-') && message.guild.id === animeBabesID) return message.reply('It hurts me when you use other bots...');
	if(!message.content.toLowerCase().startsWith(prefix) || message.author.bot) return;

	const args = message.content.slice(prefix.length + 1).split(/ +/); //creates the aray for arguements
	const command = args.shift().toLowerCase(); //grabs the command for below
	const serverQueue = queue.get(message.guild.id); // creates the server queue for music

	if(message.guild.id === gatsbyServerID){
		if(!message.member.hasPermission('ADMINISTRATOR')) return message.reply('Only Admins can use me in this server for now!');
	}

	if(command === "we"){ //all the commands
		client.commands.get('we').execute(message, args, animeBabesID);
	}else if(command === 'help'){
		client.commands.get('help').execute(message, args, Discord);
	}else if(command === 'mute' || command === 'm'){
		client.commands.get('mute').execute(message, args, client);
	}else if(command === 'unmute' || command === 'u'){
		client.commands.get('unmute').execute(message, args, client);
	}else if(command === 'join'){
		client.commands.get('join').execute(message, args, serverQueue);
	}else if(command === 'abarbanel'){
		client.commands.get('abarbanel').execute(message, args, queue, serverQueue, client, animeBabesID, Discord);
	}else if(command === 'kitzur'){
		client.commands.get('kitzur').execute(message, args, animeBabesID, Discord);
	}else if(command === 'why'){
		client.commands.get('why').execute(message, args, animeBabesID, Discord);
	}else if(command === 'lock' || command === 'play' || command === 'stop' || command === 'skip' || command === 'queue' || command === 'remove' || command === 'move' || command === 'playing' || command === 'music' || command === 'restart' || command === 'pause' || command === 'resume' || command === 'unpause' || command === 'loop'){
		client.commands.get('music').execute(command, message, args, queue, serverQueue, Discord);
	}else if(command === 'when'){
		client.commands.get('when').execute(message, args, animeBabesID, Discord);
	}else if(command === 'destroy'){
		client.commands.get('destroy').execute(message, args);
	}else if(command === 'neko'){
		client.commands.get('neko').execute(message, args, Discord);
	}else if(command === 'countdown'){
		client.commands.get('countdown').execute(Discord, animeBabesID, geulaID, client, message, args);
	}
});

client.login(process.env.TOKEN); //login to actually control the bot