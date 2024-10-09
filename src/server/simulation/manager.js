import Simulation from './simulation.js';

class SimulationManager {
    /**
     * @type {Map<String, Simulation>}
     */
    simulations;

    constructor () {
        this.simulations = new Map();
    }
}

export default SimulationManager;