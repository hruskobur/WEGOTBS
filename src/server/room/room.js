import YarlLog from '../core/logger.js';

import Action from '../../shared/action.js';
import YarlMessage from '../../shared/message.js';
import MessageProtocol from '../../shared/protocol.js';

import PhasesModel from '../model/phases.js';
import TimeModel from '../model/time.js';

import YarlClient from '../server/clients/client.js';

import YarlRoomPurgatory from './purgatory.js';

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

        client.room = YarlRoomPurgatory;
        this.clients.delete(client.uuid);

        YarlLog('room', 'leave', this.uuid, client.uuid);

        return this;
    }

    /**
     * Receives an Acton from the YarlClient.
     * @param {YarlClient} client 
     * @param {Action} action
     * @returns {YarlRoom} this
     */
    command = (client, action) => {
        const _s = performance.now();

        switch(this.phases.name) {
            case PhasesModel.Phases.Plan: {
                this.#on_command_phase_plan(client, action);

                break;
            }
            case PhasesModel.Phases.Buffer: {
                this.#on_command_phase_buffer(client, action);

                break;
            }
            case PhasesModel.Phases.Simulation: {
                this.#on_command_phase_simulation(client, action);

                break;
            }
            default: {
                break
            }
        }

        const _e = performance.now();
        YarlLog('room', 'command', this.uuid, client.uuid, (_e-_s), Date.now());

        return this;
    }

    /**
     * @private
     * @param {YarlClient} client 
     * @param {Action} action 
     */
    #on_command_phase_plan = (client, action) => {
        this.actions.push(action);
    }

    /**
     * @private
     * @param {YarlClient} client 
     * @param {Action} action 
     */
    #on_command_phase_buffer = (client, action) => {}

    /**
     * @private
     * @param {YarlClient} client 
     * @param {Action} action 
     */
    #on_command_phase_simulation = (client, action) => {}

    /**
     * @private
     */
    #on_update_phase_plan = () => {
        const msg = new YarlMessage()
        .create(MessageProtocol.Phase, PhasesModel.Phases.Plan);

        for (const [uuid, client] of this.clients) {
            if(client.control.ack !== this.time.timestamp) {
                client.kick();

                continue;
            }

            client.send(msg);
        }

        this.time.timestamp = this.time.now();
    }

    /**
     * @private
     */
    #on_update_phase_buffer = () => {
        const msg = new YarlMessage()
        .create(MessageProtocol.Phase, PhasesModel.Phases.Simulation);

        for (const [uuid, client] of this.clients) {
            client.send(msg);
        }
    }

    /**
     * @private
     */
    #on_update_phase_simulation = () => {
        const now = this.time.now();

        const msg = new YarlMessage()
        .push(this.actions)
        .create(MessageProtocol.Ack, this.time.timestamp)
        .create(MessageProtocol.Latency, undefined);

        this.clients.forEach(client => {
            client
            .control.update_latency(now)
            .control.update_ack(this.time.timestamp)
            .send(msg);
        });

        this.actions.length = 0;
    }

    /**
     * @private
     */
    #on_update = () => {
        const _s = performance.now();

        // update: the current phase is not done yet
        this.time.duration += this.time.dt;
        if(this.time.duration < this.phases.duration) {
            return;
        }

        // update: the current phase has ended
        this.phases.next();
        this.time.duration = 0;

        // update: new phase
        switch (this.phases.name) {
            case PhasesModel.Phases.Plan: {
                this.#on_update_phase_plan();

                break;
            }
            case PhasesModel.Phases.Buffer: {
                this.#on_update_phase_buffer();

                break;
            }
            case PhasesModel.Phases.Simulation: {
                this.#on_update_phase_simulation();

                break;
            }
            default: {
                break;
            }
        }

        const _e = performance.now();
        YarlLog('room', 'update', this.uuid, (_e-_s), Date.now());
    }
}

export default YarlRoom;