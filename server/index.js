const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = 3001;

app.use(cors());

const MANGADEX_API = 'https://api.mangadex.org';

// 1. Search Manga
app.get('/api/manga', async (req, res) => {
  try {
    const { title } = req.query;
    const response = await axios.get(`${MANGADEX_API}/manga`, {
      params: {
        title,
        limit: 20,
        includes: ['cover_art'],
        contentRating: ['safe', 'suggestive'],
      },
    });
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch manga' });
  }
});

// 2. Get Manga Details & Chapter List
app.get('/api/manga/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const mangaRes = await axios.get(`${MANGADEX_API}/manga/${id}`, {
      params: { includes: ['cover_art', 'author', 'artist'] },
    });

    const chaptersRes = await axios.get(`${MANGADEX_API}/manga/${id}/feed`, {
      params: {
        limit: 500,
        translatedLanguage: ['en'],
        order: { chapter: 'desc' },
        includes: ['scanlation_group'],
      },
    });

    res.json({
      manga: mangaRes.data.data,
      chapters: chaptersRes.data.data,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch manga details' });
  }
});

// 3. Get Chapter Images
app.get('/api/chapter/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const athomeRes = await axios.get(`https://api.mangadex.org/at-home/server/${id}`);
    const { baseUrl, chapter } = athomeRes.data;

    const images = chapter.data.map((filename) =>
      `${baseUrl}/data/${chapter.hash}/${filename}`
    );

    const dataSaverImages = chapter.dataSaver.map((filename) =>
      `${baseUrl}/data-saver/${chapter.hash}/${filename}`
    );

    res.json({ images, dataSaverImages });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch chapter images' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});