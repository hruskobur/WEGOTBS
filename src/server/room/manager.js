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
            // todo: stop all rooms
            // . . .

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

export {
    init, term,
    room
};