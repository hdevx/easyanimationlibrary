let ANIMATIONS = []; //global animations storage to only be added to, never replaced 

let isAnimating = false;
// Array to store key frames
let keyFrames = [];
let currentFrameIndex = 0;

let cacheAnimationTime;

function lerp(start, end, alpha) {
    return start + (end - start) * alpha;
  }

  function play() {
    if (isAnimating) {return;}
    isAnimating = true;
    console.log("play");
    animStart = new Date();
    currentFrameIndex = 0;
    animateFrames();
  
  //     let prevTime = 0;
  
  //     keyFrames.forEach((frameSet, index) => {
  //       const delay = index === 0 ? 0 : frameSet[0].time - prevTime;
  //       prevTime = frameSet[0].time;
      
  //       setTimeout(() => {
  //         // Inside your setTimeout
  
  //         frameSet.forEach((frame, i) => {
  // console.log("Setting handle to position: ", frame.position);
  
  //           const handle = handles[i];
  //           // Use Tween.js or requestAnimationFrame for smooth transition
  //           // For example, using Tween.js:
  //           new TWEEN.Tween(handle.position)
  //             .to({ x: frame.position.x, y: frame.position.y, z: frame.position.z }, 500)
  //             .start();
  //         });
  //       }, delay);
  //     }); 
  function animateFrames() {
    if (currentFrameIndex < keyFrames.length - 1) {
      const startFrames = keyFrames[currentFrameIndex];
      const endFrames = keyFrames[currentFrameIndex + 1];
      let alpha = 0;
  
      function animate() {
        alpha += anim_speed; // Speed of the animation
        // 
        if (alpha >= 1) {
          currentFrameIndex++;
          if (currentFrameIndex < keyFrames.length - 1) {
            requestAnimationFrame(animateFrames);
          } else {
            console.log("anim over");
            animOver = new Date();
            cacheAnimationTime = TotalAnimTime();
            isAnimating = false;
          }
          return;
        }
  
        startFrames.forEach((startFrame, i) => {
          const endFrame = endFrames[i];
          const handle = handles[i];
          
          handle.position.x = lerp(startFrame.position.x, endFrame.position.x, alpha);
          handle.position.y = lerp(startFrame.position.y, endFrame.position.y, alpha);
          handle.position.z = lerp(startFrame.position.z, endFrame.position.z, alpha);
        });
        
        // console.log("setting handle poisiton");
        newVertices = manipulation(handles,edges,originalVertices);
        for (var i = 0; i < newVertices.length; i++) {
          model.geometry.vertices[i].x = newVertices[i].x;
          model.geometry.vertices[i].y = newVertices[i].y;
        }
  
        model.geometry.verticesNeedUpdate = true;
        
        // handles[0].position.y = 1; 
        updateScene();

        // renderer.render(scene, camera);
        requestAnimationFrame(animate);
      }
  
      animate();
    }

    }

  }




setTimeout(function() {
  // loaded();

  console.log("add");
  
  // Play animation
  
  document.getElementById('playButton').addEventListener('click', function () {
    play();
  });
  
  
  
  //move to keyframes js
  $('.captureKeyframe').click(function(event) {
      if (!alreadyClickedCaptureButton) {
        keyFrames = [];
        alreadyClickedCaptureButton = true;
      }
      console.log("capute keyfrane");
      updateScene();
      var webglImage = (function convertCanvasToImage(canvas) {
        var image = new Image(canvas.width/10,canvas.height/10);
        image.src = canvas.toDataURL('image/png');
        return image;
      })(document.querySelectorAll('canvas')[0]);
      
      // old keyframes system
      var frame = new Frame(cloneVertices(model.geometry.vertices),cloneHandles(handles),noFrame);
      frames.push(frame);
      noFrame++;
  
      $('.framesContainer').prepend(webglImage);
      updateFrameListeners();
      
  
      const currentFrames = handles.map(handle => ({
          position: handle.position.clone(),
          time: new Date().getTime()
        }));
      keyFrames.push(currentFrames);
  
    });
    
    function updateFrameListeners(){
      $('.framesContainer > img').click(function(event) { 
        for (var i = 0; i < frames[$(this).index()].vertices.length; i++) {
          model.geometry.vertices[i].x = frames[$(this).index()].vertices[i].x;
          model.geometry.vertices[i].y = frames[$(this).index()].vertices[i].y;
          deformedVertices = cloneVertices(model.geometry.vertices);
        }
        model.geometry.verticesNeedUpdate = true;
        
        let oldHandles = [];
        // handles.forEach(function(handle, index) {
        //   oldHandles.push(handle.position);
        // });

         for (var i = 0; i < frames[$(this).index()].handles.length; i++) {
          // handles.push(frames[$(this).index()].handles[i]);
          oldHandles.push(frames[$(this).index()].handles[i].position);
          // drawHandle(frames[$(this).index()].handles[i]);

          // use add handle instead
          // addHandle();
        }


        for (var i = 0; i < handles.length; i++) {
          eraseHandle(handles[i]);
        }
        eraseAllHandles(); //something about v index
        handles = [];
        console.log(oldHandles);
        for (var i = 0; i < oldHandles.length; i++) {
          addHandle(oldHandles[i].x,  oldHandles[i].y, oldHandles[i].z);
        } 
        // handles[0].v_index is not defined in capture frame
        // handles[0].v_index is defined in working
        
        // for (var i = 0; i < frames[$(this).index()].handles.length; i++) {
        //   // handles.push(frames[$(this).index()].handles[i]);

        //   // drawHandle(frames[$(this).index()].handles[i]);

        //   // use add handle instead
        //   // addHandle();
        // }

        // for (let handle of handles) {
        //   // console.log(handle);
        //   setTimeout( function(){ compilation(handles,originalVertices,barycentricCoordMode,
        //     function(){ 
        //       // console.log(frames[$(this).index()].handles[i]);
  
        //       drawHandle(handle); 
        //       }); 
        //     }, 20);
        // }

 
        
        updateScene();
        // keyFrameMode = true;
      });
    }

}, 1000);
