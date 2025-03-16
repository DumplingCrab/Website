import fs from 'fs';
import fetch from 'node-fetch';

const apiKey = "e6214f51724e2a4b3dcb20f03b0e965c";
const username = "DumplingCrab";
const url = `https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=${username}&api_key=${apiKey}&format=json`;

async function fetchTracks() {
    try {
        const response = await fetch(url);
        const data = await response.json();
        const tracks = data.recenttracks.track.map(track => ({
            name: track.name,
            artist: track.artist["#text"],
            albumArt: track.image[3]["#text"] || "default.jpg",
            timestamp: track.date ? track.date.uts : "now"
        }));

        fs.writeFileSync("data/tracks.json", JSON.stringify(tracks, null, 2));
        console.log("Updated tracks.json");
    } catch (error) {
        console.error("Error fetching data:", error);
        process.exit(1);
    }
}

fetchTracks();
