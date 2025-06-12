// carousel.js

// ---------- Configuration ----------
// Full array of image URLs (adjust as needed)
const fullImages = [
  "https://cdn.pixabay.com/photo/2017/08/15/08/23/stars-2643089__340.jpg",
  "https://cdn.pixabay.com/photo/2012/11/28/11/28/rocket-launch-67723__340.jpg",
  "https://cdn.pixabay.com/photo/2018/08/15/13/10/galaxy-3608029_960_720.jpg",
  "https://cdn.pixabay.com/photo/2020/06/17/09/28/wormhole-5308810__340.jpg",
  "https://cdn.pixabay.com/photo/2016/11/18/22/58/stars-1837306__340.jpg",
  "https://cdn.pixabay.com/photo/2017/02/09/09/11/starry-sky-2051448__340.jpg",
  "https://cdn.pixabay.com/photo/2011/12/15/11/37/galaxy-11188__340.jpg",
  "https://cdn.pixabay.com/photo/2011/12/15/11/32/pismis-24-11186__340.jpg"
];
const totalImages = fullImages.length;
/*
We want to show five slots (visible): their conceptual offsets are:
  -2, -1, 0, +1, +2,
with the center (offset 0) being selected.
For our track approach, we also render an extra right item corresponding to offset +3.
*/
// We'll use 6 items in the track, corresponding to offsets: -2, -1, 0, +1, +2, +3
// The visible container shows only the first 5 slots.
  
// Predefined slot layout information for each offset.
// (These values are in pixels and define absolute positions within the container.)
const slotLayouts = {
  "-2": { left: 0,   top: 60,  width: 80,  height: 130, opacity: 0.6, zIndex: 1 },
  "-1": { left: 90,  top: 35,  width: 100, height: 180, opacity: 0.8, zIndex: 2 },
   "0": { left: 200, top: 0,   width: 140, height: 250, opacity: 1,   zIndex: 3 },
  "1": { left: 350, top: 35,  width: 100, height: 180, opacity: 0.8, zIndex: 2 },
  "2": { left: 460, top: 60,  width: 80,  height: 130, opacity: 0.6, zIndex: 1 },
  "3": { left: 540, top: 60,  width: 50,  height: 100, opacity: 0,   zIndex: 0 } // This one will be offscreen (or hidden)
};
// Here, offset "3" is extra; you might adjust its properties so it “eases in” nicely when added.

// Our current selected image index in fullImages.
// Initially, we set selectedIndex = 2 (so that there are two images before and two after).
let selectedIndex = 2;

// ---------- Helper Functions ----------
/**
 * Given an offset (e.g., -2, -1, 0, 1, 2, or 3), returns the fullImages index using circular wrap-around.
 */
function getImageIndex(offset) {
  return (selectedIndex + offset + totalImages) % totalImages;
}

/**
 * rebuildTrack()
 * (Re)builds the inner track (#carousel-track) with 6 items according to the current selectedIndex.
 * Each item is absolutely positioned using slotLayouts.
 */
function rebuildTrack() {
  const track = document.getElementById("carousel-track");
  if (!track) return;
  // Clear the track content
  track.innerHTML = "";
  // For offsets -2, -1, 0, 1, 2, 3 in order:
  const offsets = [-2, -1, 0, 1, 2, 3];
  offsets.forEach((offset) => {
    const layout = slotLayouts[offset];
    const item = document.createElement("div");
    item.style.position = "absolute";
    item.style.left = layout.left + "px";
    item.style.top = layout.top + "px";
    item.style.width = layout.width + "px";
    item.style.height = layout.height + "px";
    item.style.opacity = layout.opacity;
    item.style.zIndex = layout.zIndex;
    // Use a smooth easing transition
    item.style.transition = "all 0.8s cubic-bezier(0.25, 0.1, 0.25, 1)";
    // Create the IMG element
    const img = document.createElement("img");
    img.src = fullImages[getImageIndex(offset)];
    img.style.width = "100%";
    img.style.height = "100%";
    img.style.objectFit = "cover";
    item.appendChild(img);
    track.appendChild(item);
  });
  // Reset the track's transform to 0.
  track.style.transition = "none";
  track.style.transform = "translateX(0)";
}

