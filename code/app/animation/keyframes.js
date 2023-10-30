// eventually make export panel with animation, spritesheet, gif format 
// belongs in export instead of keyframes
function ExportAnimationListener() {


document.getElementById('export-animation').addEventListener('click', function() {
    const jsonStr = JSON.stringify(keyFrames, null, 2); // Pretty-printed JSON string
    const blob = new Blob([jsonStr], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'keyFrames.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
});
}


if (document.readyState === "loading") {  // If document is still loading
    document.addEventListener("DOMContentLoaded", ExportAnimationListener);
} else {  // If document is already loaded
    ExportAnimationListener()();
}