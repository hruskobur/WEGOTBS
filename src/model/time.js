class TimeModel {
    /**
     * @type {Number}
     */
    dt;
    
    /**
     * @type {Number}
     */
    latency;

    /**
     * @type {Number}
     */
    duration;

    /**
     * @type {Number}
     */
    timestamp;

    /**
     * 
     * @param {Number} dt 
     * @param {Number} latency 
     */
    constructor (dt, latency) {
        this.dt = dt;
        this.latency = latency;
        
        this.duration = 0;
        this.timestamp = Date.now();
    }
}

export default TimeModel;