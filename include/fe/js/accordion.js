const {ipcRenderer} = require('electron');
const Sortable      = require('./sortable.js');
const Task          = require('./task.js');
const addContainer  = $('#addContainer').modal();
const addTask       = $('#addTask').modal();

class Accordion{

    constructor(ref){
        this.$ref = $(`#${ref}`);
        this.data = [];
        this.sortable = null;
        this.task = new Task();

        ipcRenderer.removeAllListeners('accordion-getAllFree-reply').on('accordion-getAllFree-reply', (event, result) => {
            this.parseData(result);
        });

        ipcRenderer.removeAllListeners('container.deleteIt:reply').on('container.deleteIt:reply', (event, result) => {
            this.afterDelete(result);
        });

    }

    init(){
        this.getAll();
    }

    update(){
        this.getAll();
    }

    buildHTML(){

        let active, html = '', template, tasks, record, taskRecord, style, editIt = '', deleteIt = '';

        for(let recordIndex in this.data){

            record = this.data[recordIndex];

            active = record.container.cnt_name === 'DEFAULT' ? 'active' : '';

            editIt = `<i class="cog icon" title="Edit Container" style="color:${record.container.cnt_background_color}"></i>`;

            if(record.container.cnt_id > 1){
                deleteIt = `<i class="minus circle icon" title="Delete Container" style="color:${record.container.cnt_background_color}"></i>`;
            }

            tasks = this.task.createTasks(record.tasks);

            template = `
                <div class="item">
                    <a class="${active} title containerName">
                        <i class="dropdown icon"></i>
                        ${editIt}
                        ${deleteIt}
                        <!--<div class="point" style="background-color:${record.container.cnt_background_color}"></div>-->
                        &nbsp;
                        ${record.container.cnt_name}
                    </a>
                    <div data-type="container" data-cnt_id="${record.container.cnt_id}" class="active content draggable-list">
                        ${tasks}
                    </div>
                </div>
            `;

            html += template;

        }

        return html;
    }


    render(){

        this.$ref.html(this.buildHTML());

        this.afterRender();

        /*
        $(".arrow.left", this.$ref).on("click", () => {
            this.previousWeek();
        });

        $(".arrow.right", this.$ref).on("click", () => {
            this.nextWeek();
        });
        */
    }

    afterRender(){

        // update containers list on formTask
        $(document).trigger('updateContainersList');

        // set sortable
        if(this.sortable === null){
            this.sortable = new Sortable(".container .draggable-list", ".container .draggable-list", "containerPlaceholder");
            this.sortable.init();
        } else {
            this.sortable.update();
        }

        // ad events to containers
        this.addEventsToAll(this.$ref);

        // add events to tasks
        this.task.addEventsToAll(this.$ref);

    }

    afterDelete(result){

        if(result.status){

            this.update();
            $(document).trigger('reloadCalendar');

        } else {
            toastr.error(result.error);
        }


    }

    addEventsToSingle(cnt_id){

        let container = $(`div[data-cnt_id="${cnt_id}"]`).parent();

        // edit
        $('.cog.icon', container).off('click').on('click', {cnt_id}, this.editIt );

        // delete
        $('.minus.circle.icon', container).off('click').on('click', {cnt_id}, this.deleteIt );

    }

    addEventsToAll(scope = document){

        let containers = $(`div[data-type="container"]`, scope);

        for(let container of containers){
            this.addEventsToSingle($(container).attr('data-cnt_id'));
        }

    }

    editIt(event){

        event.stopPropagation();

        let cnt_id = event.data.cnt_id;

        // raise event
        $(document).trigger('updateContainer', [{cnt_id}]);

    }

    deleteIt(event){

        event.stopPropagation();

        if(!confirm('Are you sure to delete this container?')){
            return;
        }

        let cnt_id = event.data.cnt_id;

        ipcRenderer.send('container.deleteIt', {cnt_id});

    }


    getAll(){

        ipcRenderer.send('accordion-getAllFree');

        return false;
    }


    parseData(result){

        let data = [];
        let containers = [];

        for (let record of result.data){

            // add new container
            if(containers.indexOf(record.cnt_id) < 0){
                containers.push(record.cnt_id);
                data.push({
                    container : {
                        cnt_id: record.cnt_id,
                        cnt_name: record.cnt_name,
                        cnt_color: record.cnt_color,
                        cnt_background_color: record.cnt_background_color
                    },
                    tasks: []
                });
            }


            // add data to tasks
            data[data.length-1].tasks.push({
                // need to repeat container data here, for task component
                cnt_id: record.cnt_id,
                cnt_name: record.cnt_name,
                cnt_color: record.cnt_color,
                cnt_background_color: record.cnt_background_color,
                tsk_id: record.tsk_id,
                tsk_title: record.tsk_title,
                tsk_status: record.tsk_status, 
                tsk_priority: record.tsk_priority
            });

        }

        this.data = data;

        this.render();

    }


}

module.exports = Accordion;