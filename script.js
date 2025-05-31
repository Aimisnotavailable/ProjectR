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

/**
 * adjustFlowerPositions:
 * Dynamically calculates and sets horizontal positions for all flower containers.
 * No vertical offset is applied (offsetY = 0).
 */
function adjustFlowerPositions() {
  const containers = document.querySelectorAll('.flower-container');
  const screenWidth = window.innerWidth;
  const screenHeight = window.innerHeight;
  const bottomMargin = 20;
  
  // Use matching dimensions for mobile vs. desktop.
  let containerWidth, containerHeight, margin;
  if (screenWidth < 600) {
    containerWidth = 80;   // smaller width on mobile (matches CSS)
    containerHeight = 138; // smaller height on mobile (matches CSS)
    margin = 5;            // adjust margin as needed on mobile
  } else {
    containerWidth = 100;
    containerHeight = 275;
    margin = 10;
  }
  
  const N = containers.length;
  // Total width is the sum of all flower widths plus the spaces in between.
  const totalWidth = N * containerWidth + (N - 1) * margin;
  // Center the field horizontally.
  const leftOffset = (screenWidth - totalWidth) / 2;
  
  // Decide on a scale factor.
  let scaleFactor = 1;
  if (screenWidth >= 600 && screenWidth < 1200) {
    scaleFactor = 1.5;
  } else if (screenWidth >= 1200) {
    scaleFactor = 2;
  }
  
  // Calculate vertical offset so that (after scaling) the container’s bottom
  // is 20px from the viewport bottom.
  const offsetY = screenHeight - (containerHeight * scaleFactor) - bottomMargin;
  
  containers.forEach((container, index) => {
    // Position each container with equal spacing.
    const offsetX = leftOffset + index * (containerWidth + margin);
    
    container.dataset.baseX = offsetX;
    container.dataset.baseY = offsetY;
    container.dataset.scale = scaleFactor;
    
    container.style.transform = `translate(${offsetX}px, ${offsetY}px) scale(${scaleFactor})`;
  });
}

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
