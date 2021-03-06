'use strict';

// load packages
var Alexa = require("alexa-sdk");
var https = require("https");
var cheerio = require("cheerio");

// main handler to execute Alexa
exports.handler = function(event, context) {
    var alexa = Alexa.handler(event, context);
    alexa.registerHandlers(handlers);
    alexa.execute();
};

// handlers to be sent to main above
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

        // general assume today
        var myRequest = todayDate();
        var page = 1;

        httpsGet(myRequest, page, (myResult) => {
                console.log("sent     : " + myRequest);
                console.log("received : " + myResult);

                this.response.speak(myResult)
                    .cardRenderer('GRCF WOD', myResult);
                this.emit(':responseReady');
            }
        );
    },
    'GetWodDate': function () {

        // date request
        var myRequest = this.event.request.intent.slots.date.value;

        // check for valid amazon DATE
        if (myRequest == undefined || myRequest.length != 10 ) {
            var errorText = "Sorry, please ask for a valid, specific date."
            this.response.speak(errorText)
                .cardRenderer('GRCF-WOD', errorText);
            this.emit(':responseReady');
        } else {
            myRequest = verifyDate(myRequest);
            var page = 1;

            httpsGet(myRequest, page, (myResult) => {
                    console.log("sent     : " + myRequest);
                    console.log("received : " + myResult);

                    this.response.speak(myResult)
                        .cardRenderer('GRCF-WOD', myResult);
                    this.emit(':responseReady');
                }
            );
        }
    },
    'SessionEndedRequest' : function() {
        console.log('Session ended with reason: ' + this.event.request.reason);
    },
    'AMAZON.StopIntent' : function() {
        this.response.speak('Bye');
        this.emit(':responseReady');
    },
    'AMAZON.HelpIntent' : function() {
        this.response.speak("You can try: 'ask grassroots crossfit what's the workout today', or 'ask grassroots crossfit what's the workout for tomorrow', or 'ask grassroots crossfit what was the workout yesterday'");
        this.emit(':responseReady');
    },
    'AMAZON.CancelIntent' : function() {
        this.response.speak('Bye');
        this.emit(':responseReady');
    },
    'Unhandled' : function() {
        this.response.speak("Sorry, I didn't get that. You can try: 'ask grassroots crossfit what's the workout today', or 'ask grassroots crossfit what's the workout for tomorrow', or 'ask grassroots crossfit what was the workout yesterday'");
        this.emit(':responseReady');
    }
};

// make GET req to BTWB
function httpsGet(userRequest, page, callback) {

    // build URL with page num
    var url = 'https://beyondthewhiteboard.com/gyms/2755-grassroots-crossfit/wods?page=' + page;

    // make request
    var req = https.request(url, res => {
        res.setEncoding('utf8');
        var returnData = "";

        // save response to returnData
        res.on('data', chunk => {
            returnData = returnData + chunk;
        });

        res.on('end', () => {

            // load page source to cheerio parser
            const $ = cheerio.load(returnData);

            // get all URLs in track-eventlist
            var dateElements = $('#track-event-list a');

            // assume WOD does not exist until found
            var wodExists = false;

            // cycle through URLs until date matched -- end of URL
            dateElements.each(function searchDates(i) {
                var firstPart = $(this);
                var linkDate = firstPart.attr('href').slice(-10);

                // if match with request, send block to processing
                if (userRequest == linkDate) {
                    wodExists = true;
                    callback(buildText(firstPart, linkDate));
                    return false;
                }
            });

            // if WOD not found on this page and not today or future
            // and we have not gone past 3 pages
            // then recursive call to next page
            if (wodExists == false && differenceInDays(userRequest, todayDate()) <= 0) {
                callback('Sorry, the workout for ' + formatDate(userRequest) + ' is not available.');
            } else if (wodExists == false && page < 3) {
                page += 1;
                httpsGet(userRequest, page, callback);
            } else if (wodExists == false) {
                callback('Sorry, the workout for ' + formatDate(userRequest) + ' is not available.');
            }
        });
    });
    req.end();
}

// clean text from divs
function cleanText(text){
    text = text.replace("Show More", "").replace("Show Less", "").replace("View Results", "").replace(/\s\s+/g, ' ').trim();
    return text;
}

// replace crossfit abbreviations
function crossfitAbb(text) {
    text = text.replace(/\//g, ' or ').replace(/#/g, ' pounds').replace("Acc", "\n\nAccessory").replace(/DB/g, "Dumbell");
    text = text.replace(/RM/g, ' rep max').replace('ACC', '\n\nAccessory');
    text = text.replace(/&/g, 'and');
    return text;
}

// format for speaking
function formatDate(dateString) {
    var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    return months[parseInt(dateString.slice(5,7)) - 1] + ' ' + parseInt(dateString.slice(8));
}

// builds text from a block div
function buildText(firstPart, date) {
    // build empty text string
    var alexaText = '';

    // move to first div wod part from the first URL element
    var nextElement = firstPart.parent().parent().parent();

    // set partst at 0
    var numParts = 0;

    // cycle through all parts until hr element
    while (nextElement.is('hr') == false) {
        numParts += 1

        var desc = nextElement.text();
        desc = cleanText(desc);
        alexaText += 'Part ' + numParts + ' is:\n\n' + desc + '\n\n';

        nextElement = nextElement.next();
    }

    // format date to be spoken
    var dateSpeak = formatDate(date);

    // start text string
    if (numParts > 1) {
      var alexaPreText = '\nThe workout for ' + dateSpeak + ' has ' + numParts + ' parts:\n\n';
    } else {
      var alexaPreText = '\nThe workout for ' + dateSpeak + ' has ' + numParts + ' part:\n\n';
    }

    // change to past tense if previous workout
    if (differenceInDays(date, todayDate()) > 0) {
      alexaPreText = alexaPreText.replace('has', 'had')
    }

    // post text string
    var alexaPostText = "Good luck. You're awesome."

    // concatenate string
    alexaText = alexaPreText + alexaText + alexaPostText;
    alexaText = crossfitAbb(alexaText);

    // send back alexaText
    return alexaText;
}

// today
function todayDate() {
    var today = new Date();
    var dd = today.getDate();
    var mm = today.getMonth() + 1;
    var yyyy = today.getFullYear();

    if (dd < 10) {
        dd = '0' + dd;
    }

    if (mm < 10) {
        mm = '0' + mm;
    }

    return yyyy + '-' + mm + '-' + dd;
}

// difference in days of two date strings
function differenceInDays(dateString1, dateString2) {
    var rDateObj = new Date(dateString1);
    var tDateObj = new Date(dateString2);
    var difference = tDateObj.getTime() - rDateObj.getTime()
    var differenceDays = Math.ceil(difference / (1000 * 3600 * 24));
    return differenceDays;
}

// verify not in far future
// AMAZON.DATE if not specified automatically
// assumes future date
function verifyDate(dateRequested) {
    var differenceDays = differenceInDays(dateRequested, todayDate());
    var yearRequested = dateRequested.slice(0, 4);

    // if requested date is > 30 days in future
    // it is actually a request for the past
    if (differenceDays < -30) {
        return parseInt(yearRequested) - 1 + dateRequested.slice(4);
    } else {
        return dateRequested;
    }
}
