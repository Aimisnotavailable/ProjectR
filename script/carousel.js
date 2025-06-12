// Function to start the carousel animation
export function startCarousel() {
  const carouselContainer = document.getElementById('carousel');
  const images = document.querySelectorAll('#carousel .carousel-img');
  let currentIndex = 0;

  // Ensure carousel container is visible
  carouselContainer.classList.add('active');

  // Initially show the first image
  images.forEach((img, index) => {
    img.classList.toggle('active', index === 0);
  });

  // Cycle through the images every 3 seconds
  setInterval(() => {
    images[currentIndex].classList.remove('active');
    currentIndex = (currentIndex + 1) % images.length;
    images[currentIndex].classList.add('active');
  }, 3000);
}