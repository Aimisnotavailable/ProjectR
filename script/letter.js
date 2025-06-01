// letter.js
document.addEventListener('DOMContentLoaded', function() {
  const letterCard = document.getElementById('letter-card');

  letterCard.addEventListener('mouseenter', function() {
    letterCard.classList.add('open');
  });

  letterCard.addEventListener('mouseleave', function() {
    letterCard.classList.remove('open');
  });
});
