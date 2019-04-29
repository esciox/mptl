const {ipcRenderer} = require('electron');
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

class Sortable{

    constructor(object, target, placeHolder){
        this.object = object;
        this.target = target;
        this.placeHolder = placeHolder;
        this.component = null;

        ipcRenderer.removeAllListeners('sortable-saveContainer-reply').on('sortable-saveContainer-reply', (event, result) => {

            this.changeTaskColor(result);

            this.afterSave(result);
        });


        ipcRenderer.removeAllListeners('sortable-saveCalendar-reply').on('sortable-saveCalendar-reply', (event, result) => {
            this.afterSave(result);
        });


    }

    init(){

        // wait untill both object and target are ready
        let interval = window.setInterval(()=>{

            if($(this.object) && $(this.target)){
                this.component = this.setWidget();
                window.clearInterval(interval);
            }

        }, 500);

    }

    update(){
        this.setWidget($(this.object));
    }

    setWidget(){

        let obj = this;


        return $(this.object).sortable({
            connectWith: this.target,
            placeholder: this.placeHolder,
            appendTo: document.body,
            cursor: "move",
            opacity: 0.5,
            scroll: false,
            zIndex: 9999,
            helper: 'clone',
            // cursorAt: { left: 260, top: 50 },
            stop: function( event, ui ) {

                let element = ui.item[0];
                let source = event.target;
                let target = element.parentElement;
                let dataType = $(target).attr('data-type');
                let cnt_id = $(target).attr('data-cnt_id');
                let tsk_date = $(target).attr('data-tsk_date');
                let tsk_id = $(element).attr('data-tsk_id');

                obj.save({
                    element,
                    tsk_id,
                    target,
                    dataType,
                    cnt_id,
                    tsk_date
                });

            }
        });

    }


    save(params){

        let element     = params.element;
        let dataType    = params.dataType;
        let target      = params.target;
        let tsk_id      = params.tsk_id;
        let cnt_id      = params.cnt_id;
        let tsk_date    = this.output2dbDate(params.tsk_date);

        switch(dataType){
            case 'container':

                this.saveContainer(tsk_id, cnt_id);

                break;
            case 'calendar':

                this.saveCalendar(tsk_id, tsk_date);

                break;
        }

    }

    output2dbDate(dateString = ''){

        // from DD/MM/YYYY to YYYY-MM-DD HH:MM:SS.SSS format
        let tmp, date='';

        if(dateString != ''){
            tmp = dateString.split("/");

            if(tmp.length === 3){
                date = moment(new Date(tmp[2], tmp[1]-1, tmp[0], 0,0,0));
                return date.format('YYYY-MM-DD');
            }

        }

        return dateString;

    }

    saveContainer(tsk_id, cnt_id){

        ipcRenderer.send('sortable-saveContainer', {
            tsk_id, cnt_id
        });

        return false;

    }

    saveCalendar(tsk_id, tsk_date){

        ipcRenderer.send('sortable-saveCalendar',{
            tsk_id, tsk_date
        });

        return false;

    }

    changeTaskColor(result){

        let element = $(`div[data-tsk_id="${result.data.tsk_id}"]`);

        if(result.data.cnt_color && result.data.cnt_background_color){
            $(element)
                .css('color', result.data.cnt_color)
                .css('background-color', result.data.cnt_background_color);
        }

    }

    afterSave(result, modalWindow){

        // ok
        if(result.status){
            // toastr.success("Saved successfully");

        // error
        } else {
            toastr.error(result.error);
        }

    }

}

module.exports = Sortable;