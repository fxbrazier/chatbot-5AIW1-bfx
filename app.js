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

// This bot ensures user's profile is up to date.
var bot = new botbuilder.UniversalBot(connector, [
    function (session) {
        //session.beginDialog('ensureProfile', session.userData.profile);
        session.beginDialog('dinnerOrder', session);
    },
    function (session, results) {
        session.userData.profile = results.response; // Save user profile.
        session.send(`Hello ${session.userData.profile.name}! I love ${session.userData.profile.company}!`);
    }
]);

bot.dialog('ensureProfile', [
    function (session, args, next) {
        session.dialogData.profile = args || {}; // Set the profile or create the object.
        if (!session.dialogData.profile.name) {
            botbuilder.Prompts.text(session, "What's your name?");
        } else {
            next(); // Skip if we already have this info.
        }
    },
    function (session, results, next) {
        if (results.response) {
            // Save user's name if we asked for it.
            session.dialogData.profile.name = results.response;
        }
        if (!session.dialogData.profile.company) {
            botbuilder.Prompts.text(session, "What company do you work for?");
        } else {
            next(); // Skip if we already have this info.
        }
    },
    function (session, results) {
        if (results.response) {
            // Save company name if we asked for it.
            session.dialogData.profile.company = results.response;
        }
        session.endDialogWithResult({ response: session.dialogData.profile });
    }
]);

bot.dialog('dinnerOrder', [
    (session) => {
        botbuilder.Prompts.text(session, "Hello... What's your name?");
    },
    (session, results) => {
        session.userData.name = results.response;
        botbuilder.Prompts.time(session, "Hi " + results.response + ", when do you want to make a reservation ?");
    },
    (session, results) => {
        session.userData.coding = results.response;
        botbuilder.Prompts.text(session, "Hello... What's your name?");
        //botbuilder.Prompts.choice(session, "What language do you code Node using?", ["JavaScript", "CoffeeScript", "TypeScript"]);
    },
    (session, results) => {
        session.userData.language = results.response.entity;
        session.send("Got it... " + session.userData.name +
            " you've been programming for " + session.userData.coding +
            " years and use " + session.userData.language + ".");
    }
]);




//message qd on tape quelque chose
//ajout utilisateur : message avec id + nom
//ajout bot : message avec id + nom
//pareil pour quitter