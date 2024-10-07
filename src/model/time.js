class TimeModel {
    dt;
    left;
    timestamp;
    latency;

    constructor () {
        this.dt = 250;
        this.left = 0;
        this.timestamp = Date.now();
        this.latency = 250;
    }
}

export default TimeModel;