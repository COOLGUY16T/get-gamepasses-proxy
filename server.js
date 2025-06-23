// server.js
const express = require('express');
const axios = require('axios');

const app = express();
const PORT = 3000;

// Helper: Get User ID from username
async function getUserId(username) {
  const response = await axios.post('https://users.roblox.com/v1/usernames/users', {
    usernames: [username]
  });
  const user = response.data.data[0];
  return user ? user.id : null;
}

// Helper: Get games by user ID
async function getUserGames(userId) {
  const res = await axios.get(`https://games.roblox.com/v2/users/${userId}/games?sortOrder=Asc&limit=50`);
  return res.data.data;
}

// Helper: Get gamepasses by game ID
async function getGamepasses(gameId) {
  try {
    const res = await axios.get(`https://games.roblox.com/v1/games/${gameId}/game-passes`);
    return res.data.data || [];
  } catch (e) {
    return [];
  }
}

// Main route: username -> all gamepasses
app.get('/gamepasses/:username', async (req, res) => {
  try {
    const username = req.params.username;
    const userId = await getUserId(username);
    const games = await getUserGames(userId);

    const results = [];

    for (const game of games) {
      const passes = await getGamepasses(game.id);
      results.push({
        gameName: game.name,
        gameId: game.id,
        gamepasses: passes
      });
    }

    res.json(results);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Failed to fetch data' });
  }
});

app.listen(PORT, () => console.log(`Proxy server running on http://localhost:${PORT}`));
