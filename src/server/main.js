/* imports ********************************************************************/
import Http, { Server } from 'http';
import { WebSocketServer, WebSocket } from "ws";
import { v4 as uuidv4 } from 'uuid';
import ApplicationCommand from '../shared/command.js';
import ApplicationMessage from '../shared/message.js';
import * as Parser from '../shared/parser.js';

/* core ***********************************************************************/
class ServerWebSocket extends WebSocket {
    static ServerWebSocketOptions = {
        binary: false,
        compress: true
    };

    /** @type {String} */
    id;

    /** @type {String} */
    account;

    /** @type {Number} */
    timestamp;

    /**
     * 
     * @param {String|URL} address 
     * @param {String|Array<String>|undefined} protocols 
     * @param {*} options 
     */
    constructor (address, protocols, options=null) {
        super(address, protocols, options);

        this.id = '';
        this.account = '';
        this.timestamp = -1;

        this.on('message', this.#on_message);
    }

    /**
     * @override
     * @param {ApplicationMessage} data
     */
    send = (data) => {
        data = Parser.serialize(data);

        super.send(data, ServerWebSocket.ServerWebSocketOptions);
    }

    /**
     * 
     * @param {*} reason 
     * @returns {ServerWebSocket} this
     */
    kick = (reason) => {
        const message = new ApplicationMessage()
        .time(this.timestamp)
        .add('kick', reason);

        this.send(message);

        this.close();
    }

    /**
     * This is the received message handler, it processes data in following 
     * steps: 
     * - receives raw data
     * - parses them into ApplicationMessage instance
     * - checks for timestamp validity; kicks user if check fails
     * - sends a command event to the application, if check succeeds
     * @private
     * @emits command
     * @param {*} data 
     */
    #on_message = (data) => {
        const message = Parser.deserialize(
            data
        );

        console.log('TIMESTAMP COMP', this.timestamp, message.timestamp);

        // step 1: check timestamp validity 
        // dev: not a solution, just a dev
        if(this.timestamp !== message.timestamp) {
            this.kick('timestamp');
            
            return;
        }

        this.emit('command', this, message);
    }
}

class Simulation {
    /**
     * 
     * @param {Set<WebSocketServer>} clients 
     */
    constructor (clients) {
        this.clients = clients;
        
        this.dt = 5000;
        this.timestamp = Date.now();

        this.timer = null;
    }

    /**
     * @param {Number} dt
     * @returns {Simulation} this
     */
    start = (dt) => {
        if(this.timer !== null) {
            return this;
        }

        this.dt = dt;

        this.timer = setInterval(
            this.update, this.dt
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

        return this;
    }

    /**
     * 
     * @param {ServerWebSocket} io 
     */
    join = (io) => {
        io.on('command', this.command);

        console.log('simulation.join', io.account, io.id);
    }

    /**
     * 
     * @param {ServerWebSocket} io 
     */
    leave = (io) => {
        io.removeAllListeners('command');

        console.log('simulation.leave', io.account, io.id);
    }

    /**
     * @returns {Simulation} this
     */
    update = () => {
        this.timestamp = Date.now();

        const snapshot = new ApplicationMessage()
        .time(this.timestamp);

        Array
        .from(this.clients)
        .forEach(client => {
            client.timestamp = this.timestamp;
            client.send(snapshot);
        })

        console.log('simulation.update', this.timestamp);

        return this;
    }

    /**
     * @param {ServerWebSocket} io 
     * @param {ApplicationMessage} cmd 
     * @returns {Simulation} this
     */
    command = (io, cmd) => {
        // console.log('simulation.command', io.account, io.id, cmd);

        return this;
    }
}

/* server *********************************************************************/
const wss = new WebSocketServer({
    host: '127.0.0.1',
    port: 11000,
    WebSocket: ServerWebSocket
});

wss.on('listening', on_listening);
wss.on('connection', on_connect);

/**
 * 
 */
function on_listening () {
    console.log('listening');
}

/**
 * 
 * @param {ServerWebSocket} io 
 * @param {Http.IncomingMessage} req 
 */
function on_connect (io, req) {
    io.on('close', on_disconnect.bind(null, io));

    // note: these will be managed on upgrade event - that is not important rn.
    io.account = (Math.random() + 1).toString(36).substring(2);
    io.id = uuidv4();

    // console.log('wss.connect', io.account, io.id);

    // note: simulate join
    wss.emit('join', io);
}

/**
 * 
 * @param {ServerWebSocket} io 
 */
function on_disconnect (io) {
    // console.log('disconnect', io.account, io.id);

    wss.emit('leave', io);
}

/* app ************************************************************************/
const simulation = new Simulation(wss.clients).start(5000);
wss.addListener('join', simulation.join);
wss.addListener('leave', simulation.leave);
