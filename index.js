const express = require('express');
const mysql = require('mysql2');
const session = require('express-session');
const bcrypt = require('bcrypt');
require('dotenv').config();

const app = express();
const port = 8000;

// Database connection
const db = mysql.createConnection({
    host: process.env.HEALTH_HOST || 'localhost',
    user: process.env.HEALTH_USER || 'health_app',
    password: process.env.HEALTH_PASSWORD || 'qwertyuiop',
    database: process.env.HEALTH_DATABASE || 'health'
});

db.connect((err) => {
    if (err) {
        console.error('Database connection failed:', err);
        process.exit(1);
    }
    console.log('Connected to MySQL database');
});

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'));

// Session configuration
app.use(session({
    secret: 'fitness-tracker-secret-2024',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 3600000 }
}));

// Set view engine
app.set('view engine', 'ejs');

// Make user available to all views
app.use((req, res, next) => {
    res.locals.user = req.session.user || null;
    next();
});

// Routes

// Home page
app.get('/', (req, res) => {
    res.render('home', { title: 'Home' });
});

// About page
app.get('/about', (req, res) => {
    res.render('about', { title: 'About' });
});

// Login page
app.get('/login', (req, res) => {
    res.render('login', { title: 'Login', error: null });
});

// Login POST
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    
    db.query('SELECT * FROM users WHERE username = ?', [username], async (err, results) => {
        if (err) {
            return res.render('login', { title: 'Login', error: 'Database error' });
        }
        
        if (results.length === 0) {
            return res.render('login', { title: 'Login', error: 'Invalid credentials' });
        }
        
        const user = results[0];
        const match = await bcrypt.compare(password, user.password);
        
        if (match) {
            req.session.user = { id: user.id, username: user.username };
            res.redirect('/dashboard');
        } else {
            res.render('login', { title: 'Login', error: 'Invalid credentials' });
        }
    });
});

// Dashboard (temporary - just to test login)
app.get('/dashboard', (req, res) => {
    if (!req.session.user) {
        return res.redirect('/login');
    }
    res.send(`<h1>Welcome ${req.session.user.username}!</h1><p>Dashboard coming tomorrow!</p><a href="/logout">Logout</a>`);
});

// Logout
app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
});

// start server
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});