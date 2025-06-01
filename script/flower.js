/*********************** Flower Constants *************************/

export const MOBILE_CONTAINER_WIDTH = 80;    // in pixels
export const MOBILE_CONTAINER_HEIGHT = 138;  // in pixels
export const MOBILE_MARGIN = 5;              // horizontal margin between flowers
export const BOTTOM_MARGIN = 20;             // distance (in px) from the viewport bottom
export const RANDOM_Y_OFFSET_RANGE = 30;     // maximum random vertical offset in pixels
export const SCALE_FACTOR = 1;               // using mobile scale for a spread-out look

export const MIN_FLOWER_COUNT = 10;

export const STEM_INITIAL_DELAY       = 100;
export const STEM_DRAW_DURATION       = 3000;
export const FLOWER_GROW_DELAY        = 3200;
export const PETAL_STAGGER_DELAY      = 200;
export const PETAL_ANIMATION_DURATION = 500;
export const CORE_ANIMATION_DELAY     = PETAL_STAGGER_DELAY * 5;

/*********************** Global Variables *************************/

const flowerTimeouts = [];

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

  if (currentCount < desiredCount) {
    const templates = Array.from(existingContainers);
    let templateIndex = 0;
    for (let i = currentCount; i < desiredCount; i++) {
      const clone = templates[templateIndex].cloneNode(true);
      clone.style.transform = "";
      field.appendChild(clone);
      templateIndex = (templateIndex + 1) % templates.length;
    }
  } else if (currentCount > desiredCount) {
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

  const totalWidth = containers.length * MOBILE_CONTAINER_WIDTH + (containers.length - 1) * MOBILE_MARGIN;
  const leftOffset = (screenWidth - totalWidth) / 2;

  const baseY = screenHeight - (MOBILE_CONTAINER_HEIGHT * SCALE_FACTOR) - BOTTOM_MARGIN;

  containers.forEach((container, index) => {
    const offsetX = leftOffset + index * (MOBILE_CONTAINER_WIDTH + MOBILE_MARGIN);
    const randomYOffset = Math.random() * RANDOM_Y_OFFSET_RANGE;
    const offsetY = baseY - randomYOffset;
    
    container.dataset.baseX = offsetX;
    container.dataset.baseY = offsetY;
    container.dataset.scale = SCALE_FACTOR;
    
    container.style.transform = `translate(${offsetX}px, ${offsetY}px) scale(${SCALE_FACTOR})`;
    container.style.webkitTransform = `translate(${offsetX}px, ${offsetY}px) scale(${SCALE_FACTOR})`;
  });
}

/**
 * animateFlower:
 * Animates a flower container by drawing its stem and growing its petals/core.
 */
function animateFlower(container) {
  const letterCard = document.getElementById("letter-card");
  if (!letterCard || !letterCard.classList.contains("open")) return;
  
  const stem = container.querySelector('[id="stem-path"]');
  if (!stem) return;
  
  stem.style.transition = "none";
  stem.style.webkitTransition = "none";
  const pathLength = stem.getTotalLength();
  stem.style.strokeDasharray = pathLength;
  stem.style.strokeDashoffset = pathLength;
  stem.setAttribute("stroke-dasharray", pathLength);
  stem.setAttribute("stroke-dashoffset", pathLength);
  
  stem.getBoundingClientRect();
  
  const timeout1 = setTimeout(() => {
    if (!letterCard.classList.contains("open")) return;
    stem.style.transition = `stroke-dashoffset ${STEM_DRAW_DURATION}ms ease-out`;
    stem.style.webkitTransition = `stroke-dashoffset ${STEM_DRAW_DURATION}ms ease-out`;
    stem.style.strokeDashoffset = "0";
    stem.setAttribute("stroke-dashoffset", "0");
  }, STEM_INITIAL_DELAY);
  flowerTimeouts.push(timeout1);
  
  const timeout2 = setTimeout(() => {
    if (!letterCard.classList.contains("open")) return;
    const tipPos = stem.getPointAtLength(pathLength);
    const flowerGroup = container.querySelector("#flower");
    if (flowerGroup) {
      flowerGroup.dataset.baseX = tipPos.x;
      flowerGroup.dataset.baseY = tipPos.y;
      flowerGroup.setAttribute("transform", `translate(${tipPos.x}, ${tipPos.y})`);
    }
    const petals = container.querySelectorAll("#petals .petal");
    petals.forEach((petal, index) => {
      petal.style.transition = `transform ${PETAL_ANIMATION_DURATION}ms ease-out`;
      petal.style.webkitTransition = `-webkit-transform ${PETAL_ANIMATION_DURATION}ms ease-out`;
      const angle = petal.dataset.rotate || "0";
      const t = setTimeout(() => {
        petal.setAttribute("transform", `rotate(${angle}) scale(1)`);
      }, PETAL_STAGGER_DELAY * index);
      flowerTimeouts.push(t);
    });
    const core = container.querySelector("#flower-core");
    if (core) {
      core.style.transition = `transform ${PETAL_ANIMATION_DURATION}ms ease-out`;
      core.style.webkitTransition = `-webkit-transform ${PETAL_ANIMATION_DURATION}ms ease-out`;
      const t2 = setTimeout(() => {
        core.setAttribute("transform", "scale(1)");
      }, CORE_ANIMATION_DELAY);
      flowerTimeouts.push(t2);
    }
  }, FLOWER_GROW_DELAY);
  flowerTimeouts.push(timeout2);
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
    const t = setTimeout(() => {
      completed++;
      if (completed === containers.length && typeof callback === "function") {
        callback();
      }
    }, FLOWER_GROW_DELAY + CORE_ANIMATION_DELAY);
    flowerTimeouts.push(t);
  });
}

