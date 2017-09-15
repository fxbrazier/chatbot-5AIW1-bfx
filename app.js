var restify = require('restify');
var botbuilder = require('botbuilder');

//setup restify server
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3987, function(){
	console.log('%s bot started at %s', server.name, server.url);
});

//create chat connector
var connector = new botbuilder.ChatConnector({
	appId: process.env.APP_ID,
	appPassword: process.env.APP_SECRET
});

//listening for user inputs
server.post('/api/messages', connector.listen());

//reply by echoing
var bot = new botbuilder.UniversalBot(connector, function(session){
	session.send('You have tapped: %s | [Lenght: %s] ', session.message.text, session.message.text.length)

	//user typing
	bot.on('typing', function(){
		session.send('Too late...');
	});

	bot.on('conversationUpdate', function(message){
		//user added
		if (message.membersAdded && message.membersAdded.length > 0) {
				var membersAdded = message.membersAdded
				.map(function(x){
					var isSelf = x.id === message.address.bot.id;
					return (isSelf ? message.address.bot.name : x.name) || ' ' + '(id=' + x.id + ')'
				}).join(', ');

				bot.send(new botbuilder.Message()
					.address(message.address)
					.text('Welcome user ' + membersAdded));
		}

		//user removed
		if (message.membersRemoved && message.membersRemoved.length > 0) {
				var membersRemoved = message.membersRemoved
				.map(function(x){
					var isSelf = x.id === message.address.bot.id;
					return (isSelf ? message.address.bot.name : x.name) || ' ' + '(id=' + x.id + ')'
				}).join(', ');

				bot.send(new botbuilder.Message()
					.address(message.address)
					.text('Good bye user ' + membersRemoved));
		}
	});

	bot.on('contactRelationUpdate', message => {
		//bot added
        if (message.action && message.action === 'add') {
            bot.send(new botbuilder.Message().address(message.address).text('Welcome bot ' + message.address.id));
        }
        //bot removed
        if (message.action && message.action === 'remove') {
            bot.send(new botbuilder.Message().address(message.address).text('Good bye bot ' + message.address.id));
        }
	});
});




//message qd on tape quelque chose
//ajout utilisateur : message avec id + nom
//ajout bot : message avec id + nom
//pareil pour quitter