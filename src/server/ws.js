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
    static Events = Object.freeze({
        Message: 'app.message',
        Kicked: 'app.kicked'
    });

    /** 
     * The ServerWebSocket's application-wide unique identifier.
     * @type {String}
     */
    id;

    /**
     * The account that has opened this ServerWebSocket instance.
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

        this.id = '';
        this.account = '';
        this.timestamp = -1;

        this.on(InternalEvents.Message, this.#on_message);
    }

    /**
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
     * 
     * @param {*} reason 
     * @returns {YarlWebSocket} this
     */
    kick = (reason) => {
        const message = new Message()
        .time(this.timestamp)
        .add('kick', reason);
        
        this.emit(
            YarlWebSocket.Events.Kicked,
            this, reason
        )

        this
        .send(message)
        .close();

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
        const message = new Message().deserialize(data);

        this.emit(
            YarlWebSocket.Events.Message,
            this, message
        );
    }
}

export default YarlWebSocket;