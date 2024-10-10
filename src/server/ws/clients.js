import YarlEvents from '../core/emitter.js';
import YarlClient from './client.js';

const Events = Object.freeze({
    Purge: 'purge'
})

/**
 * @type {Map<String, YarlClient>}
 */
let List = null;

/**
 * @public
 * @async
 * @returns {Promise<void>}
 */
async function init () {
    return new Promise(
        (resolve, reject) => {
            List = new Map();

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
    return new Promise(
        (resolve, reject) => {
            purge();
            List = null;

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
    return List.get(uuid);
}

/**
 * 
 * @param {*} reason default=undefined
 */
function purge (reason=undefined) {
    List.forEach(client => {
        client.removeAllListeners();
        client.close(1000, reason);
    });
    List.clear();

    YarlEvents.emit(Events.Purge);
}

export {
    List,
    Events,
    init, term,
    client, broadcast, purge
};