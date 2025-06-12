document.addEventListener('DOMContentLoaded', function() {
  const letterCard = document.getElementById('letter-card');

  function openLetter() {
    letterCard.classList.add('open');
  }

  function closeLetter() {
    letterCard.classList.remove('open');
  }

  letterCard.addEventListener('mouseenter', openLetter);
  letterCard.addEventListener('mouseleave', closeLetter);
  
  // Add touch support for Safari and other mobile devices.
  letterCard.addEventListener('touchstart', openLetter);
  letterCard.addEventListener('touchend', closeLetter);
});
