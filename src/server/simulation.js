import YarlWebSocket from './ws.js';
import TimeModel from '../model/time.js';
import Message from '../shared/message.js';
import Action from '../shared/action.js';
import BattlegroundModel from '../model/battleground.js';
import ScenarioModel from '../model/scenario.js';

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
     * @type {Number}
     */
    timer;

    /**
     * @type {BattlegroundModel}
     */
    bg;

    /**
     * 
     * @param {String} id 
     */
    constructor (id) {
        this.id = id;
        this.clients = new Map();
        this.timer = null;

        const scenario = new ScenarioModel(
            10,
            6000, 1000,
            10, 10
        )

        this.bg = new BattlegroundModel(scenario);
    }

    /**
     * @returns {Simulation} this
     */
    start = () => {
        if(this.timer !== null) {
            return this;
        }

        this.timer = setInterval(this.#on_update, this.bg.time.delta_time);

        // todo: notify joined users that simulation has started
        // . . .
        console.log(this.id, 'start');

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

        // notify joined users that simulation has ended
        // todo: will be a part of the API
        this.clients.forEach(client => {
            client.removeAllListeners();
            client.close(1000, 'kick');
        });
        this.clients.clear();

        console.log(this.id, 'stop');

        return this;
    }

    /**
     * 
     * @param {YarlWebSocket} ws 
     */
    join = (ws) => {
        // check: simulation limit
        if(this.clients.size >= this.bg.size) {
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

        ws.timestamp = this.bg.time.timestamp;;
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
        this.bg.actions_queue.delete(ws.account);

        console.log(this.id, 'leave', ws.account);
    }

    /**
     * @param {YarlWebSocket} ws 
     * @param {Action} action
     * @returns {Simulation} this
     */
    command = (ws, action) => {
        if(this.clients.has(ws.account) === false) {
            ws.close(1000, 'wrong room');

            console.log('[KICK] account does not belong here', ws.account);

            return this;
        }

        if(this.bg.time.phase === TimeModel.Phase.Simulation) {
            console.log('[MISS] account sent command too late', ws.account);

            const message = new Message()
            .add('plan', false)
            ws.send(message);

            return this;
        }

        const cmd_queue = this.bg.actions_queue;
        
        // check: one action per round
        if(cmd_queue.has(ws.account) === true) {
            ws.close(1000, 'already acted');

            console.log('[KICK] account has already acted', ws.account);

            return this;
        }

        cmd_queue.set(ws.account, action);
        console.log('[ACT] account has acted', ws.account, action);

        // this account has acted; send ack 
        const message = new Message()
        .add('ack', true)
        ws.send(message);

        return this;
    }
    
    /**
     * @private
     * @returns {void}
     */
    #on_update = () => {
        const timestamp = this.bg.time.timestamp;
        const phase = this.bg.time.update();

        const message = new Message()
        .add('phase', phase);
        
        // dev
        switch(phase) {
            case TimeModel.Phase.Plan: {
                console.log('[TIME] BEGIN PLAN');
                
                this.clients.forEach(client => {
                    if(client.timestamp !== timestamp) {
                        client.close(1000, 'too slow');
                        
                        console.log('[KICK] account is too slow');

                        return;
                    }

                    client.send(message);
                });

                return;
            }
            case TimeModel.Phase.Simulation: {
                console.log('[TIME] BEGIN SIMULATION');

                message.add('ack', this.bg.time.timestamp);
                message.add('sim', {});
                
                this.clients.forEach(client => {
                    client.send(message);
                });
                
                this.bg.actions_queue.clear();
                
                return;
            }
            case TimeModel.Phase.Update:
            default: {
                console.log('[TIME] UPDATE');

                this.clients.forEach(client => {
                    client.send(message);
                });
                
                return;
            }
        }
    }
}

export default Simulation;