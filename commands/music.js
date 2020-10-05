var previousSongs = require('../otherFiles/previousSongs.js');

module.exports = {
	name: 'music',
	description: `Welcome to the commands list for the music functionality I have to offer. Sadly for legal reasons I cannot always play the abarbanel, so enjoy this:\n**Play**: Plays a song. Follows the format "rbh play <input>" and can accept a title or link.\n**Playing**: Gives info about the current song. "rbh playing"\n**Queue**: Displays the queue. "rbh queue"\n**Stop**: Clears the queue and leaves the call. "rbh stop"\n**Skip**: Skips the current song in the queue. "rbh skip"\n**Remove**: Follows the format "rbh remove <position>" and removes the item in that spot of the queue.\n**Move**: Moves an item from one spot in the queue to another. Follows the format "rbh move <from> <to> and moves the object from its original spot to the new place, then pushes everything else down one spot.\n**Back**: Goes back to the previous song. Works for a song that ends normally, a song that is skipped, or if someone uses the stop command. "rbh back"\n**Restart**: Restarts the current song. "rbh restart"\n**Pause**: Paueses the queue. "rbh pause"\n**Resume**: Resumes the queue. "rbh resume" or "rbh unpause"\n**Loop**: Loops the queue. Toggle with "rbh loop"`,
	async execute(command, message, args, ytdl, yts, queue, serverQueue, arrayMove){
		const argsJoined = args.slice(0).join(' ');
		if(command === 'play') return playCommand(message, args, argsJoined, ytdl, yts, queue, serverQueue, arrayMove);
		else if(command === 'stop') return stopCommand(message, queue, serverQueue);
		else if(command === 'skip') return skipCommand(message, serverQueue);
		else if(command === 'queue') return queueCommand(message, serverQueue);
		else if(command === 'remove') return removeCommand(message, args, serverQueue);
		else if(command === 'move') return moveCommand(message, argsJoined, serverQueue, arrayMove);
		else if(command === 'playing') return playingCommand(message, serverQueue);
		else if(command === 'back') return backCommand(message, ytdl, queue, serverQueue, arrayMove);
		else if(command === 'restart') return restartCommand(message, ytdl, queue, serverQueue, arrayMove);
		else if(command === 'pause') return pauseCommand(message, serverQueue);
		else if(command === 'resume' || command === 'unpause') return resumeCommand(message, serverQueue);
		else if(command === 'loop') return loopCommand(message, serverQueue);
		else if(command === 'music') return message.channel.send(`Welcome to the commands list for the music functionality I have to offer. Sadly for legal reasons I cannot always play the abarbanel, so enjoy this:\n**Play**: Plays a song. Follows the format "rbh play <input>" and can accept a title or link.\n**Playing**: Gives info about the current song. "rbh playing"\n**Queue**: Displays the queue. "rbh queue"\n**Stop**: Clears the queue and leaves the call. "rbh stop"\n**Skip**: Skips the current song in the queue. "rbh skip"\n**Remove**: Follows the format "rbh remove <position>" and removes the item in that spot of the queue.\n**Move**: Moves an item from one spot in the queue to another. Follows the format "rbh move <from> <to> and moves the object from its original spot to the new place, then pushes everything else down one spot.\n**Back**: Goes back to the previous song. Works for a song that ends normally, a song that is skipped, or if someone uses the stop command. "rbh back"\n**Restart**: Restarts the current song. "rbh restart"\n**Pause**: Paueses the queue. "rbh pause"\n**Resume**: Resumes the queue. "rbh resume" or "rbh unpause"\n**Loop**: Loops the queue. Toggle with "rbh loop"`);
	}
}

