
// RSS feed URL for GRCF
var url = 'https://www.feederninja.com/api/content?type=rss&param=https%3A%2F%2Fbeyondthewhiteboard.com%2Fgyms%2F2755.atom&limit=1000&nextUrl=';

// load https requests lib
var https = require( 'https' );

// make GET req and parse JSON response
https.get( url, function( response ) {

    var data = '';

    response.on( 'data', function( x ) { data += x; } );

    response.on( 'end', function() {

        var json = JSON.parse( data );

        // get number of parts of WOD
        var numParts = json.data.feeds.length;

        // get time stamp and convert
        var unixTimeStamp = json.data.feeds[0].date;
        var dateString = timeConverter(unixTimeStamp);

        // start text string
        var text = 'This workout was posted on ' + dateString + '.\n\n';
        text += 'There are ' + numParts + '.\n\n'

        // loop through parts
        var partCount = 1;
        for(var i = 0; i < numParts - 1; i++) {

        	// get title and desc and clean some
    		var title = json.data.feeds[i].title.trim().replace(':', '');
    		var desc = json.data.feeds[i].desc.trim();

    		// skip if a user post
    		if (title.indexOf('posted')	== -1) {
    	    	text += 'Part ' + partCount + ' is ' + title + ':\n\n' + desc + ' \n\n';
    	    	partCount += 1;
    		};
        };


        console.log(text);

        // output( text, context );

    } );
} );

// https://stackoverflow.com/questions/847185/convert-a-unix-timestamp-to-time-in-javascript
// convert UNIX timestamps
function timeConverter(UNIX_timestamp){
  var a = new Date(UNIX_timestamp * 1000);
  var months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  var days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var year = a.getFullYear();
  var month = months[a.getMonth()];
  var day = days[a.getDay()];
  var date = a.getDate();
  var hour = a.getHours();
  var min = a.getMinutes();
  var time = day + ', ' + month + ' ' + date + ', ' + year + ' at ' + hour + ':' + min;
  return time;
}