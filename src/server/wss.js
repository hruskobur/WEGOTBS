import EventEmitter from 'node:events';
import * as Http from 'node:http';
import { Socket } from 'node:net';
import { v4 as uuidv4 } from 'uuid';
import { WebSocketServer } from 'ws';

import YarlWebSocket from './ws.js';

/**
 * @typedef {Object} YarlWebSocketServerOptions
 * @property {Http.ServerOptions} http
 * @property {Object} wss
 * @property {String} host
 * @property {Number} port
 */

const InternalEvents = Object.freeze({
    Http: {
        Listening: 'listening',
        Upgrade: 'upgrade',
        Close: 'close',
        Error: 'error'
    },
    Wss: {
        Connection: 'connection',
        Close: 'close',
        Error: 'error'
    },
    Ws: {
        Close: 'close'
    }
});

class YarlWebSocketServer extends EventEmitter {
    static Events = Object.freeze({
        Join: 'join',
        Leave: 'leave',
        Shutdown: 'shutdown'
    });

    /**
     * @type {Http.ServerOptions}
     */
    cfg;

    /**
     * @type {Http.Server}
     */
    http;

    /**
     * @type {WebSocketServer}
     */
    wss;

    /**
     * @type {Map<String, YarlWebSocket>}
     */
    clients;

    /**
     * @param {YarlWebSocketServerOptions} cfg 
     */
    constructor (cfg) {
        super();

        // note: functionality-critical fixed configuration
        this.cfg = cfg;
        this.cfg.wss.noServer = true;
        this.cfg.wss.WebSocket = YarlWebSocket;
        this.cfg.wss.clientTracking = false;

        this.wss = null;
        this.http = null;

        this.clients = new Map();
    }

    /**
     * @public
     * @returns {Promise<YarlWebSocketServer>}
     */
    start = () => {
        return new Promise(
            (resolve, reject) => {
                if(this.http != null || this.wss != null) {
                    return reject();
                }

                this.http = Http.createServer(this.cfg.http)
                .on(InternalEvents.Http.Listening, this.#on_http_listening)
                .on(InternalEvents.Http.Upgrade, this.#on_http_upgrade)
                .on(InternalEvents.Http.Close, this.#on_http_close)
                .on(InternalEvents.Http.Error, this.#on_http_error);

                this.wss = new WebSocketServer(this.cfg.wss)
                .on(InternalEvents.Wss.Close, this.#on_wss_close)
                .on(InternalEvents.Wss.Error, this.#on_wss_error)
                .on(InternalEvents.Wss.Connection, this.#on_ws_connection);

                this.http.listen(
                    this.cfg.port, this.cfg.host,
                    () => {
                        return resolve(this);
                    }
                );
            }
        );
    }

    /**
     * @returns {Promise<YarlWebSocketServer>}
     */
    stop = () => {
        return new Promise(
            (resolve, reject) => {
                if(this.http == null || this.wss == null) {
                    return reject();
                }

                this.wss.close(
                    () => {
                        this.http.close(
                            () => {
                                this.http.closeAllConnections();

                                this.emit(YarlWebSocketServer.Events.Shutdown);

                                this.wss = null;
                                this.http = null;

                                return resolve(this);
                            }
                        );
                        
                    }
                );
            }
        );
    }
    
    /**
     * @private
     */
    #on_http_listening = () => {
        console.log('http', InternalEvents.Http.Listening, this.http.address());
    }

    /**
     * @private
     * @param {*} err
     */
    #on_http_error = (err) => {
        console.log('http', InternalEvents.Http.Error, err);
    }

    /**
     * @private
     * @param {*} err
     */
    #on_http_close = (err) => {
        console.log('http', InternalEvents.Http.Close, err);
    }

    /**
     * @private
     * @param {Http.IncomingMessage} req 
     * @param {Socket} socket 
     * @param {Buffer} head 
     */
    #on_http_upgrade = (req, socket, head) => {
        console.log('http', InternalEvents.Http.Upgrade, req.headers);

        // note: we dont have a web socket connection established yet here
        // so this is the place to reject request, if something is wrong
        // todo: check CORS
        // todo: check protocols
        // todo: check token

        // todo: if fails, do this
        // this.#on_auth_fail(socket);

        this.wss.handleUpgrade(
            req, socket, head,
            this.#on_http_upgrade_handler
        );
    }

    /**
     * @private
     * @param {YarlWebSocket} ws 
     * @param {Http.IncomingMessage} req 
     */
    #on_http_upgrade_handler = (ws, req) => {
        ws.account = uuidv4();

        this.wss.emit(InternalEvents.Wss.Connection, ws/*, aditional data */);
    }

    /**
     * @private
     */
    #on_wss_close = (err) => {
        // todo: this is KICK_EVERYONE functionality
        // will be part of an API
        this.clients.forEach(
            (client) => {
                client.removeAllListeners();
                client.terminate();
            }
        );
        this.clients.clear();

        console.log('wss', InternalEvents.Wss.Close, this.clients.size, err);
    }

    /**
     * @private
     * @param {Error} err
     */
    #on_wss_error = (err) => {
        console.log('wss', InternalEvents.Wss.Error, err);
    }

    /**
     * @private
     * @param {YarlWebSocket} ws 
     */
    #on_ws_connection = (ws) => {
        console.log('ws', InternalEvents.Wss.Connection, ws.account);

        this.clients.set(ws.account, ws);
        ws.on(InternalEvents.Ws.Close, this.#on_ws_close.bind(null, ws));
        this.emit(YarlWebSocketServer.Events.Join, ws);
    }

    /**
     * @private
     * @param {YarlWebSocket} ws 
     */
    #on_ws_close = (ws) => {
        console.log('ws', InternalEvents.Ws.Close, ws.account);

        this.clients.delete(ws.account);
        this.emit(YarlWebSocketServer.Events.Leave, ws);
    }

    /**
     * 
     * @param {Socket} socket 
     */
    #on_auth_fail = (socket) => {
        socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
        socket.destroy();
    }
}

export default YarlWebSocketServer;