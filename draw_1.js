
var ctx, color = "#000";
var offset = 250;

//for the screen coordinates (x, y)
var lowX;
var highX;
var topY;
var bottomY;

var yArr = []; //will keep all the relative y coordinates

var acceptable = 0.001; //Maximum distance between two y values
var increment = 0.1; //step on the x value for the interpolation

var jString;

function start() {

    document.addEventListener("DOMContentLoaded", function () {
        // setup a new canvas for drawing wait for device init
        setTimeout(function () {
            newCanvas();
        }, 1000);

    }, false);

}

// function to setup a new canvas for drawing
function newCanvas() {
    //define and resize canvas
    document.getElementById("content").style.height = window.innerHeight - offset;
    var canvas = '<canvas id="canvas" width="' + window.innerWidth + '" height="' + (window.innerHeight - offset) + '"></canvas>';
    document.getElementById("content").innerHTML = canvas;

    // setup canvas
    ctx = document.getElementById("canvas").getContext("2d");
    ctx.strokeStyle = color;
    ctx.lineWidth = 5;
    ctx.fillStyle = "#F0F0F0";
    ctx.fillRect(0, 0, window.innerWidth, window.innerHeight - offset);


    // setup to trigger drawing on mouse or touch
    drawTouch();
    drawLine(); //Not suitable for use in Internet Explorer
}

function selectColor(el) {
    el.style.borderColor = "#fff";
    el.style.borderStyle = "dashed";
    color = window.getComputedStyle(el).backgroundColor;
    ctx.beginPath();
    ctx.strokeStyle = color;
}

// prototype to	start drawing on touch using canvas moveTo and lineTo
var drawTouch = function () {
    var clicked = 0;
    
    //When the user touches the screen
    var start = function (e) {
        clicked = 1;
        ctx.beginPath();
        x = e.changedTouches[0].pageX - this.offsetLeft;
        y = e.changedTouches[0].pageY - this.offsetTop;

        lowX = x; //Left most x value
        bottomY = 0;
        topY = window.innerHeight - offset;

        ctx.moveTo(x, y);

        lastY = y;
    };

    var lastX = 0;
    var lastY;
    
    //According to the user's move, it will save the coordinates
    var move = function (e) {
        if (clicked) {
            e.preventDefault();

            x = e.changedTouches[0].pageX - this.offsetLeft;
            y = e.changedTouches[0].pageY - this.offsetTop;

            if (x >= lastX) {
                ctx.lineTo(x, y);
                ctx.stroke();

                highX = x; //This will be the right most x value
                
                //This part is to keep track of the lowest and highest y values
                if (y > bottomY)
                    bottomY = y;
                if (y < topY)
                    topY = y;

                lastX = x;

                if (Math.abs(lastY - y) >= 0.001) //Not to push too close values    
                    yArr.push(y);
            }
        }
    };
    
    //Will remove the listener components when the user stops the movements
    var stop = function (e) {
        clicked = 0;
        document.getElementById("canvas").removeEventListener("touchstart", start, false); //Start listener
        document.getElementById("canvas").removeEventListener("touchmove", move, false); //Move listener
        document.removeEventListener("touchend", stop, false); //end
        sonify();
    };

    //Will add listener components
    document.getElementById("canvas").addEventListener("touchstart", start, false); //Start listener
    document.getElementById("canvas").addEventListener("touchmove", move, false); //move listener
    document.addEventListener("touchend", stop, false); //end
};

//Function that will draw the line with 
function drawLine() {
    var clicked = 0;

    //When the user touches the screen
    var start = function (e) {
        clicked = 1;
        ctx.beginPath();
        x = e.pageX - this.offsetLeft;
        y = e.pageY - this.offsetTop;

        lowX = x; //Left most x value
        bottomY = 0;
        topY = window.innerHeight - offset;

        ctx.moveTo(x, y);

        lastY = y;
    };

    var lastX = 0;
    var lastY;
    
    //According to the user's move, it will save the coordinates
    var move = function (e) {

        if (clicked) {
            x = e.pageX - this.offsetLeft;
            y = e.pageY - this.offsetTop;

            if (x >= lastX) {
                ctx.lineTo(x, y);
                ctx.stroke();

                highX = x; //This will be the right most x value
                
                //This part is to keep track of the lowest and highest y values
                if (y > bottomY)
                    bottomY = y;
                if (y < topY)
                    topY = y;

                lastX = x;

                if (Math.abs(lastY - y) >= 0.016)
                    yArr.push(y);
            }
        }
    };

    var stop = function (e) {
        clicked = 0;
        document.getElementById("canvas").removeEventListener("mousedown", start, false); //Start listener
        document.getElementById("canvas").removeEventListener("mousemove", move, false); //move listener
        document.removeEventListener("mouseup", stop, false); //stop  listener
        sonify();
    };

    document.getElementById("canvas").addEventListener("mousedown", start, false); //start listener
    document.getElementById("canvas").addEventListener("mousemove", move, false); //move listener
    document.addEventListener("mouseup", stop, false); //stop listener
}

