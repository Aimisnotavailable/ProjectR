// Timing constants (in milliseconds)
const STEM_INITIAL_DELAY       = 100;
const STEM_DRAW_DURATION       = 3000;
const FLOWER_GROW_DELAY        = 3200;
const PETAL_STAGGER_DELAY      = 200;
const PETAL_ANIMATION_DURATION = 500;
const CORE_ANIMATION_DELAY     = PETAL_STAGGER_DELAY * 5;
const LEAF_SPAWN_DELAY         = FLOWER_GROW_DELAY + CORE_ANIMATION_DELAY + 500;
const LEAF_STAGGER_DELAY       = 300;
const LEAF_ANIMATION_DURATION  = 700;

// Leaf configuration objects
const leafConfigs = [
  { 
    factor: 0.3, 
    offset: -30, 
    randomize: true, 
    randomAngleRange: 10, 
    randomXRange: 5, 
    randomYRange: 5 
  },
  { 
    factor: 0.7, 
    offset: 30, 
    randomize: true, 
    randomAngleRange: 10, 
    randomXRange: 5, 
    randomYRange: 5,
    left: true
  }
];

// Use mobile dimensions for a “full” spread
const MOBILE_CONTAINER_WIDTH = 80;    // should match your CSS media query constants
const MOBILE_CONTAINER_HEIGHT = 138;  // should match your CSS media query constants
const MOBILE_MARGIN = 5;              // horizontal margin between flowers
const BOTTOM_MARGIN = 20;             // distance from the viewport bottom
const RANDOM_Y_OFFSET_RANGE = 30;     // maximum random vertical offset (in pixels)
const SCALE_FACTOR = 1;               // for the mobile look

/**
 * populateFlowerContainers:
 * Ensures that there are at least a desired number of flower containers
 * in the #flower-field by cloning from the pre-loaded ones.
 */
function populateFlowerContainers() {
  const field = document.getElementById("flower-field");
  const existingContainers = field.querySelectorAll(".flower-container");
  let currentCount = existingContainers.length;
  
  // Based on available screen width and a minimum of 10 containers:
  // Calculate desired count from mobile dimensions.
  const desiredCount = Math.max(
    20,
    Math.floor(window.innerWidth / (MOBILE_CONTAINER_WIDTH + MOBILE_MARGIN))
  );
  
  // If not enough containers, clone from the first one (or cycle through the 4 pre-loaded)
  if (currentCount < desiredCount) {
    // We can cycle through existing ones for variety if desired.
    const templates = Array.from(existingContainers);
    let templateIndex = 0;
    for (let i = currentCount; i < desiredCount; i++) {
      const clone = templates[templateIndex].cloneNode(true);
      // Remove any inline transform styles so that they get recalculated.
      clone.style.transform = "";
      field.appendChild(clone);
      templateIndex = (templateIndex + 1) % templates.length;
    }
  } else if (currentCount > desiredCount) {
    // Optionally remove extras if desired.
    for (let i = desiredCount; i < currentCount; i++) {
      existingContainers[i].remove();
    }
  }
}

/**
 * adjustFlowerPositions:
 * Positions each flower container evenly along the width,
 * and gives each a random vertical offset so they are not all on a single line.
 */
