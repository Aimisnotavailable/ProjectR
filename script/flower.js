// script/flower.js

/*********************** Flower Constants *************************/

// Mobile flower dimensions (should correspond with your CSS media query)
export const MOBILE_CONTAINER_WIDTH = 80;    // in pixels
export const MOBILE_CONTAINER_HEIGHT = 138;  // in pixels
export const MOBILE_MARGIN = 5;              // horizontal margin between flowers
export const BOTTOM_MARGIN = 20;             // distance (in px) from the viewport bottom
export const RANDOM_Y_OFFSET_RANGE = 30;     // maximum random vertical offset in pixels
export const SCALE_FACTOR = 1;               // using mobile scale for a spread-out look

// Minimum number of flower containers (override as desired)
export const MIN_FLOWER_COUNT = 10;

// Timing constants for the flower animations (in milliseconds)
export const STEM_INITIAL_DELAY       = 100;
export const STEM_DRAW_DURATION       = 3000;
export const FLOWER_GROW_DELAY        = 3200;
export const PETAL_STAGGER_DELAY      = 200;
export const PETAL_ANIMATION_DURATION = 500;
export const CORE_ANIMATION_DELAY     = PETAL_STAGGER_DELAY * 5;

/*********************** Flower Functions *************************/

/**
 * populateFlowerContainers:
 * Ensures there are enough flower containers. Clones existing containers if necessary.
 */
export function populateFlowerContainers() {
  const field = document.getElementById("flower-field");
  const existingContainers = field.querySelectorAll(".flower-container");
  let currentCount = existingContainers.length;

  const desiredCount = Math.max(
    MIN_FLOWER_COUNT,
    Math.floor(window.innerWidth / (MOBILE_CONTAINER_WIDTH + MOBILE_MARGIN))
  );

  // If not enough containers exist, clone from the existing ones.
  if (currentCount < desiredCount) {
    const templates = Array.from(existingContainers);
    let templateIndex = 0;
    for (let i = currentCount; i < desiredCount; i++) {
      const clone = templates[templateIndex].cloneNode(true);
      // Clear any prior positioning styles so they get recalculated.
      clone.style.transform = "";
      field.appendChild(clone);
      templateIndex = (templateIndex + 1) % templates.length;
    }
  } else if (currentCount > desiredCount) {
    // Remove extra containers if desired.
    for (let i = desiredCount; i < currentCount; i++) {
      existingContainers[i].remove();
    }
  }
}

/**
 * adjustFlowerPositions:
 * Evenly positions each flower container along the width with a slight random vertical offset.
 */
export function adjustFlowerPositions() {
  const containers = document.querySelectorAll('.flower-container');
  const screenWidth = window.innerWidth;
  const screenHeight = window.innerHeight;

  // Total horizontal width taken up by flower containers.
  const totalWidth = containers.length * MOBILE_CONTAINER_WIDTH + (containers.length - 1) * MOBILE_MARGIN;
  const leftOffset = (screenWidth - totalWidth) / 2;

  // Base vertical placement so that the bottom is BOTTOM_MARGIN above the viewport bottom.
  const baseY = screenHeight - (MOBILE_CONTAINER_HEIGHT * SCALE_FACTOR) - BOTTOM_MARGIN;

  containers.forEach((container, index) => {
    const offsetX = leftOffset + index * (MOBILE_CONTAINER_WIDTH + MOBILE_MARGIN);
    // Random vertical shift so they’re not perfectly aligned.
    const randomYOffset = Math.random() * RANDOM_Y_OFFSET_RANGE;
    const offsetY = baseY - randomYOffset;
    
    container.dataset.baseX = offsetX;
    container.dataset.baseY = offsetY;
    container.dataset.scale = SCALE_FACTOR;
    
    // Assuming your CSS sets transform-origin: bottom center;
    container.style.transform = `translate(${offsetX}px, ${offsetY}px) scale(${SCALE_FACTOR})`;
  });
}

/**
 * animateFlower:
 * Animates a flower container by drawing its stem and growing its petals/core.
 */
