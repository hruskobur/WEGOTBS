import Command from './command.js';

class ApplicationMessage {
    constructor () {
        this.timestamp = undefined;
        this.cmds = [];
    }

    /**
     * 
     * @param {Number} timestamp 
     * @returns {ApplicationMessage}
     */
    time (timestamp) {
        this.timestamp = timestamp;

        return this;
    }

    /**
     * 
     * @param {String|Number} name 
     * @param {*} data 
     * @returns {ApplicationMessage} this
     */
    add (name, data) {
        this.cmds.push(
            new Command(name, data)
        );

        return this;
    }

    /**
     * @returns {Command}
     */
    get () {
        return this.cmds.shift();
    }

    /**
     * @returns {ApplicationMessage} this
     */
    clear () {
        this.timestamp = undefined;
        this.cmds = [];

        return this;
    }
}

export default ApplicationMessage;