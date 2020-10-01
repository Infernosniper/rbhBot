var previous = [];

exports.push = function(song){
	previous.push(song);
}

exports.grabPrevious = function(){
	return previous.pop();
}

exports.checkEmpty = function(){
	return previous[0];
}