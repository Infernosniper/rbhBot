module.exports = {
	name: 'help',
	description: "Lists all commands. Alternatively, \"help rbh <command name>\" gives tips for that command.",
	execute(message, args){
		const fs = require('fs');
		fs.readdir("./commands/", (err, files) => {
		    let jsfiles = files.filter(f => f.split(".").pop() === "js");

		    var nameList = '';
		    var descList = '';

		    if(args.length === 0 ){ //if it isn't asking about a specific command
		        var curName = []; //array for names of commands
		        message.channel.send('The only help you deserve is a beating, but here is what I can do:\nYou can also type \"rbh help <command name>\" to get more info:');
		        let result = jsfiles.forEach((f, i) => { //loops through js files
		            let props = require(`./${f}`); //grabs the file info
		            nameList = props.name; //grabs the name
		            curName.push(`**${nameList}**`); //pushes the name to array
		        });
		        curName.sort(); //sort
		     	message.channel.send(curName); //print names	
		    }else { //if the user is asking about a specific command
		    	message.channel.send(`Description for ${args}:`);
		    	let result = jsfiles.forEach((f, i) => { //searches the js files
		            let props = require(`./${f}`);
		            nameList = props.name;
		            if(`${nameList}` === `${args}`) descList = `${props.description}` //if the name of the file is the keyword, grab the description
		        });

		        if(descList.length > 0) message.channel.send(descList) //if it found a command desc, print it
		        else message.channel.send('You\'re an idiot... that\'s not a command. This is why I shouldn\'t have created humanity...')
		    }				     
		});
	}
}