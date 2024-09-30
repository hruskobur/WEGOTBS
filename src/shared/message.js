import Action from './action.js';

/**
 * The unified server & client action container.
 */
class Message {
    constructor () {
        this.timestamp = -1;
        this.actions = [];
    }

    /**
     * 
     * @param {Number} timestamp 
     * @returns {Message}
     */
    time (timestamp) {
        this.timestamp = timestamp;

        return this;
    }

    /**
     * 
     * @param {String|Number} name 
     * @param {*} data 
     * @returns {Message} this
     */
    add (name, data) {
        this.actions.push(
            new Action(name, data)
        );

        return this;
    }

    /**
     * Removes the first action from the array and returns it.
     * @returns {Action}
     */
    shift () {
        return this.actions.shift();
    }

    /**
     * @returns {Message} this
     */
    clear () {
        this.timestamp = undefined;
        this.actions = [];

        return this;
    }
    
    /**
     * @returns {String}
     */
    serialize = () => {
        return JSON.stringify(this);
    }

    /**
     * @param {String} data
     * @returns {Message} this
     */
    deserialize = (data) => {
        Object.assign(
            this,
            JSON.parse(data)
        );

        return this;
    }
}

export default Message;