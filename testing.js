
var url = 'https://www.feederninja.com/api/content?type=rss&param=https%3A%2F%2Fbeyondthewhiteboard.com%2Fgyms%2F2755.atom&limit=10&nextUrl=';
var http = require( 'https' );

http.get( url, function( response ) {

    var data = '';

    response.on( 'data', function( x ) { data += x; } );

    response.on( 'end', function() {

        var json = JSON.parse( data );

        var numParts = json.data.feeds.length
        var date = json.data.feeds[0].date;

        var text = '';
        var partCount = 1
        for(var i = 0; i < numParts - 1; i++) {

    		var title = json.data.feeds[i].title;
    		var desc = json.data.feeds[i].desc;

    		if (title.indexOf('posted')	== -1) {
    	    	text += 'Part ' + partCount + ' is ' + title + ': ' + desc + ' \n';
    	    	partCount += 1
    		};

        };


        // console.log(text)

        output( text, context );

    } );
} );