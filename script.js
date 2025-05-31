/*********************** Flower Constants *************************/

// Mobile flower dimensions (should correspond with your CSS media query)
const MOBILE_CONTAINER_WIDTH = 80;    // in pixels
const MOBILE_CONTAINER_HEIGHT = 138;  // in pixels
const MOBILE_MARGIN = 5;              // horizontal margin between flowers
const BOTTOM_MARGIN = 20;             // distance (in px) from the viewport bottom
const RANDOM_Y_OFFSET_RANGE = 30;     // maximum random vertical offset in pixels
const SCALE_FACTOR = 1;               // using mobile scale for a spread-out look

// Minimum number of flower containers (override as desired)
const MIN_FLOWER_COUNT = 10;

// Timing constants for the flower animations (in milliseconds)
const STEM_INITIAL_DELAY       = 100;
const STEM_DRAW_DURATION       = 3000;
const FLOWER_GROW_DELAY        = 3200;
const PETAL_STAGGER_DELAY      = 200;
const PETAL_ANIMATION_DURATION = 500;
const CORE_ANIMATION_DELAY     = PETAL_STAGGER_DELAY * 5;


/*********************** Flower Functions *************************/

/**
 * populateFlowerContainers:
 * Ensures that there are at least MIN_FLOWER_COUNT containers (or enough to fill the width)
 * by cloning the pre-loaded ones.
 */
function populateFlowerContainers() {
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
    // Remove extra containers, if desired.
    for (let i = desiredCount; i < currentCount; i++) {
      existingContainers[i].remove();
    }
  }
}

/**
 * adjustFlowerPositions:
 * Positions each flower container evenly along the width,
 * with a slightly randomized vertical offset.
 */
function adjustFlowerPositions() {
  const containers = document.querySelectorAll('.flower-container');
  const screenWidth = window.innerWidth;
  const screenHeight = window.innerHeight;

  // Total horizontal width taken up by the flower containers.
  const totalWidth = containers.length * MOBILE_CONTAINER_WIDTH + (containers.length - 1) * MOBILE_MARGIN;
  const leftOffset = (screenWidth - totalWidth) / 2;

  // Base vertical placement so that the bottom of each container is BOTTOM_MARGIN above viewport bottom.
  const baseY = screenHeight - (MOBILE_CONTAINER_HEIGHT * SCALE_FACTOR) - BOTTOM_MARGIN;

  containers.forEach((container, index) => {
    const offsetX = leftOffset + index * (MOBILE_CONTAINER_WIDTH + MOBILE_MARGIN);
    // Random vertical shift (so they are not all exactly aligned)
    const randomYOffset = Math.random() * RANDOM_Y_OFFSET_RANGE;
    const offsetY = baseY - randomYOffset;
    
    container.dataset.baseX = offsetX;
    container.dataset.baseY = offsetY;
    container.dataset.scale = SCALE_FACTOR;
    
    // Assuming your CSS for .flower-container sets transform-origin: bottom center;
    container.style.transform = `translate(${offsetX}px, ${offsetY}px) scale(${SCALE_FACTOR})`;
  });
}

/**
 * animateFlower:
 * Animates a single flower container (drawing its stem and growing its petals & core).
 * Expects the SVG to have the required element IDs (#stem-path, #flower, #petals, #flower-core).
 */
