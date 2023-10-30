const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');

async function loadGeoFromImage(path){
// Load the image
return await loadImage(path);
}

 
function loadImage(src) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);
        
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imageData.data;
        
            // Simple method to get the boundary points
            const boundaryPoints = [];
            for (let y = 0; y < canvas.height; y++) {
                for (let x = 0; x < canvas.width; x++) {
                    const alpha = data[(y * canvas.width + x) * 4 + 3];
                    if (alpha !== 0) {
                        boundaryPoints.push([x, y]);
                    }
                }
            }
        
            console.log("in bundary");
        const epsilon = 5.0; // Adjust this based on desired simplification
        const simplifiedPoints = ramerDouglasPeucker(boundaryPoints, epsilon);
            // Now simplifiedPoints will have the vertices under 100 (based on the toleranceValue)
            // return simplifiedPoints;
            resolve(simplifiedPoints);
        }
        img.onerror = reject;
        img.src = src;
    });
}

function ramerDouglasPeucker(points, epsilon) {
    if (!points || points.length < 3) return points;

    const firstPoint = points[0];
    const lastPoint = points[points.length - 1];

    let index = -1;
    let distMax = 0;

    for (let i = 1; i < points.length - 1; i++) {
        const dist = perpendicularDistance(points[i], firstPoint, lastPoint);

        if (dist > distMax) {
            index = i;
            distMax = dist;
        }
    }

    if (distMax > epsilon) {
        const leftSegment = points.slice(0, index + 1);
        const rightSegment = points.slice(index);

        const leftResult = ramerDouglasPeucker(leftSegment, epsilon);
        const rightResult = ramerDouglasPeucker(rightSegment, epsilon);

        return leftResult.slice(0, leftResult.length - 1).concat(rightResult);
    } else {
        return [firstPoint, lastPoint];
    }
}

function perpendicularDistance(point, lineStart, lineEnd) {
    const dx = lineEnd[0] - lineStart[0];
    const dy = lineEnd[1] - lineStart[1];
    const mag = Math.sqrt(dx * dx + dy * dy);

    if (mag === 0) return 0;  // lineStart and lineEnd are the same

    const pvx = point[0] - lineStart[0];
    const pvy = point[1] - lineStart[1];

    const u = ((pvx * dx) + (pvy * dy)) / (mag * mag);

    const ix = lineStart[0] + u * dx;
    const iy = lineStart[1] + u * dy;

    const dx2 = ix - point[0];
    const dy2 = iy - point[1];

    return Math.sqrt(dx2 * dx2 + dy2 * dy2);
}