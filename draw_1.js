function DrawableAudioGraph() {
    //for the screen coordinates (x, y)
    var lowX;
    var highX;
    var topY;
    var bottomY;
    var offset = 250;

    var yArr = []; //will keep all the relative y coordinates

    var acceptable = 0.001; //Maximum distance between two y values
    var increment = 0.1; //step on the x value for the interpolation

    var jString;
    
    //define and resize canvas
    document.getElementById("content").style.height = window.innerHeight - this.offset;
    var canvas = '<canvas id="canvas" width="' + window.innerWidth + '" height="' + (window.innerHeight - this.offset) + '"></canvas>';
    document.getElementById("content").innerHTML = canvas;

    // setup canvas
    var ctx = document.getElementById("canvas").getContext("2d");
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 5;
    ctx.fillStyle = "#F0F0F0";
    ctx.fillRect(0, 0, window.innerWidth, window.innerHeight - this.offset);

    // setup to trigger drawing on mouse or touch
    this.addTouchListeners();
    this.addClickListeners();
}


/**
 * Input listeners, but with touch.
 */
DrawableAudioGraph.prototype.addTouchListeners = function() {
    var clicked = 0;
    var canvas = document.getElementById("canvas");
    
    //When the user touches the screen
    let start = (e) => {
        clicked = 1;
        this.ctx.beginPath();
        x = e.changedTouches[0].pageX - this.offsetLeft;
        y = e.changedTouches[0].pageY - this.offsetTop;

        lowX = x; //Left most x value
        bottomY = 0;
        topY = window.innerHeight - this.offset;

        ctx.moveTo(x, y);

        lastY = y;
    };

    var lastX = 0;
    var lastY;
    
    //According to the user's move, it will save the coordinates
    let move = (e) => {
        if (clicked) {
            e.preventDefault();

            x = e.changedTouches[0].pageX - this.offsetLeft;
            y = e.changedTouches[0].pageY - this.offsetTop;

            if (x >= lastX) {
                this.ctx.lineTo(x, y);
                this.ctx.stroke();

                this.highX = x; //This will be the right most x value
                
                //This part is to keep track of the lowest and highest y values
                if (y > bottomY)
                    this.bottomY = y;
                if (y < topY)
                    this.topY = y;

                lastX = x;

                if (Math.abs(lastY - y) >= 0.001) //Not to push too close values    
                    yArr.push(y);
            }
        }
    };
    
    //Will remove the listener components when the user stops the movements
    let stop = (e) => {
        clicked = 0;
        canvas.removeEventListener("touchstart", start, false); //Start listener
        canvas.removeEventListener("touchmove", move, false); //Move listener
        document.removeEventListener("touchend", stop, false); //end
        sonify();
    };

    //Will add listener components
    canvas.addEventListener("touchstart", start, false); //Start listener
    canvas.addEventListener("touchmove", move, false); //move listener
    document.addEventListener("touchend", stop, false); //end
};


/**
 * Input listeners, but with touch.
 */
DrawableAudioGraph.prototype.addClickListeners = function() {
    var clicked = 0;
    var canvas = document.getElementById("canvas");

    //When the user touches the screen
    let start = (e) => {
        clicked = 1;
        this.ctx.beginPath();
        x = e.pageX - this.offsetLeft;
        y = e.pageY - this.offsetTop;

        this.lowX = x; //Left most x value
        this.bottomY = 0;
        this.topY = window.innerHeight - this.offset;

        this.ctx.moveTo(x, y);

        this.lastY = y;
    };

    var lastX = 0;
    var lastY;
    
    //According to the user's move, it will save the coordinates
    let move = (e) => {
        if (clicked) {
            x = e.pageX - this.offsetLeft;
            y = e.pageY - this.offsetTop;

            if (x >= this.lastX) {
                this.ctx.lineTo(x, y);
                this.ctx.stroke();

                this.highX = x; //This will be the right most x value
                
                //This part is to keep track of the lowest and highest y values
                if (y > this.bottomY)
                    this.bottomY = y;
                if (y < this.topY)
                    this.topY = y;

                this.lastX = x;

                if (Math.abs(this.lastY - y) >= 0.016)
                    this.yArr.push(y);
            }
        }
    };

    let stop = (e) => {
        clicked = 0;
        canvas.removeEventListener("mousedown", start, false); //Start listener
        canvas.removeEventListener("mousemove", move, false); //Move listener
        document.removeEventListener("mouseup", stop, false); //end
        sonify();
    };

    canvas.addEventListener("mousedown", start, false); //Start listener
    canvas.addEventListener("mousemove", move, false); //move listener
    document.addEventListener("mouseup", stop, false); //stop listener
}


