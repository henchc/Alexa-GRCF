'use strict';

// load packages
var Alexa = require("alexa-sdk");
var https = require("https");
var cheerio = require("cheerio");

// For detailed tutorial on how to making a Alexa skill,
// please visit us at http://alexa.design/build


exports.handler = function(event, context) {
    var alexa = Alexa.handler(event, context);
    alexa.registerHandlers(handlers);
    alexa.execute();
};

var handlers = {
    'LaunchRequest': function () {
        this.emit('GetWod');
    },
    'GetWodIntent': function () {
        this.emit('GetWod');
    },
    'GetWodDateIntent': function () {
        this.emit('GetWodDate');
    },
    'GetWod': function () {

        // placeholder for future date request
        var myRequest = 'empty';

        httpsGet(myRequest,  (myResult) => {
                console.log("sent     : " + myRequest);
                console.log("received : " + myResult);

                this.response.speak(myResult)
                    .cardRenderer('GRCF WOD', myResult);
                this.emit(':responseReady');

            }
        );
    },
    'GetWodDate': function () {
        var date = this.event.request.intent.slots.date.value;
        this.response.speak('Hello ' + date)
            .cardRenderer('hello world', 'hello ' + date);
        this.emit(':responseReady');
    },
    'SessionEndedRequest' : function() {
        console.log('Session ended with reason: ' + this.event.request.reason);
    },
    'AMAZON.StopIntent' : function() {
        this.response.speak('Bye');
        this.emit(':responseReady');
    },
    'AMAZON.HelpIntent' : function() {
        this.response.speak("You can try: 'alexa, grassroots' or 'alexa, ask grassroots what's the workout");
        this.emit(':responseReady');
    },
    'AMAZON.CancelIntent' : function() {
        this.response.speak('Bye');
        this.emit(':responseReady');
    },
    'Unhandled' : function() {
        this.response.speak("Sorry, I didn't get that. You can try: 'alexa, grassroots' or 'alexa, ask grassroots what's the workout");
    }
};


// parse BTWB response
function httpsGet(myData, callback) {

    var url = 'https://beyondthewhiteboard.com/gyms/2755-grassroots-crossfit/wods';

    // make request
    var req = https.request(url, res => {
        res.setEncoding('utf8');
        var returnData = "";

        // save response to returnData
        res.on('data', chunk => {
            returnData = returnData + chunk;
        });

        res.on('end', () => {

            // load page source
            const $ = cheerio.load(returnData);

            // get first date element
            var dateElement = $('#track-event-list > h3:nth-child(2)');

            // reformat so day is first the month and date
            var dateArray = dateElement.text().replace(/\s\s+/g, ' ').trim().split(' ');
            var date = dateArray[2] + ', ' + dateArray[0] + ' ' + dateArray[1];

            // build empty text
            var alexaText = '';

            // move to first div wod part
            var nextElement = dateElement.next();
            var numParts = 0;

            // cycle through all parts until hr element
            while (nextElement.is('hr') == false) {
                numParts += 1
                var title = nextElement.find('a').text();
                title = cleanText(title);
                alexaText += "Part " + numParts + " is: \n\n" + title + '\n\n';

                var desc = nextElement.text();
                desc = cleanText(desc, title);
                alexaText += desc + '\n\n';

                nextElement = nextElement.next();
            }

            // start text string
            if (numParts > 1) {
              var alexaPreText = 'The workout for ' + date + ' has ' + numParts + ' parts:\n\n';
            } else {
              var alexaPreText = 'The workout for ' + date + ' has ' + numParts + ' part:\n\n';
            }

            // post text string
            var alexaPostText = "Good luck. You're awesome."

            // concatenate string
            alexaText = alexaPreText + alexaText + alexaPostText;
            alexaText = crossfitAbb(alexaText);

            // send back alexaText
            callback(alexaText);  // this will execute whatever function the caller defined, with one argument

        });

    });
    req.end();

}

// clean text from divs
function cleanText(text, title){
    text = text.replace("Show More", "").replace("Show Less", "").replace("View Results", "").replace(title, "").replace(/\s\s+/g, ' ').trim();
    return text;
};

// replace crossfit abbreviations
function crossfitAbb(text) {
    text = text.replace(/\//g, ' or ').replace(/#/g, ' pounds').replace("Acc", "Accessory").replace(/DB/g, "Dumbell");
    text = text.replace(/RM/g, ' rep max');
    return text;
};

// function convertDate(dateElement) {
//     var dateArray = dateElement.text().replace(/\s\s+/g, ' ').trim().split(' ');
//     var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
//     var date = '2017-' + (months.indexOf(dateArray[0])+1) + '-' + dateArray[1];
//     return date;
// };
