import YarlLogger from './logger.js';
import YarlWebSocket from './ws.js';
import Message from '../shared/message.js';
import Action from '../shared/action.js';

class Simulation {
    /**
     * @type {Map<String, YarlWebSocket>}
     */
    clients;

    /**
     */
    constructor () {
        this.clients = new Map();

        this.dt = 5000;
        this.timestamp = Date.now();

        this.timer = null;
    }

    /**
     * @param {number} dt defaults to  5000ms.
     * @returns {Simulation} this
     */
    start = (dt = 5000) => {
        if(this.timer !== null) {
            return this;
        }

        this.dt = dt;
        this.timestamp = Date.now();

        this.timer = setInterval(
            this.update, this.dt
        );

        YarlLogger(
            'yarl.simulation',
            'start',
            dt
        );

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

        YarlLogger(
            'yarl.simulation',
            'stop',
            dt
        );

        return this;
    }

    /**
     * 
     * @param {YarlWebSocket} ws 
     */
    join = (ws) => {
        // check: double account join
        if(this.clients.has(ws.account) === true) {
            ws.kick('fu');
            return;
        }

        ws.on(YarlWebSocket.Events.Action, this.command);
        this.clients.set(ws.account, ws);

        YarlLogger(
            'yarl.simulation',
            'join',
            ws.account, ws.id
        );
    }

    /**
     * 
     * @param {YarlWebSocket} ws 
     */
    leave = (ws) => {
        if(this.clients.has(ws.account) === false) {
            return;
        }
        
        ws.removeAllListeners(YarlWebSocket.Events.Action);
        this.clients.delete(ws.account);

        YarlLogger(
            'yarl.simulation',
            'leave',
            ws.account, ws.id
        );
    }

    /**
     * @returns {Simulation} this
     */
    update = () => {
        this.timestamp = Date.now();

        const snapshot = new Message()
        .time(this.timestamp);

        this.clients
        .forEach(client => {
            client.timestamp = this.timestamp;
            client.send(snapshot);
        });

        YarlLogger(
            'yarl.simulation',
            'update',
            this.timestamp
        );

        return this;
    }

    /**
     * @param {ServerWebSocket} io 
     * @param {Action} action
     * @returns {Simulation} this
     */
    command = (io, action) => {
        console.log('simulation.command', io.account, io.id, action);

        YarlLogger(
            'yarl.simulation',
            'command',
            io.account, action
        );

        return this;
    }
}

export default Simulation;