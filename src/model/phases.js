/**
 * @typedef {Object} PhaseModel
 * @property {String} name
 * @property {Number} time
 */

class PhasesModel {
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

    /**
     * @param {Array<PhaseModel>} phases
     */
    constructor (phases) {
        this.phases = phases;
        
        this.iterator = 0;
        this.phase = this.phases[this.iterator];

        console.log(this)
    }

    get name () {
        return this.phase.name;
    }

    get time () {
        return this.phase.time;
    }

    /**
     * Progresses to the next phase and returns that phase.
     * @returns {PhaseModel}
     */
    next = () => {
        this.iterator = (this.iterator + 1) % this.phases.length;
        this.phase = this.phases[this.iterator];

        return this.phase;
    }
}

export default PhasesModel;