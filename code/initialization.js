
var camera, scene, renderer, mesh;
var cameraDown = -0.5;
var cameraDown = -0.0;
var origin = new THREE.Vector3(0, cameraDown, 0);
// var cameraPosition = new THREE.Vector3(0, 0, -3.2);

var cameraPosition = new THREE.Vector3(0, cameraDown, 3.2);

var model = null;
var handles = [];
var edges = [];
var noFrame = 1;
var keyFrameMode = false;
var selectedHandle = null;
var originalVertices = null;
var deformedVertices = null;
var barycentricCoordMode = false;
var texture = null;
var alphatexture = null;
let charMaterial = null;

var color1 = "#FFBA94";
var color2 = "#FFBA94";
var color3 = "#FFBA94";
var color4 = "#C85970";
var color4 = "#5D408C";

var basePlaneGeo;

let isRightMouseDown = false;
let previousMousePosition = { x: 0, y: 0 };
let theta = -6.28;  // polar angle
let phi = -1.5;   // azimuthal angle



// create button to adjust keyframe speed;
// let anim_speed = 0.02;
let anim_speed = 0.07;

//mode state
let newHandleMode = false;
let cutOutMode = false;

// button state
let uploadClicked = false;
// let alreadyClickedMenu;
let alreadyClickedCaptureButton = false;


