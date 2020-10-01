module.exports = {
	name: 'when',
	description: 'Answers your deepes "when" questions. Format of \"rbh when <rest_of_question>\"',
	execute(message, args, animeBabesId){
		var answers = [ //array of potential answers
		'david can grow a beard',
		'Clarke wears tzitzit',
		'Adam wins a planking contest',
		'Meir stops flirting with mrs.hochner',
		'Eitan starts keeping kosher',
		'Michael S. doesn\'t spend 5k on technology',
		'Claudia isn\'t thicc',
		'Eitan stops hating Jews',
		'Meir can find his penis',
		'Mendy leaves his house to see the boys',
		'Rabbi Levitt stops making us learn all of Tanach in a week',
		'Rabbi levitt turns Sadya back on',
		'Clarke tells us about the redneck chat',
		'Mendy gets declined by Hopkins',
		'Levi stops being too cool for the yids',
		'Dave stops bailing'
		]
		if(!(message.guild.id === animeBabesId)) return message.reply('Your server cannot use this command!');
		message.reply("When " + args.join(' ') + ' When ' + answers[Math.floor(Math.random() * answers.length)]);
	}
}