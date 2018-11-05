var events = require('events');
var e = new events.EventEmitter();

var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('./data.db', (err) => {  
  if(err){
	  e.emit('DB Error', {status: 500, error:'internal server error'});
	  console.error('DB ERROR: ' + err);
	} 
});

e.once('DB close', ()=>{ db.close((err) => {  
    if(err){
        e.emit('DB Error', {status: 500, error:'internal server error'});
        console.error('DB ERROR: ' + err);
      }
    });
});

e.once('DB init', ()=>{
    console.log('DB EVENT: init');
    db.serialize(function () {
        db.run('CREATE TABLE IF NOT EXISTS authors (uuid TEXT PRIMARY KEY ON CONFLICT REPLACE, json BLOB, count NUM, time TEXT DEFAULT CURRENT_TIMESTAMP ) WITHOUT ROWID', (err)=> {
            if(err){ __err(err.message + ' authors'); }  
        });
        db.run('CREATE TABLE IF NOT EXISTS publishers (uuid TEXT PRIMARY KEY ON CONFLICT REPLACE, json BLOB, count NUM, time TEXT DEFAULT CURRENT_TIMESTAMP ) WITHOUT ROWID', (err)=> {
            if(err){ __err(err.message + ' publishers'); } 
        });
        db.run('CREATE TABLE IF NOT EXISTS libraries (uuid TEXT PRIMARY KEY ON CONFLICT REPLACE, json BLOB, count NUM, time TEXT DEFAULT CURRENT_TIMESTAMP ) WITHOUT ROWID', (err)=> {
            if(err){ __err(err.message +' libraries'); }  
        });
        db.run('CREATE TABLE IF NOT EXISTS books (uuid TEXT PRIMARY KEY ON CONFLICT REPLACE, json BLOB, count NUM, time TEXT DEFAULT CURRENT_TIMESTAMP ) WITHOUT ROWID', (err)=> {
            if(err){ __err(err.message + ' books'); }  
        });
        db.run('CREATE TABLE IF NOT EXISTS movements (uuid TEXT PRIMARY KEY ON CONFLICT REPLACE, json BLOB NOT NULL, count NUM NOT NULL, time TEXT DEFAULT CURRENT_TIMESTAMP) WITHOUT ROWID', (err)=> {
            if(err){ __err(err.message + ' movements'); } 
        });
        db.run('CREATE TABLE IF NOT EXISTS extractors (id INTEGER PRIMARY KEY AUTOINCREMENT, query TEXT, time TEXT DEFAULT CURRENT_TIMESTAMP )', (err)=> {
            if(err){ __err(err.message + ' extractors'); } 
		});

        let queries = [
            /*GET authors*/ 		'SELECT uuid, json FROM authors WHERE :uuid count > 0 ',
            /*GET books*/ 			'SELECT uuid, json FROM books WHERE :uuid count > 0 ',
            /*GET publishers*/ 		'SELECT uuid, json FROM publishers WHERE :uuid count > 0 ',
            /*GET libraries*/ 		'SELECT uuid, json FROM libraries WHERE :uuid count > 0 ',
            /*GET items*/ 			'SELECT json, SUM(count) AS available FROM movements GROUP BY json HAVING available > 0',
            
            /* POST --> INSERT can manage PUT --> UPDATE because of the clause ON CONFLICT REPLACE*/
    
            /*POST authors*/ 		'INSERT INTO authors(uuid, json, count) VALUES ( :uuid , :json, :val )',
            /*POST books*/	 		'INSERT INTO books(uuid, json, count) VALUES ( :uuid , :json, :val )',
            /*POST publishers*/ 	'INSERT INTO publishers(uuid, json, count) VALUES ( :uuid , :json, :val )',
            /*POST libraries*/ 		'INSERT INTO libraries(uuid, json, count) VALUES ( :uuid , :json, :val )',
            /*POST items*/ 			'INSERT INTO movements(uuid, json, count) VALUES ( :uuid , :json, :val )',
            
            /* DELETEs are made by decrementing count attribute */
            ];
    
            let sql = 'INSERT OR REPLACE INTO extractors(query) VALUES ' + queries.map((stmt) => '(?)').join(',');
            db.run(sql, queries, function(err) {
                if(err){ __err(err.message + ' extractors'); }
              });

    });
    
});

e.on('DB extractor query',(cookie, id) => {
    console.log('DB query extractor id: ' +id);
    db.serialize(() => {
        db.get('SELECT query FROM extractors WHERE id=?',[id],(err, row) => {
            if(err) __err(err.message); 
            console.log('DB EXTRACTOR: ' + row.query);
            e.emit('DB extractor ready', cookie, row.query);    
        });
    });
});

e.on('DB data query',(cookie, query ) => {
    console.log('DB data extractor: ' +query);
    db.serialize(() => {
        db.all(query,(err, rows) => {
            if(err) __err(err.message);
            console.log('DB DATA: ' + rows);
            e.emit('DB data ready', cookie, rows);    
        });
    });
});

function __err(err){
    e.emit('DB Error', {status: 500, error:'internal server error'});
    console.error('DB ERROR: ' + err);
}

module.exports = {e};