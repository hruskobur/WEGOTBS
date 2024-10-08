import YarlWebSocket from './ws.js';
import Action from '../shared/action.js';

import PhasesModel from '../model/phases.js';
import TimeModel from '../model/time.js';
import AreaModel from '../model/area.js';

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


    constructor () {
        this.#clients = new Map();
        this.#interval = null;

        this.#phases = new PhasesModel(
            [
                {name: 'phase.plan', time: 5000},
                {name: 'phase.buffer', time: 250},
                {name: 'phase.sim', time: 750}
            ]
        );

        this.#time = new TimeModel(250, 250);
        this.#time.duration = 0;

        this.area = new AreaModel();
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
        ws.simulation = null;

        console.log('leave', ws.account);
    }

    /**
     * 
     * @param {YarlWebSocket} ws 
     * @param {Action} action 
     * @returns {Boolean}
     */
    command = (ws, action) => {
        if(this.#phases.name === 'phase.sim') {
            console.log('..... to late');
            return this.#on_reject_command(ws, action);
        }

        if(this.#phases.name === 'phase.buffer') {
            console.log('..... just in time');
        } else {
            console.log('..... in time');
        }
            
        return this.#on_accept_command (ws, action);
    }

    #on_update = () => {
        this.#time.duration += this.#time.dt;

        if(this.#time.duration >= this.#phases.time) {
            this.#phases.next();

            this.#time.duration = 0;
            this.#time.timestamp = Date.now();

            if(this.#phases.name === 'phase.sim') {
                console.log('+++++ sending');
            } else {
                console.log('+++++ receiving');
            }
        }

        console.log('#on_update', this.#phases.name, this.#time.duration);
    }

    /**
     * @param {YarlWebSocket} ws 
     * @param {Action} action 
     * @param {Number} dt
     * @returns {true}
     */
    #on_accept_command = (ws, action, dt) => {
        return true;
    }

    /**
     * @param {YarlWebSocket} ws 
     * @param {Action} action 
     * @param {Number} dt
     * @returns {false}
     */
    #on_reject_command = (ws, action,  dt) => {
        return false;
    }
}

export default Simulation;