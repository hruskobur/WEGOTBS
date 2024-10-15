import YarlClient from './client.js';

class YarlClientControl {
    /**
     * @type {YarlClient}
     */
    #client;

    /**
     * @type {Array<Number>}
     */
    #lats;

    /**
     * @type {Array<Number>}
     */
    #acks;

    /**
     * @type {Number}
     */
    latency;

    /**
     * @type {Number}
     */
    ack;

    /**
     * 
     * @param {YarlClient} client 
     */
    constructor (client) {
        this.#client = client;

        this.#lats = [];
        this.#acks = [];

        this.latency = null;
        this.ack = null;
    }

    /**
     * @public
     * @param {Number} timestamp 
     * @returns {YarlClient}
     */
    update_latency = (timestamp) => {
        const length = this.#lats.push(timestamp);

        if(length === 1) {
            this.latency = null;
        } else if(length === 2) {
            this.latency = this.#lats[1] - this.#lats[0];
            this.#lats.length = 0;
        } else {
            this.latency = null;
            this.#client.kick();
        }

        return this.#client;
    }

    /**
     * @public
     * @param {Number} timestamp 
     * @returns {YarlClient}
     */
    update_ack = (timestamp) => {
        const length = this.#acks.push(timestamp);

        if(length === 1) {
            this.ack = null;
        } else if(length === 2) {
            if(this.#acks[0] === this.#acks[1]) {
                this.ack = timestamp;
            } else {
                this.ack = null;
            }
            this.#acks.length = 0;
        } else {
            this.ack = null;
            this.#client.kick();
        }

        return this.#client;
    }
}

export default YarlClientControl;