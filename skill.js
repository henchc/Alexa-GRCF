exports.handler = function( event, context ) {
    // RSS feed URL for GRCF
    var url = 'https://beyondthewhiteboard.com/gyms/2755-grassroots-crossfit/wods';

    // load https requests lib
    const https = require( 'https' );
    const cheerio = require('cheerio')

    // make GET req and capture response
    https.get( url, function( response ) {

        var data = '';

        response.on( 'data', function( x ) { data += x; } );

        response.on( 'end', function() {

              // load page source
              const $ = cheerio.load(data);

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

              // console.log(alexaText)

              output( text, context );

        } );
    });

    // clean text from divs
    function cleanText(text, title){
        text = text.replace("Show More", "").replace("Show Less", "").replace("View Results", "").replace(title, "").replace(/\s\s+/g, ' ').trim();
        return text;
    }


};

function output( text, context ) {

    var response = {
        outputSpeech: {
            type: "PlainText",
            text: text
        },
        card: {
            type: "Simple",
            title: "GRCF Workout",
            content: text
        },
        shouldEndSession: true
    };

    context.succeed( { response: response } );

}
