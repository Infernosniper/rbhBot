const Util = require('discord.js'); //used only for an escape markdown util
const ytdl = require('ytdl-core'); //primary music pulling
const ytpl = require('ytpl');
const previousSongs = require('../otherFiles/previousSongs.js'); //a js file with an array of previous songs in it
const SYA = require('simple-youtube-api'); //to setup the youtube api
const youtube = new SYA('AIzaSyB8EuU8tU7QKTyB93X0leDDA-JNobN7Gh4'); //create our instance of the youtube api
const arrayMove = require('array-move'); //for moving the order of arrays easily

const embedColor = '#d92800';

module.exports = {
	name: 'music',
	description: 'The official RBH music system! If you would like to see the list of commands, type "rbh music"!',
	async execute(command, message, args, queue, serverQueue, Discord){
		//check if queue is locked, but still alows people to view np and queue
		if(serverQueue && serverQueue.locked && !(command === 'queue' || command === 'playing') && !message.member.hasPermission('ADMINISTRATOR')) return message.reply('The queue has been locked by an admin!');
		//checks if queue is paused, but still alows certain commands to be used
		if(serverQueue && !serverQueue.playing && !(command === 'queue' || command === 'playing' || command === 'play' || command === 'resume' || command === 'unpause' || command === 'pause')) return message.reply('The queue, is paused, it cannot be modified!');
		
		//command handler
		if(command === 'play') return playCommand(message, serverQueue, args, queue, Discord);
		else if(command === 'stop') return stopCommand(message, serverQueue, queue);
		else if(command === 'queue') return queueCommand(message, serverQueue, Discord);
		else if(command === 'playing') return playingCommand(message, serverQueue, Discord);
		else if(command === 'skip') return skipCommand(message, serverQueue);
		else if(command === 'pause') return pauseCommand(message, serverQueue);
		else if(command === 'resume' || command === 'unpause') return resumeCommand(message, serverQueue);
		else if(command === 'loop') return loopCommand(message, serverQueue);
		else if(command === 'restart') return restartCommand(message, serverQueue, queue, Discord);
		else if(command === 'lock') return lockCommand(message, serverQueue);
		else if(command === 'remove') return removeCommand(message, serverQueue, args, queue, Discord);
		else if(command === 'move') return moveCommand(message, serverQueue, args, queue, Discord);
		else if(command === 'back') return backCommand(message, serverQueue, queu, Discord);
		return commandsList(message, Discord);
	}
}

async function playCommand(message, serverQueue, args, queue, Discord){
	const voiceChannel = message.member.voice.channel;
	let searchString;

	if(args.length === 0) return resumeCommand(message, serverQueue); // if someone wants to use the word play as in resume
 
	if(!voiceChannel) return message.reply('You are not in a voice channel!');

	if(ytpl.validateID(args[0])){
		var numToAdd = 5;
		if(args.length === 2) numToAdd = args.pop();

		searchString = args[0]
		let videos;

		try{
			const playlist = await youtube.getPlaylist(searchString);
			videos = await playlist.getVideos()
		}catch (error){
			console.log(`Error grabbing from youtube: ${error}`);
			message.channel.send('There was an error grabbing the youtube results, try again.');
		}
		
		if(numToAdd > videos.length) numToAdd = videos.length;

		for(var i = 0; i < numToAdd; i++){
			try{	
				var curVid = await youtube.getVideoByID(videos[i].id);
				await handleVideo(curVid, message, voiceChannel, queue, Discord, true);
			}catch{
			}
		}
		return message.react('👍');
	} else{
		searchString = args.join(' ');
		try{
			var video = await youtube.getVideoByID(searchString);
		}catch{
			try{
				var videos = await youtube.searchVideos(searchString, 1);
				var video = await youtube.getVideoByID(videos[0].id)
			} catch(error){
				console.log(error);
				return message.channel.send('No results found!');
			}
		}
		try{
			return handleVideo(video, message, voiceChannel, queue, Discord);
		}catch(error){
			console.log(error);
			message.channel.send('Error playing song. Please try again!');
			return queue.delete(message.guild.id);
		}
	}
}

