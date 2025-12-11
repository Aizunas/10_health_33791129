const express = require('express');
const mysql = require('mysql2');
const session = require('express-session');
require('dotenv').config();

const app = express();
const port = 8000;

//database config

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


//middleware config

// Parse URL-encoded bodies (form data)
app.use(express.urlencoded({ extended: true }));

// Parse JSON bodies
app.use(express.json());

// Serve static files from public directory
app.use(express.static('public'));

// Configure session management
app.use(session({
    secret: 'fitness-tracker-secret-2024',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 3600000 } // 1 hour
}));

// Set EJS as view engine
app.set('view engine', 'ejs');

// Make user object available to all views
app.use((req, res, next) => {
    res.locals.user = req.session.user || null;
    next();
});


//routes

//import route modules
const mainRoutes = require('./routes/main');
const authRoutes = require('./routes/auth');
const workoutRoutes = require('./routes/workouts');

// Use routes
app.use('/', mainRoutes());
app.use('/', authRoutes(db));
app.use('/', workoutRoutes(db));

//start server

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});