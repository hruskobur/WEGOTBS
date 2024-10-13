import WebSocket from 'ws';
import Message from '../../shared/message.js';
import YarlRoom from '../room/room.js';

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
     * @type {YarlRoom|null} 
     */
    room;

    /**
     * 
     * @param {String|URL} address 
     * @param {String|Array<String>|undefined} protocols 
     * @param {*} options 
     */
    constructor(address, protocols, options = null) {
        super(address, protocols, options);

        this.uuid = null;
        this.room = null;

        this.on(InternalEvents.Message, this.#recv);
    }

    /**
     * @public
     * @override
     * @param {Message} message 
     * @returns {YarlClient} this
     */
    send = (message) => {
        super.send(
            message.serialize(),
            WebSocketOptions
        );
    }

    /**
     * @public
     * @param {*} reason default=undefined
     * @returns {YarlClient} this
     */
    kick = (reason=undefined) => {
        const msg = new Message().add('kick', reason);

        this.send(msg);
        this.close(1000);

        return this;
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