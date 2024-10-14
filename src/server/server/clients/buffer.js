import Message from '../../../shared/message.js';

import YarlClient from './client.js';

class YarlClientBuffer {
    /**
     * @type {YarlClient}
     */
    ws;

    /**
     * @type {Message}
     */
    message;

    /**
     * 
     * @param {YarlClient} ws 
     */
    constructor (ws) {
        this.ws = ws;
        this.message = new Message();
    }

    /**
     * Sends new command to the buffer.
     * @public
     * @param {String} name 
     * @param {*} data 
     * @returns {YarlClientBuffer}
     */
    send = (name, data) => {
        this.message.add(name, data);

        return this;
    }
    
    /**
     * Flushes the buffer, sending all available data immediately.
     * @public
     * @returns {YarlClientBuffer}
     */
    flush = () => {
        this.ws.send(
            this.message
        );

        this.message.clear();

        return this;
    }
}

export default YarlClientBuffer;