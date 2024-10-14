import WebSocket from 'ws';

import MessageProtocol from '../../../shared/protocol.js';
import YarlMessage from '../../../shared/message.js';

import YarlRoom from '../../room/room.js';
import PurgatoryRoom from '../../room/specific/purgatory.js';
import YarlClientMeasurement from './measurement.js';
import YarlLog from '../../core/logger.js';

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
     * @type {YarlClientMeasurement}
     */
    measurement;

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
        this.measurement = new YarlClientMeasurement(this);

        this.on(InternalEvents.Message, this.#recv);
    }

    /**
     * @public
     * @override
     * @param {YarlMessage} message 
     * @returns {YarlClient} this
     */
    send = (message) => {
        super.send(
            message.serialize(),
            WebSocketOptions
        );

        return this;
    }

    /**
     * @public
     * @param {*} reason default=undefined
     * @returns {YarlClient} this
     */
    kick = (reason=undefined) => {
        const msg = new YarlMessage().create('kick', reason);

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
        this.room.recv(this, name, data);
        
        return this;
    }

    /**
     * @private
     * @param {*} data 
     */
    #recv = (data) => {
        const message = new YarlMessage().deserialize(data);
        if(message.length != 1) {
            this.kick();
            
            return;
        }

        // note: very few cases, let's try switch in this version
        const action = message.actions[0];
        switch (action.name) {
            case MessageProtocol.Latency: {
                this.measurement.update_latency(Date.now());
                
                YarlLog(
                    'client', 'latency',
                    this.uuid, this.measurement.latency
                );

                return;
            }
            case MessageProtocol.Ack: {
                this.measurement.update_ack(action.data)

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