/**
 * startContainerSwayAnimation:
 * Applies a continuous gentle sway on each flower container.
 */
let swayAnimationFrameId = null;
export function startContainerSwayAnimation() {
  const containers = document.querySelectorAll('.flower-container');
  containers.forEach(container => {
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
      
      const offsetX = translationAmplitude * Math.sin((timestamp / translationPeriod) * 2 * Math.PI + phase);
      let rotationEffect = 0;
      if (elapsed < rotationDecayDuration) {
        const decayFactor = 1 - (elapsed / rotationDecayDuration);
        rotationEffect = initialRotationAmplitude * decayFactor * Math.sin((timestamp / translationPeriod) * 2 * Math.PI + phase);
      }
      
      container.style.transform = `translate(${baseX + offsetX}px, ${baseY}px) scale(${scale}) rotate(${rotationEffect}deg)`;
      container.style.webkitTransform = `translate(${baseX + offsetX}px, ${baseY}px) scale(${scale}) rotate(${rotationEffect}deg)`;
    });
    swayAnimationFrameId = requestAnimationFrame(updateContainer);
  }
  swayAnimationFrameId = requestAnimationFrame(updateContainer);
}

/**
 * cancelContainerSwayAnimation:
 * Cancels the ongoing continuous sway animation.
 */
export function cancelContainerSwayAnimation() {
  if (swayAnimationFrameId !== null) {
    cancelAnimationFrame(swayAnimationFrameId);
    swayAnimationFrameId = null;
  }
}

/**
 * resetFlower and resetAllFlowers:
 * Resets flower animations so they can be restarted.
 */
function resetFlower(container) {
  const stem = container.querySelector('[id="stem-path"]');
  if (!stem) return;
  stem.style.transition = "none";
  stem.style.webkitTransition = "none";
  const pathLength = stem.getTotalLength();
  stem.style.strokeDasharray = pathLength;
  stem.style.strokeDashoffset = pathLength;
  stem.setAttribute("stroke-dasharray", pathLength);
  stem.setAttribute("stroke-dashoffset", pathLength);
  
  const petals = container.querySelectorAll("#petals .petal");
  petals.forEach(petal => {
    const angle = petal.dataset.rotate || "0";
    petal.style.transition = "";
    petal.style.webkitTransition = "";
    petal.setAttribute("transform", `rotate(${angle}) scale(0)`);
  });
  
  const core = container.querySelector("#flower-core");
  if (core) {
    core.style.transition = "";
    core.style.webkitTransition = "";
    core.setAttribute("transform", "scale(0)");
  }
}

export function resetAllFlowers() {
  const containers = document.querySelectorAll(".flower-container");
  containers.forEach(container => resetFlower(container));
  flowerTimeouts.forEach(timeoutID => clearTimeout(timeoutID));
  flowerTimeouts.length = 0;
}
