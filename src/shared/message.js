import Command from './command.js';

class ApplicationMessage {
    constructor () {
        this.ts = undefined;
        this.cmds = [];
    }

    /**
     * 
     * @param {Number} timestamp 
     * @returns {ApplicationMessage}
     */
    timestamp (timestamp) {
        this.ts = timestamp;

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
}

export default ApplicationMessage;