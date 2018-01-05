
var url = 'https://www.feederninja.com/api/content?type=rss&param=https%3A%2F%2Fbeyondthewhiteboard.com%2Fgyms%2F2755.atom&limit=1000&nextUrl=';
var https = require( 'https' );

https.get( url, function( response ) {

    var data = '';

    response.on( 'data', function( x ) { data += x; } );

    response.on( 'end', function() {

        var json = JSON.parse( data );

        var numParts = json.data.feeds.length;
        var unixTimeStamp = json.data.feeds[0].date;
        var dateString = timeConverter(unixTimeStamp);

        var text = 'This workout was posted on ' + dateString + '. ';
        var partCount = 1
        for(var i = 0; i < numParts - 1; i++) {

    		var title = json.data.feeds[i].title.trim();
    		var desc = json.data.feeds[i].desc.trim();

    		if (title.indexOf('posted')	== -1) {
    	    	text += 'Part ' + partCount + ' is ' + title + ': ' + desc + ' \n';
    	    	partCount += 1
    		};

        };


        console.log(text)

        // output( text, context );

    } );
} );

// https://stackoverflow.com/questions/847185/convert-a-unix-timestamp-to-time-in-javascript
function timeConverter(UNIX_timestamp){
  var a = new Date(UNIX_timestamp * 1000);
  var months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  var days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  var year = a.getFullYear();
  var month = months[a.getMonth()];
  var day = days[a.getDay()];
  var date = a.getDate();
  var hour = a.getHours();
  var min = a.getMinutes();
  var time = day + ', ' + month + ' ' + date + ', ' + year + ' at ' + hour + ':' + min;
  return time;
}