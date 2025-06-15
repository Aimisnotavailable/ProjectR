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

document.addEventListener("DOMContentLoaded", () => {
  const letterCard = document.getElementById("letter-card");

  const observer = new MutationObserver(() => {
    // Always read the reference fresh from the DOM
    const openBook = document.getElementById("open-book");
    const closeBook = document.getElementById("close-book")

    // When openBook is present and letterCard is not already open, open it.
    if (openBook && !letterCard.classList.contains("open")) {
      letterCard.classList.add("open");
      openLetter();
      console.log("open-book detected: letterCard set to open.");
    }

    if (closeBook && letterCard.classList.contains("open")) {
      letterCard.classList.add("open");
      closeLetter();
      console.log("close-book detected: letterCard set to open.");
    }

  });
  
  // Observe changes in the entire document subtree.
  observer.observe(document.body, { childList: true, subtree: true });
});