function initialization(objFile){
  $("body").css("overflow", "hidden");
  
  drawingSurface = document.getElementById( "drawingSurface" );
  
  if(localStorage.getItem("barycentricCoord") == 'true'){
    barycentricCoordMode = true;
    $('.barycentricCoord').text('Disable Barycentric Coordinates');
  }else{
    barycentricCoordMode = false;
    $('.barycentricCoord').text('Enable Barycentric Coordinates');
  }
  
  if(drawingSurface == null){
    throw new Error('No drawing surface found!');
  }else{
    var clickedOnHandle = false;
    $( "#drawingSurface" ).mousedown(function(event) {
      
      if(keyFrameMode){
        $('.infoText').text('Viewing Keyframe. Please click "Reset" to start again.');
        return false;
      }
      
      var leftClicked = event.which == 1 ? true : false;
      if(leftClicked){
        var x = event.clientX;
        var y = event.clientY;
        
        if(barycentricCoordMode){
          var worldPos = getPointInWorldCoordinates(x,y);
          var nearestHandle = null;
          var nearestHandleIndex = getNearestHandleIndex(x,y,deformedVertices);
          var newHandle = null;
          
          if(handleExistsBaryCentricMode(nearestHandleIndex)){
            selectedHandle = getHandleBaryCentricMode(nearestHandleIndex);
            clickedOnHandle = true;
          }else{
            clickedOnHandle = false;
            newHandle = createHandleAtPosition(worldPos,model.geometry.faces,deformedVertices);
            handles.push(newHandle);
            $('.infoText').text('Compilation started! Adding marker! Please Wait..');
            setTimeout( function(){ compilation(handles,originalVertices,barycentricCoordMode,
              function(){ 
                $('.infoText').text('Left click and drag handle (the red balls)!');
                drawHandle(newHandle); 
                }); 
              }, 20);
          }
        }else{
          var nearestVertex = null;
          var nearestVertexIndex = getNearestModelVertexIndex(x,y,deformedVertices);
          var newHandle = null;
     
          if(handleExists(nearestVertexIndex)){
            selectedHandle = getHandle(nearestVertexIndex);
            clickedOnHandle = true;
          }else{
            clickedOnHandle = false;
            if (newHandleMode) {

            
            if(nearestVertexIndex != null){
              newHandle = createHandleAtVertex(nearestVertexIndex,deformedVertices);
              handles.push(newHandle);
              $('.infoText').text('Compilation started! Adding marker! Please Wait..');
              setTimeout( function(){ compilation(handles,originalVertices,barycentricCoordMode,
                function(){ 
                  $('.infoText').text('Left click and drag handles (the red dot) to animate!');
                  drawHandle(newHandle); 
                  }); 
                }, 20);
            }else{
              console.log('No vertex found!');
            }
          }
        }
        }
        
      }
    }).contextmenu(function(event) {
      
      if(keyFrameMode){
        $('.infoText').text('Viewing Keyframe. Please click "Reset" to start again.');
        return false;
      }
      
      if (!newHandleMode) { //if not in New Handle Mode, Can't remove handles either, this breaks animaion playing
        return false;
      }
      
      var x = event.clientX;
      var y = event.clientY;
      var handleToRemove = null;

      
      
      if(barycentricCoordMode){
        var nearestHandleIndex = getNearestHandleIndex(x,y,deformedVertices);
        if(handleExistsBaryCentricMode(nearestHandleIndex)){
          handleToRemove = getHandleBaryCentricMode(nearestHandleIndex);
          eraseHandle(handleToRemove); 
          handles.splice(nearestHandleIndex,1);
          $('.infoText').text('Compilation started! Removing marker! Please Wait..');
          setTimeout( function(){ compilation(handles,originalVertices,barycentricCoordMode,
            function(){ 
              $('.infoText').text('Can drag model!');
              }); 
            }, 20);
        }
      }else{
        var nearestVertexIndex = getNearestModelVertexIndex(x,y,deformedVertices);
        if(handleExists(nearestVertexIndex)){
          handleToRemove = getHandle(nearestVertexIndex);
          eraseHandle(handleToRemove);
          handles = handles.filter(it => it.v_index != handleToRemove.v_index);
          $('.infoText').text('Compilation started! Removing marker! Please Wait..');
          setTimeout( function(){ compilation(handles,originalVertices,barycentricCoordMode, 
            function(){ 
              $('.infoText').text('Can drag model!');
              }); 
            }, 20);
        }        
      }
      return false;
    }).mousemove(function(event) {
      
      if(keyFrameMode){
        $('.infoText').text('Viewing Keyframe. Please click "Reset" to start again.');
        return false;
      }
      
      if(clickedOnHandle){        
        var x = event.clientX;
        var y = event.clientY;
        var mouseTarget = getPointInWorldCoordinates(x,y);
        
        //this will update handles[i] element that is selectedHandle
        selectedHandle.position.x = mouseTarget.x;
        selectedHandle.position.y = mouseTarget.y;
        
        // model might not have loaded so might need to moved listeners to after the 
        // model has loaded
        newVertices = manipulation(handles,edges,originalVertices);
        for (var i = 0; i < newVertices.length; i++) {
          model.geometry.vertices[i].x = newVertices[i].x;
          model.geometry.vertices[i].y = newVertices[i].y;
        }

        model.geometry.verticesNeedUpdate = true;    
        updateScene();
      }


      if (isRightMouseDown) {
        let deltaX = event.clientX - previousMousePosition.x;
        let deltaY = event.clientY - previousMousePosition.y;
        
        // Update angles based on mouse movement
        theta += (deltaX * 0.5) * Math.PI / 180;
        phi += (deltaY * 0.5) * Math.PI / 180;
        
        phi = Math.min(Math.max(phi, -Math.PI / 2), Math.PI / 2); // Clamp phi to prevent camera flip
        
        // Convert spherical coordinates to Cartesian (x, y, z)
        let distance = camera.position.length();
        camera.position.x = distance * Math.sin(phi) * Math.sin(theta);
        camera.position.y = distance * Math.cos(phi);
        camera.position.z = distance * Math.sin(phi) * Math.cos(theta);
        
        // camera.lookAt(scene.position);
        camera.lookAt(origin);

        previousMousePosition.x = event.clientX;
        previousMousePosition.y = event.clientY;
        // console.log(camera.position.x);
        updateScene();
      }
    }).mouseup(function(event) {      
      if(clickedOnHandle){
        clickedOnHandle = false;
      }
    });
  }

  $("#drawingSurface").on('touchmove', function(event) {
      if(clickedOnHandle){    
        // let event = event.touches[0];    
        var x = event.touches[0];
        var y = event.touches[0];
        var mouseTarget = getPointInWorldCoordinates(x,y);
        
        //this will update handles[i] element that is selectedHandle
        selectedHandle.position.x = mouseTarget.x;
        selectedHandle.position.y = mouseTarget.y;
        
        // model might not have loaded so might need to moved listeners to after the 
        // model has loaded
        newVertices = manipulation(handles,edges,originalVertices);
        for (var i = 0; i < newVertices.length; i++) {
          model.geometry.vertices[i].x = newVertices[i].x;
          model.geometry.vertices[i].y = newVertices[i].y;
        }

        model.geometry.verticesNeedUpdate = true;    
        updateScene();
      }
     
  });
  $("#drawingSurface").on('touchstart', function(event) {
    var x = event.touches[0].clientX;
    var y =event.touches[0].clientY;
    var nearestVertex = null;
          var nearestVertexIndex = getNearestModelVertexIndex(x,y,deformedVertices);
          var newHandle = null;
                
          if(handleExists(nearestVertexIndex)){
            selectedHandle = getHandle(nearestVertexIndex);
            clickedOnHandle = true;
          }else{
            clickedOnHandle = false;
            if(nearestVertexIndex != null){
              newHandle = createHandleAtVertex(nearestVertexIndex,deformedVertices);
              handles.push(newHandle);
              $('.infoText').text('Compilation started! Adding marker! Please Wait..');
              setTimeout( function(){ compilation(handles,originalVertices,barycentricCoordMode,
                function(){ 
                  $('.infoText').text('Left click and drag handles (the red dot) to animate!');
                  drawHandle(newHandle); 
                  }); 
                }, 20);
            }else{
              console.log('No vertex found!');
            }
          }
    
  });

  $("#drawingSurface").on('touchend', function(event) {
    clickedOnHandle = false;
  });

  

  
  $('.reset').click(function(event) {
    localStorage.clear();
    location.reload();
  });

  const modal = document.getElementById("myModal");
const openModalBtn = document.getElementById("openModalBtn");
const closeModalBtn = document.getElementById("closeModalBtn");

// File input and image display
const fileInput = document.getElementById("fileInput");
const imageDisplay = document.getElementById("imageDisplay");

// Open modal
openModalBtn.addEventListener("click", function() {
  modal.style.display = "block";
  uploadClicked = false;
});

// Close modal
closeModalBtn.addEventListener("click", function() {
  modal.style.display = "none";
});

// Load image from computer
fileInput.addEventListener("change", function() {
  const file = this.files[0];
  const reader = new FileReader();

  reader.addEventListener("load", function() {
    imageDisplay.src = reader.result;
    const textureLoader = new THREE.TextureLoader();
    const newTexture = textureLoader.load(imageDisplay.src);

   

    
  let triangulator = new Triangulator();  
    triangulator.processImage(reader.result, (triangles, mesh) => {
        // Handle the triangulated data here
        if (cutOutMode) {
        console.log(mesh.geometry.faces.length);

        const meshGenerated = mesh; 
        
        scene.remove(model);

        model = meshGenerated;
        
        scene.add(model);
        updateScene();

        initializeFromMesh(meshGenerated);
      }
      
console.log("meshGenerated added to scene");
   // set new material
   charMaterial = new THREE.MeshStandardMaterial({
    map: newTexture,
    alphaMap: newTexture,
    transparent: true,
    alphaTest: 0.01,
    side: THREE.DoubleSide,
    emissive: newTexture,
    opacity: 1,
    depthWrite: false,
  });
  model.material.map = newTexture;

  // model.material.map = newTexture;

  model.material = charMaterial;
  model.material.needsUpdate = true; 


  console.log("updated material");
  updateScene();
  updateScene();
    });


    // removeUneededTriangles(imageDisplay);

 
    
    let distance = camera.position.length();
    camera.position.x = distance * Math.sin(phi) * Math.sin(theta);
    camera.position.y = distance * Math.cos(phi);
    camera.position.z = distance * Math.sin(phi) * Math.cos(theta);
    
    // camera.lookAt(scene.position);
    // camera.position.set( new THREE.Vector3(0,0,-3));
    camera.lookAt(origin);
    // camera.lookAt(new THREE.Vector3(0,cameraDown,-3));
    
    setTimeout(function() {
      updateScene();
    }, 500);

    uploadClicked = true;

  });

  if (file) {
    reader.readAsDataURL(file);
  }
});
  
  $('.zoomIn').click(function(event) {
    camera.position.z-=0.2;
    // updateScene();
  });

  // $(document).on('wheel', function(event) {
  //   if (event.originalEvent.deltaY < 0) {  // If deltaY is negative, you're zooming out
  //     camera.position.z-=zoomSpeed;
  //   } else {
  //     camera.position.z+=zoomSpeed;
  //   }
  //   updateScene();
  // });

  var zoomSpeed =0.2;

  // Zoom function
function zoom(amount) {
  // The camera's "direction" is from its position to (0,0,0)
  // You can replace this with any other point if needed
  const dir = new THREE.Vector3(0, 0, 0).sub(camera.position).normalize();

  // Move the camera in that direction
  camera.position.add(dir.multiplyScalar(amount));
  updateScene();
}

// Add mousewheel event to zoom
document.addEventListener("wheel", function(event) {
  // Choose an amount to zoom; you can change this as needed
  const zoomAmount = event.deltaY > 0 ? -zoomSpeed : zoomSpeed;

  // Call the zoom function
  zoom(zoomAmount);
});

  
  function swapMaterial(newMaterial) {
    model.traverse((node) => {
        if (node.isMesh) {
            node.material = newMaterial;
        }
    });
}

let alreadySwapped = true;
  $('.swapMaterial').click(function(event) {
    var newMaterial = new THREE.MeshBasicMaterial({wireframe: true});
     
if (!alreadySwapped) {
  // var material = new THREE.MeshBasicMaterial({wireframe: true});
  newMaterial = charMaterial;

  // Call this whenever you want to swap the material:
} else {
  renderer.setClearColor(0x000000);
}
swapMaterial(newMaterial);

  updateScene();
    alreadySwapped = !alreadySwapped;

  });
  
  $('.boxObj').click(function(event) {
    localStorage.setItem("model", 'models/box.obj');
    location.reload();
  });
  $('.charObj').click(function(event) {
    // localStorage.setItem("model", 'models/char1.obj');
    // localStorage.setItem("model", 'models/defaultBase.obj');
    localStorage.setItem("model", 'models/defaultBaseLowRes.obj');
    location.reload();
  });  
  
  $('.manObj').click(function(event) {
    localStorage.setItem("model", 'models/man.obj');
    location.reload();
  });
  
  $('.barycentricCoord').click(function(event) {
    if(localStorage.getItem("barycentricCoord") == 'true'){
      localStorage.setItem("barycentricCoord", 'false');
    }else{
      localStorage.setItem("barycentricCoord", 'true');
    }
    location.reload();
  });
  
  $('.weightInput').keyup(function(event) {
    w = parseInt($('.weightInput').val());
    $('.infoText').text('Setting weight (w) to: '+$('.weightInput').val());
  });
  
  texture = new THREE.TextureLoader().load('examples/char1/charResized.png');
  alphatexture = new THREE.TextureLoader().load('examples/char1/harResizedAlpha.png');
  

  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 2000);
  camera.position.set(cameraPosition.x,cameraPosition.y,cameraPosition.z);
  camera.lookAt(origin);
  
  var light = new THREE.PointLight('white',2,0);
  light.position.set( 10, 10, 10 );
  scene.add(light);

  var light = new THREE.PointLight('white',2,0);
  light.position.set( -10, -10, -10 );
  scene.add(light);
  
  renderer = new THREE.WebGLRenderer({ antialias: true, canvas: drawingSurface, alpha: true });
  renderer.setPixelRatio(window.devicePixelRatio); 
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = false;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.gammaInput = true;
  renderer.gammaOutput = true;
  // renderer.setClearColor(color1);
  renderer.setClearColor(0x000000); 
  // if want transparent set background
  // renderer.setClearColor( 0x000000, 0 ); 
  renderer.render(scene, camera);
  
  loadObj(objFile);
  // renderAxes();

  renderer.domElement.addEventListener('touchstart', onTouchStart, false);
