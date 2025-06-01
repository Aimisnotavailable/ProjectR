/**
 * animateButterfly:
 * Animates a butterfly element to fly smoothly to a random destination.
 */
export function animateButterfly(butterfly) {
  // Determine the butterfly's current position.
  let currentX =
    parseFloat(butterfly.dataset.cx) ||
    Math.random() * window.innerWidth;
  let currentY =
    parseFloat(butterfly.dataset.cy) ||
    Math.random() * window.innerHeight;

  // Choose a new random destination (accounting for a 50px size).
  let newX = Math.random() * (window.innerWidth - 50);
  let newY = Math.random() * (window.innerHeight - 50);

  let dx = newX - currentX;
  let dy = newY - currentY;
  // Calculate the flight angle in degrees.
  let angle = Math.atan2(dy, dx) * (180 / Math.PI);
  // Determine the flight duration based on distance.
  let distance = Math.sqrt(dx * dx + dy * dy);
  let speed = 150; // Pixels per second.
  let duration = distance / speed;
  if (duration < 1) duration = 1; // Enforce a minimum duration.

  // Use ease-out for the initial spawn flight, then ease-in-out.
  let easing = butterfly.dataset.initial ? "ease-out" : "ease-in-out";
  if (butterfly.dataset.initial) {
    delete butterfly.dataset.initial;
  }

  // Apply the transformation.
  butterfly.style.transition = `transform ${duration}s ${easing}`;
  butterfly.style.webkitTransition = `-webkit-transform ${duration}s ${easing}`;
  butterfly.style.transform = `translate(${newX}px, ${newY}px) rotate(${angle}deg)`;
  butterfly.style.webkitTransform = `translate(${newX}px, ${newY}px) rotate(${angle}deg)`;

  // Schedule the next animation cycle.
  let triggered = false;
  const nextCycle = () => {
    if (!triggered) {
      triggered = true;
      butterfly.dataset.cx = newX;
      butterfly.dataset.cy = newY;
      setTimeout(() => {
        animateButterfly(butterfly);
      }, 500 + Math.random() * 1000);
    }
  };

  // Listen for the transition end.
  const transitionHandler = function (e) {
    if (e.propertyName === "transform" || e.propertyName === "-webkit-transform") {
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
 * Spawns all butterfly elements immediately, positioning them off-screen and then animating into view.
 */
export function spawnButterfliesSequentially() {
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
    // Updated the z-index so that butterflies render on top.
    container.style.zIndex = "20";
    document.body.appendChild(container);
  } else {
    // Clear any previous butterflies.
    container.innerHTML = "";
  }

  const MIN_BUTTERFLY_COUNT = 10;
  const butterflyCount = Math.max(
    MIN_BUTTERFLY_COUNT,
    Math.floor(window.innerWidth / 100)
  );

  // Spawn all butterflies immediately.
  for (let i = 0; i < butterflyCount; i++) {
    const butterfly = document.createElement("div");
    butterfly.classList.add("butterfly");
    butterfly.style.width = "50px";
    butterfly.style.height = "50px";
    butterfly.style.position = "absolute";

    // Randomly decide off-screen spawn (left or right).
    let spawnFromLeft = Math.random() < 0.5;
    let initX = spawnFromLeft ? -50 : window.innerWidth + 50;
    let initY = Math.random() * (window.innerHeight - 50);
    butterfly.style.transform = `translate(${initX}px, ${initY}px) rotate(0deg)`;
    butterfly.style.webkitTransform = `translate(${initX}px, ${initY}px) rotate(0deg)`;
    butterfly.dataset.cx = initX;
    butterfly.dataset.cy = initY;
    butterfly.dataset.initial = "true"; // Mark as initial flight.

    // Set the butterfly background image (ensure the path is correct).
    butterfly.style.background = "url('./imgs/butterfly.gif') no-repeat center center";
    butterfly.style.backgroundSize = "contain";

    container.appendChild(butterfly);
    // Force the browser to apply the initial off-screen position.
    butterfly.getBoundingClientRect();
    // Start the animation after a short delay.
    setTimeout(() => {
      animateButterfly(butterfly);
    }, 50);
  }
}
