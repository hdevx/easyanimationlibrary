
class Triangulator {

    constructor() {
        this.edges = [];
        this.points = []; 
        this.triangles = [];
    }

    processImage(imageSource, callback) {
        let canvas = document.createElement('canvas');
        let ctx = canvas.getContext('2d');
        let img = new Image();

        img.onload = () => {
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0, img.width, img.height);
            let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

            let src = cv.imread(canvas);
            this.edges = this.getCannyEdges(src);
            // this.points = this.samplePoints(src, this.edges);
            this.points = this.samplePointsEven(src, this.edges, 1000);
           
            this.triangles = this.triangulate(this.points, imageData);
            
            this.mesh = this.generateMesh(this.triangles);
           
            callback(this.triangles, this.mesh);
        };

        img.src = imageSource;
    }

    getCannyEdges(src) {
        let dst = new cv.Mat();
        let lowThreshold = 50;
        let highThreshold = 150;
        cv.cvtColor(src, src, cv.COLOR_RGBA2GRAY, 0);
        cv.Canny(src, dst, lowThreshold, highThreshold, 3, false);
        return dst;
    }

    samplePoints(image, edges) {
        let edgePoints = [];
        const edgeSamplingRate = 150; // 512 /30   image width / 30; 
        let edgeCounter = 0;
        for (let i = 0; i < edges.rows; i++) {
            for (let j = 0; j < edges.cols; j++) {
                let pixelValue = edges.ucharPtr(i, j)[0];
                if (pixelValue > 0) {
                    edgeCounter++;
                    if (edgeCounter % edgeSamplingRate === 0) {
                        edgePoints.push([j, i]);
                    }
                }
            }
        }
        return edgePoints;
    }

    samplePointsEven(src, edges, numVertices) {
        let edgePoints = [];
        let totalEdgeCount = 0;
    
        // First, count the total number of edge points
        for (let i = 0; i < edges.rows; i++) {
            for (let j = 0; j < edges.cols; j++) {
                let pixelValue = edges.ucharPtr(i, j)[0];
                if (pixelValue > 0) {
                    totalEdgeCount++;
                }
            }
        }
    
        // Based on your desired number of boundary vertices (e.g., 150), 
        // determine the sampling rate. If totalEdgeCount is less than desired count, then sample all.
        let desiredEdgeCount = 150;
        let edgeSamplingRate = Math.floor(totalEdgeCount / desiredEdgeCount);
        if (edgeSamplingRate < 1) edgeSamplingRate = 1; // Ensure it's at least 1 to avoid infinite loops
    
        let edgeCounter = 0;
        for (let i = 0; i < edges.rows; i++) {
            for (let j = 0; j < edges.cols; j++) {
                let pixelValue = edges.ucharPtr(i, j)[0];
                if (pixelValue > 0) {
                    edgeCounter++;
                    if (edgeCounter % edgeSamplingRate === 0) {
                        edgePoints.push([j, i]);
                    }
                }
            }
        }
    
        return edgePoints;
    }

    triangulate(points, imageData) {
        const delaunay = d3.Delaunay.from(points);
        const triangles = delaunay.triangles;

        let result = [];
        for (let i = 0; i < triangles.length; i += 3) {
            result.push([
                points[triangles[i]],
                points[triangles[i + 1]],
                points[triangles[i + 2]]
            ]);
        }
        return result.filter(triangle => !this.triangleHasTransparentCentroid(imageData, triangle));   
        // return result;   
    }

    triangleCentroid(triangle) {
        let x = (triangle[0][0] + triangle[1][0] + triangle[2][0]) / 3;
        let y = (triangle[0][1] + triangle[1][1] + triangle[2][1]) / 3;
        return [x, y];
    }

    triangleHasTransparentCentroid(imageData, triangle) {
        let centroid = this.triangleCentroid(triangle);
        return this.isTransparent(imageData, Math.round(centroid[0]), Math.round(centroid[1]));
    }

    isTransparent(imageData, x, y) {
        let index = (y * imageData.width + x) * 4;
        let alpha = imageData.data[index + 3];  // The alpha channel
        return alpha === 0;   // 0 means fully transparent
    }

    generateMesh(triangles) {

// scale down move to functuin
let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

triangles.forEach(triangle => {
    triangle.forEach(pt => {
        minX = Math.min(minX, pt[0]);
        minY = Math.min(minY, pt[1]);
        maxX = Math.max(maxX, pt[0]);
        maxY = Math.max(maxY, pt[1]);
    });
});
const centerX = (minX + maxX) / 2;
const centerY = (minY + maxY) / 2;

const rangeX = maxX - minX;
const rangeY = maxY - minY;

const scale = 2 / Math.max(rangeX, rangeY);triangles = triangles.map(triangle => {
  return triangle.map(pt => {
      const x = (pt[0] - centerX) * scale;
      const y = (pt[1] - centerY) * scale;
      return [x, y];
  });
});
        

        let geometry = new THREE.Geometry();
  

        triangles.forEach(triangle => {
            // For each triangle, we add 3 vertices and then 1 face that references these vertices
            const vertexIndices = triangle.map(pt => {
                const vertex = new THREE.Vector3(pt[0], pt[1], 0); // z is set to 0 for 2D
                geometry.vertices.push(vertex);
                return geometry.vertices.length - 1; // Return index of the last vertex added
            });
        
            const face = new THREE.Face3(vertexIndices[0], vertexIndices[1], vertexIndices[2]);
            geometry.faces.push(face);
        });
               
        geometry.mergeVertices(); 
        geometry.computeFaceNormals();  // Important for lighting to work properly if you use materials that respond to light
        
        geometry.computeBoundingBox();

let boundingBox = geometry.boundingBox;

let xRange = boundingBox.max.x - boundingBox.min.x;
let yRange = boundingBox.max.y - boundingBox.min.y;

// Loop through each face and set UVs
geometry.faceVertexUvs[0] = [];
for (let i = 0; i < geometry.faces.length; i++) {
    let face = geometry.faces[i];

    // Get the vertices for this face
    let v1 = geometry.vertices[face.a];
    let v2 = geometry.vertices[face.b];
    let v3 = geometry.vertices[face.c];

    // Map the vertices to the [0,1] range to compute UVs
    let uv1 = new THREE.Vector2((v1.x - boundingBox.min.x) / xRange, (v1.y - boundingBox.min.y) / yRange);
    let uv2 = new THREE.Vector2((v2.x - boundingBox.min.x) / xRange, (v2.y - boundingBox.min.y) / yRange);
    let uv3 = new THREE.Vector2((v3.x - boundingBox.min.x) / xRange, (v3.y - boundingBox.min.y) / yRange);

    // Push the computed UVs for this face to the faceVertexUvs array
    geometry.faceVertexUvs[0].push([uv1, uv2, uv3]);
}

// flip upside down
let uvs = geometry.faceVertexUvs[0];

for (let i = 0; i < uvs.length; i++) {
    for (let j = 0; j < uvs[i].length; j++) {
        // Flip the V coordinate
        uvs[i][j].y = 1 - uvs[i][j].y;
    }
}


// Tell Three.js to update the UVs in the GPU
geometry.uvsNeedUpdate = true;

        const material = new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true });
        // const material = new THREE.MeshBasicMaterial({ map: newTexture });

        // scale must be set some other way, this reversed handle seleciton
        // meshGenerated.scale.y = -1;
        // meshGenerated.scale.x = -1;

        // meshGenerated.position.z = 0.1;
        // meshGenerated.rotation.x = Math.PI;

        let mesh = new THREE.Mesh(geometry, material);
        return mesh;
    }
}