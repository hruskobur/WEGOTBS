import YarlClient from './client.js';

class YarlClientMeasurement {
    #client;

    #lats;
    #acks;

    latency;
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
            console.log('latency start');
        } else if(length === 2) {
            this.latency = this.#lats[1] - this.#lats[0];
            this.#lats.length = 0;

            console.log('latency end', this.latency);
        } else {
            this.latency = null;
            this.#client.kick();

            console.log('latency kick');
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

            console.log('ack start');
        } else if(this.#lats === 2) {
            if(this.#acks[0] === this.#acks[1]) {
                this.ack = timestamp;
            } else {
                this.ack = null;
            }
            this.#acks.length = 0;

            console.log('ack end', this.ack);
        } else {
            this.ack = null;
            this.#client.kick();

            console.log('ack kick');
        }

        return this.#client;

    }
}

export default YarlClientMeasurement;