import WebSocket from 'ws';

import MessageProtocol from '../../../shared/protocol.js';
import Message from '../../../shared/message.js';

import YarlRoom from '../../room/room.js';
import PurgatoryRoom from '../../room/specific/purgatory.js';

import YarlClientBuffer from './buffer.js';
import YarlClientAck from './ack.js';
import YarlClientLatency from './latency.js';

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
     * @type {YarlClientBuffer}
     */
    buffer;

    /**
     * @type {YarlClientAck}
     */
    ack;

    /**
     * @type {YarlClientLatency}
     */
    latency

    /**
     * 
     * @param {String|URL} address 
     * @param {String|Array<String>|undefined} protocols 
     * @param {*} options 
     */
    constructor(address, protocols, options = null) {
        super(address, protocols, options);

        this.uuid = null;
        this.room = PurgatoryRoom;

        this.buffer = new YarlClientBuffer(this);
        this.ack = new YarlClientAck(this);
        this.latency = new YarlClientLatency(this);

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
     * @public
     * @param {String|Number} name 
     * @param {*} data 
     * @returns {YarlClient} this
     */
    command = (name, data) => {
        // todo: switch based on 'name'
        // . . .

        this.room.recv(this, name, data);
        
        return this;
    }

    /**
     * @private
     * @param {*} data 
     */
    #recv = (data) => {
        const message = new Message().deserialize(data);
        if(message.length != 1) {
            this.kick();
            
            return;
        }

        // note: very few cases, let's try switch in this version
        const action = message.actions[0];
        switch (action.name) {
            case MessageProtocol.Latency: {
                this.latency.recv(action);

                return;
            }
            case MessageProtocol.Acknowledge: {
                this.ack.recv(action);

                return;
            }
            default: {
                this.room.recv(this, action);

                return;
            }
        }
    }
}

export default YarlClient;