renderer.domElement.addEventListener('touchmove', onTouchMove, false);

welcomeAnimation();
updateScene();

};




function welcomeAnimation() {
  
  setTimeout(() => {
    const framesPanel = document.querySelector('.framesPanel');

    // Add the 'show' class to slide the panel up
    framesPanel.classList.add('show');
  }, 1000);
  
  setTimeout(() => {
    document.querySelector('.controlPanel').style.left = '0';
    
  }, 2000);  // 2000 milliseconds, or 2 seconds
  // play wave animation, then remove all handles
  
  // tap on the character to add a handle pop up message 

  document.querySelector('.controlPanel').addEventListener('click', function() {
    this.style.left = '-100%';
  });

  document.querySelector('.menuButton').addEventListener('click', function() {
    document.querySelector('.controlPanel').style.left = '0%';
  });



  document.querySelector('#optionsButton').addEventListener('click', function() {
    document.querySelector('#options').style.left = '0%';
  });
  
  document.querySelector('#options').addEventListener('click', function() {
    this.style.left = '-100%';
  });

  document.querySelector('#exportButton').addEventListener('click', function() {
    document.querySelector('#export').style.left = '0%';
  });
  
  document.querySelector('#close-menu-export').addEventListener('click', function() {
    document.querySelector('#export').style.left = '-100%';
  });
  
  document.querySelector('.keyFramesButton').addEventListener('click', function() {
    const framesPanel = document.querySelector('.framesPanel');
    framesPanel.classList.add('show');
  });

  

}

