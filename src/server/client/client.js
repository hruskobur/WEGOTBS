import WebSocket from 'ws';
import Message from '../../shared/message.js';

const WebSocketOptions = Object.freeze({
    binary: false,
    compress: true
});

const InternalEvents = Object.freeze({
    Message: 'message'
});

class YarlClient extends WebSocket {
    /**
     * @type {String} 
     */
    uuid;

    /**
     * 
     * @param {String|URL} address 
     * @param {String|Array<String>|undefined} protocols 
     * @param {*} options 
     */
    constructor(address, protocols, options = null) {
        super(address, protocols, options);

        this.uuid = '';

        this.on(InternalEvents.Message, this.#recv);
    }

    /**
     * @public
     * @override
     * @param {Message} message 
     */
    send = (message) => {
        super.send(
            message.serialize(),
            WebSocketOptions
        );
    }

    /**
     * @private
     * @param {*} data 
     */
    #recv = (data) => {
        const message = new Message().deserialize(data);

        // todo: message's payload name switch
        // . . .
    }
}

export default YarlClient;