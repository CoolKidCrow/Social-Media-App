const express = require("express");

const database = require('./pg')

const app = express();

app.set('view engine', 'ejs')

app.get('/', async (req, res) => {
    res.render('index', data);
});

app.listen(3000);