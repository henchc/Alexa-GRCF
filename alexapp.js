exports.handler = function( event, context ) {



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
