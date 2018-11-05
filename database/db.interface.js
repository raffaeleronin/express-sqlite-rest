var uuidv4 = require('uuid/v4');
const path = require('path');

var core = require(path.join(__dirname, './db.core'));
var e = core.e;

e.emit('DB init');

e.on('RETRIEVE', ( cookie, query, uuid ) => {
    e.emit('DB extractor query', cookie, query);
    e.on('DB extractor ready',(_cookie,data) => {
        if(cookie === _cookie){
            if(uuid) { e.emit('DB data query', _cookie, data.replace(':uuid', 'uuid LIKE \'' + uuid + '\' AND ')); }
            else {e.emit('DB data query', _cookie, data.replace(':uuid', '')); }         
            e.on('DB data ready', (__cookie,data) => {
                if(cookie===__cookie){
                    data.forEach((res) => res.json = JSON.parse(res.json));
                    e.emit('RETRIEVE ready', cookie, data);
                }
            });      
        }
    });
});

e.on('INSERT', ( cookie,query, uuid, json ) => {
    e.emit('DB extractor query', cookie, query % 10 || 10);
    e.on('DB extractor ready',(_cookie,data) => {
        if(cookie === _cookie){
                e.emit('DB data query', _cookie, 
                    data
                        .replace(':uuid', '\'' + uuid +'\'' )
                        .replace(':json',  '\'' + JSON.stringify(json) +'\'' )
                        .replace(':val',  (query <= 10)?1:-1 )
                );   
        }
    });
});

e.on('GET', (on,tracker, uuid) =>{
    let cookie = uuidv4();
    let query = (on==='authors')?1:(on==='books')?2:(on==='publishers')?3:(on==='libraries')?4:(on==='movements')?5:0;
    e.emit('RETRIEVE',cookie,query, uuid);
    e.on('RETRIEVE ready', (_cookie, data)=>{
        if(cookie === _cookie){
            e.emit('GET ready',tracker, data);
        }
    });    
});

e.on('POST', (on,tracker, json) => {
    let cookie = uuidv4();
    let uuid = uuidv4();
    let query = (on==='authors')?1:(on==='books')?2:(on==='publishers')?3:(on==='libraries')?4:(on==='movements')?5:0;
    e.emit('INSERT', cookie,5 + query , uuid, json );
    e.emit('GET',on, tracker, uuid);
    e.on('GET ready', (_tracker, data)=>{
        if(_tracker ===tracker ){
            e.emit('POST ready',tracker, data);
        }
    });
});

e.on('PUT', (on,tracker, uuid, json ) => {
    let cookie = uuidv4();
    let query = (on==='authors')?1:(on==='books')?2:(on==='publishers')?3:(on==='libraries')?4:(on==='movements')?5:0;
    e.emit('INSERT', cookie,5+query, uuid, json );
    e.emit('GET', on, tracker, uuid);
    e.on('GET ready', (_tracker, data)=>{
        if(_tracker === tracker){
            e.emit('PUT ready', tracker, data);
        }
    });
});

e.on('DELETE', (on, tracker, uuid, json ) => {
    let cookie = uuidv4();
    let query = (on==='authors')?1:(on==='books')?2:(on==='publishers')?3:(on==='libraries')?4:(on==='movements')?5:0;
    e.emit('INSERT', cookie,15+query, uuid, json );
    e.emit('GET', on, tracker);
    e.on('GET ready', (_tracker, data)=>{
        if(_tracker === tracker){
            e.emit('DELETE ready',tracker, data);
        }
    });
});

module.exports = e;