function stopCommand(message, serverQueue, queue){
	if(!message.member.voice.channel) return message.reply('You are not in a voice channel!');
	if(!serverQueue) return message.reply('There are no songs in the queue!');
	if(message.member.voice.channel != serverQueue.voiceChannel) return message.reply('You are not in my voice channel!');

	for(var i = 0; i < serverQueue.songs.length; i++) previousSongs.push(serverQueue.songs[i]); //pushes every song in the queue to the previous songs array
	serverQueue.songs = [];
	serverQueue.connection.dispatcher.end();
	return message.react('⏹️');
}

function queueCommand(message, serverQueue, Discord){
	if(!serverQueue) return message.reply('There are no songs in the queue!');
	var elapsedTime = Math.trunc(serverQueue.connection.dispatcher.streamTime / 1000);
	var elapsedMinutes = Math.trunc(elapsedTime / 60);
	var elapsedSeconds = elapsedTime % 60;
	var timeToPlayMinutes = serverQueue.songs[0].duration.minutes - elapsedMinutes;
	var TimeToPlaySeconds = serverQueue.songs[0].duration.seconds - elapsedSeconds;

	const queueTitle = `Songs in queue (loop **${serverQueue.looping ? 'enabled' : 'disabled'}** - lock **${serverQueue.locked ? 'enabled' : 'disabled'}**) ${!serverQueue.playing  ? `**PAUSED**` : ``}:`;

	const embed = new Discord.MessageEmbed();
	embed.setTitle(queueTitle);
	embed.setColor(embedColor);
	embed.setFooter('RBH is your eternal creator, never forget it');
	embed.setTimestamp();

	for(var i = 0; i < serverQueue.songs.length; i++){ //pushes the title of each song onto a new line of queuelist
		if(i != 0 && i % 18 === 0){
			message.channel.send(embed);
			embed.fields = [];
			embed.setTitle(`Songs in queue cont. :`);
		}
		//adds the title, durations, and time to play to the queueList string
		var nextEntry = `**${serverQueue.songs[i].title}** - ${serverQueue.songs[i].duration.hours > 0 ? `${serverQueue.songs[i].duration.hours}:` : ``}${serverQueue.songs[i].duration.minutes}:${String(serverQueue.songs[i].duration.seconds).length === 1 ? `0` : ``}${serverQueue.songs[i].duration.seconds} - ${i == 0 ? 'Now playing' : `Time to play: ${timeToPlayMinutes}:${String(TimeToPlaySeconds).length === 1 ? `0` : ``}${TimeToPlaySeconds}`}\n`
		embed.addField(`Song ${i + 1}`, nextEntry);

		if(i != 0){
			timeToPlayMinutes += serverQueue.songs[i].duration.minutes;
			TimeToPlaySeconds += serverQueue.songs[i].duration.seconds;

			if(TimeToPlaySeconds >= 60){//when the seconds counter reaches 60, bump up the minutes counter and remove 60 from seconds
				timeToPlayMinutes ++;
				TimeToPlaySeconds -= 60;
			}
		}
	}
	return message.channel.send(embed);
}

function playingCommand(message, serverQueue, Discord){
	if(!serverQueue) return message.reply('There is no song playing!');

	var elapsedTime = Math.trunc(serverQueue.connection.dispatcher.streamTime / 1000);
	var elapsedMinutes = Math.trunc(elapsedTime / 60);
	var elapsedSeconds = elapsedTime % 60;

	var nowPlayingText = `**${serverQueue.songs[0].title}** - ${elapsedMinutes}:${elapsedSeconds}/${serverQueue.songs[0].duration.minutes}:${serverQueue.songs[0].duration.seconds}`;
	
	const embed = new Discord.MessageEmbed();
	embed.setTitle(`Now Playing${!serverQueue.playing ? ` **PAUSED**` : ``}`);
	embed.setColor(embedColor);
	embed.setFooter('RBH is your eternal creator, never forget it');
	embed.setTimestamp();
	embed.setDescription(nowPlayingText);

	message.channel.send(embed);
}