function animateFlower(container) {
  const stem = container.querySelector("#stem-path");
  if (!stem) return;
  
  stem.style.transition = "none";
  const pathLength = stem.getTotalLength();
  stem.style.strokeDasharray = pathLength;
  stem.style.strokeDashoffset = pathLength;
  // Force reflow.
  stem.getBoundingClientRect();
  
  setTimeout(() => {
    stem.style.transition = `stroke-dashoffset ${STEM_DRAW_DURATION}ms ease-out`;
    stem.style.strokeDashoffset = "0";
  }, STEM_INITIAL_DELAY);
  
  setTimeout(() => {
    const tipPos = stem.getPointAtLength(pathLength);
    const flowerGroup = container.querySelector("#flower");
    if (flowerGroup) {
      flowerGroup.dataset.baseX = tipPos.x;
      flowerGroup.dataset.baseY = tipPos.y;
      flowerGroup.setAttribute("transform", `translate(${tipPos.x}, ${tipPos.y})`);
    }
    // Animate petals sequentially.
    const petals = container.querySelectorAll("#petals .petal");
    petals.forEach((petal, index) => {
      petal.style.transition = `transform ${PETAL_ANIMATION_DURATION}ms ease-out`;
      const angle = petal.dataset.rotate || "0";
      setTimeout(() => {
        petal.setAttribute("transform", `rotate(${angle}) scale(1)`);
      }, PETAL_STAGGER_DELAY * index);
    });
    // Animate the flower core.
    const core = container.querySelector("#flower-core");
    if (core) {
      core.style.transition = `transform ${PETAL_ANIMATION_DURATION}ms ease-out`;
      setTimeout(() => {
        core.setAttribute("transform", "scale(1)");
      }, CORE_ANIMATION_DELAY);
    }
  }, FLOWER_GROW_DELAY);
}

/**
 * animateAllFlowers:
 * Animates every flower container. Optional callback fires when animations finish.
 */
export function animateAllFlowers(callback) {
  const containers = document.querySelectorAll(".flower-container");
  let completed = 0;
  containers.forEach(container => {
    animateFlower(container);
    // Assuming the animation finishes after FLOWER_GROW_DELAY + CORE_ANIMATION_DELAY.
    setTimeout(() => {
      completed++;
      if (completed === containers.length && typeof callback === "function") {
        callback();
      }
    }, FLOWER_GROW_DELAY + CORE_ANIMATION_DELAY);
  });
}

/**
 * startContainerSwayAnimation:
 * Applies a continuous gentle sway on each flower container.
 */
export function startContainerSwayAnimation() {
  const containers = document.querySelectorAll('.flower-container');
  containers.forEach(container => {
    // Set a random phase for variation.
    container.dataset.phase = Math.random() * 2 * Math.PI;
  });
  
  const translationAmplitude = 5;
  const translationPeriod = 5000;
  const initialRotationAmplitude = 5;
  const rotationDecayDuration = 5000;
  const startTime = performance.now();
  
  function updateContainer(timestamp) {
    const elapsed = timestamp - startTime;
    containers.forEach(container => {
      const baseX = parseFloat(container.dataset.baseX) || 0;
      const baseY = parseFloat(container.dataset.baseY) || 0;
      const scale = parseFloat(container.dataset.scale) || 1;
      const phase = parseFloat(container.dataset.phase) || 0;
      
      // Calculate horizontal oscillation.
      const offsetX = translationAmplitude * Math.sin((timestamp / translationPeriod) * 2 * Math.PI + phase);
      let rotationEffect = 0;
      if (elapsed < rotationDecayDuration) {
        const decayFactor = 1 - (elapsed / rotationDecayDuration);
        rotationEffect = initialRotationAmplitude * decayFactor * Math.sin((timestamp / translationPeriod) * 2 * Math.PI + phase);
      }
      
      container.style.transform = `translate(${baseX + offsetX}px, ${baseY}px) scale(${scale}) rotate(${rotationEffect}deg)`;
    });
    requestAnimationFrame(updateContainer);
  }
  requestAnimationFrame(updateContainer);
}

/**
 * resetFlower and resetAllFlowers:
 * Resets flower animations so they can be restarted.
 */
function resetFlower(container) {
  const stem = container.querySelector("#stem-path");
  if (!stem) return;
  stem.style.transition = "none";
  const pathLength = stem.getTotalLength();
  stem.style.strokeDasharray = pathLength;
  stem.style.strokeDashoffset = pathLength;
  
  const petals = container.querySelectorAll("#petals .petal");
  petals.forEach(petal => {
    const angle = petal.dataset.rotate || "0";
    petal.style.transition = "";
    petal.setAttribute("transform", `rotate(${angle}) scale(0)`);
  });
  
  const core = container.querySelector("#flower-core");
  if (core) {
    core.style.transition = "";
    core.setAttribute("transform", "scale(0)");
  }
}

export function resetAllFlowers() {
  const containers = document.querySelectorAll(".flower-container");
  containers.forEach(container => resetFlower(container));
  setTimeout(() => {
    containers.forEach(container => animateFlower(container));
  }, 100);
}
