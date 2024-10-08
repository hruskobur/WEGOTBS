/**
 * @typedef {Object} PhaseModel
 * @property {String} name
 * @property {Number} duration
 */

class PhasesModel {
    static PhasesCount = 3;
    static Phases = Object.freeze({
        Plan: 'phase.plan',
        Buffer: 'phase.buffer',
        Simulation: 'phase.simulation'
    });

    /**
     * @type {Array<PhaseModel>}
     */
    phases;

    /**
     * @type {Number}
     */
    iterator;

    /**
     * @type {PhaseModel}
     */
    phase;

    constructor (time_plan, time_buffer, time_simulation) {
        this.phases = [
            { name: PhasesModel.Phases.Plan, duration: time_plan },
            { name: PhasesModel.Phases.Buffer, duration: time_buffer },
            { name: PhasesModel.Phases.Simulation, duration: time_simulation }
        ];
        
        this.iterator = 0;
        this.phase = this.phases[this.iterator];
    }

    /**
     * Returns the name of the current phase.
     */
    get name () {
        return this.phase.name;
    }

    /**
     * Returns the duration of the current phase.
     */
    get duration () {
        return this.phase.duration;
    }

    /**
     * Progresses to the next phase and returns that phase.
     * @returns {PhaseModel}
     */
    next = () => {
        this.iterator = (this.iterator + 1) % PhasesModel.PhasesCount;
        this.phase = this.phases[this.iterator];

        return this.phase;
    }
}

export default PhasesModel;