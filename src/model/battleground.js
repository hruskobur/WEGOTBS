import ScenarioModel from './scenario.js';
import TimeModel from './time.js';
import * as Arrays from '../shared/arrays.js';

class BattlegroundModel {
    /**
     * @type {ScenarioModel}
     */
    scenario;

    /**
     * @type {TimeModel}
     */
    time;

    /**
     * @type {Number}
     */
    size;

    /**
     * @type {Map<String, Object>}
     */
    comanders;

    /**
     * @type {Array<Array<Object>>}
     */
    areas;

    /**
     * 
     * @param {ScenarioModel} scenario 
     */
    constructor (scenario) {
        this.scenario = scenario;

        this.time = new TimeModel(
            scenario.round_time, 
            scenario.sim_time
        );
        
        this.size = scenario.size;
        this.comanders = new Map();

        this.areas = Arrays.create_2d(
            scenario.width, scenario.height,
            (x, y) => { return {x, y} }
        );

        this.actions_queue = new Map();
    }
}

export default BattlegroundModel;