/**
 * shiftTrackForward()
 * Animates the inner track by shifting it left by the distance between slotLayouts[-2] and slotLayouts[-1].
 * After the transition, it updates selectedIndex, rebuilds the track (thus resetting translation), and returns.
 */
function shiftTrackForward() {
  const track = document.getElementById("carousel-track");
  if (!track) return;
  // Calculate shift distance: difference in left values between offset -1 and offset -2.
  const shiftDistance = slotLayouts["-1"].left - slotLayouts["-2"].left;  // e.g., 90 - 0 = 90px
  // Animate the track's translateX to -shiftDistance.
  track.style.transition = "transform 0.8s cubic-bezier(0.25, 0.1, 0.25, 1)";
  track.style.transform = `translateX(-${shiftDistance}px)`;
  
  // When the transition ends, update selectedIndex and rebuild the track.
  track.addEventListener("transitionend", function handler(e) {
    track.removeEventListener("transitionend", handler);
    // Advance selectedIndex by 1 (circularly).
    selectedIndex = (selectedIndex + 1) % totalImages;
    // Rebuild the track. This resets transform to 0 and uses the new selectedIndex.
    rebuildTrack();
  }, { once: true });
}

// ---------- Main Functions ----------
/**
 * spawnCarousel()
 * Creates and inserts the carousel component.
 * - Positions the container 50px above the element with id "letter-card"
 * - Uses fixed container dimensions (e.g., 500px × 250px)
 * - Creates an inner track that holds 6 items
 * - Calls rebuildTrack() to initialize
 * - Starts an autoplay interval to shift forward every 5 seconds
 */
export function spawnCarousel() {
  console.log("spawnCarousel() called.");
  
  // Prevent duplicate spawn.
  if (document.getElementById("carousel")) {
    console.log("spawnCarousel: Carousel already exists.");
    return;
  }
  
  const letterCard = document.getElementById("letter-card");
  if (!letterCard) {
    console.error("spawnCarousel: #letter-card not found. Aborting spawn.");
    return;
  }
  
  const rect = letterCard.getBoundingClientRect();
  
  // Create the outer carousel container.
  const carousel = document.createElement("div");
  carousel.id = "carousel";
  carousel.style.position = "fixed";
  carousel.style.width = "500px";  // Container width
  carousel.style.height = "250px"; // Container height
  // Position: 50px above the letter-card; horizontally centered relative to letter-card.
  carousel.style.top = (rect.top - 50) + "px";
  carousel.style.left = (rect.left + rect.width / 2 - 250) + "px";
  carousel.style.overflow = "hidden";
  carousel.style.zIndex = "15";
  carousel.style.background = "transparent";
  
  // Create the inner track.
  const track = document.createElement("div");
  track.id = "carousel-track";
  track.style.position = "relative";
  track.style.width = "500px";   // Same as container
  track.style.height = "250px";
  track.style.transition = "transform 0.8s cubic-bezier(0.25, 0.1, 0.25, 1)";
  track.style.transform = "translateX(0)";
  
  carousel.appendChild(track);
  document.body.appendChild(carousel);
  console.log("spawnCarousel: Carousel appended at", carousel.style.top, carousel.style.left);
  
  // Initialize with selectedIndex = 2 and build track.
  selectedIndex = 2;
  rebuildTrack();
  
  // Autoplay: shift the track forward every 5 seconds.
  setInterval(() => {
    shiftTrackForward();
  }, 5000);
  
  console.log("spawnCarousel() completed.");
}

/**
 * despawnCarousel()
 * Removes the carousel component from the DOM.
 */
export function despawnCarousel() {
  const carousel = document.getElementById("carousel");
  if (carousel) {
    carousel.remove();
    console.log("despawnCarousel: Carousel removed.");
  }
}
