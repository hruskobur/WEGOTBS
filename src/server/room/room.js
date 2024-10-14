import Action from '../../shared/action.js';

import PhasesModel from '../../model/phases.js';
import TimeModel from '../../model/time.js';

import YarlClient from '../server/clients/client.js';

import PurgatoryRoom from './specific/purgatory.js';

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

        console.log('room.start', this.uuid);

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

        console.log('room.stop', this.uuid);

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

        console.log('room.join', this.uuid, client.uuid);

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

        console.log('room.leave', this.uuid, client.uuid);

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
                console.log('..... in time');

                break;
            }
            case PhasesModel.Phases.Simulation:
            default: {
                console.log('..... too late');

                break;
            }
        }

        console.log(client.uuid, action);

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
                    if(client.ack.compare(this.time.timestamp) === false) {
                        console.log('..... failed timestamp check', client.ack.value, this.time.timestamp);
                    } else {
                        console.log('..... timestamp check', client.ack.value, this.time.timestamp);
                    }
                });
                
                this.time.timestamp = this.time.now();

                console.log('..... new round: receiving commands', this.time.timestamp);

                break;
            }
            case PhasesModel.Phases.Buffer: {
                console.log('..... buffer: receiving commands', this.time.timestamp);

                break;
            }
            case PhasesModel.Phases.Simulation: {
                console.log('..... simulation: sending the latest state', this.time.timestamp);
                const now = this.time.now();

                const upd_cmnd = 'update';
                const upd_data = {};

                this.clients.forEach(client => {
                    client
                    .latency.send(now)
                    .ack.send(this.time.timestamp)
                    .buffer.send(upd_cmnd, upd_data)
                    .flush();
                });

                break;
            }
        }
    }
}

export default YarlRoom;