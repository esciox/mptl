// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.

/*
    COMPONENTS SCHEMA
                                MAIN
        |---------------|--------|-----|-----------------|
    CALENDAR        ACCORDION       FORMTASK        FORMCONTAINER            
  --|---|---|       |---|---|
  SORT    TASK    SORT    TASK

*/


const Calendar          = require('./calendar.js');
const Accordion         = require('./accordion.js');
const FormContainer     = require('./formContainer.js');
const FormTask          = require('./formTask.js');
const modalContainer    = $('#modalContainer').modal();
const modalTask         = $('#modalTask').modal();
const containerSelect   = $('#containerSelect').dropdown();
const prioritySelect    = $('#prioritySelect').dropdown();

let formContainer   = new FormContainer(modalContainer);
formContainer.init();

let formTask        = new FormTask(modalTask);
formTask.init();

let calendar = new Calendar("calendarWidget");
calendar.init();

let accordion = new Accordion("accordionWidget");
accordion.init();

$('.ui.accordion').accordion();

// window close button
$('#closeBtn').on('click', () => {
    window.close();
});

$(document).on('reloadAccordion', (event)=>{    
    accordion.update();
});

$(document).on('reloadCalendar', (event)=>{    
    calendar.update();
});

$(document).on('updateTask', (event, params)=>{    
    
    formTask.clearForm();
    formTask.getData(params.tsk_id);
});

$(document).on('updateContainersList', (event, params)=>{    
    formTask.getAllContainers();
});

$(document).on('updateContainer', (event, params)=>{    
    
    formContainer.clearForm();
    formContainer.getData(params.cnt_id);
});
