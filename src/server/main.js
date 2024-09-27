/* imports ********************************************************************/
import Http from 'http';
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
    ts_in;

    /** @type {Number} */
    ts_out;

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
        this.ts_in = -1;
        this.ts_out = -1;

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
     * @private
     * @emits command
     * @param {*} data 
     */
    #on_message = (data) => {
        data = Parser.deserialize(data);

        this.emit('command', this, data);
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
const dt = 1000;
let timestamp = Date.now();

/**
 * 
 * @param {ServerWebSocket} io 
 */
function join (io) {
    io.on('command', command);

    console.log('app.join', io.account, io.id);
}

/**
 * 
 * @param {ServerWebSocket} io 
 */
function leave (io) {
    io.off('command', command);

    console.log('app.leave', io.account, io.id);
}

/**
 * 
 * @param {ServerWebSocket} io 
 * @param {ApplicationMessage} cmd 
 */
function command (io, cmd) {
    console.log('app.command', io.account, io.id, cmd);
}

/**
 * 
 */
function update () {
    // step 1: update server's timestamp
    timestamp = Date.now();

    // step 2: create snapshot of server's data
    const snapshot = new ApplicationMessage()
    .timestamp(timestamp)
    .add('move', {id: 0, x: 10, y: 10})
    .add('attack', {id: 10, ability: 0, x: 10, y: 10})
    .add('kill', {id: 1});

    // step 3: send snapshot to every connected client
    Array
    .from(wss.clients)
    .forEach(client => {
        client.send(
            snapshot
        );
    })

    // dev: report
    // const clients_report = clients
    // .map(client => {
    //     return {
    //         account: client.account,
    //         id: client.id,
    //         ts_in: client.ts_in,
    //         ts_out: client.ts_out
    //     }
    // });
    
    // const report = {
    //     ts: timestamp,
    //     clients: clients_report
    // };

    // console.log('app.update', report);
}

setInterval(update, dt);
wss.addListener('join', join);
wss.addListener('leave', leave);
