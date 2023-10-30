let capturing = false;
let capturer = null;

function ExportGifListener(){
    const canvas = document.getElementById('drawingSurface');


     
    //  capturer = new CCapture({
    //     format: 'webm',
    //     framerate: 60,
    //     timeLimit: 1.0, //record exactly one loop
    //     display: true,
    // });
    capturer = new CCapture({
        format: 'gif',
       framerate: 60,
       width: canvas.width,
       height: canvas.height,
       workersPath: 'lib/',
       transparent: true
    });

    // capturer = new CCapture({ format: 'webm' });

    document.addEventListener('keydown', function(event) {
        if(event.key === 'r' || event.key === 'R') {
            capturing = !capturing;
            
            if (capturing) {
                capturer.start();
                // if want transparent set background
                renderer.setClearColor( 0x000000, 0 );
                updateScene();
                console.log("starting capture");
            } else {
                console.log("stopping capture");
                capturer.stop();
                console.log("stopped");
                renderer.setClearColor( 0x000000);
                updateScene();
                    console.log("saving");
                    capturer.save();
                    console.log("saved");
            }
        }
    });

    document.getElementById('capture-btn').addEventListener('click', function() {

        console.log(canvas.width, canvas.height);
        console.log("export");
    
        capturing = !capturing;

     
    
if (capturing) {
    capturer.start();
    console.log("starting capture");
} else {
    console.log("stopping capture");
    capturer.stop();
    console.log("stopped");
    setTimeout(() => {
        console.log("saving");
        capturer.save();
        console.log("saved");
    }, 1000);  // A delay of 1 second
}

    });
    
}





function TotalAnimTime() {
    const diffInMilliseconds = animOver - animStart;

// Convert milliseconds to seconds
const diffInSeconds = diffInMilliseconds / 1000;
console.log(diffInSeconds);
return diffInMilliseconds;
}


let frames = [];
let maxFrames = 10;  // Number of frames to capture

function captureFrame() {
  renderer.render(scene, camera);
  let dataURL = renderer.domElement.toDataURL();
  frames.push(dataURL);
}
function assembleSpriteSheet() {
    let loadedFrames = 0;
    let canvas = document.createElement('canvas');
    let ctx = canvas.getContext('2d');
    
    canvas.width = renderer.domElement.width * maxFrames;
    canvas.height = renderer.domElement.height;
  
    // A function to draw a single frame onto the canvas.
    function drawFrame(index) {
      if (index >= frames.length) {
        // All frames are drawn, now generate the download link.
        let dataURL = canvas.toDataURL('image/png');
        let downloadLink = document.createElement('a');
        downloadLink.href = dataURL;
        downloadLink.download = 'spritesheet.png';
        downloadLink.click();
        renderer.setClearColor(0x000000);
        updateScene(); 
        return;
      }
  
      let img = new Image();
      img.onload = function() {
        ctx.drawImage(img, index * renderer.domElement.width, 0);
        drawFrame(index + 1); // Draw the next frame.
      };
      img.src = frames[index];
    }
  
    drawFrame(0); // Start the drawing process.
  }

function CaptureAndAssembly(totalFrames, timePerFrame) {
    let interval = 1000;  // Capture every 1 second
let counter = 0;

interval = timePerFrame;
maxFrames = totalFrames;

let captureInterval = setInterval(() => {
  if (counter >= maxFrames) {
    clearInterval(captureInterval);
    console.log("assembling spritesheet");
    assembleSpriteSheet();
    return;
  }

  console.log("captureFrame");
  captureFrame();
  counter++;
}, interval);
}

let animStart;
let animOver;
function ExportSpriteSheet() {
    
    document.getElementById('export-sprite-sheet').addEventListener('click', function() {
        console.log("clickedExport");
        
        play();
        
        renderer.setClearColor( 0x000000, 0 ); 

        let totalFrames = 5;
        let timePerFrame = 100;
        
            // make sure to play once to time it
        totalTime = cacheAnimationTime;
        
        totalFrames = totalTime/timePerFrame;
        totalFrames +=1; //for looping at the end;

        console.log(cacheAnimationTime);
        CaptureAndAssembly(totalFrames, timePerFrame);
        
    });
}

function Modes() {
    console.log("modes");
    $('#newHandleMode').click(function(event) {
        let circle = document.querySelector("#newHandleMode circle");

        // Get the fill attribute of the circle
        if (newHandleMode) {
            let fillValue = circle.getAttribute("fill");
            circle.setAttribute("fill", "#222222");
        } else {
            let fillValue = circle.getAttribute("fill");
            circle.setAttribute("fill", "rgb(255, 0, 68)");
        }
        
        newHandleMode = !newHandleMode;

    });
     
}

if (document.readyState === "loading") {  // If document is still loading
    document.addEventListener("DOMContentLoaded", ExportGifListener);
    document.addEventListener("DOMContentLoaded", ExportSpriteSheet);
    document.addEventListener("DOMContentLoaded", Modes);
} else {  // If document is already loaded
    ExportGifListener();
    ExportSpriteSheet();
    Modes();
}