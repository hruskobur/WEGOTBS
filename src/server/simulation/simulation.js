import YarlClient from '../ws/client.js';
import Action from '../../shared/action.js';
import PhasesModel from '../../model/phases.js';
import TimeModel from '../../model/time.js';
import AreaModel from '../../model/area.js';

class Simulation {
    /**
     * @type {String}
     */
    #uuid;

    /**
     * @type {Map<String, YarlClient>}
     */
    clients;

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

    /**
     * 
     * @param {String} uuid 
     */
    constructor (uuid) {
        this.#uuid = uuid;
        this.clients = new Map();
        this.#interval = null;

        this.#time = new TimeModel(250);

        this.#phases = new PhasesModel(
            5000,
            this.#time.dt,
            1000 - this.#time.dt
        ); 

        this.#dummy_area = new AreaModel();
    }

    get uuid () {
        return this.#uuid;
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

        console.log('start');

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

        console.log('stop');

        return true;
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
                this.clients.forEach(client => {
                    if(client.acknowledge.compare(this.#time.timestamp) === false) {
                        console.log('..... failed timestamp check', client.acknowledge.value, this.#time.timestamp);
                    } else {
                        console.log('..... timestamp check', client.acknowledge.value, this.#time.timestamp);
                    }
                });
                
                this.#time.timestamp = this.#time.now();

                console.log('..... new round: receiving commands', this.#time.timestamp);

                break;
            }
            case PhasesModel.Phases.Buffer: {
                console.log('..... buffer: receiving commands', this.#time.timestamp);

                break;
            }
            case PhasesModel.Phases.Simulation: {
                console.log('..... simulation: sending the latest state', this.#time.timestamp);
                const now = this.#time.now();

                const upd_cmnd = 'update';
                const upd_data = this.#dummy_area.data;

                this.clients.forEach(client => {
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