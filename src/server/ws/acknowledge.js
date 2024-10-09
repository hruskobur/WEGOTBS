import Action from '../../shared/action.js';
import MessageProtocol from '../../shared/protocol.js';
import YarlClient from './client.js';

class YarlClientAck {
    /**
     * @type {YarlClient}
     */
    #ws;

    /**
     * @type {Number}
     */
    #target_timestamp;

    /**
     * @type {Number}
     */
    value;

    /**
     * 
     * @param {YarlClient} ws 
     */
    constructor (ws) {
        this.#ws = ws;

        this.#target_timestamp = null;
        this.value = Number.MAX_SAFE_INTEGER;
    }


    /**
     * Sends an acknowledge command.
     * @public
     * @param {Number} timestamp
     * @returns {YarlClient}
     */
    command = (timestamp) => {
        this.#target_timestamp = timestamp;

        this.#ws.buffer.command(MessageProtocol.Acknowledge, timestamp);

        console.log(this.#ws.uuid, 'ack.send');

        return this.#ws;
    }

    /**
     * Updates the ack value.
     * @param {Action} action 
     */
    update = action => {
        if(this.#target_timestamp == null) {
            this.#ws.close(1000, 'kick');
            
            return;
        }

        this.value = action.data;
        this.#target_timestamp = null;

        console.log(this.#ws.uuid, 'ack.recv', this.value);
    }
    
    /**
     * 
     * @param {Number} target_timestamp 
     * @returns {Boolean}
     */
    compare = (target_timestamp) => {
        return (this.value === target_timestamp);
    }
}

export default YarlClientAck;