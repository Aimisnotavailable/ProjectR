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
const letterAudio = new Audio('./audio/one_of_my_favorite_sao_bgm.mp3'); // ensure this path is correct
letterAudio.loop = true; // Set to loop if you want the song to continue while the letter is open

// Flag to know if audio context is unlocked
let audioUnlocked = false;

// One-time event listener to unlock the audio context with a direct user gesture.
function unlockAudioContext() {
  letterAudio.play()
    .then(() => {
      letterAudio.pause();
      letterAudio.currentTime = 0;
      audioUnlocked = true;
      console.log("Audio context unlocked!");
    })
    .catch(error => console.error("Error unlocking audio context:", error));

  // Remove these listeners so this runs only once.
  document.removeEventListener("touchstart", unlockAudioContext, false);
  document.removeEventListener("click", unlockAudioContext, false);
}
document.addEventListener("touchstart", unlockAudioContext, false);
document.addEventListener("click", unlockAudioContext, false);

function openLetter() {
  letterCard.classList.add("open");

  // Log whether the audio context is unlocked.
  if (!audioUnlocked) {
    console.warn("Audio context still locked even though openLetter is triggered!");
  }

  // Start playing the letter music from the beginning.
  letterAudio.currentTime = 0;
  letterAudio.play().catch(error => {
    console.error("Error playing letter audio:", error);
  });

  // Start animations and display elements.
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
  letterAudio.currentTime = 0;

  // Reset animations and cancel flower sway.
  resetAllFlowers();
  cancelContainerSwayAnimation();

  // Remove dynamically spawned butterflies.
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
  
  // Remove carousel element.
  despawnCarousel();
}

document.addEventListener("DOMContentLoaded", () => {
  const letterCard = document.getElementById("letter-card");
  const unlockScreen = document.getElementById("unlock-screen");
  let isUnlocked = false;
  let firstTriggerHandled = false;

  // Unlock screen click handler.
  if (unlockScreen) {
    unlockScreen.addEventListener("click", function () {
      unlockScreen.classList.add("fade-out");
      const flipbookContainer = document.querySelector(".flipbook-container");
      if (flipbookContainer) {
        flipbookContainer.classList.add("unlocked");
      }
      isUnlocked = true;
      setTimeout(() => {
        unlockScreen.remove();
      }, 1000); // This should match your CSS transition duration.
    });
  }

  // MutationObserver to trigger openLetter/closeLetter actions.
  const observer = new MutationObserver(() => {
    if (!firstTriggerHandled) {
      firstTriggerHandled = true;
      console.log("Ignoring the first false alarm trigger.");
      return;
    }
    
    if (!isUnlocked) {
      console.log("Not unlocked yet; ignoring open-letter trigger.");
      return;
    }
    
    // Always re-read DOM references.
    const openBook = document.getElementById("open-book");
    const closeBook = document.getElementById("close-book");

    if (openBook && !letterCard.classList.contains("open")) {
      letterCard.classList.add("open");
      openLetter();
      console.log("open-book detected: letterCard set to open.");
    }

    if (closeBook && letterCard.classList.contains("open")) {
      letterCard.classList.remove("open");
      closeLetter();
      console.log("close-book detected: letterCard set to close.");
      window.location.reload();
    }
  });
  
  observer.observe(document.body, { childList: true, subtree: true });
});
