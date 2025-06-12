import {
  populateFlowerContainers,
  adjustFlowerPositions,
  animateAllFlowers,
  startContainerSwayAnimation,
  resetAllFlowers,
  cancelContainerSwayAnimation
} from "./flower.js";
import { spawnCarousel, despawnCarousel } from "./carousel.js";
import { spawnButterfliesSequentially } from "./butterfly.js";

const letterCard = document.getElementById("letter-card");
const butterflyContainer = document.getElementById("butterfly-container");

// Ensure flowers are initially placed and in a reset state.
populateFlowerContainers();
adjustFlowerPositions();
resetAllFlowers();

function openLetter() {
  letterCard.classList.add("open");

  // Spawn the carousel outside the letter, 50px above it.

  // Existing animations and butterfly spawn.
  animateAllFlowers(() => {
    spawnButterfliesSequentially();
    spawnCarousel();
  });
  startContainerSwayAnimation();
}

function closeLetter() {
  letterCard.classList.remove("open");

  // Reset animations and cancel flower sway.
  resetAllFlowers();
  cancelContainerSwayAnimation();

  // Remove all dynamically spawned butterflies.
  butterflyContainer.innerHTML = "";
  document.querySelectorAll(".butterfly").forEach(butterfly => {
    butterfly.remove();
  });

  // Reset extra styles on flower elements.
  document.querySelectorAll('[id="stem-path"]').forEach(stem => {
    stem.style.transition = "none";
    stem.style.webkitTransition = "none";
    stem.style.strokeDasharray = "";
    stem.style.strokeDashoffset = "";
    stem.setAttribute("class", "");
  });
  document.querySelectorAll(".flower-container").forEach(flower => {
    flower.style.transition = "none";
    flower.style.webkitTransition = "none";
    flower.setAttribute("class", "flower-container");
  });
  
  // Despawn the carousel.
  despawnCarousel();
}

letterCard.addEventListener("pointerdown", () => {
  if (letterCard.classList.contains("open")) {
    closeLetter();
  } else {
    openLetter();
  }
});
