import YarlLog from '../core/logger.js';

import Action from '../../shared/action.js';

import PhasesModel from '../../model/phases.js';
import TimeModel from '../../model/time.js';

import YarlClient from '../server/clients/client.js';

import PurgatoryRoom from './specific/purgatory.js';
import YarlMessage from '../../shared/message.js';
import MessageProtocol from '../../shared/protocol.js';

class YarlRoom {
    /**
     * @type {String|Number}
     */
    uuid;
    
    /**
     * @type {Map<String, YarlClient>}
     */
    clients;

    /**
     * @type {NodeJS.Timeout}
     */
    interval;

    /**
     * @type {TimeModel}
     */
    time;

    /**
     * @type {PhasesModel}
     */
    phases;

    /**
     * DEV: just dev action queue
     */
    actions;

    /**
     * 
     * @param {String|Number} uuid 
     */
    constructor (uuid) {
        this.uuid = uuid;
        this.clients = new Map();
        this.interval = null;

        this.time = new TimeModel(250);
        this.phases = new PhasesModel(
            5000,
            this.time.dt,
            1000 - this.time.dt
        );

        this.actions = [];

    }

    /**
     * Starts the room's heartbeat.
     * @public 
     * @returns {YarlRoom} this
     */
    start = () => {
        if(this.interval !== null) {
            return this;
        }

        this.interval = setInterval(this.#on_update, this.time.dt);

        YarlLog('room', 'start', this.uuid);

        return this;
    }

    /**
     * Stops the room's heartbeat.
     * @public
     * @returns {YarlRoom} this
     */
    stop = () => {
        if(this.interval === null) {
            return this;
        }

        clearInterval(this.interval);
        this.interval = null;

        YarlLog('room', 'stop', this.uuid);

        return this;
    }

    /**
     * Adds the YarlClient to this room.
     * @param {YarlClient} client
     * @returns {YarlRoom} this
     */
    join = (client) => {
        if(this.clients.has(client.uuid) === true) {
            client.kick();

            return this;
        }

        this.clients.set(client.uuid, client);
        client.room = this;

        YarlLog('room', 'join', this.uuid, client.uuid);

        return this;
    }

    /**
     * Removes the YarlClient from this room.
     * @param {YarlClient} client 
     * @returns {YarlRoom} this
     */
    leave = (client) => {
        if(this.clients.has(client.uuid) === false) {
            client.kick();

            return this;
        }

        client.room = PurgatoryRoom;
        this.clients.delete(client.uuid);

        YarlLog('room', 'leave', this.uuid, client.uuid);

        return this;
    }

    /**
     * Receives an from the specified YarlClient.
     * @param {YarlClient} client 
     * @param {Action} action
     * @returns {YarlRoom} this
     */
    recv = (client, action) => {
        switch(this.phases.name) {
            case PhasesModel.Phases.Plan:
            case PhasesModel.Phases.Buffer: {
                YarlLog('room', 'recv', 'in time', client.uuid, action);

                this.actions.push(action);

                break;
            }
            case PhasesModel.Phases.Simulation:
            default: {
                YarlLog('room', 'recv', 'too late', client.uuid, action);

                break;
            }
        }

        return this;
    }

    /**
     * @private
     */
    #on_update = () => {
        this.time.left += this.time.dt;

        // phase: NOT DONE yet!
        if(this.time.left < this.phases.duration) {
            return;
        }

        // phase DONE!
        this.phases.next();
        this.time.left = 0;

        // what to do now?
        switch (this.phases.name) {
            case PhasesModel.Phases.Plan: {
                this.clients.forEach(client => {
                    if(client.measurement.ack === this.time.timestamp) {
                        YarlLog(
                            'room', 'update',
                            'timestamp checked', 
                            client.uuid,
                            client.measurement.ack, this.time.timestamp
                        );
                    } else {
                        YarlLog(
                            'room', 'update',
                            'failed timestamp check', 
                            client.uuid,
                            client.measurement.ack, this.time.timestamp
                        );
                    }
                });
                
                this.time.timestamp = this.time.now();

                YarlLog(
                    'room', 'update',
                    'prepare phase', 
                    this.time.timestamp
                );

                break;
            }
            case PhasesModel.Phases.Buffer: {
                YarlLog(
                    'room', 'update',
                    'buffer phase', 
                    this.time.timestamp
                );
                break;
            }
            case PhasesModel.Phases.Simulation: {
                YarlLog(
                    'room', 'update',
                    'simulation phase', 
                    this.time.timestamp
                );

                const now = this.time.now();
                
                const msg = new YarlMessage()
                .create(MessageProtocol.Ack, this.time.timestamp)
                .create(MessageProtocol.Latency, undefined)
                // .push(...this.actions)

                this.clients.forEach(client => {
                    client
                    .measurement.update_latency(now)
                    .measurement.update_ack(this.time.timestamp)
                    .send(msg);
                });

                break;
            }
        }
    }
}

export default YarlRoom;