/*Will make the converstion of the coordinates, from absolute to relative to the shape's rectangle*/
function sonify() {

    var c = document.getElementById("canvas");
    var ctxRec = c.getContext("2d");

    ctxRec.beginPath();
    ctxRec.strokeStyle = "#0066FF";
    ctxRec.lineWidth = 2;
    ctxRec.fillStyle = "#F0F0F0";
    ctxRec.rect(lowX, topY, highX - lowX, bottomY - topY);
    ctxRec.stroke();

    distY = bottomY - topY; //Vertical distance
    distX = highX - lowX; //Horizontal distance

    //Will draw horizontal line inside the rectangle
    ctxRec.beginPath();
    ctxRec.moveTo(lowX, topY + distY / 2); 
    ctxRec.lineTo(highX, topY + distY / 2);
    ctxRec.stroke();

    //Will draw vertical line inside the rectangle
    ctxRec.beginPath();
    ctxRec.moveTo(lowX + distX / 2, bottomY);
    ctxRec.lineTo(lowX + distX / 2, topY);
    ctxRec.stroke();

    generateJSON();

}

//Will generate the JSON object to be sonified
function generateJSON() {
    var norm = Math.abs(bottomY - topY); //Distance between lowest and highest points

    var xAxis = norm / 2 + topY; //Reference of the horizontal axis

    var minVal = 0;
    var maxVal = 0;
    
    
    for (var i = 0; i < yArr.length; i++) {
        if (yArr[i] > xAxis) {
            yArr[i] = (Math.abs(yArr[i] - xAxis) / (norm * -1));
        } else {
            yArr[i] = (Math.abs(yArr[i] - xAxis) / (norm));
        }
        
        if (yArr[i] < minVal)
            minVal = yArr[i];
        if (yArr[i] > maxVal)
            maxVal = yArr[i];
    }
    
    //Array with interpolation values
    var fullValues = [];

    fullValues.push(yArr[0]);

    for (var i = 1; i < yArr.length; i++) {
        if (Math.abs(yArr[i] - yArr[i - 1]) >= acceptable) { //in case the distance is not acceptable
            perfomInterpolation(yArr[i - 1], yArr[i], fullValues); //will push interpolated values
        } else {
            fullValues.push(yArr[i]); //in case the values are good enough
        }
    }
    
    console.log("size yArr = " + yArr.length);
    console.log("size fullArray = " + fullValues.length);

    var jsonString = {maxVal: maxVal, minVal: minVal, values: fullValues};

    console.log(fullValues);

    audioGraph = new AudioGraph({type: "RAW", value: jsonString});

    audioGraph.play(3);

}

/*Will perform the interpolation*/
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

/*Will verifiy if the broswer is valid*/
function validBrowser() {
    var is_chrome = navigator.userAgent.indexOf('Chrome') > -1;
    var is_explorer = navigator.userAgent.indexOf('MSIE') > -1;
    var is_firefox = navigator.userAgent.indexOf('Firefox') > -1;
    var is_safari = navigator.userAgent.indexOf("Safari") > -1;
    var is_opera = navigator.userAgent.indexOf("Presto") > -1;

    var nav;

    if (is_chrome)
        nav = "Chrome";
    if (is_firefox)
        nav = "Firefox";
    if (is_safari)
        nav = "Safari";
    if (is_opera)
        nav = "Opera";

    if (is_explorer) {
        alert("Please, use another browser!");
        exit;
    }

    return 1;
}
