const express = require('express');
var uuidv4 = require('uuid/v4');
var validate = require('uuid-validate');
const path = require('path');

var app = express();
var database = require(path.join(__dirname, '../database/db.interface'));

app.on('mount', function () {
    console.log(app.path() + ' -- mounted');
});

app.param(['id'], function (req, res, next, value) {
    if (validate(value, 4)){
        console.log(req.originalUrl + ' -- ' + req.method + ' validator good');
        next();
    }
    else{
        console.log(req.originalUrl + ' -- ' + req.method + ' invalid identifier');
        next({ status: 400, error: 'bad request' });
    }
});


app.route('/publishers')
    .get(function (req, res, next) {
        console.log(req.originalUrl + ' -- ' + req.method + ' called');
        let tracker = uuidv4();
        database.emit('GET','publishers',tracker);
        database.on('GET ready', (_tracker, data)=>{
            if(tracker===_tracker){ console.log(data); res.json(data); }
        });   
    })

    .post(function (req, res, next) {
        if (!req.is('application/json')) next({ status: 406, error: 'not acceptable' });
        console.log(req.originalUrl + ' -- ' + req.method + ' called');
        let tracker = uuidv4();
        database.emit('POST','publishers',tracker, (req.body));
        database.on('POST ready', (_tracker, data)=>{
            if(tracker===_tracker){ console.log(data); res.json(data); }
        }); 
        
    });

app.route('/publishers/:id')
    .get(function (req, res, next) {
        console.log(req.originalUrl + ' -- ' + req.method + ' called');
        let tracker = uuidv4();
        database.emit('GET','publishers',tracker, req.params.id);
        database.on('GET ready', (_tracker, data)=>{
            if(tracker===_tracker){ console.log(data); res.json(data); }
        }); 
    })

    .post(function (req, res, next) {
        next({ status: 405, error: 'not allowed' });
    })

    .put(function(req,res,next){
        if (!req.is('application/json')) next({ status: 406, error: 'not acceptable' });
        console.log(req.originalUrl + ' -- ' + req.method + ' called');
        let tracker = uuidv4();
        database.emit('PUT','publishers',tracker,req.params.id, (req.body));
        database.on('PUT ready', (_tracker, data)=>{
            if(tracker===_tracker){ console.log(data); res.json(data); }
        }); 
        
    })

    .delete(function(req,res,next){
        if (!req.is('application/json')) next({ status: 406, error: 'not acceptable' });
        console.log(req.originalUrl + ' -- ' + req.method + ' called');
        let tracker = uuidv4();
        database.emit('DELETE','publishers',tracker, req.params.id, (req.body));
        database.on('DELETE ready', (_tracker, data)=>{
            if(tracker===_tracker){ console.log(data); res.json(data); }
        }); 
    })


    module.exports = app;