function addHandle(x,y,z) { 
  var nearestVertexIndex = getNearestModelVertexIndexWorld(x,y,z, deformedVertices);
  // console.log(nearestVertexIndex);
  let newHandle = createHandleAtVertex(nearestVertexIndex,deformedVertices);
  // console.log(newHandle);
  handles.push(newHandle);
  // drawHandle(newHandle);
  
  setTimeout( function(){ compilation(handles,originalVertices,barycentricCoordMode,
    function(){ 
      $('.infoText').text('Left click and drag handles (the red dot) to animate!');
      // Left click and drag handles (the red dot) to animate!
      drawHandle(newHandle); 
      }); 
    }, 20);
  
}

function welcomeRig() {
  addHandle(0,0.9,0);

  addHandle(-0.9,0.6,0);
  addHandle(0,0.6,0);
  addHandle(0.9,0.6,0);

  addHandle(0,0,0);

  addHandle(-0.3,-0.9,0);
  addHandle(0.3,-0.9,0);

  // handles = HANDLES_HUMANOID_7;

}
function welcomeWave() {
  keyFrames = IDLE_LOOP_7; 
  setTimeout( function(){
    play();
    
    }, 150);
  // play animation;
}


function updateScene(){
  renderer.render(scene, camera);
  if (capturing) {
    capturer.capture(renderer.domElement);
 }
};

