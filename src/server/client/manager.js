import YarlEvents from '../core/emitter.js';

import ServerEvents from '../server/events.js';

import ClientsEvents from './events.js';
import YarlClient from './client.js';
import Message from '../../shared/message.js';

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
            Clients.forEach(client => client.removeAllListeners().close(1000));
            Clients.clear();
            Clients = null;

            console.log('clients.term');
            return resolve();
        }
    );
}

/**
 * Broadcasts a message to every connected client.
 * @public
 * @param {String|Number} name message's name
 * @param {*} data message's data
 */
function broadcast (name, data) {
    const msg = new Message().add(name, data);

    Clients.forEach(client => client.send(msg));
}

/**
 * Returns the YarlClient instance identified by the uuid
 * or null if no such UUID exists.
 * @public
 * @param {String} uuid 
 * @returns {YarlClient|null}
 */
function client (uuid) {
    return Clients.get(uuid);
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
    client, broadcast
};