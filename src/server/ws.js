import WebSocket from 'ws';
import Message from '../shared/message.js';

const YarlWebSocketOptions = Object.freeze({
    binary: false,
    compress: true
});

const InternalEvents = Object.freeze({
    Message: 'message'
});

class YarlWebSocket extends WebSocket {
    /**
     * The account that has opened this YarlWebSocket instance.
     * @type {String} 
     */
    account;

    /**
     * 
     * @type {Number} 
     */
    timestamp;

    /**
     * 
     * @param {String|URL} address 
     * @param {String|Array<String>|undefined} protocols 
     * @param {*} options 
     */
    constructor (address, protocols, options=null) {
        super(address, protocols, options);

        this.account = '';
        this.simulation = null;
        this.timestamp = null;

        this.on(InternalEvents.Message, this.#on_message);
    }

    /**
     * @public
     * @override
     * @param {Message} message
     * @returns {YarlWebSocket} this
     */
    send = (message) => {
        super.send(
            message.serialize(),
            YarlWebSocketOptions
        );

        return this;
    }

    /**
     * This is the received message handler, it processes data in following 
     * steps: 
     * - receives raw data
     * - parses them into new Message instance
     * - checks for timestamp validity; kicks user if check fails
     * - emits a new message event to the application, if check succeeds
     * @private
     * @emits command
     * @param {*} data 
     */
    #on_message = (data) => {
        // check: client has to join simulation before sending any messages
        if(this.simulation == null) {
            this.close(1000, 'kick');

            return;
        }

        const message = new Message().deserialize(data);

        // check: client is allowed to send EXACTLY ONE action per message
        if(message.length != 1) {
            this.close(1000, 'kick');
            
            return;
        }

        const action = message.actions[0];

        if(action.name === 'ack') {
            this.timestamp = action.data;
            
            return;
        }

        // client has received an action, send this action to the simulation
        this.simulation.command(this, action)
    }
}

export default YarlWebSocket;