function loadObj(objPath){
  var loader = new THREE.OBJLoader();
  loader.load(
    objPath,
    async function ( object ) {
      child = object.children[0];
      var geometry = new THREE.Geometry().fromBufferGeometry( child.geometry );
      geometry.mergeVertices(); 
      
      basePlaneGeo = child.geometry.clone(); 
      // console.log(child.geometry);

//       let differentGeo = await loadGeoFromImage("examples/char1/charResized.png");
      
//       // differentGeo = differentGeo.map(subArray => [...subArray, 0]);
//       // console.log(differentGeo);
//       let vectors = differentGeo.map(subArray => new THREE.Vector3(subArray[0], subArray[1], 0));
//       vectors = scaleDown(vectors);
//       // Log the result to see the new array of Vector3 objects
//       vectors.forEach(v => console.log(v));
//       // Create the geometry
// let genGeometry = new THREE.BufferGeometry().setFromPoints(vectors);

// Create the material
// let material = new THREE.LineBasicMaterial({ color: 0x00ff00 });

// var material = new THREE.MeshBasicMaterial({wireframe: true});





      charMaterial = new THREE.MeshStandardMaterial({
        map: texture,
        alphaMap: alphatexture,
        transparent: true,
        alphaTest: 0.0,
        side: THREE.DoubleSide,
      });
      // var material = new THREE.MeshBasicMaterial({ map: texture, side: THREE.DoubleSide  });
      // const material = new THREE.MeshBasicMaterial({ color: 0xff00ff });
      // var material = new THREE.MeshBasicMaterial({wireframe: true});
      // var material = new THREE.MeshBasicMaterial();
      model = new THREE.Mesh(geometry, charMaterial);


      let geometrybox = new THREE.BoxGeometry(1, 1, 1);
// let cube = new THREE.Mesh(geometrybox, material);
// scene.add(cube);
// model = cube;
      


// // Combine geometry and material into a Line
// let line = new THREE.Line(genGeometry, charMaterial);
// line.rotation.z = Math.PI;
// // Add it to the scene
// scene.add(line);




// document.getElementById('fileInput').addEventListener('change', function(event) {

// });


      scene.add(model);
      if (!cutOutMode) {
        initializeFromMesh(model);
        updateScene();
        welcomeRig();
        welcomeWave();
      } 
    },
    function ( xhr ) {
      console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
    },
    function ( error ) {
      console.log( 'An error happened' );
    }
  );
};

