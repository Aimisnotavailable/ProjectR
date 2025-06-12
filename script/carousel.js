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
We want to show five visible slots (offsets: -2, -1, 0, 1, 2),
with one extra item (offset 3) for a seamless looping effect.
*/

// Predefined slot layout information for each offset.
// (Values in pixels defining absolute positions and size within the container.)
const slotLayouts = {
  "-2": { left: 0,   top: 60,  width: 80,  height: 130, opacity: 0.6, zIndex: 1 },
  "-1": { left: 90,  top: 35,  width: 100, height: 180, opacity: 0.8, zIndex: 2 },
   "0": { left: 200, top: 0,   width: 140, height: 250, opacity: 1,   zIndex: 3 },
  "1": { left: 350, top: 35,  width: 100, height: 180, opacity: 0.8, zIndex: 2 },
  "2": { left: 460, top: 60,  width: 80,  height: 130, opacity: 0.6, zIndex: 1 },
  "3": { left: 540, top: 60,  width: 50,  height: 100, opacity: 0,   zIndex: 0 } // Extra off-screen slot (fades in)
};
// Global variable to hold the current selected image index. 
// Initially, we set selectedIndex = 2 so that there are two images before and after.
let selectedIndex = 2;

// Global array for carousel item DOM elements.
let carouselItems = [];

/**
 * getImageIndex(offset)
 * Given an offset (e.g., -2, -1, 0, 1, 2, or 3) from the current selected image,
 * returns the correct index in fullImages (using circular wrap-around).
 */
function getImageIndex(offset) {
  return (selectedIndex + offset + totalImages) % totalImages;
}

/**
 * createCarouselItems()
 * Builds the 6 carousel item elements, each positioned according to its starting offset.
 * Each item is given a custom "data-offset" attribute to track its logical position.
 */
function createCarouselItems(track) {
  // Offsets in order: -2, -1, 0, 1, 2, 3.
  const offsets = [-2, -1, 0, 1, 2, 3];
  offsets.forEach((offset) => {
    const layout = slotLayouts[offset];
    const item = document.createElement("div");
    // Set custom attribute to track this element's offset.
    item.setAttribute("data-offset", offset);
    item.style.position = "absolute";
    item.style.left = layout.left + "px";
    item.style.top = layout.top + "px";
    item.style.width = layout.width + "px";
    item.style.height = layout.height + "px";
    item.style.opacity = layout.opacity;
    item.style.zIndex = layout.zIndex;
    // Use a smooth easing transition for all property changes
    item.style.transition = "all 0.8s cubic-bezier(0.25, 0.1, 0.25, 1)";
    // Create the IMG element
    const img = document.createElement("img");
    img.src = fullImages[getImageIndex(offset)];
    img.style.width = "100%";
    img.style.height = "100%";
    img.style.objectFit = "cover";
    item.appendChild(img);
    track.appendChild(item);
    // Add to global carouselItems for later reference.
    carouselItems.push(item);
  });
}

/**
 * shiftTrackForward()
 * Animates the carousel items shifting left by one slot.
 * Each item's new offset is computed as (current offset - 1).
 * The item that would have an offset below -2 is repositioned to offset 3,
 * and its image source is updated with the next circular image.
 */
function shiftTrackForward() {
  // For each carousel item update its offset value and animate to new layout.
  carouselItems.forEach((item) => {
    // current offset as an integer:
    let currentOffset = parseInt(item.getAttribute("data-offset"));
    let newOffset = currentOffset - 1;
    // If the new offset falls below the left-most defined slot (-2),
    // we reposition this item to the right (offset 3)
    if (newOffset < -2) {
      newOffset = 3;
      // Update its image. Calculate new image index:
      // For a smooth loop, the new image should be the one that comes after what was previously at offset 2.
      const newImageIndex = (selectedIndex + 3 + 1) % totalImages;
      const img = item.querySelector("img");
      img.src = fullImages[newImageIndex];
    }
    // Set the new offset on the item.
    item.setAttribute("data-offset", newOffset);
    // Retrieve the layout for this new offset.
    const layout = slotLayouts[newOffset];
    // Animate to new left, top, width, height, opacity, and z-index.
    item.style.left = layout.left + "px";
    item.style.top = layout.top + "px";
    item.style.width = layout.width + "px";
    item.style.height = layout.height + "px";
    item.style.opacity = layout.opacity;
    item.style.zIndex = layout.zIndex;
  });
  // Update the global selected index (circularly)
  selectedIndex = (selectedIndex + 1) % totalImages;
}

/**
 * spawnCarousel()
 * Creates and inserts the carousel component.
 * - Positions the container 50px above the element with id "letter-card"
 * - Uses fixed container dimensions (500px × 250px)
 * - Creates an inner track holding 6 items
 * - Starts an autoplay interval to shift items forward every 5 seconds.
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
  track.style.width = "500px";
  track.style.height = "250px";
  
  carousel.appendChild(track);
  document.body.appendChild(carousel);
  console.log("spawnCarousel: Carousel appended at", carousel.style.top, carousel.style.left);
  
  // Clear any previous carousel items and global references.
  carouselItems = [];
  // Create carousel items once.
  createCarouselItems(track);
  
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