async function playCommand(message, args, argsJoined, ytdl, yts, queue, serverQueue, arrayMove){
	if(!message.member.voice.channel) return message.reply('You need to be in a voice channel to use the play command!') //checks if user is in a channel
	if(args.length === 0) return message.channel.send('You must give a link or title!');
	if(ytdl.validateURL(args[0])){ //checks if arg is a url
		const songInfo = await ytdl.getInfo(args[0]); //grabs the song info
		song = { //stores the title and url
			title: songInfo.videoDetails.title,
			url: songInfo.videoDetails.video_url,
			length: songInfo.videoDetails.lengthSeconds
		};
	}else{ //if it is not a link, it's a title
		const {videos} = await yts(argsJoined); //joins the array of args and searches for it on yt
		if(!videos.length) return message.channel.send("No videos were found!"); //if there are no search results
		var duration = String(videos[0].duration);
		song = { //stores the title and url of search result 0
			title: videos[0].title,
			url: videos[0].url,
			length: duration.substring(0, duration.indexOf('s') - 1)
		};
	}
	if(!serverQueue){ //creates the queue if there isn't one
		const queueConstruct = {
			textChannel: message.channel,
			voiceChannel: message.member.voice.channel,
			connection: null,
			songs: [],
			volume: 5,
			playing: true
		}
		queue.set(message.guild.id, queueConstruct);

		queueConstruct.songs.push(song);
		try{ //tries connecting to voice
			var connection = await message.member.voice.channel.join();
			queueConstruct.connection = connection;
			play(queueConstruct.songs[0], queue, ytdl, message, arrayMove);
		}catch (error){ //if there is an error connecting
			queue.delete(message.guild.id);
			return message.channel.send(`There was an error (playCommand): ${error}`);
		}
	}else{ //if the queue already exists, just push the song to it
		serverQueue.songs.push(song);
		serverQueue.voiceChannel = message.member.voice.channel;
		serverQueue.voiceChannel.join();
		return message.channel.send(`**${song.title}** has been added to the queue`)
	}		

}

function skipCommand(message, serverQueue){
	if(!message.member.voice.channel) return message.reply('You need to be in a voice channel to use the skip command!') //checks if user is in a channel
	if(!serverQueue) return message.channel.send('There are no songs in the queue. You cannot skip!');
	if(serverQueue.voiceChannel != message.member.voice.channel) return message.reply('You are not in my voice channel!');
	if(!serverQueue.playing) return message.reply('You cannot skip a song while the queue is paused!');
	if(serverQueue.loop) return message.reply('You cannot skip a song while looping is enabled! "rbh loop" to disable looping.');
	serverQueue.connection.dispatcher.end(); //ends the current song
	message.channel.send('Skipped!');
	return undefined;
}

function stopCommand(message, queue, serverQueue){
	if(!message.member.voice.channel) return message.reply('You need to be in a voice channel to use the stop command!'); //checks if you are in a channel
	if(!serverQueue) return message.channel.send('There are no songs in the queue!'); //checks if there are songs in the queue
	if(serverQueue.voiceChannel != message.member.voice.channel) return message.reply('You are not in my voice channel!');
			
	queue.delete(message.guild.id);

	for(var i = 0; i < serverQueue.songs.length; i++) previousSongs.push(serverQueue.songs[i]);

	message.channel.send('Stopped! All songs in queue have been sent to the list of previous songs. "rbh back" to go back to the stopped songs.');
	message.member.voice.channel.leave(); //makes rbh leave his currnet channel, not only the channel that the serverqueue was created in
	
	return undefined;
}

function playingCommand(message, serverQueue){
	if(!serverQueue) return message.channel.send('No song is playing!');

	var timeElapsedSeconds = Math.trunc(serverQueue.connection.dispatcher.streamTime / 1000); //grabs time passed in song
	var timeElapsedPartMins = Math.trunc(timeElapsedSeconds / 60);
	var timeElapsedPartSeconds = timeElapsedSeconds % 60;
	var totalSongMins = Math.trunc(serverQueue.songs[0].length / 60)
	var totalSongSeconds = serverQueue.songs[0].length % 60;

	if(String(timeElapsedPartSeconds).length === 1) timeElapsedPartSeconds = '0' + String(timeElapsedPartSeconds); //makes the seconds two digits
	if(String(totalSongSeconds).length === 1) totalSongSeconds = '0' + String(totalSongSeconds);

	return message.channel.send(`Now playing **${serverQueue.songs[0].title}** - ${timeElapsedPartMins}:${timeElapsedPartSeconds} / ${totalSongMins}:${totalSongSeconds}`);
}

