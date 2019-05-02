const {ipcRenderer} = require('electron');
const moment        = require('../../../node_modules/moment/min/moment-with-locales.min.js');
const Sortable      = require('./sortable.js');
const Task          = require('./task.js');
const addTask       = $('#addTask').modal();
const config        = require('../../../config.json');

class Calendar{

    constructor(ref){
        this.$ref = $(`#${ref}`);
        // set current date to the first day of week
        this.currentDate = moment().locale(config.locale).day(1);
        this.selectedDate = this.currentDate;
        this.selectedWeek = this.selectedDate.week();
        this.sortable = null;
        this.task = new Task();

        // set listener for get data reply
        ipcRenderer.removeAllListeners('task.getByDate.reply').on('task.getByDate.reply', (event, result) => {
            this.addTasks(result);
        });
    }

    init(){
        this.render();
    }

    buildHTML(){

        let html = `
                    <div id="calendarConsole">${this.buildConsole()}</div>
                    <div id="calendarGrid">${this.buildGrid()}</div>
                    `;

        return html;
    }

    buildConsole(){

        let html = `
                    <div class="inline">
                        <button id="arrowLeft" class="ui icon circular black button" title="Previous week">
                            <i class="icon arrow left link orange"></i>
                        </button>
                    </div>

                    <div class="inline selectedWeek">Week: <span>${this.selectedWeek}</span></div>

                    <div class="inline">
                        <button  id="arrowRight" class="ui icon circular black button" title="Next week">
                            <i class="icon arrow right link orange"></i>
                        </button>
                    </div>
                    `;

        return html;
    }

    buildGrid(){


        let startOfWeek = this.selectedDate.clone().startOf('week');
        let endOfWeek = this.selectedDate.clone().endOf('week');
        let week = [];
        let day = startOfWeek;

        while (day <= endOfWeek) {
            week.push(day);
            day = day.clone().add(1, 'd');
        }


        let html = `
            <div>
                <table class="ui striped stacked inverted celled table">
                    <thead>
                        <tr>
                            <th>${week[0].format(config.dateFormat + " <br> ddd")}</th>
                            <th>${week[1].format(config.dateFormat + " <br> ddd")}</th>
                            <th>${week[2].format(config.dateFormat + " <br> ddd")}</th>
                            <th>${week[3].format(config.dateFormat + " <br> ddd")}</th>
                            <th>${week[4].format(config.dateFormat + " <br> ddd")}</th>
                            <th>${week[5].format(config.dateFormat + " <br> ddd")}</th>
                            <th>${week[6].format(config.dateFormat + " <br> ddd")}</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td data-type="calendar" data-tsk_date="${week[0].format(config.dateFormat)}" class="fullGrid draggable-list"></td>
                            <td data-type="calendar" data-tsk_date="${week[1].format(config.dateFormat)}" class="draggable-list"></td>
                            <td data-type="calendar" data-tsk_date="${week[2].format(config.dateFormat)}" class="draggable-list"></td>
                            <td data-type="calendar" data-tsk_date="${week[3].format(config.dateFormat)}" class="draggable-list"></td>
                            <td data-type="calendar" data-tsk_date="${week[4].format(config.dateFormat)}" class="draggable-list"></td>
                            <td data-type="calendar" data-tsk_date="${week[5].format(config.dateFormat)}" class="draggable-list"></td>
                            <td data-type="calendar" data-tsk_date="${week[6].format(config.dateFormat)}" class="draggable-list"></td>
                        </tr>
                    </tbody>
                </table>
            </div>
        `;

        return html;
    }

    render(){

        // I need to create another moment object, because
        // moment date functions change obj value
        // and I'm not able to clone the whole obj in js
        let date = this.selectedDate.date();
        let month = this.selectedDate.month();
        let year = this.selectedDate.year();
        let selectedDate = this.selectedDate.clone();
        let selectedDateFrom = selectedDate.startOf('week').format("YYYY-MM-DD");
        let selectedDateTo = selectedDate.clone().endOf('week').format("YYYY-MM-DD");

        this.$ref.html(this.buildHTML());

        $("#arrowLeft", this.$ref).off("click").on("click", () => {
            this.previousWeek();
        });

        $("#arrowRight", this.$ref).off("click").on("click", () => {
            this.nextWeek();
        });


        this.getData(selectedDateFrom, selectedDateTo);
    }


    nextWeek(){
        this.selectedDate = this.selectedDate.add(7, 'days');
        this.selectedWeek = this.selectedDate.week();

        this.update();
    }

    previousWeek(){
        this.selectedDate = this.selectedDate.subtract(7, 'days');
        this.selectedWeek = this.selectedDate.week();

        this.update();
    }

    update(){
        // I need to clone moment object, because
        // moment date functions change obj value.
        // I'm using clone function from moment library
        let date = this.selectedDate.date();
        let month = this.selectedDate.month();
        let year = this.selectedDate.year();
        let selectedDate = this.selectedDate.clone();
        let selectedDateFrom = selectedDate.startOf('week').format("YYYY-MM-DD");
        let selectedDateTo = selectedDate.clone().endOf('week').format("YYYY-MM-DD");

        $(".selectedWeek span", this.$ref).html(this.selectedWeek);
        $('#calendarGrid', this.$ref).html(this.buildGrid());

        this.getData(selectedDateFrom, selectedDateTo);

    }

    afterRender(){

        // set sortable
        if(this.sortable === null){
            this.sortable = new Sortable(".container .draggable-list", ".container .draggable-list", "containerPlaceholder");
            this.sortable.init();
        } else {
            this.sortable.update();
        }

        // add events to tasks
        this.task.addEventsToAll(this.$ref);

    }

    getData(dateFrom, dateTo){

        ipcRenderer.send('task.getByDate', {
            dateFrom,
            dateTo
        });

    }

    addTasks(data){

        let column, task, style, taskRecord, date;

        // first clear all columns
        this.clearColumns();

        for(let record in data.data){

            taskRecord = data.data[record];
            date = this.db2outputDate(taskRecord.tsk_date);

            column = $(`td[data-tsk_date='${date}']`);
            task = this.task.createTask(taskRecord);

            column.append(task);

        }

        this.afterRender();

    }

    clearColumns(){
        $('td[data-type="calendar"]').html('');
    }

    db2outputDate(dateString = ''){

        // from YYYY-MM-DD to config.dateFormat format

        if(dateString != ''){
            let date = moment(dateString)
            return date.format(config.dateFormat);
        }

        return dateString;

    }

}

module.exports = Calendar;