function scaleDown(points) {
  // 1. Find the bounding box
let minX = Infinity, maxX = -Infinity;
let minY = Infinity, maxY = -Infinity;
let minZ = Infinity, maxZ = -Infinity;

for (let point of points) {
    minX = Math.min(minX, point.x);
    maxX = Math.max(maxX, point.x);
    
    minY = Math.min(minY, point.y);
    maxY = Math.max(maxY, point.y);
    
    minZ = Math.min(minZ, point.z);
    maxZ = Math.max(maxZ, point.z);
}

// 2. Determine the scaling factor
const scaleFactorX = 2 / (maxX - minX);
const scaleFactorY = 2 / (maxY - minY);
const scaleFactorZ = 2 / (maxZ - minZ);

const offsetX = (maxX + minX) / 2;
const offsetY = (maxY + minY) / 2;
const offsetZ = (maxZ + minZ) / 2;

// 3. Apply the scaling factor
for (let point of points) {
    point.x = (point.x - offsetX) * scaleFactorX;
    point.y = (point.y - offsetY) * scaleFactorY;
    point.z = (point.z - offsetZ) * scaleFactorZ;
}
return points;
}

function initializeFromMesh(mesh){
  faces = mesh.geometry.faces;
  for (var i = 0; i < faces.length; i++) {
    var currentEdge1 = new Edge(faces[i].a,faces[i].b,i);
    var currentEdge2 = new Edge(faces[i].b,faces[i].c,i);
    var currentEdge3 = new Edge(faces[i].a,faces[i].c,i);
    
    if(!Edge.edgeDoesExist(edges,currentEdge1)){ edges.push(currentEdge1); }
    if(!Edge.edgeDoesExist(edges,currentEdge2)){ edges.push(currentEdge2); }
    if(!Edge.edgeDoesExist(edges,currentEdge3)){ edges.push(currentEdge3); }  
  }
  
  for (var i = 0; i < edges.length; i++) {
    if(isBorderEdge(edges[i],faces)){
      edges[i].setIsBorderEdge(true);
    }else{
      edges[i].setIsBorderEdge(false);
    }
  }
  
  var allEdges = Edge.getAllEdges(faces);
  for (var i = 0; i < edges.length; i++) {
    var neighbors = Edge.getEdgeNeighbors(edges[i],allEdges,faces);
    edges[i].setNeighbors(neighbors);
  }
  
  originalVertices = cloneVertices(model.geometry.vertices);
  deformedVertices = cloneVertices(model.geometry.vertices);
  registration(edges,originalVertices);
}

