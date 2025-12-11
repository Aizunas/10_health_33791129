const express = require('express');
const router = express.Router();

//authentication middleware
const requireAuth = (req, res, next) => {
    if (req.session.user) {
        next();
    } else {
        res.redirect('/login');
    }
};

module.exports = (db) => {
    
    //dashboard 
    router.get('/dashboard', requireAuth, (req, res) => {
        const userId = req.session.user.id;
        
        //get recent workouts
        db.query(
            'SELECT * FROM workouts WHERE user_id = ? ORDER BY workout_date DESC LIMIT 5',
            [userId],
            (err, workouts) => {
                if (err) {
                    return res.render('dashboard', { title: 'Dashboard', workouts: [], stats: {} });
                }
                
                //get stats
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

    //add workout page
    router.get('/add-workout', requireAuth, (req, res) => {
        db.query('SELECT * FROM workout_types ORDER BY name', (err, types) => {
            res.render('add-workout', { 
                title: 'Add Workout', 
                workoutTypes: types || [],
                error: null 
            });
        });
    });

    //add workout POST
    router.post('/add-workout', requireAuth, (req, res) => {
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
                            error: 'Failed to add workout: ' + err.message 
                        });
                    });
                } else {
                    res.redirect('/dashboard');
                }
            }
        );
    });

    //view all workouts 
    router.get('/all-workouts', requireAuth, (req, res) => {
        const userId = req.session.user.id;
        
        db.query(
            'SELECT * FROM workouts WHERE user_id = ? ORDER BY workout_date DESC',
            [userId],
            (err, workouts) => {
                res.render('all-workouts', { 
                    title: 'All Workouts', 
                    workouts: workouts || []
                });
            }
        );
    });

    //delete workout 
    router.post('/delete-workout/:id', requireAuth, (req, res) => {
        const workoutId = req.params.id;
        const userId = req.session.user.id;
        
        //ensure user owns this workout
        db.query(
            'DELETE FROM workouts WHERE id = ? AND user_id = ?',
            [workoutId, userId],
            (err, result) => {
                res.redirect('/dashboard');
            }
        );
    });

    //search page
    router.get('/search', requireAuth, (req, res) => {
        res.render('search', { title: 'Search Workouts', workouts: [], query: '' });
    });

    //search POST
    router.post('/search', requireAuth, (req, res) => {
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

    return router;
};