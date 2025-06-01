// script/script.js

import {
  populateFlowerContainers,
  adjustFlowerPositions,
  animateAllFlowers,
  startContainerSwayAnimation,
  resetAllFlowers
} from "./flower.js";

import { spawnButterfliesSequentially } from "./butterfly.js";

/*********************** Event Listeners *************************/

// When the window loads, set up the flower field, animate flowers, then spawn butterflies.
window.addEventListener("load", () => {
  populateFlowerContainers();
  adjustFlowerPositions();
  
  // Animate all flowers; then spawn butterflies once the animations complete.
  animateAllFlowers(() => {
    spawnButterfliesSequentially();
  });
  
  startContainerSwayAnimation();
});

// On window resize, re-calculate flower positions and re-spawn butterflies.
window.addEventListener("resize", () => {
  populateFlowerContainers();
  adjustFlowerPositions();
  spawnButterfliesSequentially();
});

// Attach the restart button to reset the flower animations.
const restartBtn = document.getElementById("restartBtn");
if (restartBtn) {
  restartBtn.addEventListener("click", resetAllFlowers);
};
