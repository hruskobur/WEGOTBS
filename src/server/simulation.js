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

        // dev: will be part of the bg model
        this.actors = new Set();
        this.actions = [];
    }

    /**
     * @returns {Simulation} this
     */
    start = () => {
        if(this.timer !== null) {
            return this;
        }

        this.actors.clear();
        this.time.reset();

        this.timer = setInterval(this.#on_update, this.time.dt);

        console.log(this.id, 'start', this.time);

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

        console.log(this.id, 'stop', this.time);

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

        ws.timestamp = this.time.timestamp;;
        ws.simulation = this;
        this.clients.set(ws.account, ws);

        console.log(this.id, 'join', ws.account);
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

        console.log(this.id, 'leave', ws.account);
    }

    /**
     * @param {YarlWebSocket} ws 
     * @param {Action} action
     * @returns {Simulation} this
     */
    command = (ws, action) => {
        // check: only one action per turn is allowed
        if(this.actors.has(ws.account) === true) {
            console.log('..... already acted', ws.account);

            ws.close(1000, 'kick');
            return;
        }

        // check: client can't send any actions in simulation phase
        if(this.time.phase === TimeModel.Phase.Simulation) {
            console.log('..... simulation in progress', ws.account);

            ws.close(1000, 'kick');
            return;
        }

        this.actors.add(ws.account);
        this.actions.push(action);

        console.log(
            '..... updating simulation', 
            ws.account, action, this.time.timestamp
        );
        
        return this;
    }
    
    /**
     * @private
     * @returns {void}
     */
    #on_update = () => {
        const next = this.time.update();
        
        switch(next) {
            case null: {
                console.log('..... update', this.time);
                break;
            }

            case TimeModel.Phase.Plan: {
                this.actions = [];
                this.actors.clear();
                this.clients.forEach(client => {
                    if(client.timestamp != this.time.timestamp) {
                        console.log('not acked!')
                        client.close(1000, 'kick');
                        return;
                    }

                    client.timestamp = null;
                });

                this.time.timestamp = Date.now();

                console.log('begin', this.time);
                
                break;
            }
            case TimeModel.Phase.Simulation: {
                console.log('begin', this.time);

                const message = new Message()
                .add('ack', this.time.timestamp)
                .add('update', this.actions);

                this.clients.forEach(client => {
                    client.send(message);
                });

                break;
            }
        }

        // YarlLogger(
        //     this.id, 'update', 
        //     this.time.round, this.time.phase, this.time.left
        // );
    }
}

export default Simulation;