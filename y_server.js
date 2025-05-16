const express = require('express');
const mysql = require('mysql');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 7862;

// MySQL connection
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root', // Replace with your database username
  password: '', // Replace with your database password
  database: 'friday_site' // Replace with your database name
});

// Connect to the database
connection.connect(err => {
  if (err) {
    console.error('Error connecting to the database:', err);
    process.exit(1);
  }
  console.log('Connected to the database');
});
app.use('/Assets', express.static(path.join(__dirname, 'Assets')));
app.use(express.static(path.join(__dirname, 'Youtube_Project')));


// Middleware
app.use(cors());
app.use(express.json()); // To parse JSON bodies
// app.use(express.static(path.join(__dirname))); // Serve static files from the current directory

// API Endpoints

// Get stored search queries
app.get('/api/search', (req, res) => {
  connection.query('SELECT * FROM search_queries ORDER BY id DESC LIMIT 1', (err, results) => {
    if (err) {
      console.error('Error fetching search queries:', err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
    res.json(results);
  });
});

// Save a new search query
app.post('/api/search', (req, res) => {
  const { query } = req.body;
  if (!query) {
    return res.status(400).json({ error: 'Query parameter is required' });
  }

  connection.query('INSERT INTO search_queries (query) VALUES (?)', [query], (err, results) => {
    if (err) {
      console.error('Error inserting search query:', err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
    res.status(201).json({ message: 'Search query saved successfully' });
  });
});

// Get all videos
app.get('/api/videos', (req, res) => {
  connection.query('SELECT * FROM video_ids group by videoId', (err, results) => {
    if (err) {
      console.error('Error fetching videos:', err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
    res.json(results);
  });
});

// Get related videos based on the search query
app.get('/api/related_videos', (req, res) => {
  const query = req.query.query; // Get the search query from the URL parameter
  if (!query) {
    return res.status(400).json({ error: 'Query parameter is required' });
  }

  const searchQuery = `%${query}%`;
  connection.query('SELECT * FROM video_ids WHERE title LIKE ?', [searchQuery], (err, results) => {
    if (err) {
      console.error('Error fetching related videos:', err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
    res.json(results);
  });
});
// app.post('/api/videos', (req, res) => {
//   // Static test data
//   const testData = {
//     videoId: '12345',
//     title: 'Test Video',
//     description: 'This is a test video description.',
//     thumbnail: 'http://example.com/thumbnail.jpg'
//   };

//   // Log the static test data to confirm it is sent correctly
//   console.log('Static Test Data:', testData);

//   // Send static data back as response
//   res.json({ message: 'Received static data', data: testData });
// });
app.post('/api/videos', (req, res) => {
  const { videos } = req.body;
  console.log('Received data:', req.body);

  if (!Array.isArray(videos)) {
    return res.status(400).json({ error: 'Invalid video data' });
  }

  let errorOccurred = false;
  videos.forEach(video => {
    const { videoId, title, description, thumbnail } = video;

    // Check if video data is valid
    if (!videoId || !title || !description || !thumbnail) {
      console.error('Missing video data:', video);
      errorOccurred = true;
      return;
    }

    connection.query(
      'INSERT INTO video_ids (videoId, title, description, thumbnail) VALUES (?, ?, ?, ?)',
      [videoId, title, description, thumbnail],
      (err, results) => {
        if (err) {
          console.error('Error inserting video:', err);
          errorOccurred = true;
        }
      }
    );
  });

  // If an error occurred during insertion
  if (errorOccurred) {
    return res.status(500).json({ error: 'Error saving some videos' });
  }

  res.status(201).json({ message: 'Videos saved successfully' });
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'Youtube_Project', 'Y_Page', 'y.html'));
});

app.get('/Y_Play.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'Youtube_Project', 'Y_Play', 'Y_Play.html'));
});
// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
