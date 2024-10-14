import Action from '../../../shared/action.js';
import MessageProtocol from '../../../shared/protocol.js';

import YarlClient from './client.js';

class YarlClientLatency {
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
     * Sends new latency action.
     * @public
     * @param {Number} timestamp
     * @returns {YarlClient}
     */
    send = (timestamp) => {
        this.#target_timestamp = timestamp;

        this.#ws.buffer.send(MessageProtocol.Latency, undefined);

        console.log(this.#ws.uuid, 'latency.send');

        return this.#ws;
    }

    /**
     * Updates the latency value.
     * @public
     * @param {Action} action
     * @returns {YarlClient}
     */
    recv = (action) => {
        if(this.#target_timestamp == null) {
            this.#ws.close(1000, 'kick');
            
            return this.#ws;
        }

        this.value = Date.now() - this.#target_timestamp;
        this.#target_timestamp = null;

        console.log(this.#ws.uuid, 'latency.recv', this.value);

        return this.#ws;
    }
}

export default YarlClientLatency;