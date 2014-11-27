
var ctx, color = "#000";
var offset = 250;

var lowX;
var highX;
var topY;
var bottomY;

var yArr = [];

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
   // drawPointer();
    //drawMouse();
     drawLine();
}

var drawTouch = function () {
    var clicked = 0;
    
    var start = function (e) {
        clicked = 1;
        ctx.beginPath();
        x = e.changedTouches[0].pageX - this.offsetLeft;
        y = e.changedTouches[0].pageY - this.offsetTop;
        
        lowX = x;
        bottomY = 0;
        topY = window.innerHeight - offset;

        ctx.moveTo(x, y);

        lastY = y;
    };
    
    var lastX = 0;
    var lastY;
    
    var move = function (e) {
        if (clicked) {
            e.preventDefault();
            
            x = e.changedTouches[0].pageX - this.offsetLeft;
            y = e.changedTouches[0].pageY - this.offsetTop;

            if (x >= lastX) {
                ctx.lineTo(x, y);
                ctx.stroke();

                highX = x;

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
        document.getElementById("canvas").removeEventListener("touchstart", start, false);
        document.getElementById("canvas").removeEventListener("touchmove", move, false);
        document.removeEventListener("touchend", stop, false);
        sonify();
    };

    document.getElementById("canvas").addEventListener("touchstart", start, false);
    document.getElementById("canvas").addEventListener("touchmove", move, false);
    document.addEventListener("touchend", stop, false);
};

function selectColor(el) {
    el.style.borderColor = "#fff";
    el.style.borderStyle = "dashed";
    color = window.getComputedStyle(el).backgroundColor;
    ctx.beginPath();
    ctx.strokeStyle = color;
}

function drawLine() {
    var clicked = 0;
    
    var start = function (e) {
        clicked = 1;
        ctx.beginPath();
        x = e.pageX - this.offsetLeft;
        y = e.pageY - this.offsetTop;
        
        lowX = x;
        bottomY = 0;
        topY = window.innerHeight - offset;
        
        ctx.moveTo(x, y);
        
        lastY = y;
    };
    
    var lastX = 0;
    var lastY;
    
    var move = function (e) {
        
        if (clicked) {
            x = e.pageX - this.offsetLeft;
            y = e.pageY - this.offsetTop;
            
            if(x >= lastX) {
                ctx.lineTo(x, y);
                ctx.stroke();

                highX = x;

                if(y > bottomY)
                    bottomY = y;
                if(y < topY)
                    topY = y;
                
                lastX = x;
                
                if(Math.abs(lastY - y) >= 0.016)
                    yArr.push(y);
            }
        }
    };
    
    var stop = function (e) {
        clicked = 0;
        document.getElementById("canvas").removeEventListener("mousedown", start, false);
        document.getElementById("canvas").removeEventListener("mousemove", move, false);
        document.removeEventListener("mouseup", stop, false);
        sonify();
    };

    document.getElementById("canvas").addEventListener("mousedown", start, false);
    document.getElementById("canvas").addEventListener("mousemove", move, false);
    document.addEventListener("mouseup", stop, false);
}

function sonify() {
    //alert("It's going to sonify");
    //alert("lowX: " + lowX + " highX: " + highX + " topY " + topY + " bottomY: " + bottomY);
    
    var c = document.getElementById("canvas");
    var ctxRec = c.getContext("2d");
    
    ctxRec.beginPath();
    ctxRec.strokeStyle = "#0066FF";
    ctxRec.lineWidth = 2;
    ctxRec.fillStyle = "#F0F0F0";
    ctxRec.rect(lowX,topY,highX - lowX,bottomY - topY);
    ctxRec.stroke();
    
    distY = bottomY - topY;
    distX = highX - lowX;
    
    ctxRec.beginPath();
    ctxRec.moveTo(lowX, topY + distY / 2);
    ctxRec.lineTo(highX, topY + distY / 2);
    ctxRec.stroke();
    
    ctxRec.beginPath();
    ctxRec.moveTo(lowX + distX / 2, bottomY);
    ctxRec.lineTo(lowX + distX / 2, topY);
    ctxRec.stroke();
    
    generateJSON();
    
}

function generateJSON() {
    var stringA = "";
    
    var norm = Math.abs(bottomY - topY);
    
    var xAxis = norm/2 + topY;
    
    var minVal = 0;
    var maxVal = 0;
    
    stringA = "[";
    
    for(var i = 0; i < yArr.length; i++) {
        if(yArr[i] > xAxis) {
            yArr[i] = 100 * parseFloat(Math.abs(yArr[i] - xAxis) / (norm * -1)).toFixed(4);
        } else {
            yArr[i] = 100 * parseFloat(Math.abs(yArr[i] - xAxis) / (norm)).toFixed(4);
        }
        
        if(yArr[i] < minVal)
            minVal = yArr[i];
        if(yArr[i] > maxVal)
            maxVal = yArr[i];
    }
    
    /*for(var i = 0; i < yArr.length; i++) {
        if(i < (yArr.length - 1))
            stringA += yArr[i] + ",";
        else
            stringA += yArr[i] + "]";
        
    }
    
    var jsonString = 'callback("f1", {' +
            '"maxVal":' + maxVal + ',' +
            '"minVal":' + minVal + ',' +
            '"values":' + stringA + '});';*/
    
    var jsonString = { maxVal : maxVal, minVal : minVal, values:yArr};
    
    
    
    audioGraph = new AudioGraph({type:"RAW", value:jsonString});
    
    //audioGraph = new AudioGraph("jsonString");
    audioGraph.play(4);
    
}

function getJSON() {
    return jString;
}

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
