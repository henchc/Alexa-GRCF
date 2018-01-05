// RSS feed URL for GRCF
var url = 'https://beyondthewhiteboard.com/gyms/2755-grassroots-crossfit/wods';

// load https requests lib
const https = require( 'https' );
const cheerio = require('cheerio')

// make GET req and parse JSON response
https.get( url, function( response ) {

    var data = '';

    response.on( 'data', function( x ) { data += x; } );

    response.on( 'end', function() {

        const $ = cheerio.load(data);
        var date = $('#track-event-list > h3:nth-child(2)').text().replace(/\s\s+/g, ' ').trim()
        var title = $('#track-event-list > div:nth-child(3) > div.clearfix > div.pull-left > a').text();
        var desc = $('#track-event-list > div:nth-child(3)').text();
        desc = cleanDescription(desc, title);
        console.log(date);
        // $('h3').each(function(i, elem) {
        //   console.log($(this).text());
        // });

      //   var json = JSON.parse( data );

      //   // get number of parts of WOD
      //   var numParts = json.data.feeds.length;

      //   // get time stamp and convert
      //   var unixTimeStamp = json.data.feeds[0].date;
      //   var dateString = timeConverter(unixTimeStamp);

      //   // start text string
      //   var text = 'This workout was posted on ' + dateString + '.\n\n';

      //   // loop through parts
      //   var partCount = 1;
      //   var wod = ''
      //   for (var i = 0; i < numParts - 1; i++) {

      //   	// get title and desc and clean some
    		// var title = json.data.feeds[i].title.trim().replace(':', '');
    		// var desc = json.data.feeds[i].desc.trim();

    		// // skip if a user post
    		// if (title.indexOf('posted')	== -1) {
    	 //    	wod += 'Part ' + partCount + ' is ' + title + ':\n\n' + desc + ' \n\n';
    	 //    	partCount += 1;
    		// }
      //   };

      //   if ((partCount-1) > 1) {
      //   	text += 'There are ' + (partCount-1) + ' parts.\n\n';
      //   } else {
      //   	text += 'There is ' + (partCount-1) + ' part.\n\n';
      //   }


      //   text += wod
      //   text += "You're awesome.\n\n"


      //   console.log(text);

        // output( text, context );

    } );
} );

// https://stackoverflow.com/questions/847185/convert-a-unix-timestamp-to-time-in-javascript
// convert UNIX timestamps
function timeConverter(UNIX_timestamp){
  var a = new Date(UNIX_timestamp * 1000);
  var months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  var days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var time = days[a.getDay()] + ', ' + months[a.getMonth()] + ' ' + a.getDate() + ', ' + a.getFullYear() + ' at ' + a.getHours() + ':' + a.getMinutes();
  return time;
}

function cleanDescription(desc, title){
    desc = desc.replace("Show More", "").replace("Show Less", "").replace("View Results", "").replace(title, "").replace(/\s\s+/g, ' ').trim();

    return desc;
}