const {ipcRenderer} = require('electron');
const toastr        = require('../../../node_modules/toastr/build/toastr.min.js');
const config        = require('../../../config.json');

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


class FormContainer {
    
    constructor(modalWindow){
        this.cnt_id = $('#cnt_id');
        this.cnt_name = $('#cnt_name');
        this.cnt_color = $('#cnt_color');
        this.cnt_background_color = $('#cnt_background_color');
        this.cnt_color_def = '#000000';
        this.cnt_background_color_def = '#C0C0C0';
        this.modalWindow = modalWindow;

        ipcRenderer.removeAllListeners('form-container-save-reply').on('form-container-save-reply', (event, result) => {
            this.afterSave(result, modalWindow);
        });


        ipcRenderer.removeAllListeners('container.getData:reply').on('container.getData:reply', (event, result) => {
            this.setForm(result, this.modalWindow);
        });
    }

    init(){


        $('#cnt_color, #cnt_background_color').spectrum({
            color: "#C0C0C0",
            showInput: false,
            showPalette: true,
            palette: config.colorPickerPalette,
            hideAfterPaletteSelect:true,
            preferredFormat: "hex",
            // containerClassName: 'awesome'
            // replacerClassName: 'awesome'
        });


        $('#modalContainerBtn').on('click', () => {
            this.clearForm();
            this.modalShow();
        });

        $('#modalContainerCancelBtn').on('click', () => {
            this.modalHide();
            return false;
        });

        $('#modalContainerOKBtn').on('click', () => {
            
            if(this.check()){
                this.save();
            }

            return false;
            
        });
    }

    check(){
        if(this.cnt_name.val().trim() === ''){
            alert('Name required');
            return false;
        }

        return true;
    }


    save(modalWindow){

        let cnt_id = this.cnt_id.val() || 0;
        let cnt_name = this.cnt_name.val();
        let cnt_color = this.cnt_color.val().trim() !== '' ? this.cnt_color.val() : this.cnt_color_def;
        let cnt_background_color = this.cnt_background_color.val().trim() !== '' ? this.cnt_background_color.val() : this.cnt_color_def;

        ipcRenderer.send('form-container-save', {
            cnt_id, cnt_name, cnt_color, cnt_background_color
        });

        return false;
    }


    afterSave(result, modalWindow){

        // ok
        if(result.status){
            this.modalHide();

            // reload accordion
            $(document).trigger('reloadAccordion');
            $(document).trigger('reloadCalendar');

            if(config.showSuccess){
                toastr.success("Container saved successfully");
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

        this.cnt_id.val(0);
        this.cnt_name.val('');
        $('#cnt_color, #cnt_background_color').spectrum('set', '#C0C0C0');

    }

    getData(cnt_id){

        ipcRenderer.send('container.getData', {cnt_id});

    }

    setForm(result){

        if(result.status){

            this.cnt_id.val(result.data.cnt_id);
            this.cnt_name.val(result.data.cnt_name);
            $('#cnt_color').spectrum('set', result.data.cnt_color);
            $('#cnt_background_color').spectrum('set', result.data.cnt_background_color);            

            this.modalShow();

        } else {
            toastr.error(result.error);
        }

    }
}

module.exports = FormContainer;
