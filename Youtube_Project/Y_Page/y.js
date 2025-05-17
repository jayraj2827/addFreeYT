const API_KEY = CONFIG.YOUTUBEAPI

document.addEventListener('DOMContentLoaded', () => {
  fetchVideos(); // Fetch all videos on page load
});
var t,d;
function searchVideos() {
  const query = document.getElementById('search-bar').value.trim();

  if (query === '') {
    return; // Do nothing if the query is empty
  }

  // Fetch videos from YouTube API
  fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=20&q=${encodeURIComponent(query)}&type=video&key=${API_KEY}`)
    .then(response => response.json())
    .then(data => {
      const videos = data.items.map(item => ({
        videoId: item.id.videoId,
        title: item.snippet.title,
        description: item.snippet.description || 'No description available',
        thumbnail: item.snippet.thumbnails?.high?.url || 'default-thumbnail.jpg'
      }));

      displayVideos(videos);
      saveSearchQuery(query);

      // Save video data to the database
      fetch('/api/videos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ videos }) // Send entire array of videos
      })
      .then(response => response.json())
      .then(data => console.log('Videos saved:', data))
      .catch(error => console.error('Error saving videos:', error));
    })
    .catch(error => console.error('Error fetching videos:', error));
}

function fetchVideos() {
  fetch('/api/videos')
    .then(response => response.json())
    .then(data => {
      console.log('Get Method');
      displayVideos(data);
    })
    .catch(error => console.error('Error fetching videos:', error));
}

function displayVideos(videos) {
  console.log(videos);
  
  if (!Array.isArray(videos)) {
    console.error('Expected an array of videos but received:', videos);
    return;
  }

  const videoGrid = document.getElementById('video-grid');
  videoGrid.innerHTML = '';

  videos.forEach(video => {
    console.log('Video Object:', video); // Log each video

    const videoItem = document.createElement('div');
    videoItem.classList.add('video-item');

    videoItem.innerHTML = `
      <img src="${video.thumbnail}" alt="${video.title}">
      <div class="video-info">
        <h4>${video.title}</h4>
        <p>${video.description}</p>
      </div>
    `;

    videoItem.onclick = () => playVideo(video.videoId,video.title,video.description); // Play video on click
    videoGrid.appendChild(videoItem);
  });
}

function playVideo(videoId,title,description) {
  if (!videoId) {
    console.error('Video ID is undefined');
    return;
  }const encodedTitle = encodeURIComponent(title);
  const encodedDescription = encodeURIComponent(description);

  window.location.href = `y_play.html?videoId=${videoId}&title=${encodedTitle}&description=${encodedDescription}`;
}

function saveSearchQuery(query) {
  console.log(query);
  
  fetch('/api/search', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ query: query })
  })
  .then(response => response.text())
  .then(data => console.log(data))
  .catch(error => console.error('Error saving search query:', error));
}
// function searchVideos() {
//   const query = document.getElementById('search-bar').value.trim();

//   if (query === '') {
//     return; // Do nothing if the query is empty
//   }

//   // Fetch videos from YouTube API
//   fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=10&q=${encodeURIComponent(query)}&type=video&key=${API_KEY}`)
//     .then(response => response.json())
//     .then(data => {
//       const videos = data.items.map(item => ({
//         videoId: item.id.videoId,
//         title: item.snippet.title,
//         description: item.snippet.description,
//         thumbnail: item.snippet.thumbnails.high.url
//       }));

//       displayVideos(videos);
//       saveSearchQuery(query); // Save the search query

//       // Save video data to the database
//       videos.forEach(video => {
//         fetch('/api/videos', {
//           method: 'POST',
//           headers: {
//             'Content-Type': 'application/json'
//           },
//           body: JSON.stringify({
//             videoId: video.videoId,
//             title: video.title,
//             description:video.description,
//             thumbnail:video.thumbnail
//           })
//         })
//         .then(response => response.json())
//         .then(data => console.log('Video saved:', data))
//         .catch(error => console.error('Error saving video:', error));
//       });
//     })
//     .catch(error => console.error('Error fetching videos:', error));
// }

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
