module.exports = {
	name: 'why',
	description: 'Answers your deepest questions. Format of \"rbh why <rest_of_question>\".',
	execute(message, args, animeBabesId){
		var answers = [ //array of potential answers
		'eitan hates the jews...',
		'dave doesn\'t like michael for some reason',
		'meir\'s a goblin',
		'eitan won\'t stop eating cheesburgers',
		'Michael Arshawsky hasnt invented it yet',
		'David\'s belly buster was late',
		'Meir showed us his penis...',
		'Meir decided to swim',
		'Gigaron is still taking attendance',
		'Dave\'s eating during a fast',
		'you ate Doc\'s Chulent',
		'Mendy got a 1590',
		'Mr.Rath is an amazing teacher',
		'I\'m busy devouring worlds',
		'Fair Life is the best',
		'Eitan hates learning kitzur',
		'Mendy went running'];
		if(!(message.guild.id === animeBabesId)) return message.reply('Your server cannot use this command!');
		message.reply("Why " + args.join(' ') + ' Because ' + answers[Math.floor(Math.random() * answers.length)]);
	}
}