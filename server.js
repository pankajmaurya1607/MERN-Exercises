// Problem : August 14 2025

// Create a REST API endpoint in Node.js (Express) that:

// Accepts a GET request at /random-joke
// Fetches a random joke from an external API (https://official-joke-api.appspot.com/random_joke)
// Returns the joke JSON to the client.
// Bonus : Implement caching for 30 seconds so repeated requests don’t call the external API every time.

const express = require("express")

const app = express();
const port = process.env.PORT || 3000

// In-memory cache
let cache = {
    joke: null,
    timestamp: 0
};

const TTL_MS = 30_000;  // 30 sec

app.get("/random-joke", async (req, res) => {
    const now = Date.now()

    // if we have a fresh cache return it
    if(cache.joke && now - cache.timestamp < TTL_MS) {
        return res.json({
            ...cache.joke,
            cached: true,
            cacheAgeMs: now - cache.timestamp
        });
    }

    // otherwise fetch new jokes
    try {
        const response = await fetch("https://official-joke-api.appspot.com/random_joke");
        if(!response.ok) {
            throw new Error(`External API Error: ${response.status}`);
        }
        const data = await response.json();

        // update cache
        cache.joke = data;
        cache.timestamp = Date.now();

        return res.json({
            ...data,
            cached: false
        });
    } catch(error) {
        console.error("failed to fetch from External API:", error.message)

        // return from stale cache
        if(cache.joke) {
            return res.json({
                ...cache.joke,
                cached: true,
                note: "served from cache due to upstream error"
            })
        }

        // otherwise show error
        return res.status(502).json({error: "failed to fetch from External API"})
    }
})

app.listen(port, () => {
    console.log(`✅ server is running at http://localhost:${port}`)
})
