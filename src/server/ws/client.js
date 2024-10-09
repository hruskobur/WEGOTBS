import WebSocket from 'ws';
import MessageProtocol from '../../shared/protocol.js';
import Message from '../../shared/message.js';
import YarlClientLatency from './latency.js';
import YarlClientAck from './acknowledge.js';
import YarlWebSocketBuffer from './buffer.js';

const YarlWebSocketOptions = Object.freeze({
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
     * @type {YarlWebSocketBuffer}
     */
    buffer;

    /**
     * @type {YarlClientLatency} 
     */
    latency;

    /**
     * @type {YarlClientAck}
     */
    acknowledge;

    /**
     * 
     * @param {String|URL} address 
     * @param {String|Array<String>|undefined} protocols 
     * @param {*} options 
     */
    constructor (address, protocols, options=null) {
        super(address, protocols, options);

        this.uuid = '';
        this.buffer = new YarlWebSocketBuffer(this);
        this.latency = new YarlClientLatency(this);
        this.acknowledge = new YarlClientAck(this);

        this.on(InternalEvents.Message, this.#recv);
    }

    /**
     * Sends a message directly.
     * @public
     * @override
     * @param {Message} message
     * @returns {YarlClient} this
     */
    send = (message) => {
        super.send(
            message.serialize(),
            YarlWebSocketOptions
        );

        return this;
    }

    /**
     * @private
     * @emits command
     * @param {*} data 
     */
    #recv = (data) => {
        const message = new Message().deserialize(data);
        if(message.length != 1) {
            this.close(1000, 'kick');
            
            return;
        }

        const action = message.actions[0];

        // note: very few cases, let's try switch in this version
        switch (action.name) {
            case MessageProtocol.Latency: {
                this.latency.recv(action);

                return;
            }
            case MessageProtocol.Acknowledge: {
                this.acknowledge.recv(action);

                return;
            }
            default: {
                // this.close(1000, 'kick');

                return;
            }
        }
    }
}

export default YarlClient;