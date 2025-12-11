const express = require('express');
const router = express.Router();

module.exports = () => {
    
    // Home page
    router.get('/', (req, res) => {
        res.render('home', { title: 'Home' });
    });

    // About page
    router.get('/about', (req, res) => {
        res.render('about', { title: 'About' });
    });

    return router;
};