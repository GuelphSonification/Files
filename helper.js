var audioGraph;
var playing = 0;

/**
 * Creates a new audio graph object based on the function specified.
 * Creates a button to play the audio graph.
 *
 * @param	expression	the function to base the audio graph on as a string
 * @param	duration	length of the audio graph playback in seconds
 * @param	div			div to create the button on
 */
function addAudioGraph(expression, duration, div) {
	audioGraph = new AudioGraph({type:"URL", value:expression});
	var container = document.getElementById(div);

    function tempFunc() { this.ding = null; this.onDone = function(ding) {audioGraph.ding = ding; }; } 
    temp = new tempFunc();
	loadDing(temp);

	var button = document.createElement("h3");
	button.innerHTML = "Play";
	button.id = expression;
	button.className = "PlayButton";
	button.onclick = function() { // Note this is a function
        if (!playing) {
            playing = 1;
            document.getElementById(expression).className = "PlayButtonDeactivated";
            audioGraph.play(duration);
            setTimeout(function(){
                playing = 0;
                document.getElementById(expression).className = "PlayButton";
            }, duration*1000);
        }
	};
	writeStyle();

	container.appendChild(button);
}

function callback(id, data) {
    document.getElementById(id).style.display = "block";
    audioGraph.setValues(data);
}



/**
 * Writes <style> tags to the document.
 */
function writeStyle() {	
	var text = 
        ["<style>",
		 "h3.PlayButton {",
		     "display: none;",
		     "font-size: 1.17em;",
			 "background-color: grey;",
			 "color: white;",
			 "border: solid 2px black;",
			 "border-radius: 5px;",
			 "cursor: pointer;",
			 "padding-left: 0.4em;",
			 "width: 2.5em;",
         "}",
		 "h3.PlayButton:hover {",
		     "background-color: white;",
			 "color: grey;",
         "}",
         "h3.PlayButtonDeactivated {",
		     "display: none;",
		     "font-size: 1.17em;",
             "background-color: white;",
             "color: grey;",
			 "border: solid 2px black;",
			 "border-radius: 5px;",
			 "cursor: pointer;",
			 "padding-left: 0.4em;",
			 "width: 2.5em;",
         "}",
		 "</style>"].join('\n');
	document.write(text);
}
