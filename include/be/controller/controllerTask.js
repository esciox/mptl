const {ipcMain} = require('electron')
const ModelTask = require('../model/modelTask.js');


class ControllerTask {

    constructor(){
        this.modelTask = new ModelTask(); 

        ipcMain.on('form-task-save', (event, arg) => {
            controller.save(event, arg);    
        });

        ipcMain.on('sortable-saveContainer', (event, arg) => {
            controller.saveContainer(event, arg);    
        });

        ipcMain.on('sortable-saveCalendar', (event, arg) => {
            controller.saveCalendar(event, arg);    
        });

        ipcMain.on('task.getByDate', (event, arg) => {
            controller.getByDate(event, arg);    
        });

        ipcMain.on('task.deleteIt', (event, arg) => {
            controller.deleteIt(event, arg);    
        });

        ipcMain.on('task.doIt', (event, arg) => {
            controller.doIt(event, arg);    
        });

        ipcMain.on('task.getData', (event, arg) => {
            controller.getData(event, arg);    
        });


    }

    save(event, arg){
        this.modelTask.save(this.manageSave, event, arg);
    }

    getAll(event){
        this.modelTask.getAll(this.manageGetAll, event);
    }

    saveContainer(event, arg){
        this.modelTask.saveContainer(this.manageSaveContainer, event, arg);
    }

    saveCalendar(event, arg){
        this.modelTask.saveCalendar(this.manageSaveCalendar, event, arg);
    }    

    getByDate(event, arg){
        this.modelTask.getByDate(this.manageGetByDate, event, arg);
    }

    deleteIt(event, arg){
        this.modelTask.deleteIt( (event, result) => {
            event.sender.send('task.deleteIt:reply', result);
        }, event, arg);
    }

    doIt(event, arg){
        this.modelTask.doIt( (event, result) => {
            event.sender.send('task.doIt:reply', result);
        }, event, arg);
    }    

    getData(event, arg){
        this.modelTask.getData( (event, result) => {
            event.sender.send('task.getData:reply', result);
        }, event, arg);
    }


    manageGetAll(event, result){
        event.sender.send('form-task-getAll-reply', result);
    }

    manageSave(event, result){
        event.sender.send('form-task-save-reply', result);
    }

    manageSaveContainer(event, result){
        event.sender.send('sortable-saveContainer-reply', result);
    }

    manageSaveCalendar(event, result){
        event.sender.send('sortable-saveCalendar-reply', result);
    }

    manageGetByDate(event, result){
        event.sender.send('task.getByDate.reply', result);
    }    

}


const controller = new ControllerTask();