function getNearestModelVertexIndexWorld(x,y,z,vertices){
  var mouseTarget = new THREE.Vector3(x,y,z);
  var distanceFromVertex = 0;
  // var distanceTolerance = cameraPosition.z/100;;
  var distanceTolerance = cameraPosition.z/10;
  var closestVertexIndex = null;
  
  for (var i = 0; i < vertices.length; i++) {
    distanceFromVertex = vertices[i].distanceTo(mouseTarget);
    if(distanceFromVertex < distanceTolerance){
        closestVertexIndex = i;
        distanceTolerance = distanceFromVertex;
    }
  }
  
  return closestVertexIndex;
}

function getNearestModelVertexIndex(x,y,vertices){
  var mouseTarget = getPointInWorldCoordinates(x,y);
  var distanceFromVertex = 0;
  // var distanceTolerance = cameraPosition.z/100;;
  var distanceTolerance = cameraPosition.z/10;
  var closestVertexIndex = null;
  
  for (var i = 0; i < vertices.length; i++) {
    distanceFromVertex = vertices[i].distanceTo(mouseTarget);
    if(distanceFromVertex < distanceTolerance){
        closestVertexIndex = i;
        distanceTolerance = distanceFromVertex;
    }
  }
  
  return closestVertexIndex;
}

function getNearestHandleIndex(x,y,vertices){
  var mouseTarget = getPointInWorldCoordinates(x,y);
  var distanceFromHandle = 0;
  var distanceTolerance = cameraPosition.z/100;
  var closestHandleIndex = null;
  
  for (var i = 0; i < handles.length; i++) {
    distanceFromHandle = handles[i].position.distanceTo(mouseTarget);
    if(distanceFromHandle < distanceTolerance){
        closestHandleIndex = i;
        distanceTolerance = distanceFromHandle;
    }
  }
  
  return closestHandleIndex;
}

function createHandleAtVertex(index,vertices){
  var vertex = vertices[index];
  var newHandle = null;
  var uniformScale = cameraPosition.z / 120;
  var geometry = new THREE.SphereGeometry( 1, 32, 32 );
  // edit this to better handle material!
  // var material = new THREE.MeshPhongMaterial({shininess: 1});
  var material =  new THREE.MeshBasicMaterial({ color: 0xff0033 });
  var newHandle = new THREE.Mesh( geometry, material );
  
  newHandle.position.set(vertex.x,vertex.y,vertex.z);
  newHandle.scale.set(uniformScale,uniformScale,uniformScale);
  newHandle.v_index = index;
  
  return newHandle;
}

function drawHandle(handle){
  scene.add(handle);  
  updateScene();
}

function toggleHandles() {
  for (var i = 0; i < handles.length; i++) {
    handles[i].visible = !handles[i].visible;
  }
  updateScene();
}

function eraseAllHandles() {
  for (var i = 0; i < handles.length; i++) {
    scene.remove(handles[i]);
  }
  updateScene();
}

function eraseHandle(handle){
  for (var i = 0; i < handles.length; i++) {
    if(handles[i].v_index == handle.v_index){
      scene.remove(handle);
      break;
    }
  }
  updateScene();
}

function handleExists(modelVertexIndex){
  exists = false;
  for (var i = 0; i < handles.length; i++) {
    if(handles[i].v_index == modelVertexIndex){
      exists = true;
      return exists;
    }
  }
  return exists;
}

function handleExistsBaryCentricMode(index){
  exists = false;
  for (var i = 0; i < handles.length; i++) {
    if(i == index){
      exists = true;
      return exists;
    }
  }
  return exists;
}

function getHandleBaryCentricMode(index){
  handle = null;
  for (var i = 0; i < handles.length; i++) {
    if(i == index){
      handle = handles[i];
      return handle;
    }
  }
  return handle;
}

