import YarlEvents from '../core/emitter.js';

import ServerEvents from '../server/events.js';

import ClientsEvents from './events.js';
import YarlClient from './client.js';

/**
 * @type {Map<String, YarlClient>}
 */
let Clients = null;

/**
 * @public
 * @async
 * @returns {Promise<void>}
 */
async function init () {
    if(Clients !== null) {
        throw new Error();
    }
    
    return new Promise(
        (resolve, reject) => {
            Clients = new Map();

            YarlEvents.on(ServerEvents.Connected, on_client_connected);
            YarlEvents.on(ServerEvents.Disconnected, on_client_disconnected);

            console.log('clients.init');
            return resolve();
        }
    );
}

/**
 * @public
 * @async
 * @returns {Promise<void>}
 */
async function term () {
    if(Clients === null) {
        throw new Error();
    }

    return new Promise(
        (resolve, reject) => {
            purge();
            Clients = null;

            console.log('clients.term');
            return resolve();
        }
    );
}

/**
 * 
 * @param {String} name 
 * @param {*} data 
 */
function broadcast (name, data) {}

/**
 * 
 * @param {String} uuid 
 * @returns {YarlClient|null}
 */
function client (uuid) {
    return Clients.get(uuid);
}

/**
 * 
 * @param {*} reason default=undefined
 */
function purge (reason=undefined) {
    Clients.forEach(client => {
        client.removeAllListeners();
        client.close(1000, reason);
    });
    Clients.clear();

    YarlEvents.emit(ClientsEvents.Purge);
}

/**
 * @private
 * @param {YarlClient} ws 
 */
function on_client_connected (ws) {
    Clients.set(ws.uuid, ws);

    console.log('clients.connected', ws.uuid, Clients.size);
}

/**
 * @private
 * @param {YarlClient} ws 
 */
function on_client_disconnected (ws) {
    Clients.delete(ws.uuid, ws);

    console.log('clients.disconnected', ws.uuid, Clients.size);
}

export {
    init, term,
    client, broadcast, purge
};