/**
 * Draws the line on the canvas, then calls generateJSON at the end.
 * (Should be split up.
 */
DrawableAudioGraph.prototype.sonify = function() {
    var c = document.getElementById("canvas");
    var ctxRec = c.getContext("2d");

    ctxRec.beginPath();
    ctxRec.strokeStyle = "#0066FF";
    ctxRec.lineWidth = 2;
    ctxRec.fillStyle = "#F0F0F0";
    ctxRec.rect(this.lowX, this.topY, this.highX - this.lowX, this.bottomY - this.topY);
    ctxRec.stroke();

    distY = this.bottomY - this.topY; //Vertical distance
    distX = this.highX - this.lowX; //Horizontal distance

    //Will draw horizontal line inside the rectangle
    ctxRec.beginPath();
    ctxRec.moveTo(this.lowX, this.topY + distY / 2); 
    ctxRec.lineTo(this.highX, this.topY + distY / 2);
    ctxRec.stroke();

    //Will draw vertical line inside the rectangle
    ctxRec.beginPath();
    ctxRec.moveTo(this.lowX + distX / 2, this.bottomY);
    ctxRec.lineTo(this.lowX + distX / 2, this.topY);
    ctxRec.stroke();

    generateJSON();
}


/**
 * Generates the JSON object to be sonified.
 */
DrawableAudioGraph.prototype.generateJSON = function() {
    var norm = Math.abs(this.bottomY - this.topY); //Distance between lowest and highest points

    var xAxis = norm / 2 + this.topY; //Reference of the horizontal axis

    var minVal = 0;
    var maxVal = 0;
    
    
    for (var i = 0; i < yArr.length; i++) {
        if (this.yArr[i] > xAxis) {
            this.yArr[i] = (Math.abs(this.yArr[i] - xAxis) / (norm * -1));
        } else {
            this.yArr[i] = (Math.abs(this.yArr[i] - xAxis) / (norm));
        }
        
        if (this.yArr[i] < minVal)
            minVal = this.yArr[i];
        if (this.yArr[i] > maxVal)
            maxVal = this.yArr[i];
    }
    
    //Array with interpolation values
    var fullValues = [];

    fullValues.push(this.yArr[0]);

    for (var i = 1; i < this.yArr.length; i++) {
        if (Math.abs(this.yArr[i] - this.yArr[i - 1]) >= acceptable) { //in case the distance is not acceptable
            perfomInterpolation(this.yArr[i - 1], this.yArr[i], fullValues); //will push interpolated values
        } else {
            fullValues.push(this.yArr[i]); //in case the values are good enough
        }
    }
    
    console.log("size yArr = " + this.yArr.length);
    console.log("size fullArray = " + fullValues.length);

    var jsonString = {maxVal: maxVal, minVal: minVal, values: fullValues};

    console.log(fullValues);

    audioGraph = new AudioGraph({type: "RAW", value: jsonString});

    audioGraph.play(3);
}


/**
 * Performs interpolation.
 */
function perfomInterpolation(previous, current, fullValues) {
    /*Horizontal coordinates*/
    var x1 = 0;
    var x2 = 0;
    var x3 = 1;
    
    /*Vertical coordinates*/
    var y1 = previous;
    var y2;
    var y3 = current;
    
    var keep = true;
    
    x2 += increment;
    
    while(keep) {        
        y2 = ((x2 - x1) * (y3 - y1)) / (x3 - x1) + y1; //Function to get interpolated value
        
        fullValues.push(y2);
        
        if(Math.abs(y2 - y1) <= acceptable)
            keep = false;
        else if (x2 >= x3)
            keep = false;
        
        x2 += increment;
    }
    
    fullValues.push(y3);
}
