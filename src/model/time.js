class TimeModel {
    /**
     * @type {Number}
     */
    dt;
    
    /**
     * @type {Number}
     */
    left;

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
        
        this.left = 0;
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