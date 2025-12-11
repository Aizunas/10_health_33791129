const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();

module.exports = (db) => {
    
    //login page
    router.get('/login', (req, res) => {
        res.render('login', { title: 'Login', error: null });
    });

    //login POST
    router.post('/login', (req, res) => {
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

    //register page
    router.get('/register', (req, res) => {
        res.render('register', { title: 'Register', error: null });
    });

    //register POST
    router.post('/register', async (req, res) => {
        const { username, email, password, confirmPassword } = req.body;
        
        //validation
        if (password !== confirmPassword) {
            return res.render('register', { title: 'Register', error: 'Passwords do not match' });
        }
        
        //password req: 8 chars - 1 lowercase - 1 uppercase - 1 numbe - 1 special
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

    //logout
    router.get('/logout', (req, res) => {
        req.session.destroy();
        res.redirect('/');
    });

    return router;
};