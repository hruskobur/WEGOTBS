import YarlWebSocket from './ws.js';
import Action from '../shared/action.js';
import PhasesModel from '../model/phases.js';
import TimeModel from '../model/time.js';
import AreaModel from '../model/area.js';
import Message from '../shared/message.js';

class Simulation {
    /**
     * @type {Map<String, YarlWebSocket>}
     */
    #clients;

    /**
     * @type {Number}
     */
    #interval;

    /**
     * @type {PhasesModel}
     */
    #phases;

    /**
     * @type {TimeModel}
     */
    #time;

    /** @type {AreaModel} */
    #dummy_area;

    constructor () {
        this.#clients = new Map();
        this.#interval = null;

        this.#time = new TimeModel(250);

        this.#phases = new PhasesModel(
            5000,
            this.#time.dt,
            1000 - this.#time.dt
        ); 

        this.#dummy_area = new AreaModel();
    }

    /**
     * 
     * @returns {Boolean}
     */
    start = () => {
        if(this.#interval !== null) {
            return false;
        }

        this.#interval = setInterval(this.#on_update, this.#time.dt);

        return true;
    }

    /**
     * 
     * @returns {Boolean}
     */
    stop = () => {
        if(this.#interval === null) {
            return false;
        }

        clearInterval(this.#interval);
        this.#interval = null;

        return true;
    }

    /**
     * 
     * @param {YarlWebSocket} ws 
     * @returns {Boolean}
     */
    join = (ws) => {
        if(this.#clients.has(ws.account) === true) {
            return false;
        }

        if(this.#clients.size >= 10) {
            return false;
        }

        this.#clients.set(ws.account, ws);
        ws.timestamp = this.#time.timestamp;
        ws.simulation = this;

        console.log('join', ws.account);

        return true;
    }

    /**
     * 
     * @param {YarlWebSocket} ws 
     * @returns {Boolean}
     */
    leave = (ws) => {
        if(this.#clients.has(ws.account) === false) {
            return false;
        }

        this.#clients.delete(ws.account);
        ws.timestamp = null;
        ws.simulation = null;

        console.log('leave', ws.account);
    }

    /**
     * @public
     * @param {YarlWebSocket} ws 
     * @param {Action} action 
     * @returns {Boolean}
     */
    command = (ws, action) => {
        // note: merge PhaseModel.Phases.Plan & PhasesModel.Phases.Buffer
        // once the console.log is not needed anymore
        switch(this.#phases.name) {
            case PhasesModel.Phases.Plan: {
                console.log('..... in time');

                this.#dummy_area.data += 1;
                return true;
            }
            case PhasesModel.Phases.Buffer: {
                console.log('..... just in time');

                this.#dummy_area.data += 1;
                return true;
            }
            case PhasesModel.Phases.Simulation:
            default: {
                console.log('..... to late');
                
                return false;
            }
        }
    }

    /**
     * @private
     */
    #on_update = () => {
        this.#time.left += this.#time.dt;

        // phase: NOT DONE yet!
        if(this.#time.left < this.#phases.duration) {
            return;
        }

        // phase DONE!
        this.#phases.next();
        this.#time.left = 0;

        // what to do now?
        switch (this.#phases.name) {
            case PhasesModel.Phases.Plan: {
                this.#clients.forEach(client => {
                    if(client.timestamp !== this.#time.timestamp) {
                        console.log('..... failed timestamp check', client.timestamp, this.#time.timestamp);
                    } else {
                        console.log('..... timestamp check', client.timestamp, this.#time.timestamp);
                    }
                });
                
                this.#time.timestamp = Date.now();

                console.log('..... new round has begun!', this.#time.timestamp);

                break;
            }
            case PhasesModel.Phases.Buffer: {
                console.log('..... still receiving commands', this.#time.timestamp);

                break;
            }
            case PhasesModel.Phases.Simulation: {
                console.log('..... sending the latest state', this.#time.timestamp);

                const message = new Message()
                .add('ack', this.#time.timestamp)
                .add('update', this.#dummy_area.data)
                .add('latency', Date.now())

                this.#clients.forEach(client => client.send(message));

                break;
            }
        }
    }
}

export default Simulation;