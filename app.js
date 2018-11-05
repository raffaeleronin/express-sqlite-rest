const express = require('express');
const path = require('path');

var app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use('/static', express.static(path.join(__dirname, 'public')));

app.use('/', require(path.join(__dirname, './routes/route.libraries')));
app.use('/', require(path.join(__dirname, './routes/route.books')));
app.use('/', require(path.join(__dirname, './routes/route.publishers')));
app.use('/', require(path.join(__dirname, './routes/route.authors')));

app.use(function (err, req, res, next) {
    console.error(req.originalUrl + ' -- ' + err.status + ' ' + err.error);
    res.status(err.status).end(err.error);
});

app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname + '/public/index.html'));
});

app.get('*',function (req, res) {
    res.redirect('/');
});

app.listen(3000);