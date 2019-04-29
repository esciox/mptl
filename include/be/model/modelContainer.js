const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('data/mptl.sqlite');


class ModelContainer {

    constructor(){
        this.db = db;
    }

    save(callback, event, arg){

        // if cnt_id > 0, update
        if(arg.cnt_id !== undefined && arg.cnt_id !== null && arg.cnt_id > 0){
            this.update(callback, event, arg);
        } else {
            this.insert(callback, event, arg);
        }

        // else insert
    }

    insert(callback, event, arg){
        
        let cnt_name = arg.cnt_name;
        let cnt_color = arg.cnt_color;
        let cnt_background_color = arg.cnt_background_color;

        db.run("INSERT INTO containers (cnt_name, cnt_color, cnt_background_color) VALUES ($cnt_name, $cnt_color, $cnt_background_color)", {
            $cnt_name: cnt_name,
            $cnt_color: cnt_color,
            $cnt_background_color: cnt_background_color
        }, (err) =>  {
            
            if(err){
                console.log(err);

                callback(event, {
                    status: 0,
                    error: err.code,
                    data: null    
                });
            } else {
                callback(event, {
                    status: 1,
                    error: null,
                    data: null    
                });
            }

        });
    }

    update(callback, event, arg){
        
        let cnt_id = arg.cnt_id || 0;
        let cnt_name = arg.cnt_name;
        let cnt_color = arg.cnt_color;
        let cnt_background_color = arg.cnt_background_color;

        db.run("UPDATE containers SET cnt_name = $cnt_name, cnt_color = $cnt_color, cnt_background_color = $cnt_background_color WHERE cnt_id = $cnt_id", {
            $cnt_name: cnt_name,
            $cnt_color: cnt_color,
            $cnt_background_color : cnt_background_color,
            $cnt_id: cnt_id        
        }, (err, row) =>  {

            if(err){
                console.log(err);

                callback(event, {
                    status: 0,
                    error: err.code,
                    data: null    
                });
            } else {
                callback(event, {
                    status: 1,
                    error: null,
                    data: row    
                });
            }


        });
    }

    deleteIt(callback, event, arg){

        
        // first update all tasks to the DEFAULT container
        this.updateTasks(callback, event, arg);

        // then delete container
        let cnt_id = arg.cnt_id || 0;

        db.run("DELETE from containers WHERE cnt_id = ?", [ cnt_id ], (err, row) =>  {
            
            if(err){
                console.log(err);

                callback(event, {
                    status: 0,
                    error: err.code,
                    data: null    
                });
            } else {
                callback(event, {
                    status: 1,
                    error: null,
                    data: row    
                });
            }

        });
    }


    updateTasks(callback, event, arg){
        
        let cnt_id = arg.cnt_id;

        db.run("UPDATE tasks SET tsk_container_id = 1 WHERE tsk_container_id = $cnt_id", {
            $cnt_id:cnt_id
        }, (err, rows) =>  {

            if(err){
                console.log(err);

                callback(event, {
                    status: 0,
                    error: err.code,
                    data: null    
                });
            } else {
                callback(event, {
                    status: 1,
                    error: null,
                    data: rows    
                });
            }

        });
    }


    getAll(callback, event){
        
        db.all( " SELECT * FROM containers ORDER BY cnt_name", (err, rows) =>  {
            
            if(err){
                console.log(err);

                callback(event, {
                    status: 0,
                    error: err.code,
                    data: null    
                });
            } else {
                callback(event, {
                    status: 1,
                    error: null,
                    data: rows    
                });
            }
            
        });
    }

    getData(callback, event, arg){
        
        let cnt_id = arg.cnt_id || 0;

        db.get("SELECT * FROM containers WHERE cnt_id = ?", [cnt_id], (err, row) =>  {
            
            if(err){
                console.log(err);

                callback(event, {
                    status: 0,
                    error: err.code,
                    data: null    
                });
            } else {
                callback(event, {
                    status: 1,
                    error: null,
                    data: row    
                });
            }
            
        });
    }

    getAllFree(callback, event){
        
        db.all( " SELECT cnt_id, cnt_name, cnt_color, cnt_background_color, " + 
                " '' as tsk_id, '' as tsk_title, '' as tsk_content, '' as tsk_container_id, " +
                " '' as tsk_date, '' as tsk_time, '' as tsk_creation_date, " + 
                " '' as tsk_update_date, '' as tsk_priority, '' as tsk_status " +
                " FROM containers  " +
                " UNION " +
                " SELECT * FROM containers  " +
                " LEFT JOIN tasks ON cnt_id = tsk_container_id " + 
                " WHERE (tsk_date = '' OR tsk_date IS NULL) " +
                " ORDER BY cnt_id, tsk_id ", (err, rows) =>  {
            
            if(err){
                console.log(err);

                callback(event, {
                    status: 0,
                    error: err.code,
                    data: null    
                });
            } else {
                callback(event, {
                    status: 1,
                    error: null,
                    data: rows    
                });
            }
            
        });
    }

    getByName(cnt_name){
        db.get("SELECT * FROM containers WHERE cnt_name = ? ", cnt_name, (err, row) => {
            console.log(row);
        });        
    }

    getById(callback, cnt_id){
        db.get("SELECT * FROM containers WHERE cnt_id = ? ", cnt_id, (err, row) => {
            
            if(err){
                console.log(err);

                callback(event, {
                    status: 0,
                    error: err.code,
                    data: null    
                });
            } else {
                callback(event, {
                    status: 1,
                    error: null,
                    data: row 
                });
            }
        });        
    }    
}

module.exports = ModelContainer; 

/* 
db.serialize(function() {
  db.run("CREATE TABLE lorem (info TEXT)");
 
  var stmt = db.prepare("INSERT INTO lorem VALUES (?)");
  for (var i = 0; i < 10; i++) {
      stmt.run("Ipsum " + i);
  }
  stmt.finalize();
 
  db.each("SELECT rowid AS id, info FROM lorem", function(err, row) {
      console.log(row.id + ": " + row.info);
  });
});
*/