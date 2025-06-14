// flipbook.js
import { animateAllFlowers, resetAllFlowers, startContainerSwayAnimation, cancelContainerSwayAnimation } from "./flower.js";
import { spawnCarousel, despawnCarousel } from "./carousel.js";
import { spawnButterfliesSequentially } from "./butterfly.js";

$(document).ready(function () {
  const $flipbook = $(".flipbook");
  let isOpen = false;

  function openFlipbook() {
    $flipbook.addClass("open");
    // Start animations: flowers, then when finished spawn butterflies and carousel.
    animateAllFlowers(() => {
      spawnButterfliesSequentially();
      spawnCarousel();
    });
    startContainerSwayAnimation();
    isOpen = true;
  }

  function closeFlipbook() {
    $flipbook.removeClass("open");
    resetAllFlowers();
    cancelContainerSwayAnimation();
    $("#butterfly-container").empty();
    despawnCarousel();
    isOpen = false;
  }

  // Toggle open/close on click.
  $flipbook.on("click", function () {
    if (isOpen) {
      closeFlipbook();
    } else {
      openFlipbook();
    }
  });

  // Initialize turn.js so the flipbook has page-turn functionality.
  $(".flipbook").turn();
});
