window.onload = init;
var context;
var bufferLoader;

function init() {
    // Fix up prefixing
    window.AudioContext = window.AudioContext || window.webkitAudioContext;
    context = new AudioContext();

    // Load buffer asynchronously
    var request = new XMLHttpRequest();
    request.open("GET", 'http://guelphsonification.github.io/Files/ding.wav', true);
    request.responseType = "arraybuffer";

    request.onload = function() {
        // Asynchronously decode the audio file data in request.response
        context.decodeAudioData(
            request.response,
            function(buffer) {
                var source1 = context.createBufferSource();
                source1.buffer = buffer;

                source1.connect(context.destination);
                source1.start(0);
            },
            function(error) {
                console.error('decodeAudioData error', error);
            }
        );
    }

    request.onerror = function() {
        alert('BufferLoader: XHR error');
    }

    request.send();
}
