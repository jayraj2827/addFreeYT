document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const searchQuery = urlParams.get('query');
    const videoId = urlParams.get('videoId');
    const title = urlParams.get('title');
    const description = urlParams.get('description');
  
    if (searchQuery) {
      searchVideosFromAPI(searchQuery);
    }
  
    if (videoId) {
      playVideo(videoId,title,description);
      fetchVideos(); // Fetch related videos from the database
    }
  });
  
  function searchVideos(query) {
    const searchQuery = query || document.getElementById('search-bar').value.trim();
  
    if (searchQuery === '') {
      return;
    }
  
    window.location.href = `http://localhost:7862/`;
    searchVideosFromAPI(searchQuery);
  }
  
  function searchVideosFromAPI(query) {
    fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=10&q=${encodeURIComponent(query)}&type=video&key=${API_KEY}`)
      .then(response => response.json())
      .then(data => displayVideos(data.items, 'api'))
      .catch(error => console.error('Error fetching videos:', error));
  }
  
  function fetchVideos() {
    fetch('/api/videos')
      .then(response => response.json())
      .then(data => displayVideos(data, 'db'))
      .catch(error => console.error('Error fetching videos:', error));
  }
  
  function displayVideos(videos) {
    const videoResultsContainer = document.getElementById('video-results');
    videoResultsContainer.innerHTML = '';
  
    videos.forEach(video => {
      const videoItem = document.createElement('div');
      videoItem.classList.add('video-result-item');
  
      videoItem.innerHTML = `
        <img src="${video.thumbnail}" alt="${video.title}">
        <h4>${video.title}</h4>
      `;
  
      videoItem.onclick = () => {
        playVideo(video.videoId,video.title,video.description);
      };
  
      videoResultsContainer.appendChild(videoItem);
    });
  }
  
  function playVideo(videoId,title,description) {
    const videoPlayer = document.getElementById('video-player');
    videoPlayer.src = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`;
    console.log(title,description);
    
    document.getElementById('video-title').textContent=title;
    document.getElementById('video-description').textContent=description;
  }
  
  function goHome() {
    window.location.href = 'http://localhost:7862/';
  }
  
  const toggleThemeButton = document.getElementById("toggleThemeButton");

// Function to apply the theme based on local storage
function applyTheme() {
  const isDarkMode = localStorage.getItem("theme") === "dark";
  document.body.classList.toggle("dark-mode", isDarkMode);

  // Update button icon based on theme
  toggleThemeButton.innerHTML = isDarkMode
    ? '<i class="fas fa-sun"></i>'
    : '<i class="fas fa-moon"></i>';
}

// Toggle theme and save to local storage
toggleThemeButton.addEventListener("click", () => {
  const isDarkMode = document.body.classList.toggle("dark-mode");
  localStorage.setItem("theme", isDarkMode ? "dark" : "light");

  toggleThemeButton.innerHTML = isDarkMode
    ? '<i class="fas fa-sun"></i>'
    : '<i class="fas fa-moon"></i>';
});

// Apply theme on page load
applyTheme();
