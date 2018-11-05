const express = require('express');
const path = require('path');

var app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(express.static(path.join(__dirname, 'public')));

app.use('/', require('./routes/route.libraries'));
app.use('/', require('./routes/route.books'));
app.use('/', require('./routes/route.publishers'));
app.use('/', require('./routes/route.authors'));

app.use(function (err, req, res, next) {
    console.error(req.originalUrl + ' -- ' + err.status + ' ' + err.error);
    res.status(err.status).end();
});


app.listen(3000);