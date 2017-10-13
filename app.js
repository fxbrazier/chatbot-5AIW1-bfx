var restify = require('restify');
var botbuilder = require('botbuilder');
var reservation = require('./reservation');
var alarm = require('./alarm');

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

// This bot ensures user's profile is up to date.
var bot = new botbuilder.UniversalBot(connector, [
    function (session) {
        session.send("Welcome to your alarm bot");
        session.beginDialog("mainMenu");
    }
]);

// Main menu
var menuItems = { 
    "Create Alarm": {
        item: "createAlarm"
    },
    "Show Alarm": {
        item: "showAlarm"
    },
    "Historic Alarm": {
        item: "historicAlarm"
    },
}

// Display the main menu and start a new request depending on user input.
bot.dialog("mainMenu", [
    function(session){
        botbuilder.Prompts.choice(session, "Main Menu:", menuItems);
    },
    function(session, results){
        if(results.response){
            session.beginDialog(menuItems[results.response.entity].item);
        }
    }
])
.triggerAction({
    matches: /^main menu$/i,
    confirmPrompt: "This will cancel your request. Are you sure?"
});

bot.dialog('createAlarm', [
    function (session) {
        session.dialogData.alarm = {};
        botbuilder.Prompts.text(session, "What would you like to name this alarm?");
    },
    function (session, results, next) {
        if (results.response) {
            session.dialogData.name = results.response;
            botbuilder.Prompts.time(session, "What time would you like to set an alarm for?");
        } else {
            next();
        }
    },
    function (session, results) {
        if (results.response) {
            session.dialogData.time = botbuilder.EntityRecognizer.resolveTime([results.response]);
        }

        if (session.dialogData.name && session.dialogData.time) {
        	session.dialogData.alarm.name = session.dialogData.name;
        	session.dialogData.alarm.time = session.dialogData.time;
            session.endDialogWithResult({ 
                response: { name: session.dialogData.name, time: session.dialogData.time } 
            }); 
        } else {
            session.endDialogWithResult({
                resumed: botbuilder.ResumeReason.notCompleted
            });
        }
    }
]).reloadAction(
    "restartCreateAlarm", "Ok. Let's start over.",
    {
        matches: /^start over$/i,
        confirmPrompt: "This wil cancel your request. Are you sure?"
    }
)
.cancelAction(
    "cancelCreateAlarm", "Type 'Main Menu' to continue.", 
    {
        matches: /^cancel$/i,
        confirmPrompt: "This will cancel your request. Are you sure?"
    }
);

bot.dialog('showAlarm', [
    function (session) {
    	var listAlarm;

        for(var alarm in session.dialogData.alarm){
		    console.log(alarm);
		    session.send("Alarm name : " + alarm.name +
            " Alarm time " + alarm.id);
		}
    },
    function(session, results){
        if(results.response){
            session.dialogData.room = results.response;
            var msg = `Thank you`;
            session.send(msg);
            session.replaceDialog("mainMenu"); // Display the menu again.
        }
    }
]).reloadAction(
    "restartShowAlarm", "Ok. Let's start over.",
    {
        matches: /^start over$/i,
        confirmPrompt: "This wil cancel your request. Are you sure?"
    }
)
.cancelAction(
    "cancelShowAlarm", "Type 'Main Menu' to continue.", 
    {
        matches: /^cancel$/i,
        confirmPrompt: "This will cancel your request. Are you sure?"
    }
);

bot.dialog('historcAlarm', [
    
]);

/*
bot gerer des alarmes
alarme : date + nom
bonjour => liste des choix (menu)
consulter les alarmes actives,
historique alarmes actives et non, afficher sous forme liste ou rich card ou button => au click il affiche detail
creer par qui, a quel heure, recap, name
celle qui sont a venir

trigger, reload, cancel, action
un main menu
 */