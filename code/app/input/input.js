// document.addEventListener('mousedown', (e) => {
//     if (e.button === 2) { // Right mouse button
//         isRightMouseDown = true;
//         previousMousePosition.x = e.clientX;
//         previousMousePosition.y = e.clientY;
//     }
// });


// document.addEventListener('mousemove', (e) => {
//     if (isRightMouseDown) {
//         let deltaX = e.clientX - previousMousePosition.x;
//         let deltaY = e.clientY - previousMousePosition.y;
        
//         // Update angles based on mouse movement
//         theta += (deltaX * 0.5) * Math.PI / 180;
//         phi += (deltaY * 0.5) * Math.PI / 180;
        
//         phi = Math.min(Math.max(phi, -Math.PI / 2), Math.PI / 2); // Clamp phi to prevent camera flip
        
//         // Convert spherical coordinates to Cartesian (x, y, z)
//         let distance = camera.position.length();
//         camera.position.x = distance * Math.sin(phi) * Math.sin(theta);
//         camera.position.y = distance * Math.cos(phi);
//         camera.position.z = distance * Math.sin(phi) * Math.cos(theta);
        
//         // camera.lookAt(scene.position);
//         camera.lookAt(origin);

//         previousMousePosition.x = e.clientX;
//         previousMousePosition.y = e.clientY;
//     }
// });

// document.addEventListener('mouseup', (e) => {
//     if (e.button === 2) {
//         isRightMouseDown = false;
//     }
// });




document.addEventListener('pointerdown', (e) => {
    if (e.button === 2) { // Right mouse button
        isRightMouseDown = true;
        previousMousePosition.x = e.clientX;
        previousMousePosition.y = e.clientY;
    }
});

document.addEventListener('pointermove', (e) => {
    if (isRightMouseDown) {
        let deltaX = e.clientX - previousMousePosition.x;
        let deltaY = e.clientY - previousMousePosition.y;
        
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

        previousMousePosition.x = e.clientX;
        previousMousePosition.y = e.clientY;
    }
});

document.addEventListener('pointerup', (e) => {
    if (e.button === 2) {
        isRightMouseDown = false;
    }
});
