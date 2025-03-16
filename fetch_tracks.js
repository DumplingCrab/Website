const axios = require('axios');
const fs = require('fs');

const API_KEY = "e6214f51724e2a4b3dcb20f03b0e965c";
const USERNAME = "DumplingCrab";
const URL = `https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=${USERNAME}&api_key=${API_KEY}&format=json`;

async function fetchTracks() {
    try {
        // Fetch current data
        const response = await axios.get(URL);
        const tracks = response.data.recenttracks.track.map(track => ({
            name: track.name,
            artist: track.artist["#text"],
            albumArt: track.image[3]["#text"] || "default.jpg",
            timestamp: new Date().toISOString()
        }));

        // Read existing JSON
        let data = { tracks: [], summary: {} };
        if (fs.existsSync("data/tracks.json")) {
            data = JSON.parse(fs.readFileSync("data/tracks.json"));
        }

        // Append new tracks
        data.tracks.push(...tracks);

        // Generate summary for the day
        const today = new Date().toISOString().split("T")[0];
        const todayTracks = data.tracks.filter(t => t.timestamp.startsWith(today));

        const artistCount = {};
        const songCount = {};

        todayTracks.forEach(track => {
            songCount[track.name] = (songCount[track.name] || 0) + 1;
            artistCount[track.artist] = (artistCount[track.artist] || 0) + 1;
        });

        // Find most played song and artist
        const mostPlayedSong = Object.keys(songCount).reduce((a, b) => songCount[a] > songCount[b] ? a : b, "");
        const mostPlayedArtist = Object.keys(artistCount).reduce((a, b) => artistCount[a] > artistCount[b] ? a : b, "");

        data.summary[today] = {
            mostPlayedSong,
            mostPlayedArtist,
            completed: true
        };

        // Save updated JSON
        fs.writeFileSync("data/tracks.json", JSON.stringify(data, null, 2));
        console.log("Successfully updated track data.");
    } catch (error) {
        console.error("Error fetching data:", error);
    }
}

fetchTracks();
