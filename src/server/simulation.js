import YarlLogger from './logger.js';
import YarlWebSocket from './ws.js';
import Message from '../shared/message.js';

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
        ws.on(YarlWebSocket.Events.Message, this.command);

        YarlLogger(
            'yarl.simulation',
            'join',
            ws.account, ws.id
        );
    }

    /**
     * 
     * @param {ServerWebSocket} ws 
     */
    leave = (ws) => {
        ws.removeAllListeners(YarlWebSocket.Events.Message);

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
     * @param {Message} cmd 
     * @returns {Simulation} this
     */
    command = (io, cmd) => {
        // console.log('simulation.command', io.account, io.id, cmd);

        return this;
    }
}

export default Simulation;