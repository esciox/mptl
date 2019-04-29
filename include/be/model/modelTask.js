const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('data/mptl.sqlite');


class ModelTask {

    constructor(){
        this.db = db;
    }

    save(callback, event, arg){

        // if tsk_id > 0, update
        if(arg.tsk_id !== undefined && arg.tsk_id !== null && arg.tsk_id > 0){
            this.update(callback, event, arg);
        // else insert
        } else {
            this.insert(callback, event, arg);
        }


    }


    saveContainer(callback, event, arg){
        let tsk_id = arg.tsk_id;
        let tsk_container_id = arg.cnt_id;
        let res;

        db.run("UPDATE tasks SET tsk_container_id = $tsk_container_id, tsk_date = null " +
                " WHERE tsk_id = $tsk_id", {
            $tsk_id:tsk_id,
            $tsk_container_id:tsk_container_id,
        }, (err, row) =>  {

            if(err){
                console.log(err);

                callback(event, {
                    status: 0,
                    error: err.code,
                    data: null
                });
            } else {

                db.get("SELECT * FROM containers WHERE cnt_id = ? ", tsk_container_id, (err, row) => {

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
                            data: {
                                tsk_id: tsk_id,
                                cnt_id: row.cnt_id,
                                cnt_name: row.cnt_name,
                                cnt_color: row.cnt_color,
                                cnt_background_color: row.cnt_background_color,
                            }
                        });
                    }

                });

            }

        });
    }


    saveCalendar(callback, event, arg){
        let tsk_id = arg.tsk_id;
        let tsk_date = arg.tsk_date;

        db.run("UPDATE tasks SET tsk_date = $tsk_date " +
            " WHERE tsk_id = $tsk_id", {
            $tsk_id:tsk_id,
            $tsk_date:tsk_date,
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


    insert(callback, event, arg){

        let tsk_title = arg.tsk_title;
        let tsk_content = arg.tsk_content;
        let tsk_container_id = arg.tsk_container_id;
        let tsk_priority = arg.tsk_priority;
        let tsk_date = arg.tsk_date;
        let tsk_time = arg.tsk_time;


        db.run(
            "INSERT INTO tasks (tsk_title, tsk_content, tsk_container_id, tsk_priority, tsk_date, tsk_time) " +
            "VALUES ($tsk_title, $tsk_content, $tsk_container_id, $tsk_priority, $tsk_date, $tsk_time)", {
            $tsk_title:tsk_title,
            $tsk_content:tsk_content,
            $tsk_container_id:tsk_container_id,
            $tsk_priority:tsk_priority,
            $tsk_date:tsk_date,
            $tsk_time:tsk_time
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

        let tsk_id = arg.tsk_id;
        let tsk_title = arg.tsk_title;
        let tsk_content = arg.tsk_content;
        let tsk_container_id = arg.tsk_container_id;
        let tsk_priority = arg.tsk_priority;
        let tsk_date = arg.tsk_date;
        let tsk_time = arg.tsk_time;

        db.run("UPDATE tasks SET tsk_title = $tsk_title, tsk_content = $tsk_content, " +
            "tsk_container_id = $tsk_container_id, tsk_priority = $tsk_priority, tsk_date = $tsk_date, " +
            "tsk_time = $tsk_time WHERE tsk_id = $tsk_id", {
            $tsk_id:tsk_id,
            $tsk_title:tsk_title,
            $tsk_content:tsk_content,
            $tsk_container_id:tsk_container_id,
            $tsk_priority:tsk_priority,
            $tsk_date:tsk_date,
            $tsk_time:tsk_time
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

    deleteIt(callback, event, arg){

        let tsk_id = arg.tsk_id || 0;

        db.run("DELETE from tasks WHERE tsk_id = ?", [ tsk_id ], (err, rows) =>  {

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
                    data: {tsk_id}
                });
            }

        });
    }

    doIt(callback, event, arg){

        let tsk_id = arg.tsk_id || 0;

        db.run("UPDATE tasks SET tsk_status = 'DONE' WHERE tsk_id = ?", [ tsk_id ], (err, rows) =>  {

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
                    data: {tsk_id}
                });
            }

        });
    }


    getAll(callback, event){
        db.all("SELECT * FROM tasks", (err, rows) =>  {

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

        let tsk_id = arg.tsk_id || 0;

        db.get("SELECT * FROM tasks WHERE tsk_id = ?", [tsk_id], (err, row) =>  {

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


    getByDate(callback, event, arg){

        let dateFrom = arg.dateFrom;
        let dateTo = arg.dateTo;

        db.all( "SELECT * FROM tasks INNER JOIN containers ON tsk_container_id = cnt_id " +
                " WHERE tsk_date >= ? AND tsk_date <= ? order by tsk_date, tsk_priority", [dateFrom, dateTo], (err, rows) =>  {

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

}

module.exports = ModelTask;