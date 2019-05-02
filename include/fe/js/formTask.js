const {ipcRenderer} = require('electron');
const config        = require('../../../config.json');
const toastr        = require('../../../node_modules/toastr/build/toastr.min.js');
const moment        = require('../../../node_modules/moment/min/moment-with-locales.min.js');

toastr.options = {
    "closeButton": true,
    "debug": false,
    "newestOnTop": false,
    "progressBar": true,
    "positionClass": "toast-top-center",
    "preventDuplicates": false,
    "onclick": null,
    "showDuration": "300",
    "hideDuration": "1000",
    "timeOut": "5000",
    "extendedTimeOut": "1000",
    "showEasing": "swing",
    "hideEasing": "linear",
    "showMethod": "fadeIn",
    "hideMethod": "fadeOut"
};


class FormTask {

    constructor(modalWindow){
        this.tsk_id = $('#tsk_id');
        this.tsk_title = $('#tsk_title');
        this.tsk_content = $('#tsk_content');
        this.tsk_container_id = $('#tsk_container_id');
        this.tsk_priority = $('#tsk_priority');
        this.tsk_date = $('#tsk_date');
        this.tsk_time = $('#tsk_time');
        this.modalWindow = modalWindow;

        ipcRenderer.removeAllListeners('form-task-save-reply').on('form-task-save-reply', (event, result) => {
            this.afterSave(result, this.modalWindow);
        });

        ipcRenderer.removeAllListeners('task.getData:reply').on('task.getData:reply', (event, result) => {
            this.setForm(result, this.modalWindow);
        });

        ipcRenderer.removeAllListeners('container.getAll:reply').on('container.getAll:reply', (event, result) => {
            this.fillContainer(result, this.modalWindow);
        });

    }

    init(){

        $('#modalTaskBtn').on('click', () => {
            this.clearForm();
            this.modalShow();
        });

        this.getAllContainers();

        $('#tsk_priority').dropdown({
            values: [
                { name : '1', value : '1'},
                { name : '2', value : '2'},
                { name : '3', value : '3'},
                { name : '4', value : '4'},
                { name : '5', value : '5', selected : true}
            ]
          })
        ;


        $('#modalTaskCancelBtn').on('click', () => {
            this.modalHide();
            return false;
        });

        $('#modalTaskOKBtn').on('click', () => {
            if(this.check()){
                this.save();
            }
            return false;
        });

    }

    getAllContainers(){
        ipcRenderer.send('container.getAll');
    }

    check(){
        if(this.tsk_title.val().trim() === ''){
            alert('Title required');
            return false;
        }

        return true;
    }


    save(){

        let tsk_id              = this.tsk_id.val() || 0;
        let tsk_title           = this.tsk_title.val();
        let tsk_content         = this.tsk_content.val();
        let tsk_container_id    = this.tsk_container_id.dropdown('get value') || 1;
        let tsk_priority        = this.tsk_priority.dropdown('get value') || 5;
        let tsk_date            = this.output2dbDate(this.tsk_date.val());
        let tsk_time            = this.tsk_time.val();

        ipcRenderer.send('form-task-save', {
            tsk_id,
            tsk_title,
            tsk_content,
            tsk_container_id,
            tsk_priority,
            tsk_date,
            tsk_time
        });

        return false;
    }

    db2outputDate(dateString = ''){

        // from YYYY-MM-DD HH:MM:SS.SSS to YYYY-MM-DD  format

        if(dateString != ''){
            let date = moment(dateString)
            return date.format('YYYY-MM-DD');
        }

        return dateString;

    }

    output2dbDate(dateString = ''){

        // from YYYY-MM-DD to YYYY-MM-DD HH:MM:SS.SSS format
        let tmp, date='';

        if(dateString != ''){
            tmp = dateString.split("-");

            if(tmp.length === 3){
                date = moment(new Date(tmp[0], tmp[1]-1, tmp[2], 0,0,0));
                return date.format('YYYY-MM-DD HH:MM:SS.SSS');
            }

        }

        return dateString;

    }

    afterSave(result){

        // ok
        if(result.status){
            this.modalHide();

            // reload main page
            $(document).trigger('reloadAccordion');
            $(document).trigger('reloadCalendar');

            if(config.showSuccess){
                toastr.success("Task saved successfully");
            }

        // error
        } else {
            toastr.error(result.error);
        }

    }

    modalShow(){
        this.modalWindow.modal('show');
    }

    modalHide(){
        this.modalWindow.modal('hide');
    }

    clearForm(){

        this.tsk_id.val(0);
        this.tsk_title.val('');
        this.tsk_content.val('');
        this.tsk_container_id.val(1);
        this.tsk_priority.val(5);
        this.tsk_date.val('');
        this.tsk_time.val('');

    }

    getData(tsk_id){

        ipcRenderer.send('task.getData', {tsk_id});

    }

    setForm(result){

        if(result.status){

            this.tsk_id.val(result.data.tsk_id);
            this.tsk_title.val(result.data.tsk_title);
            this.tsk_content.val(result.data.tsk_content);
            this.tsk_container_id.dropdown('set selected', result.data.tsk_container_id);
            this.tsk_priority.dropdown('set selected', result.data.tsk_priority);
            this.tsk_date.val(this.db2outputDate(result.data.tsk_date));
            this.tsk_time.val(result.data.tsk_time);

            this.modalShow();

        } else {
            toastr.error(result.error);
        }

    }

    fillContainer(result){

        let record, values = [];

        for(let index in result.data){
            record = result.data[index];

            values.push({
                name: record.cnt_name,
                value: record.cnt_id,
                selected: record.cnt_id === 1 ? true : false
            })

        }

        $('#tsk_container_id').dropdown({
            values
        });

    }
}

module.exports = FormTask;