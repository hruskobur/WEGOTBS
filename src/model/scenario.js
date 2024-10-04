class ScenarioModel {
    /**
     * 
     * @param {Number} size 
     * @param {Number} round_time 
     * @param {Number} sim_time
     * @param {Number} width 
     * @param {Number} height 
     */
    constructor (size, round_time, sim_time, width, height) {
        this.size = size;
        this.round_time = round_time;
        this.sim_time = sim_time;
        this.width = width;
        this.height = height;
    }
}

export default ScenarioModel;