function skipCommand(message, serverQueue){
	if(!message.member.voice.channel) return message.reply('You are not in a voice channel!');
	if(!serverQueue) return message.replu('There are no songs in the queue!');
	if(message.member.voice.channel != serverQueue.voiceChannel) return message.reply('You are not in my voice channel!');

	previousSongs.push(serverQueue.songs[0]);
	serverQueue.connection.dispatcher.end();
	return message.react('⏭️');
}

function pauseCommand(message, serverQueue){
	if(!message.member.voice.channel) return message.reply('You are not in a voice channel!');
	if(!serverQueue) return message.reply('There are no songs in the queue!');
	if(message.member.voice.channel != serverQueue.voiceChannel) return message.reply('You are not in my voice channel!');
	if(!serverQueue.playing) return message.reply('The queue is already paused!');

	serverQueue.playing = false;
	serverQueue.connection.dispatcher.pause();
	message.react('⏸');
	return undefined;
}

function resumeCommand(message, serverQueue){
	if(!message.member.voice.channel) return message.reply('You are not in a voice channel!');
	if(!serverQueue) return message.reply('There are no songs in the queue!');
	if(message.member.voice.channel != serverQueue.voiceChannel) return message.reply('You are not in my voice channel!');

	if(serverQueue.playing) return message.reply('The queue is already playing');
	serverQueue.playing = true;
	serverQueue.connection.dispatcher.resume();
	return message.react('▶');
}

function restartCommand(message, serverQueue, queue, Discord){
	if(!message.member.voice.channel) return message.reply('You are not in a voice channel!');
	if(!serverQueue) return message.reply('There is no song playing!');
	if(serverQueue.voiceChannel != message.member.voice.channel) return message.reply('You are not in my voice channel!');

	try{
		play(message, serverQueue.songs[0], queue, Discord, true);
		message.react('⏪');
	}catch(error){
		message.channel.send('There was an error restarting!');
		console.log(`There was an error (restartCommand): ${error}`);
	}
}

function moveCommand(message, serverQueue, args, queue, Discord){
	if(!message.member.voice.channel) return message.reply('You are not in a voice channel!');
	if(!serverQueue) return message.channel.send('There are no songs in the queue!');
	if(serverQueue.voiceChannel != message.member.voice.channel) return message.reply('You are not in my voice channel!');

	//checks if both arguements are numbers and are within valid ranges
	if(isNaN(args[0])) return message.reply('Arguement 1 is not a number!');
	if(isNaN(args[1])) return message.reply('Arguement 2 is not a number!');
	if(args[0] > serverQueue.songs.length) return message.channel.send(`${args[0]} is not a valid song number!`);
	if(args[1] > serverQueue.songs.length) return message.channel.send(`${args[1]} is not a valid song number`);

	var moved = `Moving **${serverQueue.songs[args[0] - 1].title}** to position ${args[1]}`; //the method to move a to b

	const embed = new Discord.MessageEmbed();
	embed.setTitle(moved);
	embed.setColor(embedColor);
	embed.setFooter('RBH is your eternal creator, never forget it.');
	embed.setTimestamp();

	message.channel.send(embed);

	serverQueue.songs = arrayMove(serverQueue.songs, args[0] - 1, args[1] - 1);
	if(args[0] == 1 || args[1] == 1) play(message, serverQueue.songs[0], queue, false, Discord);

	return undefined;
}