function adjustFlowerPositions() {
  const containers = document.querySelectorAll('.flower-container');
  const screenWidth = window.innerWidth;
  const screenHeight = window.innerHeight;
  
  // Use mobile dimensions for layout.
  const containerWidth = MOBILE_CONTAINER_WIDTH;
  const containerHeight = MOBILE_CONTAINER_HEIGHT;
  const margin = MOBILE_MARGIN;
  
  // Total horizontal space taken by all containers.
  const totalWidth = containers.length * containerWidth + (containers.length - 1) * margin;
  const leftOffset = (screenWidth - totalWidth) / 2;
  
  // Base vertical position where the bottom of a flower container should be,
  // i.e. container bottom is BOTTOM_MARGIN above the viewport bottom.
  const baseY = screenHeight - (containerHeight * SCALE_FACTOR) - BOTTOM_MARGIN;
  
  // Loop through each container:
  containers.forEach((container, index) => {
    // Evenly space horizontally.
    const offsetX = leftOffset + index * (containerWidth + margin);
    
    // Add a random vertical offset (so they’re not in a perfect horizontal line).
    // This subtracts a random amount (0 to RANDOM_Y_OFFSET_RANGE) from the base.
    const randomYOffset = Math.random() * RANDOM_Y_OFFSET_RANGE;
    const offsetY = baseY - randomYOffset;
    
    // Save these values in data attributes (if needed for further animations)
    container.dataset.baseX = offsetX;
    container.dataset.baseY = offsetY;
    container.dataset.scale = SCALE_FACTOR;
    
    // With transform-origin set to bottom center in CSS, this moves the container so that
    // its bottom center is at (offsetX, offsetY).
    container.style.transform = `translate(${offsetX}px, ${offsetY}px) scale(${SCALE_FACTOR})`;
  });
}

// ---
// Integration with your existing code:
// (Assuming you already have functions like animateAllFlowers() and startContainerSwayAnimation())

// When the window loads, populate and reposition the flower containers.
window.addEventListener("load", () => {
  populateFlowerContainers();
  adjustFlowerPositions();
  animateAllFlowers();
  startContainerSwayAnimation();
});

// Re-calculate positions (and re-populate if necessary) on resize.
window.addEventListener("resize", () => {
  populateFlowerContainers();
  adjustFlowerPositions();
});

/**
 * computeLeafTransform:
 * Computes a transform (translate, scale, rotate) for a leaf based on the stem.
 */
function computeLeafTransform(stem, pathLength, config, final, leaf) {
  let pos = stem.getPointAtLength(pathLength * config.factor);
  let posAhead = stem.getPointAtLength(pathLength * config.factor + 1);
  let tangentDeg = Math.atan2(posAhead.y - pos.y, posAhead.x - pos.x) * (180 / Math.PI);
  let angle = tangentDeg + config.offset;
  
  if (config.randomize) {
    if (!leaf.dataset.randAngle) {
      leaf.dataset.randAngle = (Math.random() * config.randomAngleRange * 2 - config.randomAngleRange).toFixed(2);
      leaf.dataset.randX = (Math.random() * config.randomXRange * 2 - config.randomXRange).toFixed(2);
      leaf.dataset.randY = (Math.random() * config.randomYRange * 2 - config.randomYRange).toFixed(2);
    }
    angle += parseFloat(leaf.dataset.randAngle);
    pos.x += parseFloat(leaf.dataset.randX);
    pos.y += parseFloat(leaf.dataset.randY);
  }
  
  if (config.left) {
    angle = (angle + 360) % 360;
    if (angle < 90) angle += 180;
    else if (angle > 270) angle -= 180;
  }
  
  const scaleVal = final ? 1 : 0;
  return `translate(${pos.x}, ${pos.y}) scale(${scaleVal}) rotate(${angle})`;
}

/**
 * animateFlower:
 * Animates one flower container (stem, petals, core, leaves).
 * Positions the flower group at the tip of the stem.
 */
