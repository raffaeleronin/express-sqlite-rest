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

app.param(['book'], function (req, res, next, value) {
    if (validate(value, 4)){
        console.log(req.originalUrl + ' -- ' + req.method + ' validator good');
        next();
    }
    else{
        console.log(req.originalUrl + ' -- ' + req.method + ' invalid identifier');
        next({ status: 400, error: 'bad request' });
    }
});


app.route('/libraries')
    .get(function (req, res, next) {
        console.log(req.originalUrl + ' -- ' + req.method + ' called');
        let tracker = uuidv4();
        database.emit('GET','libraries',tracker);
        database.on('GET ready', (_tracker, data)=>{
            if(tracker===_tracker){ console.log(data); res.json(data); }
        });   
    })

    .post(function (req, res, next) {
        if (!req.is('application/json')) next({ status: 406, error: 'not acceptable' });
        console.log(req.originalUrl + ' -- ' + req.method + ' called');
        let tracker = uuidv4();
        database.emit('POST','libraries',tracker, (req.body));
        database.on('POST ready', (_tracker, data)=>{
            if(tracker===_tracker){ console.log(data); res.json(data); }
        }); 
        
    });

app.route('/libraries/:id')
    .get(function (req, res, next) {
        console.log(req.originalUrl + ' -- ' + req.method + ' called');
        let tracker = uuidv4();
        database.emit('GET','libraries',tracker, req.params.id);
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
        database.emit('PUT','libraries',tracker,req.params.id, (req.body));
        database.on('PUT ready', (_tracker, data)=>{
            if(tracker===_tracker){ console.log(data); res.json(data); }
        }); 
        
    })

    .delete(function(req,res,next){
        if (!req.is('application/json')) next({ status: 406, error: 'not acceptable' });
        console.log(req.originalUrl + ' -- ' + req.method + ' called');
        let tracker = uuidv4();
        database.emit('DELETE','libraries',tracker, req.params.id, (req.body));
        database.on('DELETE ready', (_tracker, data)=>{
            if(tracker===_tracker){ console.log(data); res.json(data); }
        }); 
    })

app.route('/libraries/:id/items')
    .get(function (req, res, next) {
        console.log(req.originalUrl + ' -- ' + req.method + ' called');
        let tracker = uuidv4();
        database.emit('GET','movements',tracker);
        database.on('GET ready', (_tracker, data)=>{
            if(tracker===_tracker){ console.log(data); res.json(data); }
        });   
    })

    .post(function (req, res, next) {
        if (!req.is('application/json')) next({ status: 406, error: 'not acceptable' });
        console.log(req.originalUrl + ' -- ' + req.method + ' called');
        
        let tracker = uuidv4();
        let lid = {};
        let bid = req.body;

        database.emit('GET','libraries',tracker, req.params.id);
        database.on('GET ready', (_tracker, data)=>{
            if(tracker===_tracker){ 
                lid = data[0];
                let __tracker = uuidv4();
                database.emit('POST','movements',__tracker, { library: lid , book: bid });
                database.on('POST ready', (___tracker, data)=>{
                    if(__tracker===___tracker){ console.log(data); res.json(data); }
                }); 
            }
        
        });  
        
    })

    .put(function (req, res, next) {
        next({ status: 405, error: 'not allowed' });
    })

    .delete(function (req, res, next) {
        next({ status: 405, error: 'not allowed' });
    });

app.route('/libraries/:id/items/:book')
    .get(function (req, res, next) {
        console.log(req.originalUrl + ' -- ' + req.method + ' called');
        let tracker = uuidv4();
        database.emit('GET','movements',tracker);
        database.on('GET ready', (_tracker, data)=>{
            if(tracker===_tracker){ 
                console.log(data);
                let result = [];
                data.forEach(element => {
                    if(element.json.library.uuid === req.params.id && element.json.book.uuid === req.params.book)
                        result.push(element);
                });
                res.json(result);
            }
        }); 
    })

    .post(function (req, res, next) {
        next({ status: 405, error: 'not allowed' });
    })

    .put(function(req,res,next){
        next({ status: 405, error: 'not allowed' });        
    })

    .delete(function(req,res,next){
        console.log(req.originalUrl + ' -- ' + req.method + ' called');

        let trackerL = uuidv4();
        let trackerB = uuidv4();
        let trackerM = uuidv4();
        let lib = {};
        let boo = {};

        database.emit('GET','libraries',trackerL, req.params.id);
        database.on('GET ready', (_tracker, data)=>{
            if(trackerL===_tracker){ 
                lib = data[0];
                database.emit('GET','books',trackerB, req.params.book);
                database.on('GET ready', (__tracker, data)=>{
                    if(trackerB===__tracker){ 
                        boo = data[0];

                        database.emit('DELETE','movements',trackerM, uuidv4(), { library: lib , book: boo } );
                        database.on('DELETE ready', (___tracker, data)=>{
                            if(trackerM===___tracker){
                                console.log(data);
                                res.json(data);
                            }
                        });
                    }
                });
            }
        });

    })



    module.exports = app;