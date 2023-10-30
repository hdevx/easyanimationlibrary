function renderAxes(){
  var colors = ['#1B0A37','#1B0A37','#1B0A37'];
  for (var i = 0; i < 3; i++) {
    var geometry = new THREE.Geometry();
    var axis_color = colors[i];
    switch (i) {
      case 0:
        geometry.vertices.push(new THREE.Vector3(-5, 0, 0));
        geometry.vertices.push(new THREE.Vector3(5, 0, 0));
        break;
      case 1:
        geometry.vertices.push(new THREE.Vector3(0, -5, 0));
        geometry.vertices.push(new THREE.Vector3(0, 5, 0));
        break;
      case 2:
        geometry.vertices.push(new THREE.Vector3(0, 0, 5));
        geometry.vertices.push(new THREE.Vector3(0, 0, -5));
        break;
    };
    var material = new THREE.LineBasicMaterial({ color: axis_color }); 
    var axis =  new THREE.Line(geometry, material);
    scene.add(axis);
  };
};

function addNeighbors(neighbors,edge,face){
  var face =  faces[edge.parentFaceIndex];
  var vertex1 = face.a;
  var vertex2 = face.b;
  var vertex3 = face.c;
  
  if(!neighbors.includes(vertex1)){ neighbors.push(vertex1) };
  if(!neighbors.includes(vertex2)){ neighbors.push(vertex2) };
  if(!neighbors.includes(vertex3)){ neighbors.push(vertex3) };
  
  return neighbors;
}

function drawEdge(edge,model){
  drawMarker(createMarker(model.geometry.vertices[edge.start],edge.start));
  drawMarker(createMarker(model.geometry.vertices[edge.end],edge.end));
}

function getVertex(i,vertices){
  return vertices[i];
}

// function getVertex(i, vertices) {
//   if (i * 3 + 2 >= vertices.length) {
//       console.error('Vertex index out of bounds:', i);
//       return null;
//   }
//   return {
//       x: vertices[i * 3],
//       y: vertices[i * 3 + 1],
//       z: vertices[i * 3 + 2]
//   };
// }



function getEdgeVectorFromEdge(edge,vertices){
  var edgeVector = math.matrix();
  var edgeEndVertex = getVertex(edge.end,vertices);
  var edgeStartVertex = getVertex(edge.start,vertices);
  
  edgeVector.set([0,0], edgeEndVertex.x - edgeStartVertex.x );
  edgeVector.set([1,0], edgeEndVertex.y - edgeStartVertex.y );
  
  return edgeVector;
}

function isBorderEdge(edge,faces){
  var isBorderEdge = null;
  var count = 0;
  
  for (var i = 0; i < faces.length; i++) {
    var edge1 = new Edge(faces[i].a,faces[i].b,i);
    var edge2 = new Edge(faces[i].b,faces[i].c,i);
    var edge3 = new Edge(faces[i].a,faces[i].c,i);
    if(edge.equals(edge1) || edge.equals(edge2) || edge.equals(edge3)){
      count ++;
    }
  }
  
  if(count < 2){
    isBorderEdge = true;
  }else{
    isBorderEdge = false;
  }
  return isBorderEdge;
}

function cloneVertices(vertices){
  var clonedVertices = [];
  for (var i = 0; i < vertices.length; i++) {
    clonedVertices.push(vertices[i].clone());
  }
  return clonedVertices;
}

function cloneHandles(handles){
  var clonedHandles = [];
  for (var i = 0; i < handles.length; i++) {
    clonedHandles.push(handles[i].clone());
  }
  return clonedHandles;
}

function getNeighborVerticesCoordinates(neighbors,vertices){
  var vertexCoordinates = math.matrix();
  var vertex = null;
  for (var k = 0; k < neighbors.length; k++) {
    vertex = getVertex(neighbors[k],vertices);
    vertexCoordinates.set([2*k,0],vertex.x);
    vertexCoordinates.set([2*k+1,0],vertex.y);
  }
  return vertexCoordinates;
}

function createTrianglesFromFaces(faces, vertices){
  var triangles = [];
  var v1,v2,v3;
  for (var i = 0; i < faces.length; i++) {
    v1 = getVertex(faces[i].a,vertices);
    v2 = getVertex(faces[i].b,vertices);
    v3 = getVertex(faces[i].c,vertices);
    
    var triangle = new THREE.Triangle(v1,v2,v3);
    triangle.v1Index = faces[i].a;
    triangle.v2Index = faces[i].b;
    triangle.v3Index = faces[i].c;
    triangles.push(triangle);
  }
  
  return triangles;
}

