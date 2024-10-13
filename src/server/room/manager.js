import Message from '../../shared/message.js';
import YarlRoom from './room.js';

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

export {
    init, term,
    room,
    create, destroy
};