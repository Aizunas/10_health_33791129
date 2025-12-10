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

// Authentication middleware
const requireAuth = (req, res, next) => {
    if (req.session.user) {
        next();
    } else {
        res.redirect('/login');
    }
};

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

// Register page
app.get('/register', (req, res) => {
    res.render('register', { title: 'Register', error: null });
});

// Register POST
app.post('/register', async (req, res) => {
    const { username, email, password, confirmPassword } = req.body;
    
    // Validation
    if (password !== confirmPassword) {
        return res.render('register', { title: 'Register', error: 'Passwords do not match' });
    }
    
    // Password requirements: 8 chars, 1 lowercase, 1 uppercase, 1 number, 1 special
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(password)) {
        return res.render('register', { 
            title: 'Register', 
            error: 'Password must be 8+ characters with uppercase, lowercase, number, and special character' 
        });
    }
    
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        
        db.query(
            'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
            [username, email, hashedPassword],
            (err, result) => {
                if (err) {
                    if (err.code === 'ER_DUP_ENTRY') {
                        return res.render('register', { title: 'Register', error: 'Username or email already exists' });
                    }
                    return res.render('register', { title: 'Register', error: 'Registration failed' });
                }
                
                req.session.user = { id: result.insertId, username };
                res.redirect('/dashboard');
            }
        );
    } catch (err) {
        res.render('register', { title: 'Register', error: 'Registration failed' });
    }
});

// Dashboard 
app.get('/dashboard', requireAuth, (req, res) => {
    const userId = req.session.user.id;
    
    // Get recent workouts
    db.query(
        'SELECT * FROM workouts WHERE user_id = ? ORDER BY workout_date DESC LIMIT 5',
        [userId],
        (err, workouts) => {
            if (err) {
                return res.render('dashboard', { title: 'Dashboard', workouts: [], stats: {} });
            }
            
            // Get stats
            db.query(
                'SELECT COUNT(*) as total_workouts, SUM(duration) as total_minutes, SUM(calories_burned) as total_calories FROM workouts WHERE user_id = ?',
                [userId],
                (err, stats) => {
                    res.render('dashboard', { 
                        title: 'Dashboard', 
                        workouts, 
                        stats: stats[0] || {} 
                    });
                }
            );
        }
    );
});

// Add workout page
app.get('/add-workout', requireAuth, (req, res) => {
    db.query('SELECT * FROM workout_types ORDER BY name', (err, types) => {
        res.render('add-workout', { 
            title: 'Add Workout', 
            workoutTypes: types || [],
            error: null 
        });
    });
});

// Add workout POST
app.post('/add-workout', requireAuth, (req, res) => {
    const { workout_type, duration, calories_burned, distance, notes, workout_date } = req.body;
    const userId = req.session.user.id;
    
    db.query(
        'INSERT INTO workouts (user_id, workout_type, duration, calories_burned, distance, notes, workout_date) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [userId, workout_type, duration, calories_burned || null, distance || null, notes, workout_date],
        (err, result) => {
            if (err) {
                db.query('SELECT * FROM workout_types ORDER BY name', (err, types) => {
                    return res.render('add-workout', { 
                        title: 'Add Workout', 
                        workoutTypes: types || [],
                        error: 'Failed to add workout' 
                    });
                });
            } else {
                res.redirect('/dashboard');
            }
        }
    );
});

// Search page
app.get('/search', requireAuth, (req, res) => {
    res.render('search', { title: 'Search Workouts', workouts: [], query: '' });
});

// Search POST
app.post('/search', requireAuth, (req, res) => {
    const { query } = req.body;
    const userId = req.session.user.id;
    
    const searchQuery = `%${query}%`;
    
    db.query(
        'SELECT * FROM workouts WHERE user_id = ? AND (workout_type LIKE ? OR notes LIKE ?) ORDER BY workout_date DESC',
        [userId, searchQuery, searchQuery],
        (err, workouts) => {
            res.render('search', { 
                title: 'Search Workouts', 
                workouts: workouts || [], 
                query 
            });
        }
    );
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