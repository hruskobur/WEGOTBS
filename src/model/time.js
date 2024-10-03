
class TimeModel {
    static TimeEnd = 0;

    static Phase = Object.freeze({
        Plan: 'phase.plan',
        Simulation: 'phase.simulation'
    });

    /**
     * @type {Number}
     */
    #time_plan;

    /**
     * @type {Number}
     */
    #time_simulation;

    /**
     * @type {Number}
     */
    #dt;

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
     * @param {Number} time_plan how long should plan phase last
     * @param {Number} time_simulation how long should simulation phase last
     * @param {Number} time_delta how much time does pass between two updates
     */
    constructor (time_plan, time_simulation, time_delta) {
        this.#time_plan = time_plan;
        this.#time_simulation = time_simulation;
        this.#dt = time_delta;

        this.reset();
    }

    get dt () {
        return this.#dt;
    }

    reset = () => {
        this.round = 0;
        this.phase = TimeModel.Phase.Simulation;
        this.left = this.#time_simulation;
        this.timestamp = Date.now();
    }

    /**
     * @returns {TimeModel.Phase|null}
     */
    update = () => {
        // simluation (end of current turn)
        if(this.left === this.#time_simulation) {
            this.phase = TimeModel.Phase.Simulation;
            this.left -= this.#dt;

            return this.phase;
        }

        // plan (begining of new turn)
        if(this.left === TimeModel.TimeEnd) {
            this.phase = TimeModel.Phase.Plan;
            this.left = this.#time_plan;
            this.round += 1;

            return this.phase;
        }

        this.left -= this.#dt;

        return null;
    }
}

export default TimeModel;