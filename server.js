const express = require('express');
const fs = require('fs');
const cors = require('cors');
const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

const DB_FILE = './albums.json';

function initializeDB() {
    if (!fs.existsSync(DB_FILE)) {
        const initialAlbums = [
            {
                id: Date.now(),
                band: "Queen",
                title: "A Night at the Opera",
                year: 1975,
                genre: "Rock"
            },
            {
                id: Date.now() + 1,
                band: "Daft Punk",
                title: "Discovery",
                year: 2001,
                genre: "Electronic"
            }
        ];
        fs.writeFileSync(DB_FILE, JSON.stringify(initialAlbums, null, 2));
    }
}

function readDB() {
    initializeDB();
    return JSON.parse(fs.readFileSync(DB_FILE));
}

function writeDB(data) {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

app.get('/albums', (req, res) => {
    res.json(readDB());
});

app.get('/albums/:id', (req, res) => {
    const db = readDB();
    const album = db.find(a => a.id === parseInt(req.params.id));
    album ? res.json(album) : res.status(404).json({ error: 'Not found' });
});

app.post('/albums', (req, res) => {
    const db = readDB();
    const newAlbum = { id: Date.now(), ...req.body };
    db.push(newAlbum);
    writeDB(db);
    res.status(201).json(newAlbum);
});

app.put('/albums/:id', (req, res) => {
    const db = readDB();
    const index = db.findIndex(a => a.id === parseInt(req.params.id));
    if (index === -1) return res.status(404).json({ error: 'Not found' });
    db[index] = { ...db[index], ...req.body };
    writeDB(db);
    res.json(db[index]);
});

app.delete('/albums/:id', (req, res) => {
    let db = readDB();
    const id = parseInt(req.params.id);
    if (!db.find(a => a.id === id)) return res.status(404).json({ error: 'Not found' });
    db = db.filter(a => a.id !== id);
    writeDB(db);
    res.json({ message: 'Deleted' });
});

app.listen(PORT, () => console.log(`API running at http://localhost:${PORT}`));