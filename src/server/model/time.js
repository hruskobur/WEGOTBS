class TimeModel {
    /**
     * @type {Number}
     */
    dt;
    
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
     */
    constructor (dt) {
        this.dt = dt;
        
        this.duration = 0;
        this.timestamp = Date.now();
    }

    /**
     * 
     * @returns {Number}
     */
    now = () => {
        return Date.now();
    }
}

export default TimeModel;