function animateFlower(container) {
  const stem = container.querySelector("#stem-path");
  if (!stem) return;
  
  stem.style.transition = "none";
  const pathLength = stem.getTotalLength();
  stem.style.strokeDasharray = pathLength;
  stem.style.strokeDashoffset = pathLength;
  // Force reflow to register the style change.
  stem.getBoundingClientRect();
  
  setTimeout(() => {
    stem.style.transition = `stroke-dashoffset ${STEM_DRAW_DURATION}ms ease-out`;
    stem.style.strokeDashoffset = "0";
  }, STEM_INITIAL_DELAY);
  
  setTimeout(() => {
    const tipPos = stem.getPointAtLength(pathLength);
    const flowerGroup = container.querySelector("#flower");
    if(flowerGroup) {
      flowerGroup.dataset.baseX = tipPos.x;
      flowerGroup.dataset.baseY = tipPos.y;
      flowerGroup.setAttribute("transform", `translate(${tipPos.x}, ${tipPos.y})`);
    }
    // Animate petals one by one.
    const petals = container.querySelectorAll("#petals .petal");
    petals.forEach((petal, index) => {
      petal.style.transition = `transform ${PETAL_ANIMATION_DURATION}ms ease-out`;
      const angle = petal.dataset.rotate || "0";
      setTimeout(() => {
        petal.setAttribute("transform", `rotate(${angle}) scale(1)`);
      }, PETAL_STAGGER_DELAY * index);
    });
    // Animate flower core after petals.
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
 * Triggers the animation for every flower container.
 * Accepts an optional callback that fires after all animation sequences finish.
 */
function animateAllFlowers(callback) {
  const containers = document.querySelectorAll(".flower-container");
  let completed = 0;
  containers.forEach(container => {
    animateFlower(container);
    // Assume the entire animation finishes after FLOWER_GROW_DELAY + CORE_ANIMATION_DELAY.
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
 * Applies a gentle, continuous sway (and rotational decay) to each flower container.
 */
function startContainerSwayAnimation() {
  const containers = document.querySelectorAll('.flower-container');
  containers.forEach(container => {
    // Give each container a random phase for sway variation.
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
      
      // Horizontal oscillation.
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
 * (Optional) Resets the flower animations so they can be restarted.
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

function resetAllFlowers() {
  const containers = document.querySelectorAll(".flower-container");
  containers.forEach(container => resetFlower(container));
  setTimeout(() => {
    containers.forEach(container => animateFlower(container));
  }, 100);
}


/*********************** Updated Butterfly Functions *************************/

/**
 * animateButterfly:
 * Animates a butterfly element to fly smoothly to a random destination.
 * The butterfly uses an "ease-out" transition on its initial spawn flight
 * (coming from off-screen) and then reverts to an "ease-in-out" for subsequent movements.
 */
function animateButterfly(butterfly) {
  // Determine the butterfly's current position.
  let currentX =
    parseFloat(butterfly.dataset.cx) ||
    Math.random() * window.innerWidth;
  let currentY =
    parseFloat(butterfly.dataset.cy) ||
    Math.random() * window.innerHeight;

  // Pick a new random destination within the viewport (accounting for a 50px butterfly size).
  let newX = Math.random() * (window.innerWidth - 50);
  let newY = Math.random() * (window.innerHeight - 50);

  let dx = newX - currentX;
  let dy = newY - currentY;
  // Calculate flight angle (in degrees) for proper rotation.
  let angle = Math.atan2(dy, dx) * (180 / Math.PI);
  // Calculate distance and determine the duration based on a constant speed.
  let distance = Math.sqrt(dx * dx + dy * dy);
  let speed = 150; // Pixels per second.
  let duration = distance / speed;
  if (duration < 1) duration = 1; // enforce a minimum duration

  // Use ease-out for the initial spawn flight, then ease-in-out afterward.
  let easing = butterfly.dataset.initial ? "ease-out" : "ease-in-out";
  if (butterfly.dataset.initial) {
    delete butterfly.dataset.initial;
  }

  // Apply the CSS transformation with the chosen easing.
  butterfly.style.transition = `transform ${duration}s ${easing}`;
  butterfly.style.transform = `translate(${newX}px, ${newY}px) rotate(${angle}deg)`;

  // Define a function to trigger the next animation cycle.
  let triggered = false;
  const nextCycle = () => {
    if (!triggered) {
      triggered = true;
      // Update the current coordinates.
      butterfly.dataset.cx = newX;
      butterfly.dataset.cy = newY;
      // Schedule the next movement.
      setTimeout(() => {
        animateButterfly(butterfly);
      }, 500 + Math.random() * 1000);
    }
  };

  // Listen for the transition end event.
  const transitionHandler = function (e) {
    if (e.propertyName === "transform") {
      butterfly.removeEventListener("transitionend", transitionHandler);
      nextCycle();
    }
  };
  butterfly.addEventListener("transitionend", transitionHandler);

  // Fallback in case transitionend doesn't fire.
  setTimeout(nextCycle, duration * 1000 + 50);
}

/**
 * spawnButterfliesSequentially:
 * Creates butterfly elements one by one from the far sides (left or right)
 * so they ease in toward the main display area.
 */
function spawnButterfliesSequentially() {
  let container = document.getElementById("butterfly-container");
  if (!container) {
    container = document.createElement("div");
    container.id = "butterfly-container";
    container.style.position = "fixed";
    container.style.top = "0";
    container.style.left = "0";
    container.style.width = "100%";
    container.style.height = "100%";
    container.style.pointerEvents = "none";
    container.style.zIndex = "2"; // Adjust z-index as needed.
    document.body.appendChild(container);
  } else {
    // Clear previous butterflies on resize or reload.
    container.innerHTML = "";
  }

  const MIN_BUTTERFLY_COUNT = 10;
  // Adjust the count based on viewport width.
  const butterflyCount = Math.max(
    MIN_BUTTERFLY_COUNT,
    Math.floor(window.innerWidth / 100)
  );
  // Delay (in ms) between each butterfly's spawn.
  const spawnDelay = 500;

  for (let i = 0; i < butterflyCount; i++) {
    setTimeout(() => {
      const butterfly = document.createElement("div");
      butterfly.classList.add("butterfly");
      butterfly.style.width = "50px";
      butterfly.style.height = "50px";
      butterfly.style.position = "absolute";

      // Randomly choose left or right off-screen spawn.
      let spawnFromLeft = Math.random() < 0.5;
      let initX = spawnFromLeft ? -50 : window.innerWidth + 50;
      let initY = Math.random() * (window.innerHeight - 50);
      butterfly.style.transform = `translate(${initX}px, ${initY}px) rotate(0deg)`;
      butterfly.dataset.cx = initX;
      butterfly.dataset.cy = initY;
      // Flag so that its initial movement uses ease-out.
      butterfly.dataset.initial = "true";

      // Use your butterfly SVG background (adjust the URL if necessary).
      butterfly.style.background = "url('butterfly.svg') no-repeat center center";
      butterfly.style.backgroundSize = "contain";

      container.appendChild(butterfly);
      // Start the butterfly's flight animation.
      animateButterfly(butterfly);
    }, i * spawnDelay);
  }
}


/*********************** Event Listeners *************************/

// When the window loads, set up the flower field, animate all flowers, and then spawn butterflies.
window.addEventListener("load", () => {
  populateFlowerContainers();
  adjustFlowerPositions();
  
  // Animate flowers and then spawn butterflies only after the bloom animations finish.
  animateAllFlowers(() => {
    spawnButterfliesSequentially();
  });
  
  startContainerSwayAnimation();
});

// On window resize, re-calculate flowers' positions and re-spawn the butterflies sequentially.
window.addEventListener("resize", () => {
  populateFlowerContainers();
  adjustFlowerPositions();
  spawnButterfliesSequentially();
});

// Attach the restart button (if it exists) to reset the flower animations.
const restartBtn = document.getElementById("restartBtn");
if (restartBtn) {
  restartBtn.addEventListener("click", resetAllFlowers);
}
