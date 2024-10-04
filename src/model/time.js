class TimeModel {
    static TimeEnd = 0;

    static Phase = Object.freeze({
        Plan: 'phase.plan',
        Update: 'phase.update',
        Simulation: 'phase.simulation'
    });

    /**
     * @type {Number}
     */
    #round_time;

    /**
     * @type {Number}
     */
    #sim_time;

    /**
     * @type {Number}
     */
    #delta_time;

    /**
     * How many rounds have passed?
     * @type {Number}
     */
    round;

    /**
     * Current phase in this round.
     * @type {TimeKeeperModel.Phase}
     */
    phase;

    /**
     * How much time does current phase have left?
     * @type {Number}
     */
    left;

    /**
     * Timestamp marking current round.
     * @type {Number}
     */
    timestamp;

    /**
     * 
     * @param {Number} round_time 
     * @param {Number} sim_time 
     */
    constructor (round_time, sim_time) {
        this.#round_time = round_time;
        this.#sim_time = sim_time;
        this.#delta_time = 1000;

        this.phase = TimeModel.Phase.Plan;
        this.left = this.#round_time;

        this.timestamp = Date.now();
        this.round = 0;
    }

    get delta_time () {
        return this.#delta_time;
    }

    /**
     * @returns {TimeModel.Phase}
     */
    update = () => {
        if(this.left === this.#round_time) {
            this.phase = TimeModel.Phase.Plan;
            this.left -= this.#delta_time;

            this.timestamp = Date.now();
            this.round += 1;
        } else if(this.left === this.#sim_time) {
            this.phase = TimeModel.Phase.Simulation;
            this.left = this.#round_time;
        } else {
            this.phase = TimeModel.Phase.Update;
            this.left -= this.#delta_time;
        }

        return this.phase;
    }
}

export default TimeModel;