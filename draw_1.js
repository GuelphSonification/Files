function DrawableAudioGraph() {
    //for the screen coordinates (x, y)
    this.lowX;
    this.highX;
    this.topY;
    this.bottomY;
    this.lastY;
    this.lastX = 0;

    this.offset = 250;

    this.clicked = 0;
    this.yArr = []; //will keep all the relative y coordinates

    this.acceptable = 0.001; //Maximum distance between two y values
    this.increment = 0.1; //step on the x value for the interpolation

    this.jString;
    
    //define and resize canvas
    document.getElementById("content").style.height = window.innerHeight - this.offset;
    this.canvas = '<canvas id="canvas" width="' + window.innerWidth + '" height="' + (window.innerHeight - this.offset) + '"></canvas>';
    document.getElementById("content").innerHTML = this.canvas;

    // setup canvas
    this.ctx = document.getElementById("canvas").getContext("2d");
    this.ctx.strokeStyle = "#000";
    this.ctx.lineWidth = 5;
    this.ctx.fillStyle = "#F0F0F0";
    this.ctx.fillRect(0, 0, window.innerWidth, window.innerHeight - this.offset);

    this.audioGraph;

    // setup to trigger drawing on mouse or touch
    this.addTouchListeners();
    this.addClickListeners();
}


/**
 * Input listeners, but with touch.
 */
DrawableAudioGraph.prototype.addTouchListeners = function() {
    var canvas = document.getElementById("canvas");
    
    var that = this;
         
    //When the user touches the screen
    var start = function(e) {
        that.clicked = 1;
        that.ctx.beginPath();
        var x = e.changedTouches[0].pageX - this.offsetLeft;
        var y = e.changedTouches[0].pageY - this.offsetTop;

        lowX = x; //Left most x value
        bottomY = 0;
        topY = window.innerHeight - that.offset;

        ctx.moveTo(x, y);

        lastY = y;
    };
    
    //According to the user's move, it will save the coordinates
    var move = function(e) {
        if (that.clicked) {
            e.preventDefault();

            var x = e.changedTouches[0].pageX - this.offsetLeft;
            var y = e.changedTouches[0].pageY - this.offsetTop;

            if (x >= lastX) {
                that.ctx.lineTo(x, y);
                that.ctx.stroke();

                that.highX = x; //This will be the right most x value
                
                //This part is to keep track of the lowest and highest y values
                if (y > bottomY)
                    that.bottomY = y;
                if (y < topY)
                    that.topY = y;

                lastX = x;

                if (Math.abs(lastY - y) >= 0.001) //Not to push too close values    
                    yArr.push(y);
            }
        }
    };
    
    //Will remove the listener components when the user stops the movements
    var stop = function(e) {
        that.clicked = 0;
        canvas.removeEventListener("touchstart", start, false); //Start listener
        canvas.removeEventListener("touchmove", move, false); //Move listener
        document.removeEventListener("touchend", stop, false); //end
        that.sonify();
        that.generateJSON();
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
    var canvas = document.getElementById("canvas");
    
    var that = this;

    //When the user touches the screen
    var start = function(e) {
        that.clicked = 1;
        console.log("Clicked - " + that.clicked);
        that.ctx.beginPath();
        var x = e.pageX - this.offsetLeft;
        var y = e.pageY - this.offsetTop;
        
        that.lowX = x; //Left most x value
        that.bottomY = 0;
        that.topY = window.innerHeight - that.offset;
        
        that.ctx.moveTo(x, y);
        
        that.lastY = y;
    };
    
    //According to the user's move, it will save the coordinates
    var move = function(e) {
        if (that.clicked) {
            console.log("Moved");
            var x = e.pageX - this.offsetLeft;
            var y = e.pageY - this.offsetTop;

            if (x >= that.lastX) {
                that.ctx.lineTo(x, y);
                that.ctx.stroke();

                that.highX = x; //This will be the right most x value
                
                //This part is to keep track of the lowest and highest y values
                if (y > that.bottomY)
                    that.bottomY = y;
                if (y < that.topY)
                    that.topY = y;

                that.lastX = x;

                if (Math.abs(that.lastY - y) >= 0.016) {
                    that.yArr.push(y);
                    console.log("asdf");
                }
            }
        }
    };

    var stop = function(e) {
        that.clicked = 0;
        console.log("Stopped - " + this.clicked);
        canvas.removeEventListener("mousedown", start, false); //Start listener
        canvas.removeEventListener("mousemove", move, false); //Move listener
        document.removeEventListener("mouseup", stop, false); //end
        that.sonify();
        that.generateJSON();
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

    var distY = this.bottomY - this.topY; //Vertical distance
    var distX = this.highX - this.lowX; //Horizontal distance

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
}


/**
 * Generates the JSON object to be sonified.
 */
DrawableAudioGraph.prototype.generateJSON = function() {
    var norm = Math.abs(this.bottomY - this.topY); //Distance between lowest and highest points

    var xAxis = norm / 2 + this.topY; //Reference of the horizontal axis

    var minVal = 0;
    var maxVal = 0;
    
    
    for (var i = 0; i < this.yArr.length; i++) {
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
        if (Math.abs(this.yArr[i] - this.yArr[i - 1]) >= this.acceptable) { //in case the distance is not acceptable
            perfomInterpolation(this.yArr[i - 1], this.yArr[i], fullValues); //will push interpolated values
        } else {
            fullValues.push(this.yArr[i]); //in case the values are good enough
        }
    }
    
    console.log("size yArr = " + this.yArr.length);
    console.log("size fullArray = " + fullValues.length);

    var jsonString = {maxVal: maxVal, minVal: minVal, values: fullValues};

    console.log(fullValues);

    this.audioGraph = new AudioGraph({type: "RAW", value: jsonString});

    this.audioGraph.play(3);
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
        
        if(Math.abs(y2 - y1) <= this.acceptable)
            keep = false;
        else if (x2 >= x3)
            keep = false;
        
        x2 += increment;
    }
    
    fullValues.push(y3);
}
