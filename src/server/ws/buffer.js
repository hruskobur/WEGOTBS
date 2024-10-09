import Action from '../../shared/action.js';
import Message from '../../shared/message.js';
import YarlClient from './client.js';

class YarlWebSocketBuffer {
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
     * 
     * @param {Action} action 
     * @returns {YarlWebSocketBuffer}
     */
    action = (action) => {
        this.message.actions.push(action);

        return this;
    }

    /**
     * 
     * @param {String} name 
     * @param {*} data 
     * @returns {YarlWebSocketBuffer}
     */
    command = (name, data) => {
        this.message.add(name, data);

        return this;
    }

    /**
     * 
     * @returns {YarlWebSocketBuffer}
     */
    flush = () => {
        this.ws.send(
            this.message
        );

        this.message.clear();

        return this;
    }
}

export default YarlWebSocketBuffer;