function animateFlower(container) {
  const stem = container.querySelector("#stem-path");
  stem.style.transition = "none";
  const pathLength = stem.getTotalLength();
  stem.style.strokeDasharray = pathLength;
  stem.style.strokeDashoffset = pathLength;
  stem.getBoundingClientRect();
  
  setTimeout(() => {
    stem.style.transition = `stroke-dashoffset ${STEM_DRAW_DURATION}ms ease-out`;
    stem.style.strokeDashoffset = "0";
  }, STEM_INITIAL_DELAY);
  
  setTimeout(() => {
    const tipPos = stem.getPointAtLength(pathLength);
    const flowerGroup = container.querySelector("#flower");
    flowerGroup.dataset.baseX = tipPos.x;
    flowerGroup.dataset.baseY = tipPos.y;
    flowerGroup.setAttribute("transform", `translate(${tipPos.x}, ${tipPos.y})`);
    
    const petals = container.querySelectorAll("#petals .petal");
    petals.forEach((petal, index) => {
      petal.style.transition = `transform ${PETAL_ANIMATION_DURATION}ms ease-out`;
      const angle = petal.dataset.rotate || "0";
      setTimeout(() => {
        petal.setAttribute("transform", `rotate(${angle}) scale(1)`);
      }, PETAL_STAGGER_DELAY * index);
    });
    
    const core = container.querySelector("#flower-core");
    if (core) {
      core.style.transition = `transform ${PETAL_ANIMATION_DURATION}ms ease-out`;
      setTimeout(() => {
        core.setAttribute("transform", "scale(1)");
      }, CORE_ANIMATION_DELAY);
    }
  }, FLOWER_GROW_DELAY);
  
  const leaves = container.querySelectorAll("#leaves .leaf");
  leaves.forEach((leaf, index) => {
    const config = leafConfigs[index] || { factor: 0.5, offset: 0, randomize: false };
    leaf.style.transition = "none";
    const initialTransform = computeLeafTransform(stem, pathLength, config, false, leaf);
    leaf.setAttribute("transform", initialTransform);
  });
  setTimeout(() => {
    const leaves = container.querySelectorAll("#leaves .leaf");
    leaves.forEach((leaf, index) => {
      const config = leafConfigs[index] || { factor: 0.5, offset: 0, randomize: false };
      leaf.style.transition = `transform ${LEAF_ANIMATION_DURATION}ms ease-out`;
      setTimeout(() => {
        const finalTransform = computeLeafTransform(stem, pathLength, config, true, leaf);
        leaf.setAttribute("transform", finalTransform);
      }, LEAF_STAGGER_DELAY * index);
    });
  }, LEAF_SPAWN_DELAY);
}

/**
 * animateAllFlowers:
 * Iterates through each flower container and starts its animation.
 */
function animateAllFlowers() {
  const containers = document.querySelectorAll(".flower-container");
  containers.forEach(container => animateFlower(container));
}

/**
 * resetFlower:
 * Resets a single flower container's elements to their initial state.
 */
function resetFlower(container) {
  const stem = container.querySelector("#stem-path");
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
  
  const leaves = container.querySelectorAll("#leaves .leaf");
  leaves.forEach((leaf, index) => {
    leaf.style.transition = "";
    delete leaf.dataset.randAngle;
    delete leaf.dataset.randX;
    delete leaf.dataset.randY;
    const config = leafConfigs[index] || { factor: 0.5, offset: 0, randomize: false };
    leaf.setAttribute("transform", computeLeafTransform(stem, pathLength, config, false, leaf));
  });
}

/**
 * resetAllFlowers:
 * Resets every flower container and re-animates them.
 */
function resetAllFlowers() {
  const containers = document.querySelectorAll(".flower-container");
  containers.forEach(container => resetFlower(container));
  setTimeout(() => {
    containers.forEach(container => animateFlower(container));
  }, 100);
}

/**
 * startContainerSwayAnimation:
 * Applies continuous horizontal sway plus a decaying rotation to each flower container.
 * Uses the dynamic base positions and scales from adjustFlowerPositions.
 */
function startContainerSwayAnimation() {
  const containers = document.querySelectorAll('.flower-container');
  // Assign a random phase for each container.
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
      const phase = parseFloat(container.dataset.phase);
      
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

// Start everything when the window loads.
window.addEventListener("load", () => {
  adjustFlowerPositions();
  animateAllFlowers();
  startContainerSwayAnimation();
});
window.addEventListener("resize", adjustFlowerPositions);
document.getElementById("restartBtn").addEventListener("click", resetAllFlowers);
