// make animation faster
// hide balls, show that they are handles
// user testing - 
// faq, free for royalty free commerical use
// 

setTimeout(function() {
    loadListeners();
    loadAnimationGrid();
  }, 1000);

function loadListeners() {
    const animationsButton = document.getElementById("animationsButton");
    const animationsPanel = document.getElementById("animations-panel");
    const animationsPanelClose = document.getElementById("animations-panel-close");
    animationsButton.addEventListener("click", function() {
        
        animationsPanel.style.left = 0;
        // loadAnimation();

      });

      animationsPanelClose.addEventListener("click", function() {
        animationsPanel.style.left = "-100%";
      });

    function loadAnimation() {
        keyFrames = IDLE_LOOP_7; 
    }
}

function loadAnimationGrid() {
  
      const gridElement = document.getElementById('grid');
  
      ANIMATIONS.forEach(animation => {
        const div = document.createElement('div');
        div.classList.add('animation-item');
        
        const img = document.createElement('img');
        img.src = animation.imageSrc;
        img.alt = animation.name;
        img.classList.add('animation-img');
        div.appendChild(img);

        const nameDiv = document.createElement('div');
        nameDiv.innerHTML = "<b>" + animation.name + "</b>";
        nameDiv.classList.add('animation-name');
        div.appendChild(nameDiv);

        const keyframeInfoDiv = document.createElement('div');
        keyframeInfoDiv.innerHTML =  "<b> Keyframes </b>" + animation.keyFrames.length;
        keyframeInfoDiv.classList.add('animation-info');
        div.appendChild(keyframeInfoDiv);

        //add author, link around athours names, let people drive traffic to thier sites 
        // message me to add custom to the libary
        // eventually form to add, add within 24 hours . show 24 message to user
      

        div.onclick = function() {
            const gridItems = document.querySelectorAll('#grid .animation-item');

            // Iterate over each grid item and remove 'select' class
            gridItems.forEach(item => {
                item.classList.remove('select');
            });

            this.classList.add('select');

            keyFrames = animation.keyFrames;
        }

        gridElement.appendChild(div);
      });
}