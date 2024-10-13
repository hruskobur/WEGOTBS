import Http from 'node:http';
import { Duplex } from 'node:stream';
import { WebSocket, WebSocketServer } from 'ws';
import { v4 as uuid } from 'uuid';

import YarlEmitter from '../core/emitter.js';
import YarlClient from '../client/client.js';

import ServerEvents from './events.js';

/**
 * @typedef {Object} YarlServerOptions
 * @property {Http.ServerOptions} http
 * @property {WebSocket.ServerOptions} wss
 * @property {String} host
 * @property {Number} port
 */

const InternalEvents = Object.freeze({
    Http: {
        Listening: 'listening',
        Upgrade: 'upgrade',
        Close: 'close',
    },
    Wss: {
        Listening: 'listening',
        Connection: 'connection',
        Close: 'close',
        Error: 'error'
    },
    Ws: {
        Close: 'close'
    }
});



/**
 * @type {Http.Server}
 */
let http = null;

/**
 * @type {WebSocketServer}
 */
let wss = null;

/**
 * @public
 * @async
 * @param {YarlServerOptions} cfg 
 * @returns {Promise<void>}
 */
async function init (cfg) {
    if(http !== null || wss !== null) {
        throw new Error();
    }

    // note: functionality-critical fixed configuration
    cfg.wss.noServer = true;
    cfg.wss.WebSocket = YarlClient;
    cfg.wss.clientTracking = false;

    return new Promise(
        (resolve, reject) => {
            http = Http.createServer(cfg.http)
            .on(InternalEvents.Http.Listening, on_http_listening)
            .on(InternalEvents.Http.Upgrade, on_http_upgrade)
            .on(InternalEvents.Http.Close, on_http_close);

            wss = new WebSocketServer(cfg.wss)
            .on(InternalEvents.Wss.Listening, on_wss_listening)
            .on(InternalEvents.Wss.Connection, on_wss_connection)
            .on(InternalEvents.Wss.Close, on_wss_close)
            .on(InternalEvents.Wss.Error, on_wss_error);

            http.listen(
                cfg.port, cfg.host,
                () => {
                    console.log('server.init');
                    return resolve();
                }
            );
        }
    );
}

/**
 * @public
 * @async
 * @returns {Promise<void>}
 */
async function term () {
    if(http === null || wss === null) {
        throw new Error();
    }

    return new Promise(
        (resolve, reject) => {
            wss.close(() => {
                // note: wss' (the YarlClient) removal is handled by YarlClient
                // manager
                // . . .

                http.close(() => {
                    http.closeAllConnections();

                    http = null
                    wss = null;

                    console.log('server.term');
                    return resolve();
                });
            })
        }
    );
}

/**
 * @private
 */
function on_http_listening () {
    console.log('http.listening', http.address());
}

/**
 * @private
 * @param {Http.IncomingMessage} req 
 * @param {Duplex} socket 
 * @param {Buffer} header 
 */
function on_http_upgrade (req, socket, header) {
    console.log('http.upgrade', req.headers);

    // todo: check CORS
    // todo: check protocols
    // todo: some sort of authorization...

    // todo: if any of the check fails, do this
    // on_http_auth_fail(socket);

    wss.handleUpgrade(
        req, socket, header,
        on_http_upgrade_done
    );
}

/**
 * @private
 * @param {Duplex} socket 
 */
function on_http_auth_fail (socket) {
    socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
    socket.destroy();
}

/**
 * @private
 * @param {YarlClient} ws 
 * @param {Http.IncomingMessage} req 
 */
function on_http_upgrade_done (ws, req) {
    // dev: uuid will be the account, for now this
    ws.uuid = uuid();
    
    // todo: we need to get the room's uuid from the initial query
    // note: this workflow may change
    // . . .

    // note: to emit custom data, just add another argument here
    wss.emit(InternalEvents.Wss.Connection, ws, /* additional args */);
}

/**
 * @private
 */
function on_http_close () {
    console.log('http.close');
}

/**
 * @private
 */
function on_wss_listening () {
    console.log('wss.listening', wss.address());
}

/**
 * @private
 */
function on_wss_close () {
    console.log('wss.close');
}

/**
 * @private
 * @param {YarlClient} ws 
 */
function on_wss_connection (ws) {
    ws.on(InternalEvents.Ws.Close, on_ws_close.bind(null, ws));

    YarlEmitter.emit(ServerEvents.Connected, ws);
}

/**
 * @private
 * @param {Error} err 
 */
function on_wss_error (err) {
    console.error('wss.error', err);
}

/**
 * @private
 * @param {YarlClient} ws 
 */
function on_ws_close (ws) {
    YarlEmitter.emit(ServerEvents.Disconnected, ws);
}

export {
    init, term
};
