var botbuilder = require('botbuilder');

const library = new botbuilder.Library('reservation');

library.dialog('reservationHostel', [
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
            botbuilder.Prompts.text(session, "What's your phone numbers?");
        } else {
            next(); // Skip if we already have this info.
        }
    },
    function (session, results, next) {
        if (results.response) {
            // Save user's name if we asked for it.
            session.dialogData.profile.phone = results.response;
        }
        if (!session.dialogData.profile.company) {
            botbuilder.Prompts.text(session, "What's your email?");
        } else {
            next(); // Skip if we already have this info.
        }
    },
    function (session, results) {
        if (results.response) {
            // Save email name if we asked for it.
            session.dialogData.profile.email = results.response;
        }
        session.endDialogWithResult({ response: session.dialogData.profile });
    }
]);

module.exports = library;