function removeCommand(message, serverQueue, args, queue, Discord){
	if(!message.member.voice.channel) return message.reply('You are not in a voice channel!');
	if(!serverQueue) return message.reply('There is no song playing!');
	if(serverQueue.voiceChannel != message.member.voice.channel) return message.reply('You are not in my voice channel!');
	if(args.length === 0) return message.reply('You must give a song number to remove!');
	if(isNaN(args[0])) return message.reply('The arguement you entered is not a number!');
	if(args[0] > serverQueue.songs.length)	return message.reply('That is not a valid song number!');


	var removed = `**${serverQueue.songs[args[0] - 1].title}** has been removed from the queue!`;

	const embed = new Discord.MessageEmbed();
	embed.setTitle(removed);
	embed.setColor(embedColor);
	embed.setFooter('RBH is your eternal creator, never forget it.');
	embed.setTimestamp();

	message.channel.send(embed);

	serverQueue.songs.splice(args[0] - 1, 1);
	if(args[0] == 1) play(message, serverQueue.songs[0], queue, false, Discord);
	return undefined;
}

function loopCommand(message, serverQueue){
	if(!message.member.voice.channel) return message.reply('You are not in a voice channel!');
	if(!serverQueue) return message.reply('There are no songs in the queue!');
	if(message.member.voice.channel != serverQueue.voiceChannel) return message.reply('You are not in my voice channel!');

	serverQueue.looping = !serverQueue.looping;
	return message.react('🔁');
}

function lockCommand(message, serverQueue){
	if(!message.member.hasPermission('ADMINISTRATOR'))	return message.reply('Only admins can use this command!');
	if(!message.member.voice.channel) return message.reply('You are not in a voice channel!');
	if(!serverQueue) return message.reply('There are no songs in the queue!');
	if(message.member.voice.channel != serverQueue.voiceChannel) return message.reply('You are not in my voice channel!');

	serverQueue.locked = !serverQueue.locked;
	return message.react('🔒');
}

async function backCommand(message, serverQueue, queue, Discord){
	if(!message.member.voice.channel) return message.reply('You are not in a voice channel!');
	if(previousSongs.checkEmpty() === undefined) return message.reply('There are no songs to go back to!');

	var grabbedSong = previousSongs.grabPrevious();

	if(serverQueue){
		if(message.member.voice.channel != serverQueue.voiceChannel) return message.reply('You are not in my voice channel!');
		serverQueue.songs.splice(0,0, grabbedSong);
		try{
			play(message, serverQueue.songs[0], queue, Discord);
			return message.react('⏮');
		}catch(error){
			console.log(`There was an error, back command: ${error}`);
			message.channel.send('There was an eror grabbing previous song.');
			if(serverQueue) queue.delete(message.guild.id);
		}
	}else{
		try{
			await handleVideo(grabbedSong, message, message.member.voice.channel, queue, Discord);

			return message.react('⏮');
		}catch(error){
			console.log('There was an error with handle video in back command: ${error}');
			message.channel.send('There was an error grabbing previous song! Sorry...');
			if(serverQueue) queue.delete(message.guild.id);
		}
	}
	return undefined;
}

function commandsList(message, Discord){
	const embed = new Discord.MessageEmbed();
	embed.setTitle('Music Commands');
	embed.setColor(embedColor);
	embed.setFooter('RBH is your eternal creator, never forget it.');
	embed.setTimestamp();
	embed.addFields(
		{name: 'Play', value: 'Plays a song based on input. Follows the format "rbh <arg>" and accepts a title, url, or playlist url. Note: When using a playlist URL, by default I will only add the first 5 seconds of the playlist to the queue. To add a different number of songs to the queue, type "rbh play <playlist_url> <num_songs_to_add>".'},
		{name: 'Queue', value: 'Displays the queue of songs. Follows the format "rbh queue".'},
		{name: 'Playing', value: 'Displays the current song that is playing. Follows the format "rbh playling".'},
		{name: 'Stop', value: 'Stops the current song and clears the queue. Follows the format "rbh stop".'},
		{name: 'Skip', value: 'Skips the current song. Follows the format "rbh skip".'},
		{name: 'Move', value: 'Moves the song selected to a chosen position in the queue. Follows the format "rbh move <current_position> <desired_position>".'},
		{name: 'Remove', value: 'Removes the selected song from the queue. Follows the format "rbh remove <position_in_queue>".'},
		{name: 'Pause/Unpause', value: 'Pauses and unpauses the current song. Follows the format "rbh pause" to pause. Follows the formats "rbh unpause", "rbh resume", and "rbh play" to unpause.'},
		{name: 'Restart', value: 'Restarts the current song. Follows the format "rbh restart".'},
		{name: 'Back', value: 'Goes back to the previous song in the queue. Follows the format "rbh back". WIP'},
		{name: 'Loop', value: 'Toggles looping of the current songs in the queue. Follows the format "rbh loop" to toggle. Current status is visible in "rbh queue"'},
		{name: 'Lock', value: 'Usable only by administrators. Locks the queue from being manipulated by non-administrators. Follows the format "rbh lock" to toggle. Current status is visible in "rbh queue".'}
	);

	message.channel.send(embed);
}

