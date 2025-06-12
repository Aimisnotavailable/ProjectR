// carousel.js

// The currently selected item index (0-based). We want the 4th item (index 3)
// to be selected initially so that there are two items before and two after.
let selectedIndex = 3;

// Helper function to compute the minimal circular difference.
// For even n, we treat diff <= -n/2 and diff >= n/2 as needing adjustment.
function circularDiff(i, selected, n) {
  let diff = i - selected;
  if (diff <= -n / 2) {
    diff += n;
  }
  if (diff >= n / 2) {
    diff -= n;
  }
  return diff;
}

// Update the CSS classes on each carousel item based on its circular distance
// from the selectedIndex. The mapping is as follows:
//
// - diff ===  0: "selected"
// - diff === -1: "prev"
// - diff === -2: "prevLeftSecond"
// - diff ===  1: "next"
// - diff ===  2: "nextRightSecond"
// - diff < -2: "hideLeft"
// - diff >  2: "hideRight"
function updateCarouselClasses() {
  const carousel = document.getElementById("carousel");
  if (!carousel) return;
  const items = Array.from(carousel.children);
  const n = items.length;
  items.forEach((item, i) => {
    const diff = circularDiff(i, selectedIndex, n);
    if (diff === 0) {
      item.className = "selected";
    } else if (diff === -1) {
      item.className = "prev";
    } else if (diff === -2) {
      item.className = "prevLeftSecond";
    } else if (diff === 1) {
      item.className = "next";
    } else if (diff === 2) {
      item.className = "nextRightSecond";
    } else if (diff < -2) {
      item.className = "hideLeft";
    } else if (diff > 2) {
      item.className = "hideRight";
    }
  });
}

// Advances the carousel by incrementing the selectedIndex (circularly)
// and then updates the classes.
function shiftCarousel() {
  const carousel = document.getElementById("carousel");
  if (!carousel) return;
  const n = carousel.children.length;
  selectedIndex = (selectedIndex + 1) % n;
  updateCarouselClasses();
  console.log("shiftCarousel: new selectedIndex =", selectedIndex);
}

export function spawnCarousel() {
  console.log("spawnCarousel() called.");

  // Prevent duplicate spawning.
  if (document.getElementById("carousel")) {
    console.log("Carousel already exists.");
    return;
  }

  const letterCard = document.getElementById("letter-card");
  if (!letterCard) {
    console.error("Letter card element not found. Aborting carousel spawn.");
    return;
  }

  // Get the letter card's position.
  const rect = letterCard.getBoundingClientRect();

  // Create the carousel container.
  const carousel = document.createElement("div");
  carousel.id = "carousel";
  carousel.className = "carousel";
  // Position the carousel 50px above the letter with a fixed size of 400x400.
  carousel.style.position = "fixed";
  carousel.style.width = "400px";
  carousel.style.height = "400px";
  carousel.style.top = (rect.top - 50) + "px";
  // Horizontally center the carousel relative to the letter.
  carousel.style.left = (rect.left + rect.width / 2 - 200) + "px";

  // Define an array of 8 image sources.
  const images = [
    "https://cdn.pixabay.com/photo/2017/08/15/08/23/stars-2643089__340.jpg",
    "https://cdn.pixabay.com/photo/2012/11/28/11/28/rocket-launch-67723__340.jpg",
    "https://cdn.pixabay.com/photo/2018/08/15/13/10/galaxy-3608029_960_720.jpg",
    "https://cdn.pixabay.com/photo/2020/06/17/09/28/wormhole-5308810__340.jpg",
    "https://cdn.pixabay.com/photo/2016/11/18/22/58/stars-1837306__340.jpg",
    "https://cdn.pixabay.com/photo/2017/02/09/09/11/starry-sky-2051448__340.jpg",
    "https://cdn.pixabay.com/photo/2011/12/15/11/37/galaxy-11188__340.jpg",
    "https://cdn.pixabay.com/photo/2011/12/15/11/32/pismis-24-11186__340.jpg"
  ];

  // Create carousel items for each image.
  images.forEach((src, index) => {
    const item = document.createElement("div");
    item.id = `item_${index + 1}`;
    // Initially, assign an empty class (classes will be set below).
    item.className = "";
    const img = document.createElement("img");
    img.src = src;
    item.appendChild(img);
    carousel.appendChild(item);
    console.log("Appended carousel item for:", src);
  });

  // Append the carousel container to the body.
  document.body.appendChild(carousel);
  console.log("Carousel appended at:", carousel.style.top, carousel.style.left);

  // Set the initial selectedIndex to 3 (4th item).
  selectedIndex = 3;
  updateCarouselClasses();

  // Start auto-sliding: every 3 seconds, advance the carousel.
  setInterval(() => {
    shiftCarousel();
  }, 3000);

  console.log("spawnCarousel() completed.");
}

export function despawnCarousel() {
  const carousel = document.getElementById("carousel");
  if (carousel) {
    carousel.remove();
    console.log("Carousel despawned.");
  }
}
