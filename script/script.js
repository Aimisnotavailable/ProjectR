import {
  populateFlowerContainers,
  adjustFlowerPositions,
  animateAllFlowers,
  startContainerSwayAnimation,
  resetAllFlowers,
  cancelContainerSwayAnimation
} from "./flower.js";

import { spawnButterfliesSequentially } from "./butterfly.js";

document.addEventListener("DOMContentLoaded", () => {
  // Get important elements after DOM is ready.
  const letterCard = document.getElementById("letter-card");
  const butterflyContainer = document.getElementById("butterfly-container");

  // Force the letter card to start in its default, closed state.
  letterCard.classList.remove("open");

  // Initialize flower positions and reset animations.
  populateFlowerContainers();
  adjustFlowerPositions();
  resetAllFlowers();

  // Define the function to open the letter.
  function openLetter() {
    letterCard.classList.add("open");

    // Animate flowers and then spawn butterflies.
    animateAllFlowers(() => {
      spawnButterfliesSequentially();
    });
    startContainerSwayAnimation();

    // Optionally, add a glowing effect to each flower container.
    document.querySelectorAll(".flower-container").forEach(flower => {
      flower.classList.add("glowing");
    });
  }

  // Define the function to close the letter.
  function closeLetter() {
    letterCard.classList.remove("open");

    // Reset all flower animations and cancel any container sway.
    resetAllFlowers();
    cancelContainerSwayAnimation();

    // Remove the glowing effect from flower containers.
    document.querySelectorAll(".flower-container").forEach(flower => {
      flower.classList.remove("glowing");
    });

    // Remove all dynamically spawned butterflies.
    if (butterflyContainer) {
      butterflyContainer.innerHTML = "";
    }
  }

  // Toggle the letter's open/closed state on click.
  letterCard.addEventListener("click", () => {
    if (letterCard.classList.contains("open")) {
      closeLetter();
    } else {
      openLetter();
    }
  });
});