function queueCommand(message, serverQueue){
	if(!serverQueue) return message.channel.send('There are no songs in the queue!');//checks if you are in a channel
	if(!serverQueue.connection) return message.reply('There is an error with the connection');

	let queueList = 'Songs in the queue:';
	var totalTime = 0;
			
	serverQueue.songs.forEach((f, i) => { //loops through each song
		var totalTimeMins = Math.trunc(totalTime / 60);
		var totalTimeSeconds = totalTime % 60;
		var songTimeMins = Math.trunc(f.length / 60);
		var songTimeSeconds = f.length % 60;

		if(String(totalTimeSeconds).length === 1) totalTimeSeconds = '0' + String(totalTimeSeconds); //makes the 1-digit seconds become 2 digits
		if(String(songTimeSeconds).length === 1) songTimeSeconds = '0' + String(songTimeSeconds); //^^^^^

		if(i === 0) queueList += `\n${i}: **${f.title}** Length: ${songTimeMins}:${songTimeSeconds} - Now playing`; //the line of text for first song
		else queueList += `\n${i}: **${f.title}** - ${songTimeMins}:${songTimeSeconds} - Time to play: ${totalTimeMins}:${totalTimeSeconds}`; //line of text for all other osngs
		if(i === 0){ //if first song
						
			var timeElapsedSeconds = serverQueue.connection.dispatcher.streamTime / 1000; //calulcate time elapsed

			totalTime += Math.trunc(f.length - timeElapsedSeconds); //total time only gets time remaining in current song
		}
		else totalTime += parseInt(f.length, 10); //if not first song, add song length to the total time
	})
	message.channel.send(queueList);
			
	return undefined;
}

function removeCommand(message, args, serverQueue){
	if(!message.member.voice.channel) return message.reply('You need to be in a voice channel to use the remove command!') //checks if user is in a channel
	if(!serverQueue) return message.channel.send('There are no songs in the queue!');
	if(serverQueue.voiceChannel != message.member.voice.channel) return message.reply('You are not in my voice channel!');
	if(args == '0') return message.channel.send('Cannot remove current song, use "rbh skip" instead!');
	if(args >= serverQueue.songs.length) return message.channel.send(args + ' is not a valid song in the queue!');

	if(isNaN(args)) return message.reply('The arguement you entered is not a number!');
			
	message.channel.send(`**${serverQueue.songs[args].title}** has been removed from the queue!`);
	serverQueue.songs.splice(args, 1);				

	return undefined;
}


function moveCommand(message, argsJoined, serverQueue, arrayMove){
	if(!message.member.voice.channel) return message.reply('You need to be in a voice channel to use the move command!');
	if(!serverQueue) return message.channel.send('There are no songs in the queue!');
	if(serverQueue.voiceChannel != message.member.voice.channel) return message.reply('You are not in my voice channel!');

	let argOne = parseInt(argsJoined.substring(0, argsJoined.indexOf(' ')));
	let argTwo = parseInt(argsJoined.substring(argsJoined.indexOf(' ') + 1));

	//checks if both arguements are numbers and are within valid ranges
	if(isNaN(argOne)) return message.reply('Arguement 1 is not a number!');
	if(isNaN(argTwo)) return message.reply('Arguement 2 is not a number!');
	if(argOne === 0 ) return message.channel.send('You cannot move the current song!');
	if(argTwo === 0) return message.channel.send('You cannot move something to make it the first song!');
	if(argOne >= serverQueue.songs.length) return message.channel.send(`${argOne} is not a valid location!`);
	if(argTwo >= serverQueue.songs.length) return message.channel.send(`${argTwo} is not a valid location!`);

	message.channel.send(`Moving **${serverQueue.songs[argOne].title}** to position ${String(argTwo)}`); //the method to move a to b
	serverQueue.songs = arrayMove(serverQueue.songs, argOne, argTwo);

	return undefined;
}

async function backCommand(message, ytdl, queue, serverQueue, arrayMove){
	if(!message.member.voice.channel) return message.reply('You need to be in a voice channel to use the back command!') //checks if user is in a channel
	if(previousSongs.checkEmpty() === undefined) return message.reply('There are no songs to go back to!');
	if(serverQueue){
		if(serverQueue.voiceChannel != message.member.voice.channel) return message.reply('You are not in my voice channel!');

		var grabbedSong = previousSongs.grabPrevious();
		serverQueue.songs.splice(0,0, grabbedSong);
		try{
			play(grabbedSong, queue, ytdl, message, previousSongs, arrayMove);
		}catch(error){
			console.log(`There was an error (backCommand, hasQueue): ${error}`)
		}
	}else {
		const queueConstruct = {
			textChannel: message.channel,
			voiceChannel: message.member.voice.channel,
			connection: null,
			songs: [],
			volume: 5,
			playing: true
		}
		queue.set(message.guild.id, queueConstruct);

		var grabbedSong = previousSongs.grabPrevious();
		queueConstruct.songs.push(grabbedSong);
		try{ //tries connecting to voice
			var connection = await message.member.voice.channel.join();
			queueConstruct.connection = connection;
			play(queueConstruct.songs[0], queue, ytdl, message, arrayMove);
		}catch (error){ //if there is an error connecting
			queue.delete(message.guild.id);
			return message.channel.send(`There was an error (backCommand, noQueue): ${error}`);
		}	
	}

	return undefined;
}

