const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const path = require('path');
const bcrypt = require('bcrypt');

const app = express();
const PORT = 3000;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Database setup
const db = new sqlite3.Database('./database/users.db', (err) => {
    if (err) {
        console.error(err.message);
    }
});

// Create users table
db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL
    )`);
});

// Register route
app.post('/register', (req, res) => {
    const { username, password } = req.body;
    const hashedPassword = bcrypt.hashSync(password, 10);
    
    db.run(`INSERT INTO users (username, password) VALUES (?, ?)`, [username, hashedPassword], function(err) {
        if (err) {
            return res.send('Username already exists');
        }
        res.send('User registered successfully!');
    });
});

// Login route
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    db.get(`SELECT * FROM users WHERE username = ?`, [username], (err, row) => {
        if (row && bcrypt.compareSync(password, row.password)) {
            res.send(`Welcome, ${username}!`);
        } else {
            res.send('Invalid username or password');
        }
    });
});

// Lupa Password route (just for demonstration, ideally use email)
app.post('/forgot-password', (req, res) => {
    const { username } = req.body;
    db.get(`SELECT * FROM users WHERE username = ?`, [username], (err, row) => {
        if (row) {
            res.send(`Password reset link sent to your email for user: ${username}`);
        } else {
            res.send('User not found');
        }
    });
});

// Serve HTML file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});