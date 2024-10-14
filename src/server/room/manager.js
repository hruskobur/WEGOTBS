import Message from '../../shared/message.js';

import ServerEvents from '../server/events.js';
import YarlClient from '../server/client.js';

import YarlRoom from './room.js';
import YarlEmitter from '../core/emitter.js';

/**
 * @type {Map<String|Number, YarlRoom>}
 */
let Rooms = null;

/**
 * @public
 * @returns {Promise<void>}
 */
async function init () {
    if(Rooms !== null) {
        throw new Error();
    }

    Rooms = new Map();

    return new Promise(
        (resolve, reject) => {
            YarlEmitter.on(ServerEvents.Ready, on_client_ready);
            YarlEmitter.on(ServerEvents.Done, on_client_done);

            console.log('rooms.init');
            return resolve();
        }
    )
}

/**
 * @public
 * @returns {Promise<void>}
 */
async function term () {
    if(Rooms === null) {
        throw new Error();
    }
    
    return new Promise(
        (resolve, reject) => {
            YarlEmitter.off(ServerEvents.Ready, on_client_ready);

            Rooms.forEach(room => room.stop());
            Rooms.clear();
            Rooms = null;

            console.log('rooms.reject');
            return resolve();
        }
    )
}

/**
 * 
 * @param {String|Number} uuid 
 * @returns {YarlRoom|null}
 */
function room (uuid) {
    return Rooms.get(uuid);
}

/**
 * @param {String|Number} uuid 
 * @returns {YarlRoom|null}
 */
function create (uuid) {
    if(Rooms.has(uuid) === true) {
        return null;
    }

    const room = new YarlRoom(uuid);
    Rooms.set(uuid, room);

    return room;
}

/**
 * Destroys YarlRoom specified by its uuid.
 * @param {String|Number} uuid
 * @param {*} reason default=undefined
 * @returns {YarlRoom|null}
 */
function destroy (uuid, reason=undefined) {
    const room = Rooms.get(uuid);
    if(uuid == null) {
        return null;
    }

    room.clients.forEach(client => client.kick(reason));
    room.stop();
    Rooms.delete(uuid);

    return room;
}

/**
 * @private
 * @param {YarlClient} client 
 * @param {String} room_uuid 
 */
function on_client_ready (client, room_uuid) {
    const to_join = room(room_uuid);
    if(to_join == null) {
        client.kick();
        return;
    }

    to_join.join(client);
}

/**
 * @private
 * @param {YarlClient} client 
 */
function on_client_done (client) {
    const to_leave = client.room;
    if(to_leave == null) {
        return;
    }

    to_leave.leave(client);
}

export {
    init, term,
    room,
    create, destroy
};