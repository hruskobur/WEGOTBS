import YarlClient from './client.js';

/**
 * @type {Map<String, YarlClient>}
 */
const Clients = new Map();

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

export {
    Clients,
    client, broadcast
};