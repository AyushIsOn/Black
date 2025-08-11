// Loader Page JavaScript
function initSitePreloader() {
  const preloader = document.getElementById('sitePreloader');
  const progressNumber = document.getElementById('progressNumber');
  
  if (!preloader || !progressNumber) return;
  
  let progress = 0;
  const progressInterval = setInterval(() => {
    progress += Math.random() * 2 + 0.5;
    if (progress > 100) progress = 100;
    
    progressNumber.textContent = Math.floor(progress);
    
    if (progress >= 100) {
      clearInterval(progressInterval);
      setTimeout(() => {
        // Redirect to main page when loading is complete
        window.location.href = 'main.html';
      }, 500);
    }
  }, 50);
}

// Initialize the loader when the page loads
document.addEventListener("DOMContentLoaded", () => {
  initSitePreloader();
});
