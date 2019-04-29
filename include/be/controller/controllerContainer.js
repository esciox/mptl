const {ipcMain} = require('electron')
const ModelContainer = require('../model/modelContainer.js');


class ControllerContainer {

    constructor(){
        this.modelContainer = new ModelContainer(); 

        ipcMain.on('form-container-save', (event, arg) => {
            this.save(event, arg);    
        });

        ipcMain.on('container.getAll', (event) => {
            this.getAll(event);    
        });

        ipcMain.on('accordion-getAllFree', (event) => {
            this.getAllFree(event);    
        });

        ipcMain.on('container.getData', (event, arg) => {
            this.getData(event, arg);    
        });

        ipcMain.on('container.deleteIt', (event, arg) => {
            this.deleteIt(event, arg);    
        });                
    }

    save(event, arg){
        this.modelContainer.save(this.manageSave, event, arg);
    }

    getAll(event){
        this.modelContainer.getAll((event, result) => {
            event.sender.send('container.getAll:reply', result);
        }, event);
    }

    getAllFree(event){
        
        this.modelContainer.getAllFree(this.manageGetAllFree, event);
    }

    getData(event, arg){
        this.modelContainer.getData((event, result) => {
            event.sender.send('container.getData:reply', result);
        }, event, arg);
    }

    deleteIt(event, arg){
        this.modelContainer.deleteIt( (event, result) => {
            event.sender.send('container.deleteIt:reply', result);
        }, event, arg);
    }

    manageGetAllFree(event, result){

        event.sender.send('accordion-getAllFree-reply', result);
    }

    manageSave(event, result){
        event.sender.send('form-container-save-reply', result);
    }

}


const controller = new ControllerContainer();
