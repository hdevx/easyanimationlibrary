setTimeout(function() {
    loaded();
  }, 2000);

  function loaded() {

    


let currentTooltipIndex = 10;
// this is the tooltip for the default model, which is flipped 
// const tooltipTexts = ["Click Head", "Click Left Hand", "Click Chest", "Click Right Hand", "Click Pelvis", "Click Left Foot", "Click Right Foot"];
// sometimes wheel
const tooltipTexts = ["Click Head", "Click Right Hand", "Click Chest", "Click Left Hand", "Click Pelvis", "Click Right Foot", "Click Left Foot"];
const tooltip = document.getElementById("tooltip");

document.addEventListener("mousemove", function (e) {
    if (currentTooltipIndex < tooltipTexts.length) {
        tooltip.style.top = (e.clientY + 10) + 'px';
        tooltip.style.left = (e.clientX + 10) + 'px';
    }
});

document.addEventListener("click", function () {
    if (currentTooltipIndex < tooltipTexts.length) {
        tooltip.innerText = tooltipTexts[currentTooltipIndex];
        tooltip.style.display = "block";
        tooltip.style.opacity = 0;

        setTimeout(() => {
            tooltip.style.opacity = 1;
        }, 10);

        currentTooltipIndex++;
    } else {
        if (currentTooltipIndex == tooltipTexts.length) {
            tooltip.style.display = "none"; // Hide tooltip after all texts are shown
            newHandleMode = false;
        }
        currentTooltipIndex++;
        
    }
});


// move custom image model to own file
// setNewSkeleton

$('.closeUploadImageModal').click(function(event) {
    // if (setNewSkeleton) {
    //     // delete all handles;    
    // }
        

    if (uploadClicked) {
        // if ( createNewRigButton == true )
        // erase all handles
            eraseAllHandles();
            handles = [];
        
        if (handles.length == 0) {
            currentTooltipIndex = 0;
            newHandleMode = true;
        } 
        
    } 

    
    });

    
}