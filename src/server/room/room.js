import YarlClient from '../server/client.js';
import PurgatoryRoom from './specific/purgatory.js';

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
     * @type {NodeJS.Timeout}
     */
    interval;

    /**
     * 
     * @param {String|Number} uuid 
     */
    constructor (uuid) {
        this.uuid = uuid;
        this.clients = new Map();

        this.interval = null;
    }

    /**
     * Starts the room's heartbeat.
     * @public 
     * @returns {YarlRoom} this
     */
    start = () => {
        if(this.interval !== null) {
            return this;
        }

        this.interval = setInterval(this.#on_update, 1000);

        return this;
    }

    /**
     * Stops the room's heartbeat.
     * @public
     * @returns {YarlRoom} this
     */
    stop = () => {
        if(this.interval === null) {
            return this;
        }

        clearInterval(this.interval);
        this.interval = null;

        return this;
    }

    /**
     * Adds the YarlClient to this room.
     * @param {YarlClient} client
     * @returns {YarlRoom} this
     */
    join = (client) => {
        if(this.clients.has(client.uuid) === true) {
            client.kick();

            return this;
        }

        this.clients.set(client.uuid, client);
        client.room = this;

        console.log('room.join', this.uuid, client.uuid);

        return this;
    }

    /**
     * Removes the YarlClient from this room.
     * @param {YarlClient} client 
     * @returns {YarlRoom} this
     */
    leave = (client) => {
        if(this.clients.has(client.uuid) === false) {
            client.kick();

            return this;
        }

        client.room = PurgatoryRoom;
        this.clients.delete(client.uuid);

        console.log('room.leave', this.uuid, client.uuid);

        return this;
    }

    /**
     * Sends a command with a payload from the specified YarlClient to this 
     * room.
     * @param {YarlClient} client 
     * @param {String|Number} command 
     * @param {*} payload 
     * @returns {YarlRoom} this
     */
    send = (client, command, payload) => {
        console.log(client.uuid, command, payload);

        return this;
    }

    /**
     * @private
     */
    #on_update = () => {
        console.log(this.uuid, Date.now());
    }
}

export default YarlRoom;