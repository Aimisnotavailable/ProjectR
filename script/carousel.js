// ---------- Configuration ----------
// Full array of image URLs (adjust as needed)
const fullImages = [
  "ProjectR/carousel/0.png",
  "ProjectR/carousel/1.png",
  "ProjectR/carousel/2.png",
  "ProjectR/carousel/3.png",
  "ProjectR/carousel/4.png",
  "ProjectR/carousel/5.png",
  "ProjectR/carousel/6.png",
  "ProjectR/carousel/7.png"
];
const totalImages = fullImages.length;

/*
We want five visible slots (offsets: -2, -1, 0, 1, 2),
with one extra item (offset 3) for a seamless looping effect.
*/

// Predefined slot layout information for a 600px-wide container.
const slotLayouts = {
  "-2": { left: 0,   top: 30,  width: 120, height: 68, opacity: 0.6, zIndex: 1 },
  "-1": { left: 20,  top: 20,  width: 160, height: 90, opacity: 0.8, zIndex: 2 },
   "0": { left: 180, top: 0,   width: 240, height: 135, opacity: 1,   zIndex: 3 },
  "1": { left: 400, top: 20,  width: 160, height: 90, opacity: 0.8, zIndex: 2 },
  "2": { left: 480, top: 30,  width: 120, height: 68, opacity: 0.6, zIndex: 1 },
  "3": { left: 600, top: 30,  width: 80,  height: 45, opacity: 0,   zIndex: 0 } // Extra off-screen slot
};

// Global variable to hold the current selected image index.
let selectedIndex = 2;

// Global array for carousel item DOM elements.
let carouselItems = [];

// Global variable to store the interval ID.
let carouselInterval = null;

/**
 * getImageIndex(offset)
 * Given an offset (e.g., -2, -1, 0, 1, 2, or 3) from the current selected image,
 * returns the correct index in fullImages using circular wrap-around.
 */
function getImageIndex(offset) {
  return (selectedIndex + offset + totalImages) % totalImages;
}

/**
 * createCarouselItems()
 * Builds the 6 carousel item elements positioned based on its starting offset.
 */
function createCarouselItems(track) {
  // Offsets in order: -2, -1, 0, 1, 2, 3.
  const offsets = [-2, -1, 0, 1, 2, 3];
  offsets.forEach((offset) => {
    const layout = slotLayouts[offset];
    const item = document.createElement("div");
    item.setAttribute("data-offset", offset);
    item.style.position = "absolute";
    item.style.left = layout.left + "px";
    item.style.top = layout.top + "px";
    item.style.width = layout.width + "px";
    item.style.height = layout.height + "px";
    item.style.opacity = layout.opacity;
    item.style.zIndex = layout.zIndex;
    // Smooth easing transitions.
    item.style.transition = "all 0.8s cubic-bezier(0.25, 0.1, 0.25, 1)";
    item.style.webkitTransition = "all 0.8s cubic-bezier(0.25, 0.1, 0.25, 1)";

    const img = document.createElement("img");
    img.src = fullImages[getImageIndex(offset)];
    img.style.width = "100%";
    img.style.height = "100%";
    img.style.objectFit = "cover";

    item.appendChild(img);
    track.appendChild(item);
    carouselItems.push(item);
  });
}

/**
 * shiftTrackForward()
 * Animates the carousel items shifting left by one slot.
 */
function shiftTrackForward() {
  carouselItems.forEach((item) => {
    let currentOffset = parseInt(item.getAttribute("data-offset"));
    let newOffset = currentOffset - 1;
    if (newOffset < -2) {
      newOffset = 3;
      const newImageIndex = (selectedIndex + 3 + 1) % totalImages;
      const img = item.querySelector("img");
      img.src = fullImages[newImageIndex];
    }
    item.setAttribute("data-offset", newOffset);
    const layout = slotLayouts[newOffset];
    item.style.left = layout.left + "px";
    item.style.top = layout.top + "px";
    item.style.width = layout.width + "px";
    item.style.height = layout.height + "px";
    item.style.opacity = layout.opacity;
    item.style.zIndex = layout.zIndex;
  });
  selectedIndex = (selectedIndex + 1) % totalImages;
}