function getHandle(modelVertexIndex){
  handle = null;
  for (var i = 0; i < handles.length; i++) {
    if(handles[i].v_index == modelVertexIndex){
      handle = handles[i];
      return handle;
    }
  }
  return handle;
}

function createHandleAtPosition(worldPos,faces,vertices){
  var triangles = createTrianglesFromFaces(model.geometry.faces,vertices);
  var newHandle = null;
  var uniformScale = cameraPosition.z / 120;
  for (var i = 0; i < triangles.length; i++) {
    if(triangles[i].containsPoint(worldPos)){

      var x1y1 = new THREE.Vector3(triangles[i].a.x,triangles[i].a.y,triangles[i].a.z);
      var x2y2 = new THREE.Vector3(triangles[i].b.x,triangles[i].b.y,triangles[i].b.z);
      var x3y3 = new THREE.Vector3(triangles[i].c.x,triangles[i].c.y,triangles[i].c.z);
      
      var triangleA  = new THREE.Triangle(x3y3,x2y2,x1y1);
      var triangleA1 = new THREE.Triangle(x3y3,x2y2,worldPos);
      var triangleA2 = new THREE.Triangle(x1y1,x3y3,worldPos);
      var triangleA3 = new THREE.Triangle(x1y1,x2y2,worldPos);
      
      var areaA = triangleA.area();
      var areaA1 = triangleA1.area();
      var areaA2 = triangleA2.area();
      var areaA3 = triangleA3.area();
      
      var l1 = areaA1/areaA;
      var l2 = areaA2/areaA;
      var l3 = areaA3/areaA;
      
      x1y1 = x1y1.multiplyScalar(l1);
      x2y2 = x2y2.multiplyScalar(l2);
      x3y3 = x3y3.multiplyScalar(l3);
      
      var p = x1y1.add(x2y2).add(x3y3);
      
      var geometry = new THREE.SphereGeometry( 1, 32, 32 );
      var material = new THREE.MeshPhongMaterial({shininess: 1});
      newHandle = new THREE.Mesh( geometry, material );
      newHandle.position.set(p.x,p.y,p.z);
      newHandle.scale.set(uniformScale,uniformScale,uniformScale);
      newHandle.l1 = l1;
      newHandle.l2 = l2; 
      newHandle.l3 = l3;
      newHandle.triangleV1Index = triangles[i].v1Index;
      newHandle.triangleV2Index = triangles[i].v2Index;
      newHandle.triangleV3Index = triangles[i].v3Index;
    }
  }
  
  return newHandle;
}

function getPointInWorldCoordinates(x,y){
  var vector = new THREE.Vector3();
  vector.set((x / window.innerWidth) * 2 - 1, -(y / window.innerHeight) * 2 + 1, 0.5);
  vector.unproject( camera );
  var dir = vector.sub( camera.position ).normalize();
  var distance = - camera.position.z / dir.z;
  var pos = camera.position.clone().add( dir.multiplyScalar( distance ) );
  
  return pos;
};

var drawingSurface = document.getElementById('drawingSurface');
function animate(){
  // requestAnimationFrame(animate);

  updateScene();
  // TWEEN.update(); // If using Tween.js
  // if (capturing) {
  //   capturer.capture(drawingSurface);
  // }


};


document.addEventListener('DOMContentLoaded', function() {
  var framesPanel = document.querySelector('.framesPanel');
  
  if (framesPanel) {
      framesPanel.addEventListener('click', function(event) {
          // Check if the clicked element or its parents are not buttons
          if (!closest(event.target, 'button') && !closest(event.target, 'img')) {
              console.log("clicked modal");
              framesPanel.classList.remove('show');
          }
      });
  }
});

// Helper function to find the closest parent with a certain tag or selector
function closest(element, selector) {
  while (element && element !== document) {
      if (typeof selector === 'string') {
          if (element.matches(selector)) {
              return element;
          }
      } else if (element === selector) {
          return element;
      }
      element = element.parentNode;
  }
  return null;
}