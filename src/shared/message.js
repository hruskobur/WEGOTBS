import Action from './action.js';

/**
 * The unified server & client action container.
 */
class Message {
    constructor () {
        this.actions = [];
    }

    get length () {
        return this.actions.length
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