/**
 * insertCarouselAnimationStyles()
 * Inserts keyframe definitions for the carousel spawn animation
 * (with vendor prefixes for Safari and Firefox).
 */
function insertCarouselAnimationStyles() {
  if (!document.getElementById("carouselAnimationStyle")) {
    const styleElem = document.createElement("style");
    styleElem.id = "carouselAnimationStyle";
    styleElem.textContent = `
      /* For Safari, Chrome, and older WebKit browsers */
      @-webkit-keyframes carouselSpawn {
        from { opacity: 0; -webkit-transform: translateY(50px); transform: translateY(50px); }
        to { opacity: 1; -webkit-transform: translateY(0); transform: translateY(0); }
      }
      /* Standard keyframes for modern browsers including Firefox */
      @keyframes carouselSpawn {
        from { opacity: 0; -webkit-transform: translateY(50px); transform: translateY(50px); }
        to { opacity: 1; -webkit-transform: translateY(0); transform: translateY(0); }
      }
    `;
    document.head.appendChild(styleElem);
  }
}

/**
 * spawnCarousel()
 * Creates, inserts, positions, and animates the carousel component.
 *
 * The carousel container maintains a maximum width of 600px and its center is
 * aligned with the center of the viewport. Its vertical position is set dynamically
 * relative to the letter-card element.
 */
export function spawnCarousel() {
  console.log("spawnCarousel() called.");

  // Prevent duplicate spawn.
  if (document.getElementById("carousel")) {
    console.log("spawnCarousel: Carousel already exists.");
    return;
  }

  // Insert animation keyframe styles.
  insertCarouselAnimationStyles();

  // Create the outer carousel container.
  const carousel = document.createElement("div");
  const letter = document.getElementById("letter-card");

  carousel.id = "carousel";
  carousel.style.position = "fixed";
  carousel.style.width = "600px";    // Maximum container width.
  carousel.style.height = "160px";   // Container height adjusted for landscape slots.

  // Horizontal centering: center the carousel based on viewport width.
  carousel.style.left = (window.innerWidth / 2 - 300) + "px"; // (600 / 2 = 300)

  // Vertical positioning: set the carousel's top edge relative to the letter-card.
  const letterRect = letter.getBoundingClientRect();
  if (window.innerWidth <= 768) {  // for smaller screens
    carousel.style.top = (letterRect.top - 20 - 160) + "px";
  } else { // for larger screens
    carousel.style.top = (letterRect.top - 20 - 100) + "px";
  }

  carousel.style.overflow = "hidden";
  carousel.style.zIndex = "15";
  carousel.style.background = "transparent";

  // Apply spawn animation with vendor prefixes.
  carousel.style.animation = "carouselSpawn 0.8s ease-out forwards";
  carousel.style.webkitAnimation = "carouselSpawn 0.8s ease-out forwards";

  // Create the inner track.
  const track = document.createElement("div");
  track.id = "carousel-track";
  track.style.position = "relative";
  track.style.width = "600px";
  track.style.height = "160px";

  carousel.appendChild(track);
  document.body.appendChild(carousel);

  console.log("spawnCarousel: Carousel appended at top:", carousel.style.top, "left:", carousel.style.left);

  // Clear the previous carousel items, then create new ones.
  carouselItems = [];
  createCarouselItems(track);

  // Autoplay: shift carousel items every 2 seconds.
  carouselInterval = setInterval(() => {
    shiftTrackForward();
  }, 2000);
}

/**
 * despawnCarousel()
 * Removes the carousel component from the DOM and clears the shift interval.
 */
export function despawnCarousel() {
  // Clear the interval if it's running.
  if (carouselInterval !== null) {
    clearInterval(carouselInterval);
    carouselInterval = null;
    console.log("despawnCarousel: Carousel interval cleared.");
  }
  
  // Remove carousel element if it exists.
  const carousel = document.getElementById("carousel");
  if (carousel) {
    carousel.remove();
    console.log("despawnCarousel: Carousel removed.");
  }
}
