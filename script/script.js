import {
  populateFlowerContainers,
  adjustFlowerPositions,
  animateAllFlowers,
  startContainerSwayAnimation,
  resetAllFlowers,
  cancelContainerSwayAnimation
} from "./flower.js";

import { spawnButterfliesSequentially } from "./butterfly.js";

const letterCard = document.getElementById("letter-card");
const butterflyContainer = document.getElementById("butterfly-container");

// Initially, ensure flowers are placed and in a reset state.
populateFlowerContainers();
adjustFlowerPositions();
resetAllFlowers();

function openLetter() {
  letterCard.classList.add("open");

  // Animate flowers and then spawn butterflies.
  animateAllFlowers(() => {
    spawnButterfliesSequentially();
  });

  startContainerSwayAnimation();
}

function closeLetter() {
  letterCard.classList.remove("open");

  // Reset all flower animations and clear pending timeouts.
  resetAllFlowers();

  // Cancel the continuous flower sway animation.
  cancelContainerSwayAnimation();

  // Remove all dynamically spawned butterflies.
  butterflyContainer.innerHTML = "";
  document.querySelectorAll(".butterfly").forEach(butterfly => {
    butterfly.style.transition = "none";
    butterfly.style.webkitTransition = "none";
    butterfly.style.transform = "";
    butterfly.remove();
  });

  // Reset any inline styles and extra classes on the stem paths.
  document.querySelectorAll('[id="stem-path"]').forEach((stem) => {
    stem.style.transition = "none";
    stem.style.webkitTransition = "none";
    stem.style.strokeDasharray = "";
    stem.style.strokeDashoffset = "";
    stem.className = "";
  });

  // Reset flower container animations to a clean state.
  document.querySelectorAll(".flower-container").forEach(flower => {
    flower.style.transition = "none";
    flower.style.webkitTransition = "none";
    flower.className = "flower-container";
  });
}

letterCard.addEventListener("mouseenter", openLetter);
letterCard.addEventListener("mouseleave", closeLetter);

// Add touch events for mobile Safari support.
letterCard.addEventListener("touchstart", openLetter);
letterCard.addEventListener("touchend", closeLetter);