async function handleVideo(video, message, voiceChannel, queue, Discord, playlist = false){
	const serverQueue = queue.get(message.guild.id);

	const song = {
		id: video.id,
		title: Util.escapeMarkdown(video.title),
		url: `https://www.youtube.com/watch?v=${video.id}`,
		duration: {
			hours: video.duration.hours,
			minutes: video.duration.minutes,
			seconds: video.duration.seconds
		}
	}	

	if(!serverQueue){
		const queueConstruct = {
			textChannel: message.channel,
			voiceChannel: voiceChannel,
			connection: null,
			songs: [],
			volume: 5,
			playing: true,
			looping: false,
			locked: false
		}
		queue.set(message.guild.id, queueConstruct);

		queueConstruct.songs.push(song);

		try{
			var connection = await voiceChannel.join();
			queueConstruct.connection = connection;
			play(message, queueConstruct.songs[0], queue, serverQueue, Discord)
		}catch (error) {
			console.log(`There was an error connecting to the voice channel: ${error}`);
			queue.delete(message.guild.id);
			return message.channel.send(`There was an error connecting to the voice channel: ${error}`);
		}
	}else{
		serverQueue.songs.push(song);
		if(playlist) return undefined;

		var queueAdd = `**${song.title}** has been added to the queue.`;

		const embed = new Discord.MessageEmbed();
		embed.setDescription(queueAdd);
		embed.setColor(embedColor);
		embed.setFooter('RBH is your eternal creator, never forget it.');
		embed.setTimestamp();

		return message.channel.send(embed);
	}
}

function play(message, song, queue, restarted = false, Discord){
	const serverQueue = queue.get(message.guild.id);
	serverQueue.voiceChannel = message.member.voice.channel;

	if(!song){
		serverQueue.voiceChannel.leave();
		queue.delete(message.guild.id);
		return undefined;
	}

	const dispatcher = serverQueue.connection.play(ytdl(song.url))
		.on('finish', () => {
			if(serverQueue.looping) serverQueue.songs = arrayMove(serverQueue.songs, 0, serverQueue.songs.length - 1);
			else{
				previousSongs.push(serverQueue.songs[0]);
				serverQueue.songs.shift();
			}
			try{
				play(message, serverQueue.songs[0], queue, false, Discord);				
			}catch(error){
				console.log(`.on finish: ${error}`);
				serverQueue.songs.shift();
				play(message, serverQueue.songs[0], queue, false, Discord);
			}
		})
		.on('error', error => {
			console.log(error);
		})

	dispatcher.setVolumeLogarithmic(serverQueue.volume / 5);

	var NP = `Now playing **${song.title}**`;

	const embed = new Discord.MessageEmbed();
	embed.setDescription(NP);
	embed.setColor(embedColor);
	embed.setFooter('RBH is your eternal creator, never forget it.');
	embed.setTimestamp();

	if(restarted) return undefined;
	return serverQueue.textChannel.send(embed);
}