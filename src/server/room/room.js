import YarlClient from '../client/client.js';

class YarlRoom {
    /**
     * @type {String|Number}
     */
    uuid;
    
    /**
     * @type {Map<String, YarlClient>}
     */
    clients;

    /**
     * 
     * @param {String|Number} uuid 
     */
    constructor (uuid) {
        this.uuid = uuid;
        this.clients = new Map();
    }

    /**
     * Starts the room's heartbeat.
     * @public 
     */
    start = () => {

    }

    /**
     * Stops the room's heartbeat.
     */
    stop = () => {

    }

    /**
     * Adds the YarlClient to this room.
     * @param {YarlClient} client 
     */
    join = (client) => {

    }

    /**
     * Removes the YarlClient from this room.
     * @param {YarlClient} client 
     */
    leave = (client) => {

    }

    /**
     * Sends a command with a payload from the specified YarlClient to this 
     * room.
     * @param {YarlClient} client 
     * @param {String|Number} command 
     * @param {*} payload 
     */
    send = (client, command, payload) => {

    }
}

export default YarlRoom;