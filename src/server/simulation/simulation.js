import YarlClient from '../ws/client.js';
import Action from '../../shared/action.js';
import PhasesModel from '../../model/phases.js';
import TimeModel from '../../model/time.js';
import AreaModel from '../../model/area.js';

class Simulation {
    /**
     * @type {Map<String, YarlClient>}
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
     * @param {YarlClient} ws 
     * @returns {Boolean}
     */
    join = (ws) => {
        if(this.#clients.has(ws.uuid) === true) {
            return false;
        }

        if(this.#clients.size >= 10) {
            return false;
        }

        this.#clients.set(ws.uuid, ws);

        console.log('join', ws.uuid);

        return true;
    }

    /**
     * 
     * @param {YarlClient} ws 
     * @returns {Boolean}
     */
    leave = (ws) => {
        if(this.#clients.has(ws.uuid) === false) {
            return false;
        }

        this.#clients.delete(ws.uuid);

        console.log('leave', ws.uuid);
    }

    /**
     * @public
     * @param {YarlClient} ws 
     * @param {Action} action 
     * @returns {Boolean}
     */
    command = (ws, action) => {
        switch(this.#phases.name) {
            case PhasesModel.Phases.Plan:
            case PhasesModel.Phases.Buffer: {
                console.log('..... in time');

                this.#dummy_area.data += 1;

                return true;
            }
            case PhasesModel.Phases.Simulation:
            default: {
                console.log('..... too late');
                
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
                    if(client.acknowledge.compare(this.#time.timestamp) === false) {
                        console.log('..... failed timestamp check', client.acknowledge.value, this.#time.timestamp);
                    } else {
                        console.log('..... timestamp check', client.acknowledge.value, this.#time.timestamp);
                    }
                });
                
                this.#time.timestamp = this.#time.now();

                console.log('..... new round has begun!', this.#time.timestamp);

                break;
            }
            case PhasesModel.Phases.Buffer: {
                console.log('..... still receiving commands', this.#time.timestamp);

                break;
            }
            case PhasesModel.Phases.Simulation: {
                console.log('..... sending the latest state', this.#time.timestamp);
                const now = this.#time.now();

                const upd_cmnd = 'update';
                const upd_data = this.#dummy_area.data;

                this.#clients.forEach(client => {
                    client
                    .latency.send(now)
                    .acknowledge.send(this.#time.timestamp)
                    .buffer.send(upd_cmnd, upd_data)
                    .flush();
                });

                break;
            }
        }
    }
}

export default Simulation;