function restartCommand(message, ytdl, queue, serverQueue, arrayMove){
	if(!message.member.voice.channel) return message.reply('You need to be in a voice channel to use the restart command!');
	if(!serverQueue) return message.reply('No song is playing!');
	if(serverQueue.voiceChannel != message.member.voice.channel) return message.reply('You are not in my voice channel!');
	if(serverQueue.songs[0]) {
		try{
		play(serverQueue.songs[0], queue, ytdl, message, arrayMove);
		}catch(error){
			console.log(`There was an error (restartCommand): ${error}`);
		}
	}
	else return message.reply('There is no song playing!');
	return undefined;
}

function pauseCommand(message, serverQueue){
	if(!message.member.voice.channel) return message.reply('You need to be in a voice channel to use the pause command!');
	if(!serverQueue) return message.reply('No songs are in the queue!');
	if(serverQueue.voiceChannel != message.member.voice.channel) return message.reply('You are not in my voice channel');
	if(!serverQueue.playing) return message.reply('The queue has already been paused!');
	serverQueue.playing = false;
	serverQueue.connection.dispatcher.pause();
	return message.channel.send('The queue has been paused!');
}

function resumeCommand(message, serverQueue){
	if(!message.member.voice.channel) return message.reply('You need to be in a voice channel to use the resume command!');
	if(!serverQueue) return message.reply('No songs are in the queue!');
	if(serverQueue.voiceChannel != message.member.voice.channel) return message.reply('You are not in my voice channel!');
	if(serverQueue.playing) return message.reply('The queue is already playing!');
	serverQueue.playing = true;
	serverQueue.connection.dispatcher.resume();
	return message.channel.send('The queue has been resumed!');	
}

function loopCommand(message, serverQueue){
	if(!message.member.voice.channel) return message.reply('You need to be in a voice channel to loop the queue!');
	if(!serverQueue || !serverQueue.songs[0]) return message.reply('There are no songs in the queue!');
	if(serverQueue.voiceChannel != message.member.voice.channel) return message.reply('You are not in my voice channel!');

	serverQueue.loop = !serverQueue.loop;
	if(serverQueue.loop) return message.channel.send(`Queue looping is now **enabled**`);
	else return message.channel.send(`Queue looping is now **disabled**`)
}


function play(song, queue, ytdl, message, arrayMove){
	const serverQueue = queue.get(message.guild.id);
	if(message.member.voice.channel) serverQueue.voiceChannel = message.member.voice.channel;

	if(!song){	
		try{
			serverQueue.voiceChannel.leave();
		}catch(error){
			console.log(error);
		}
		queue.delete(message.guild.id);
		return undefined;
	}
	message.channel.send(`**${song.title}** is now playing`); //shows it is playing the song
	const dispatcher = serverQueue.connection.play(ytdl(song.url)) //plays the song
	.on('finish', () => {
		previousSongs.push(serverQueue.songs[0]);
		if(!serverQueue.loop) serverQueue.songs.shift(); //if the queue is not set to loop
		else{
			serverQueue.songs = arrayMove(serverQueue.songs, 0, serverQueue.songs.length - 1);
		}
		try{
			play(serverQueue.songs[0], queue, ytdl, message, arrayMove);
		}catch(error){
			console.log(error);
			message.channel.send('An error occured. try using "rbh skip" or "rbh stop" if the error happens again. Tagging <@289173843837452288>')
		}
	})
	.on('error', error => { //if there is an error playing some song
		console.log(error)
		message.channel.send(`There was an error (play, .on): ${error}`);
	})

	dispatcher.setVolumeLogarithmic(serverQueue.volume / 5); //volume
}