// This is legacy code
function pseudoInverse(matrix){
  var pseudoInverse = math.matrix();
  var res = numeric.svd(matrix.toArray());
  var U = math.matrix(res.U);
  var S = math.matrix(res.S);
  var V = math.matrix(res.V);
  var tol = 5.3291e-15;
  for (var i = 0; i < S.size()[0]; i++) {
    if(S.get([i]) > tol){
      S.set([i],1/S.get([i]));
    }
  }
  S = math.diag(S);
  pseudoInverse = math.multiply(math.multiply(V,S),math.transpose(U));
  return pseudoInverse;
}

function rollOut() {

}

function onTouchStart(event) {
  if (event.touches.length >= 2) {
    let touch1 = event.touches[0];
    let touch2 = event.touches[1];
    
    // Calculate the distance between two touch points
    lastTouchDistance = Math.sqrt(
      Math.pow(touch2.pageX - touch1.pageX, 2) +
      Math.pow(touch2.pageY - touch1.pageY, 2)
    );
  }
}

function onTouchMove(event) {
  if (event.touches.length >= 2) {
    let touch1 = event.touches[0];
    let touch2 = event.touches[1];
    
    // Calculate the new distance between two touch points
    let newTouchDistance = Math.sqrt(
      Math.pow(touch2.pageX - touch1.pageX, 2) +
      Math.pow(touch2.pageY - touch1.pageY, 2)
    );
    
    // Find the difference in distances
    let distanceChange = newTouchDistance - lastTouchDistance;

    // Update camera (zoom in or out)
    camera.position.z += distanceChange * 0.1;
    
    // Update the last touch distance
    lastTouchDistance = newTouchDistance;
  }
}

function createAlphaTexture(image) {

}

function removeUneededTriangles(image){
  const canvas = document.createElement('canvas');
const context = canvas.getContext('2d');

canvas.width = image.width;
canvas.height = image.height;
context.drawImage(image, 0, 0);

const imgData = context.getImageData(0, 0, canvas.width, canvas.height).data;

// load base mesh again in future
const geometry = basePlaneGeo;
const vertices = geometry.attributes.position.array;
const uvs = geometry.attributes.uv.array;

let newVertices = [];
let newUVs = [];

// Function to calculate centroid of a triangle in UV space
const calculateCentroid = (uv1, uv2, uv3) => {
  const x = (uv1.x + uv2.x + uv3.x) / 3;
  const y = (uv1.y + uv2.y + uv3.y) / 3;
  return new THREE.Vector2(x, y);
};

for (let i = 0; i < vertices.length; i += 9) {
  // Get the UVs corresponding to the three vertices of a triangle
  const uv1 = new THREE.Vector2(uvs[(i / 3) * 2], uvs[(i / 3) * 2 + 1]);
  const uv2 = new THREE.Vector2(uvs[(i / 3) * 2 + 2], uvs[(i / 3) * 2 + 3]);
  const uv3 = new THREE.Vector2(uvs[(i / 3) * 2 + 4], uvs[(i / 3) * 2 + 5]);

  // Calculate centroid of the UVs
  const uvCentroid = calculateCentroid(uv1, uv2, uv3);

  // Map centroid to texture coordinates
  const x = Math.floor(uvCentroid.x * canvas.width);
  const y = Math.floor((1 - uvCentroid.y) * canvas.height);

  // Find the corresponding pixel in the image data
  const index = (y * canvas.width + x) * 4;

  // If alpha is NOT zero, keep the face
  if (imgData[index + 3] !== 0) {
    for (let j = 0; j < 9; j++) {
      newVertices.push(vertices[i + j]);
    }
    for (let j = 0; j < 6; j++) {
      newUVs.push(uvs[(i / 3) * 2 + j]);
    }
  }
}

// Create new geometry
const newGeometry = new THREE.BufferGeometry();
// newGeometry.setAttribute('position', new THREE.Float32BufferAttribute(newVertices, 3));
// newGeometry.setAttribute('uv', new THREE.Float32BufferAttribute(newUVs, 2));

newGeometry.attributes.position = new THREE.BufferAttribute(new Float32Array(newVertices), 3);
newGeometry.attributes.uv = new THREE.BufferAttribute(new Float32Array(newUVs), 2);


// Update mesh with new geometry
model.geometry = new THREE.Geometry().fromBufferGeometry(newGeometry);
model.geometry.elementsNeedUpdate = true; // Required to reflect changes in faces
model.geometry.verticesNeedUpdate = true; // Required to reflect changes in vertices 
}


if (document.readyState === "loading") {  // If document is still loading
  document.addEventListener("DOMContentLoaded", LoadMobileWarning);
} else {  // If document is already loaded
  LoadMobileWarning();
}
function LoadMobileWarning() {
  if(window.innerWidth <= 900) {
    document.getElementById('mobileModal').style.display = 'block';
}
}

function closeModal() {
  document.getElementById('mobileModal').style.display = 'none';
}
