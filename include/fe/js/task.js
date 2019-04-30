const {ipcRenderer} = require('electron');
const toastr        = require('../../../node_modules/toastr/build/toastr.min.js');

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

class Task{

    constructor(object, target, placeHolder){

        this.priorityMap = {
            1: 'red',
            2: 'orange',
            3: 'yellow',
            4: 'greenyellow',
            5: 'green'
        };

        ipcRenderer.removeAllListeners('task.deleteIt:reply').on('task.deleteIt:reply', (event, result) => {
            this.afterDelete(result);
        });

        ipcRenderer.removeAllListeners('task.doIt:reply').on('task.doIt:reply', (event, result) => {
            this.afterDoIt(result);
        });

    }

    createTask(record){

        let task = '';
        let style = '';
        let doneBtn = '';
        let editBtn = '';
        let deleteBtn = '';
        let customClass = '';
        let title = '';

        if(record.tsk_id){

            // border-top: 3px solid ${this.priorityMap[record.tsk_priority]};
            style = `color:${record.cnt_color}; background-color:${record.cnt_background_color}`;

            // if task is already done, show only delete btn
            if(record.tsk_status != 'DONE'){
                doneBtn = '<i class="check circle icon taskBtn" title="Task Done"></i>';
                editBtn = '<i class="cog icon taskBtn" title="Edit Task"></i>';
            } else {
                customClass += ' taskDone';
            }

            deleteBtn = '<i class="minus circle icon taskBtn" title="Delete Task"></i>';

            title += `
${record.tsk_title}

${record.tsk_content}`;

            task = `<div data-type="task" data-tsk_id="${record.tsk_id}" id="task_${record.tsk_id}"
                    class="task ${customClass}" style="${style}" title="${title}">
                    <!--<i class="circle icon" style="color:${this.priorityMap[record.tsk_priority]}" title="Priority: ${record.tsk_priority}"></i>-->
                    <div class="point" style="background-color:${this.priorityMap[record.tsk_priority]}" title="Priority: ${record.tsk_priority}"></div>
                    ${this.cutString(record.tsk_title, 15)}
                    <div class="actionButtons">
                        ${doneBtn}
                        ${editBtn}
                        ${deleteBtn}
                    </div>
                    </div>`;
        }

        return task;

    }

    createTasks(records){

        let tasks = '';
        let record;

        for(let taskIndex in records){

            record = records[taskIndex];
            tasks += this.createTask(record);

        }

        return tasks;

    }

    addEventsToSingle(tsk_id){

        let task = $(`div[data-tsk_id="${tsk_id}"]`);

        //done
        $('.check.circle.icon', task).off('click').on('click', {tsk_id}, this.doIt);

        // edit
        $('.cog.icon', task).off('click').on('click', {tsk_id}, this.editIt );

        // delete
        $('.minus.circle.icon', task).off('click').on('click', {tsk_id}, this.deleteIt );

    }

    addEventsToAll(scope = document){

        let tasks = $(`div[data-type="task"]`, scope);

        for(let task of tasks){
            this.addEventsToSingle($(task).attr('data-tsk_id'));
        }

    }

    editIt(event){

        let tsk_id = event.data.tsk_id;

        // raise event
        $(document).trigger('updateTask', [{tsk_id}]);

    }

    deleteIt(event){

        if(!confirm('Are you sure to delete it?')){
            return;
        }

        let tsk_id = event.data.tsk_id;

        ipcRenderer.send('task.deleteIt', {tsk_id});

    }

    doIt(event){

        let tsk_id = event.data.tsk_id;

        ipcRenderer.send('task.doIt', {tsk_id});

    }

    afterDelete(result){

        if(result.status){

            let task = $(`div[data-tsk_id="${result.data.tsk_id}"]`);

            task.remove();

        } else {
            toastr.error(result.error);
        }


    }

    afterDoIt(result){

        if(result.status){
            let task = $(`div[data-tsk_id="${result.data.tsk_id}"]`);

            task.addClass('taskDone');

            //remove buttons
            $('.check.circle.icon', task).remove();
            $('.cog.icon', task).remove();

        } else {
            toastr.error(result.error);
        }

    }

    cutString(string, limit){

        if(string.length > limit) {
            return string.substr(0, limit) + "...";
        } else {
            return string;
        }



    }

}

module.exports = Task;