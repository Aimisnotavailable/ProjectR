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

// Global audio object for the letter
const letterAudio = new Audio('/audio/one_of_my_favorite_sao_bgm.mp3'); // update the path as needed
letterAudio.loop = true; // Set to loop if you want the song to continue while the letter is open

function openLetter() {
  letterCard.classList.add("open");

  // Start playing the letter music from the beginning.
  letterAudio.currentTime = 0;
  letterAudio.play().catch(error => {
    console.error("Error playing letter audio:", error);
  });

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

  // Stop the letter music immediately.
  letterAudio.pause();
  letterAudio.currentTime = 0; // Reset the song to the beginning

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
  const unlockScreen = document.getElementById("unlock-screen");
  let isUnlocked = false;
  let firstTriggerHandled = false;

  // Setup unlock screen click handler.
  if (unlockScreen) {
    unlockScreen.addEventListener("click", function () {
      // Fade out the unlock screen.
      unlockScreen.classList.add("fade-out");
      // Add the 'unlocked' class to flipbook-container to trigger its fade in.
      const flipbookContainer = document.querySelector(".flipbook-container");
      if (flipbookContainer) {
        flipbookContainer.classList.add("unlocked");
      }
      // Mark that the user has unlocked the letter.
      isUnlocked = true;
      // Remove the unlock screen after the CSS transition completes.
      setTimeout(() => {
        unlockScreen.remove();
      }, 1000); // This duration should match your CSS fade-out transition.
    });
  }

  // MutationObserver to trigger openLetter/closeLetter actions.
  const observer = new MutationObserver(() => {
    // Ignore the very first mutation event.
    if (!firstTriggerHandled) {
      firstTriggerHandled = true;
      console.log("Ignoring the first false alarm trigger.");
      return;
    }
    
    // Only proceed if the letter is unlocked.
    if (!isUnlocked) {
      console.log("Not unlocked yet; ignoring open-letter trigger.");
      return;
    }
    
    // Always re-read DOM references.
    const openBook = document.getElementById("open-book");
    const closeBook = document.getElementById("close-book");

    // Trigger the open-letter handler if open-book exists and letterCard isn’t open.
    if (openBook && !letterCard.classList.contains("open")) {
      letterCard.classList.add("open");
      openLetter();
      console.log("open-book detected: letterCard set to open.");
    }

    // Trigger the close-letter handler if close-book exists and letterCard is open.
    if (closeBook && letterCard.classList.contains("open")) {
      letterCard.classList.remove("open");
      closeLetter();
      console.log("close-book detected: letterCard set to close.");
      // Refresh the page to reset everything including the unlock (or apply any reset logic you need)
      window.location.reload();
    }
  });
  
  // Start observing DOM mutations in the entire document subtree.
  observer.observe(document.body, { childList: true, subtree: true });
});

