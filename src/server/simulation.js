import YarlLogger from './logger.js';
import YarlWebSocket from './ws.js';
import TimeModel from '../model/time.js';
import Message from '../shared/message.js';
import Action from '../shared/action.js';

class Simulation {
    /**
     * @type {String}
     */
    id;

    /**
     * @type {Map<String, YarlWebSocket>}
     */
    clients;

    /**
     * @type {TimeModel}
     */
    time;

    /**
     * 
     * @param {String} id 
     */
    constructor (id) {
        this.id = id;
        this.clients = new Map();

        this.time = new TimeModel(5000, 1000, 1000);
        this.timer = null;
    }

    /**
     * @returns {Simulation} this
     */
    start = () => {
        if(this.timer !== null) {
            return this;
        }

        this.time.reset();
        this.timer = setInterval(this.#on_update, this.time.dt);

        YarlLogger(this.id, 'start', this.time);

        return this;
    }

    /**
     * @returns {Simulation} this
     */
    stop = () => {
        if(this.timer === null) {
            return this;
        }

        clearInterval(this.timer);
        this.timer = null;

        this.clients.forEach(client => {
            client.removeAllListeners();
            client.close(1000, 'kick')
        });
        this.clients.clear();

        YarlLogger(this.id, 'stop', this.time);

        return this;
    }

    /**
     * 
     * @param {YarlWebSocket} ws 
     */
    join = (ws) => {
        // check: has simulation started?
        if(this.time == null) {
            ws.close(1000, 'kick');
            
            return;
        }

        // check: limit
        // todo: check the count against the model, not clients here
        // . . .
        if(this.clients.size >= 10) {
            ws.close(1000, 'kick');

            return;
        }

        // check: one simulation per client
        if(ws.simulation !== null) {
            ws.close(1000, 'kick');

            return;
        }

        // check: one client per simulation
        if(this.clients.has(ws.account) === true) {
            ws.close(1000, 'kick');
            
            return;
        }

        ws.timestamp = null;
        ws.simulation = this;
        this.clients.set(ws.account, ws);

        YarlLogger(this.id, 'join', ws.account);
    }

    /**
     * 
     * @param {YarlWebSocket} ws 
     */
    leave = (ws) => {
        // check: does this client belong here?
        if(this.clients.has(ws.account) === false) {
            return;
        }
        
        ws.timestamp = null;
        ws.simulation = null;
        this.clients.delete(ws.account);

        YarlLogger(this.id, 'leave', ws.account);
    }

    /**
     * @param {YarlWebSocket} ws 
     * @param {Action} action
     * @returns {Simulation} this
     */
    command = (ws, action) => {
        YarlLogger(this.id, 'command', ws.account, action);
        
        return this;
    }
    
    /**
     * @private
     * @returns {void}
     */
    #on_update = () => {
        this.time.update();

        // YarlLogger(
        //     this.id, 'update', 
        //     this.time.round, this.time.phase, this.time.left
        // );
    }
}

export default Simulation;